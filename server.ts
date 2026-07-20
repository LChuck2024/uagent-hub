import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { Agent, Workflow, ChatMessage, WorkflowRunLog, TenantSite } from "./src/types";
import { initialAgents, initialWorkflows } from "./src/data/communityResources";
import { callDeepSeekStream, resolveTemplate, sseLine } from "./lib/llmStream.mjs";
import { isValidSlug, resolveTenantSlug } from "./lib/tenantHost.mjs";
import {
  applyTenantUpdates,
  buildTenantFromAgent,
  resolveChatConfig,
  toPublicTenant,
} from "./lib/tenantCore.mjs";
import { buildTenantUrls } from "./lib/tenantHost.mjs";
import { readTenant, tenantExists, writeTenant, ensureTenantsDir } from "./lib/tenantStore.ts";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_VERSION = "edge-v2";

app.use(express.json({ limit: "10mb" }));

// Host slug resolution — *.uagent.net / *.localhost (no ?tenant= query)
app.use((req, res, next) => {
  req.tenantSlug = resolveTenantSlug(req.hostname);
  if (req.tenantSlug) {
    res.setHeader("X-Tenant-Slug", req.tenantSlug);
  }
  next();
});

function writeSse(res: express.Response, payload: unknown) {
  res.write(sseLine(payload));
}

function beginSse(res: express.Response) {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-UAgent-Hub-Api", API_VERSION);
  res.flushHeaders?.();
}

let customAgents: Agent[] = [];
let customWorkflows: Workflow[] = [];

function findAgentById(agentId: string): Agent | undefined {
  return [...initialAgents, ...customAgents].find((a) => a.id === agentId);
}

app.post("/api/agent/chat", async (req, res) => {
  let resolvedInstruction: string;
  let resolvedTemp: number;
  let messages: ChatMessage[];

  try {
    const resolved = await resolveChatConfig(req.body, readTenant, isValidSlug, findAgentById);
    resolvedInstruction = resolved.resolvedInstruction;
    resolvedTemp = resolved.resolvedTemp;
    messages = resolved.messages;
  } catch (error: any) {
    const status = error.statusCode || 400;
    return res.status(status).json({ error: error.message || "Invalid chat request." });
  }

  beginSse(res);

  try {
    const deepSeekMessages = [
      {
        role: "system" as const,
        content: resolvedInstruction,
      },
      ...messages.map((msg: ChatMessage) => ({
        role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: msg.text,
      })),
    ];

    const reply = await callDeepSeekStream(
      process.env,
      deepSeekMessages,
      resolvedTemp,
      (_delta, partial) => writeSse(res, { delta: _delta, partial }),
    );
    writeSse(res, { done: true, reply });
    res.end();
  } catch (error: any) {
    console.error("Error in /api/agent/chat:", error);
    writeSse(res, { error: error.message || "智能助手响应出错，请检查配置或稍后再试。" });
    res.end();
  }
});

app.post("/api/workflow/run", async (req, res) => {
  const { steps, triggerValues } = req.body;

  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ error: "No steps provided for workflow." });
  }

  beginSse(res);

  const runLogs: WorkflowRunLog[] = [];
  const context: Record<string, string> = {};

  if (triggerValues) {
    Object.keys(triggerValues).forEach((key) => {
      context[`trigger.${key}`] = triggerValues[key];
    });
  }

  let finalOutput = "";

  try {
    for (const step of steps) {
      const startTime = Date.now();
      const resolvedPrompt = resolveTemplate(step.promptTemplate, context);

      writeSse(res, {
        event: "step_start",
        stepId: step.id,
        stepName: step.name,
        inputParsed: resolvedPrompt,
      });

      try {
        const stepResult = await callDeepSeekStream(
          process.env,
          [
            {
              role: "system" as const,
              content:
                step.systemInstruction ||
                "You are a highly efficient assistant completing a precise workflow sub-task.",
            },
            { role: "user" as const, content: resolvedPrompt },
          ],
          0.5,
          (delta, partial) => writeSse(res, { event: "delta", stepId: step.id, delta, partial }),
        );

        context[step.outputVarName] = stepResult;
        context[`${step.id}.output`] = stepResult;
        finalOutput = stepResult;

        const log: WorkflowRunLog = {
          stepId: step.id,
          stepName: step.name,
          status: "completed",
          inputParsed: resolvedPrompt,
          output: stepResult,
          durationMs: Date.now() - startTime,
        };
        runLogs.push(log);
        writeSse(res, { event: "step_done", log });
      } catch (stepErr: any) {
        const log: WorkflowRunLog = {
          stepId: step.id,
          stepName: step.name,
          status: "failed",
          inputParsed: resolvedPrompt,
          error: stepErr.message || "大模型执行该步骤时发生网络或参数错误",
          durationMs: Date.now() - startTime,
        };
        runLogs.push(log);
        writeSse(res, { event: "step_done", log });
        writeSse(res, {
          event: "done",
          success: false,
          logs: runLogs,
          finalOutput: `工作流在 [${step.name}] 步骤中断。错误信息: ${stepErr.message}`,
        });
        return res.end();
      }
    }

    writeSse(res, { event: "done", success: true, logs: runLogs, finalOutput });
    res.end();
  } catch (error: any) {
    console.error("Error in /api/workflow/run:", error);
    writeSse(res, { error: error.message || "工作流执行引擎发生故障，请检查步骤配置。" });
    res.end();
  }
});

// 3. Get All Community & System Resources
app.get("/api/community/resources", (req, res) => {
  res.json({
    agents: [...initialAgents, ...customAgents],
    workflows: [...initialWorkflows, ...customWorkflows]
  });
});

// 4. Share Custom Agent/Workflow
app.post("/api/community/share", (req, res) => {
  const { type, resource } = req.body;
  if (!type || !resource) {
    return res.status(400).json({ error: "Missing type or resource data." });
  }

  const newResource = {
    ...resource,
    likes: 0,
    runs: 0,
    isCustom: true
  };

  if (type === "agent") {
    customAgents.push(newResource);
  } else if (type === "workflow") {
    customWorkflows.push(newResource);
  } else {
    return res.status(400).json({ error: "Invalid resource type." });
  }

  res.json({ success: true, resource: newResource });
});

// 5. Like / Run increments
app.post("/api/community/interaction", (req, res) => {
  const { type, id, action } = req.body; // action: 'like' | 'run'
  
  const findAndIncrement = (list: any[]) => {
    const item = list.find(i => i.id === id);
    if (item) {
      if (action === "like") item.likes = (item.likes || 0) + 1;
      if (action === "run") item.runs = (item.runs || 0) + 1;
      return true;
    }
    return false;
  };

  let found = false;
  if (type === "agent") {
    found = findAndIncrement(initialAgents) || findAndIncrement(customAgents);
  } else if (type === "workflow") {
    found = findAndIncrement(initialWorkflows) || findAndIncrement(customWorkflows);
  }

  res.json({ success: found });
});

// --- Tenant APIs (JSON persistence: data/tenants/{slug}.json) ---

app.get("/api/tenant/:slug", async (req, res) => {
  const slug = String(req.params.slug).toLowerCase();
  if (!isValidSlug(slug)) {
    return res.status(400).json({ error: "Invalid tenant slug." });
  }

  try {
    const tenant = await readTenant(slug);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found." });
    }
    res.json({ tenant: toPublicTenant(tenant) });
  } catch (error: any) {
    console.error("Error in GET /api/tenant/:slug:", error);
    res.status(500).json({ error: "Failed to read tenant config." });
  }
});

app.post("/api/tenant/clone", async (req, res) => {
  const slug = typeof req.body.slug === "string" ? req.body.slug.trim().toLowerCase() : "";
  const sourceAgentId =
    typeof req.body.sourceAgentId === "string" ? req.body.sourceAgentId.trim() : "";

  if (!slug || !isValidSlug(slug)) {
    return res.status(400).json({ error: "Invalid or missing slug." });
  }
  if (!sourceAgentId) {
    return res.status(400).json({ error: "Missing sourceAgentId." });
  }

  try {
    if (await tenantExists(slug)) {
      return res.status(409).json({ error: `子域名「${slug}」已被占用，请换一个名称。` });
    }

    const agent = findAgentById(sourceAgentId);
    if (!agent) {
      return res.status(404).json({ error: "Source agent not found." });
    }

    const tenant = buildTenantFromAgent(slug, agent) as TenantSite;
    await writeTenant(tenant);

    const { siteUrl, adminUrl } = buildTenantUrls(slug, req.hostname, String(PORT));

    res.json({
      success: true,
      adminPin: tenant.adminPin,
      siteUrl,
      adminUrl,
      tenant: toPublicTenant(tenant),
    });
  } catch (error: any) {
    console.error("Error in POST /api/tenant/clone:", error);
    res.status(500).json({ error: "Failed to clone tenant." });
  }
});

app.put("/api/tenant/:slug", async (req, res) => {
  const slug = String(req.params.slug).toLowerCase();
  if (!isValidSlug(slug)) {
    return res.status(400).json({ error: "Invalid tenant slug." });
  }

  try {
    const existing = await readTenant(slug);
    if (!existing) {
      return res.status(404).json({ error: "Tenant not found." });
    }

    if (!req.body.adminPin || req.body.adminPin !== existing.adminPin) {
      return res.status(403).json({ error: "Invalid admin PIN." });
    }

    const updated = applyTenantUpdates(existing, req.body) as TenantSite;
    await writeTenant(updated);

    res.json({ success: true, tenant: toPublicTenant(updated) });
  } catch (error: any) {
    console.error("Error in PUT /api/tenant/:slug:", error);
    res.status(500).json({ error: "Failed to update tenant config." });
  }
});


// Serve static frontend files in production or hook up Vite in dev
async function setupServer() {
  await ensureTenantsDir();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
