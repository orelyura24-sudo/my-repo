import type { ChatRequest, ChatResponse, UIElement } from "../types/chat";

/**
 * Non-streaming call: one request, one full JSON response. Kept as a simple
 * fallback / reference. In dev, Vite proxies `/api` to the Java Servlet
 * backend on :8080 (see vite.config.ts).
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

export interface StreamHandlers {
  /** A chunk of reply text arrived — append it to the assistant message. */
  onToken: (text: string) => void;
  /** UI elements arrived — render them in the right-hand panel. */
  onElements: (elements: UIElement[]) => void;
  /** The stream finished cleanly. */
  onDone?: () => void;
}

/**
 * Streaming call over Server-Sent Events (POST /api/chat/stream).
 *
 * We use `fetch` + a ReadableStream reader rather than the native
 * `EventSource` because EventSource is GET-only and we need to POST a JSON
 * body. The backend still speaks the SSE wire format (`text/event-stream`
 * with `data:` frames); we parse those frames here.
 */
export async function streamMessage(
  req: ChatRequest,
  handlers: StreamHandlers
): Promise<void> {
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Backend error ${res.status}: ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line.
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      dispatchFrame(frame, handlers);
    }
  }

  if (buffer.trim()) {
    dispatchFrame(buffer, handlers);
  }
}

function dispatchFrame(frame: string, handlers: StreamHandlers): void {
  // A frame may carry multiple `data:` lines; concatenate them per the SSE spec.
  const data = frame
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).replace(/^ /, ""))
    .join("\n");

  if (!data) return;

  let event: { type?: string; text?: string; elements?: UIElement[]; message?: string };
  try {
    event = JSON.parse(data);
  } catch {
    return; // ignore malformed frames (e.g. comments / keep-alives)
  }

  switch (event.type) {
    case "token":
      handlers.onToken(event.text ?? "");
      break;
    case "elements":
      handlers.onElements(event.elements ?? []);
      break;
    case "done":
      handlers.onDone?.();
      break;
    case "error":
      throw new Error(event.message ?? "Stream error");
  }
}
