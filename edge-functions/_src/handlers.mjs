import { initialAgents, initialWorkflows } from "../../src/data/communityResources.ts";
import { callDeepSeekStream, jsonResponse, resolveTemplate, sseLine, sseResponse } from "./shared.mjs";

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

  const { systemInstruction, temperature, messages } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ error: "Missing or invalid chat messages." }, 400);
  }

  const deepSeekMessages = [
    {
      role: "system",
      content: systemInstruction || "You are a helpful smart agent.",
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
          temperature !== undefined ? Number(temperature) : 0.7,
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
