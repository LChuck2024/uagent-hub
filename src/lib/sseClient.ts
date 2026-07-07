type SseHandler<T> = {
  onEvent?: (event: Record<string, unknown>) => void;
  onDelta?: (partial: string) => void;
  finalize: (events: Record<string, unknown>[]) => T;
};

async function consumeSseStream<T>(
  response: Response,
  handler: SseHandler<T>,
): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const text = await response.text();
    if (contentType.includes("text/html") || text.trim().startsWith("<!doctype") || text.trim().startsWith("<html")) {
      throw new Error("线上 API 未返回 JSON，可能当前部署只包含静态页面，缺少后端 API 或 EdgeOne Functions。");
    }
    try {
      const data = JSON.parse(text) as { error?: string };
      throw new Error(data.error || "请求失败");
    } catch (err) {
      if (err instanceof Error && err.message !== text) throw err;
      throw new Error(text || "请求失败");
    }
  }

  if (!contentType.includes("text/event-stream") || !response.body) {
    const text = await response.text();
    try {
      const data = JSON.parse(text) as Record<string, unknown>;
      if (data.error) throw new Error(String(data.error));
      return handler.finalize([data]);
    } catch (err) {
      if (err instanceof Error && err.message !== text) throw err;
      throw new Error("服务端未返回流式响应");
    }
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const events: Record<string, unknown>[] = [];
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload) continue;
      try {
        const event = JSON.parse(payload) as Record<string, unknown>;
        events.push(event);
        if (event.error) throw new Error(String(event.error));
        handler.onEvent?.(event);
        if (typeof event.partial === "string") {
          handler.onDelta?.(event.partial);
        }
      } catch (err) {
        if (err instanceof Error && !err.message.includes("Unexpected token")) throw err;
      }
    }
  }

  return handler.finalize(events);
}

export async function streamAgentChat(
  body: {
    systemInstruction: string;
    temperature?: number;
    messages: { role: string; text: string }[];
  },
  onPartial: (text: string) => void,
): Promise<string> {
  const response = await fetch("/api/agent/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return consumeSseStream(response, {
    onDelta: onPartial,
    finalize: (events) => {
      const done = [...events].reverse().find((e) => e.done);
      if (done && typeof done.reply === "string") return done.reply;
      const partial = [...events].reverse().find((e) => typeof e.partial === "string");
      if (partial && typeof partial.partial === "string" && partial.partial.trim()) {
        return partial.partial;
      }
      throw new Error("流式响应未返回完整内容");
    },
  });
}

export type WorkflowStreamResult = {
  success: boolean;
  logs: import("../types").WorkflowRunLog[];
  finalOutput: string;
};

export async function streamWorkflowRun(
  body: {
    steps: import("../types").WorkflowStep[];
    triggerValues: Record<string, string>;
  },
  callbacks: {
    onStepStart?: (stepId: string, stepName: string, inputParsed: string) => void;
    onStepDelta?: (stepId: string, partial: string) => void;
    onStepDone?: (log: import("../types").WorkflowRunLog) => void;
    onFinalDelta?: (partial: string) => void;
  },
): Promise<WorkflowStreamResult> {
  const response = await fetch("/api/workflow/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let logs: import("../types").WorkflowRunLog[] = [];

  return consumeSseStream(response, {
    onEvent: (event) => {
      if (event.event === "step_start") {
        callbacks.onStepStart?.(
          String(event.stepId),
          String(event.stepName),
          String(event.inputParsed || ""),
        );
      }
      if (event.event === "delta" && typeof event.stepId === "string" && typeof event.partial === "string") {
        callbacks.onStepDelta?.(event.stepId, event.partial);
        callbacks.onFinalDelta?.(event.partial);
      }
      if (event.event === "step_done" && event.log && typeof event.log === "object") {
        callbacks.onStepDone?.(event.log as import("../types").WorkflowRunLog);
      }
    },
    finalize: (events) => {
      const done = [...events].reverse().find((e) => e.event === "done");
      if (done) {
        logs = (done.logs as import("../types").WorkflowRunLog[]) || logs;
        return {
          success: Boolean(done.success),
          logs,
          finalOutput: String(done.finalOutput || ""),
        };
      }
      throw new Error("工作流流式响应未完成");
    },
  });
}
