import { initialAgents, initialWorkflows } from "../../src/data/communityResources.ts";
import { callDeepSeekStream, jsonResponse, resolveTemplate, sseLine, sseResponse } from "./shared.mjs";
import { isValidSlug, resolveTenantSlug, buildTenantUrls } from "../../lib/tenantHost.mjs";
import {
  applyTenantUpdates,
  buildTenantFromAgent,
  resolveChatConfig,
  toPublicTenant,
} from "../../lib/tenantCore.mjs";
import { readTenant, tenantExists, writeTenant } from "./tenantMemory.mjs";

export function handleResourcesGet() {
  return jsonResponse({
    agents: initialAgents,
    workflows: initialWorkflows,
  });
}

export async function handleChatPost(context) {
  let body = {};
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  let resolvedInstruction;
  let resolvedTemp;
  let messages;

  try {
    const resolved = await resolveChatConfig(
      body,
      async (slug) => readTenant(slug),
      isValidSlug,
      (id) => initialAgents.find((a) => a.id === id) ?? null,
    );
    resolvedInstruction = resolved.resolvedInstruction;
    resolvedTemp = resolved.resolvedTemp;
    messages = resolved.messages;
  } catch (error) {
    const status = error.statusCode || 400;
    return jsonResponse({ error: error.message || "Invalid chat request." }, status);
  }

  const deepSeekMessages = [
    {
      role: "system",
      content: resolvedInstruction,
    },
    ...messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.text,
    })),
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const write = (payload) => controller.enqueue(encoder.encode(sseLine(payload)));
      try {
        const reply = await callDeepSeekStream(
          context.env || {},
          deepSeekMessages,
          resolvedTemp,
          (delta, partial) => write({ delta, partial }),
        );
        write({ done: true, reply });
      } catch (error) {
        write({
          error: error instanceof Error ? error.message : "智能助手响应出错，请检查配置或稍后再试。",
        });
      }
      controller.close();
    },
  });

  return sseResponse(stream);
}

export async function handleWorkflowRunPost(context) {
  let body = {};
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const { steps, triggerValues } = body;
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return jsonResponse({ error: "No steps provided for workflow." }, 400);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const write = (payload) => controller.enqueue(encoder.encode(sseLine(payload)));
      const runLogs = [];
      const ctx = {};

      if (triggerValues) {
        Object.keys(triggerValues).forEach((key) => {
          ctx[`trigger.${key}`] = triggerValues[key];
        });
      }

      let finalOutput = "";

      try {
        for (const step of steps) {
          const startTime = Date.now();
          const resolvedPrompt = resolveTemplate(step.promptTemplate, ctx);

          write({
            event: "step_start",
            stepId: step.id,
            stepName: step.name,
            inputParsed: resolvedPrompt,
          });

          try {
            const stepResult = await callDeepSeekStream(
              context.env || {},
              [
                {
                  role: "system",
                  content:
                    step.systemInstruction ||
                    "You are a highly efficient assistant completing a precise workflow sub-task.",
                },
                { role: "user", content: resolvedPrompt },
              ],
              0.5,
              (delta, partial) => write({ event: "delta", stepId: step.id, delta, partial }),
            );

            ctx[step.outputVarName] = stepResult;
            ctx[`${step.id}.output`] = stepResult;
            finalOutput = stepResult;

            const log = {
              stepId: step.id,
              stepName: step.name,
              status: "completed",
              inputParsed: resolvedPrompt,
              output: stepResult,
              durationMs: Date.now() - startTime,
            };
            runLogs.push(log);
            write({ event: "step_done", log });
          } catch (stepErr) {
            const log = {
              stepId: step.id,
              stepName: step.name,
              status: "failed",
              inputParsed: resolvedPrompt,
              error: stepErr instanceof Error ? stepErr.message : "大模型执行该步骤时发生网络或参数错误",
              durationMs: Date.now() - startTime,
            };
            runLogs.push(log);
            write({ event: "step_done", log });
            write({
              event: "done",
              success: false,
              logs: runLogs,
              finalOutput: `工作流在 [${step.name}] 步骤中断。错误信息: ${log.error}`,
            });
            controller.close();
            return;
          }
        }

        write({ event: "done", success: true, logs: runLogs, finalOutput });
      } catch (error) {
        write({
          error: error instanceof Error ? error.message : "工作流执行引擎发生故障，请检查步骤配置。",
        });
      }
      controller.close();
    },
  });

  return sseResponse(stream);
}

export async function handleSharePost(context) {
  let body = {};
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const { type, resource } = body;
  if (!type || !resource) {
    return jsonResponse({ error: "Missing type or resource data." }, 400);
  }
  if (type !== "agent" && type !== "workflow") {
    return jsonResponse({ error: "Invalid resource type." }, 400);
  }

  const newResource = {
    ...resource,
    likes: 0,
    runs: 0,
    isCustom: true,
  };

  return jsonResponse({ success: true, resource: newResource });
}

export async function handleInteractionPost(context) {
  let body = {};
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const { type, id } = body;
  const lists =
    type === "agent"
      ? [initialAgents]
      : type === "workflow"
        ? [initialWorkflows]
        : [];

  const found = lists.some((list) => list.some((item) => item.id === id));
  return jsonResponse({ success: found });
}

function findAgentById(agentId) {
  return initialAgents.find((a) => a.id === agentId) ?? null;
}

export function handleTenantGet(_context, slug) {
  const normalized = slug.toLowerCase();
  if (!isValidSlug(normalized)) {
    return jsonResponse({ error: "Invalid tenant slug." }, 400);
  }

  const tenant = readTenant(normalized);
  if (!tenant) {
    return jsonResponse({ error: "Tenant not found." }, 404);
  }

  return jsonResponse({ tenant: toPublicTenant(tenant) });
}

export async function handleTenantClonePost(context) {
  let body = {};
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const sourceAgentId = typeof body.sourceAgentId === "string" ? body.sourceAgentId.trim() : "";

  if (!slug || !isValidSlug(slug)) {
    return jsonResponse({ error: "Invalid or missing slug." }, 400);
  }
  if (!sourceAgentId) {
    return jsonResponse({ error: "Missing sourceAgentId." }, 400);
  }
  if (tenantExists(slug)) {
    return jsonResponse({ error: `子域名「${slug}」已被占用，请换一个名称。` }, 409);
  }

  const agent = findAgentById(sourceAgentId);
  if (!agent) {
    return jsonResponse({ error: "Source agent not found." }, 404);
  }

  const tenant = buildTenantFromAgent(slug, agent);
  writeTenant(tenant);

  const host = new URL(context.request.url).hostname;
  const { siteUrl, adminUrl } = buildTenantUrls(slug, host);

  return jsonResponse({
    success: true,
    adminPin: tenant.adminPin,
    siteUrl,
    adminUrl,
    tenant: toPublicTenant(tenant),
  });
}

export async function handleTenantPut(context, slug) {
  let body = {};
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const normalized = slug.toLowerCase();
  if (!isValidSlug(normalized)) {
    return jsonResponse({ error: "Invalid tenant slug." }, 400);
  }

  const existing = readTenant(normalized);
  if (!existing) {
    return jsonResponse({ error: "Tenant not found." }, 404);
  }

  if (!body.adminPin || body.adminPin !== existing.adminPin) {
    return jsonResponse({ error: "Invalid admin PIN." }, 403);
  }

  const updated = applyTenantUpdates(existing, body);
  writeTenant(updated);

  return jsonResponse({ success: true, tenant: toPublicTenant(updated) });
}

export function attachTenantSlug(context) {
  const url = new URL(context.request.url);
  return resolveTenantSlug(url.hostname);
}
