export const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
export const DEEPSEEK_MODEL = "deepseek-v4-flash";

export function getDeepSeekApiKey(env) {
  const apiKey = env?.VITE_DEEPSEEK_API_KEY || env?.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_DEEPSEEK_API_KEY environment variable is missing. Please configure it in EdgeOne Pages environment variables.",
    );
  }
  return apiKey;
}

function extractDeltaText(delta) {
  if (!delta) return "";
  if (typeof delta === "string") return delta;
  if (typeof delta.content === "string") return delta.content;
  if (Array.isArray(delta.content)) {
    return delta.content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  }
  return "";
}

function extractMessageText(message) {
  if (!message?.content) return "";
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  }
  return "";
}

export function resolveTemplate(template, context) {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return context[trimmedKey] !== undefined ? context[trimmedKey] : match;
  });
}

export function sseLine(payload) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

/** @param {(delta: string, partial: string) => void} onDelta */
export async function callDeepSeekStream(env, messages, temperature = 0.7, onDelta) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getDeepSeekApiKey(env)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature,
      stream: true,
    }),
  });

  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    let detail = "";
    try {
      const data = JSON.parse(raw);
      detail = data?.error?.message || data?.message || "";
    } catch {
      detail = raw.trim().slice(0, 240);
    }
    throw new Error(
      detail || `DeepSeek API request failed with status ${response.status}.`,
    );
  }

  const reader = response.body?.getReader?.();
  if (!reader) {
    throw new Error("Streaming not supported in this runtime.");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let output = "";

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
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const choice = json?.choices?.[0];
        const deltaText = extractDeltaText(choice?.delta);
        if (deltaText) {
          output += deltaText;
          onDelta(deltaText, output);
        }
        const messageText = extractMessageText(choice?.message);
        if (messageText && messageText.length > output.length) {
          const extra = messageText.slice(output.length);
          if (extra) {
            output += extra;
            onDelta(extra, output);
          }
        }
      } catch {
        // skip malformed chunk
      }
    }
  }

  output = String(output || "").trim();
  if (!output) {
    throw new Error("抱歉，DeepSeek 没有返回任何内容，请重试。");
  }
  return output;
}
