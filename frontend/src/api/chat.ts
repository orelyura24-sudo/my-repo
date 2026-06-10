import type { ChatRequest, ChatResponse } from "../types/chat";

/**
 * Calls the backend chat endpoint. In dev, Vite proxies `/api` to the
 * Java Servlet backend on :8080 (see vite.config.ts).
 */
export async function sendMessage(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw new Error(`Backend error ${res.status}: ${await res.text()}`);
  }

  return (await res.json()) as ChatResponse;
}
