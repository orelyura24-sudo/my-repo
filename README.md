# Chat Project

A ChatGPT / Claude-style chat application.

- **Left panel** — list of conversations.
- **Right side** — the active chat.
- **Dynamic split** — when the backend reply includes structured UI
  `elements` (a table, an input form, a button, …), the right side splits into
  **two columns**: the chat stays on the left, and the elements are rendered in
  a dedicated panel on the right. With no elements, the chat fills the whole
  right side.

```
┌──────────┬───────────────────────────────────────────┐
│          │                  (no elements)             │
│  chats   │                  CHAT                      │
│  list    │                                            │
│          ├─────────────────────┬─────────────────────┤
│          │   CHAT   (split)    │   ELEMENTS PANEL     │
│          │                     │  table / input / ... │
└──────────┴─────────────────────┴─────────────────────┘
```

## Layout

```
Chat_project/
├── frontend/   # React + TypeScript (Vite), CSS Modules
└── backend/    # Java Servlet on embedded Jetty (Maven)
```

## Prerequisites

- **Node.js** 18+ and npm (frontend)
- **Java 21** (backend). Maven itself is **not** required — the project ships a
  Maven Wrapper (`mvnw` / `mvnw.cmd`) that downloads it on first use.

> The Maven Wrapper needs `JAVA_HOME` set. On this machine the JDK is at
> `C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot`.
> In PowerShell: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"`

## Running (two terminals)

### 1. Backend — http://localhost:8080

```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"   # if not already set
.\mvnw.cmd compile exec:java        # dev run
# or build a runnable jar:
.\mvnw.cmd package
java -jar target\chat-backend.jar
```

Check it: `GET http://localhost:8080/api/health` → `{"status":"ok"}`

### 2. Frontend — http://localhost:5173

```powershell
cd frontend
npm install      # first time only
npm run dev
```

Open http://localhost:5173. Vite proxies `/api/*` to the backend on `:8080`
(configured in `frontend/vite.config.ts`), so there's no CORS setup in dev.

## Trying the split view

The demo backend attaches elements based on keywords in your message:

| Type this…            | What you get on the right |
|-----------------------|---------------------------|
| `show me a table`     | a data **table**          |
| `give me an input form` | a small **form** (text + inputs + button) |
| `add a button`        | a **button**              |
| anything else         | plain text, single column |

## The contract

### Streaming — `WS /api/chat/ws` (used by the UI)

A WebSocket. The client sends one JSON message
(`{"message":"...","conversationId":"..."}`); the server replies with a
sequence of typed JSON envelopes, **one per WebSocket message**: the reply
streamed word-by-word for a typewriter effect, then any UI elements, then a
`done` signal.

```jsonc
// client -> server
{ "message": "show me a table", "conversationId": "abc123" }

// server -> client (each line is a separate WS message)
{ "type": "token", "text": "Here's " }
{ "type": "token", "text": "a " }
{ "type": "elements", "elements": [ { "type": "table", ... } ] }
{ "type": "done" }
```

(`{"type":"error","message":"..."}` is sent if the request is invalid.)

Backend endpoint:
[`ChatSocket.java`](backend/src/main/java/com/chat/web/ChatSocket.java)
(Jetty Jakarta WebSocket). Frontend client:
[`frontend/src/api/chat.ts`](frontend/src/api/chat.ts). Vite proxies the WS
upgrade to `:8080` via `ws: true` in
[`vite.config.ts`](frontend/vite.config.ts).

### Non-streaming — `POST /api/chat` (fallback / reference)

```jsonc
// request
{ "message": "show me a table", "conversationId": "abc123" }

// response
{
  "reply": "Here's a table rendered in the right-hand panel.",
  "elements": [
    { "type": "table", "title": "Sample data",
      "columns": ["ID", "Name"], "rows": [[1, "Ada"]] }
  ]
}
```

The element shapes are defined in two mirrored places — keep them in sync:

- Frontend: [`frontend/src/types/chat.ts`](frontend/src/types/chat.ts)
- Backend:  [`backend/src/main/java/com/chat/model/`](backend/src/main/java/com/chat/model/)

To add a new element type: add it to the union in `chat.ts`, create a renderer
under `frontend/src/components/elements/` (and wire it in `ElementsPanel.tsx`),
then add a matching POJO in the backend `model` package and return it from
`ChatService`.
