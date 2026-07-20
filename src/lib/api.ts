export async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) {
    if (!response.ok) {
      throw new Error(fallbackMessage);
    }
    return {} as T;
  }

  if (contentType.includes("text/html") || trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
    throw new Error("线上 API 未返回 JSON，可能当前部署只包含静态页面，缺少后端 API 或 EdgeOne Functions。");
  }

  let data: T;
  try {
    data = JSON.parse(trimmed) as T;
  } catch {
    const preview = trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed;
    throw new Error(preview.startsWith("Error") ? preview : fallbackMessage);
  }

  if (!response.ok) {
    const message = typeof data === "object" && data && "error" in data
      ? String((data as { error?: unknown }).error)
      : fallbackMessage;
    throw new Error(message);
  }

  return data;
}
