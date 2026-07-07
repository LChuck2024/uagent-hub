export const API_VERSION = "edge-v1";
export const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
export const DEEPSEEK_MODEL = "deepseek-v4-flash";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "X-UAgent-Hub-Api": API_VERSION,
  };
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export function getDeepSeekApiKey(env) {
  const apiKey = env?.VITE_DEEPSEEK_API_KEY || env?.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_DEEPSEEK_API_KEY environment variable is missing. Please configure it in EdgeOne Pages environment variables.",
    );
  }
  return apiKey;
}

export async function callDeepSeek(env, messages, temperature = 0.7) {
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
      stream: false,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || `DeepSeek API request failed with status ${response.status}.`);
  }

  return data?.choices?.[0]?.message?.content?.trim() || "抱歉，DeepSeek 没有返回任何内容，请重试。";
}

export function resolveTemplate(template, context) {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return context[trimmedKey] !== undefined ? context[trimmedKey] : match;
  });
}
