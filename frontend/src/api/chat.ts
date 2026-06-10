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
 * Streaming call over a WebSocket (ws://host/api/chat/ws).
 *
 * We send the request as one JSON message, then receive a sequence of typed
 * JSON envelopes (one per WebSocket message): `token` chunks, an `elements`
 * frame, then `done`. The promise resolves on `done` and rejects on `error`
 * or a connection failure. In dev, Vite proxies the upgrade to :8080
 * (see vite.config.ts -> ws: true).
 */
export function streamMessage(
  req: ChatRequest,
  handlers: StreamHandlers
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${proto}//${window.location.host}/api/chat/ws`;
    const ws = new WebSocket(url);

    let settled = false;
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      if (err) reject(err);
      else resolve();
    };

    ws.onopen = () => ws.send(JSON.stringify(req));

    ws.onmessage = (e) => {
      let event: {
        type?: string;
        text?: string;
        elements?: UIElement[];
        message?: string;
      };
      try {
        event = JSON.parse(e.data as string);
      } catch {
        return; // ignore unparseable messages
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
          finish();
          break;
        case "error":
          finish(new Error(event.message ?? "Stream error"));
          break;
      }
    };

    ws.onerror = () => finish(new Error("WebSocket connection error"));

    // If the socket closes before we saw a `done`, treat it as a failure.
    ws.onclose = (e) => {
      if (!settled) {
        finish(new Error(`WebSocket closed unexpectedly (code ${e.code})`));
      }
    };
  });
}
