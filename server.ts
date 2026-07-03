import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { Agent, Workflow, ChatMessage, WorkflowRunLog, WorkflowRunResult } from "./src/types";
import { initialAgents, initialWorkflows } from "./src/data/communityResources";

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-v4-flash";

function getDeepSeekApiKey(): string {
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_DEEPSEEK_API_KEY environment variable is missing. Please configure it in EdgeOne Pages environment variables.");
  }
  return apiKey;
}

async function callDeepSeek(messages: DeepSeekMessage[], temperature = 0.7): Promise<string> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getDeepSeekApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature,
      stream: false,
    }),
  });

  const data = await response.json().catch(() => null) as DeepSeekChatResponse | null;
  if (!response.ok) {
    throw new Error(data?.error?.message || `DeepSeek API request failed with status ${response.status}.`);
  }

  return data?.choices?.[0]?.message?.content?.trim() || "抱歉，DeepSeek 没有返回任何内容，请重试。";
}

// In-memory Database for Community Resources
let customAgents: Agent[] = [];
let customWorkflows: Workflow[] = [];

// API Endpoints

// 1. Chat with an Agent
app.post("/api/agent/chat", async (req, res) => {
  try {
    const { systemInstruction, temperature, messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing or invalid chat messages." });
    }

    const deepSeekMessages: DeepSeekMessage[] = [
      {
        role: "system",
        content: systemInstruction || "You are a helpful smart agent.",
      },
      ...messages.map((msg: ChatMessage) => ({
        role: msg.role === "user" ? "user" as const : "assistant" as const,
        content: msg.text,
      })),
    ];

    const replyText = await callDeepSeek(
      deepSeekMessages,
      temperature !== undefined ? Number(temperature) : 0.7,
    );
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Error in /api/agent/chat:", error);
    res.status(500).json({ error: error.message || "智能助手响应出错，请检查配置或稍后再试。" });
  }
});

// 2. Run Automation Workflow
app.post("/api/workflow/run", async (req, res) => {
  try {
    const { steps, triggerValues } = req.body;
    
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ error: "No steps provided for workflow." });
    }

    const runLogs: WorkflowRunLog[] = [];
    
    // Maintain execution context
    const context: Record<string, string> = {};
    
    // Add trigger values to context as: trigger.varName
    if (triggerValues) {
      Object.keys(triggerValues).forEach(key => {
        context[`trigger.${key}`] = triggerValues[key];
      });
    }

    // Replace helper helper function
    const resolveTemplate = (template: string, ctx: Record<string, string>): string => {
      return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        return ctx[trimmedKey] !== undefined ? ctx[trimmedKey] : match;
      });
    };

    let finalOutput = "";

    for (const step of steps) {
      const startTime = Date.now();
      const resolvedPrompt = resolveTemplate(step.promptTemplate, context);
      
      console.log(`Running step "${step.name}". Resolved prompt preview: ${resolvedPrompt.substring(0, 100)}...`);

      try {
        const stepResult = await callDeepSeek([
          {
            role: "system",
            content: step.systemInstruction || "You are a highly efficient assistant completing a precise workflow sub-task.",
          },
          {
            role: "user",
            content: resolvedPrompt,
          },
        ], 0.5);
        
        // Save in context
        context[step.outputVarName] = stepResult;
        // Also support stepId.output for maximum compatibility
        context[`${step.id}.output`] = stepResult;

        finalOutput = stepResult;

        runLogs.push({
          stepId: step.id,
          stepName: step.name,
          status: "completed",
          inputParsed: resolvedPrompt,
          output: stepResult,
          durationMs: Date.now() - startTime
        });
      } catch (stepErr: any) {
        console.error(`Error in step "${step.name}":`, stepErr);
        runLogs.push({
          stepId: step.id,
          stepName: step.name,
          status: "failed",
          inputParsed: resolvedPrompt,
          error: stepErr.message || "大模型执行该步骤时发生网络或参数错误",
          durationMs: Date.now() - startTime
        });

        return res.json({
          success: false,
          logs: runLogs,
          finalOutput: `工作流在 [${step.name}] 步骤中断。错误信息: ${stepErr.message}`
        });
      }
    }

    res.json({
      success: true,
      logs: runLogs,
      finalOutput
    });
  } catch (error: any) {
    console.error("Error in /api/workflow/run:", error);
    res.status(500).json({ error: error.message || "工作流执行引擎发生故障，请检查步骤配置。" });
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


// Serve static frontend files in production or hook up Vite in dev
async function setupServer() {
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
