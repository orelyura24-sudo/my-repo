/**
 * Shared contract between the frontend and the Java Servlet backend.
 *
 * A chat reply is plain text PLUS an optional list of "elements". When
 * `elements` is non-empty the UI splits the right side into two columns:
 * the chat on the left, the rendered elements on the right.
 *
 * Keep this in sync with the backend DTOs in:
 *   backend/src/main/java/com/chat/model/
 */

export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  /** Elements attached to an assistant message (tables, inputs, etc.). */
  elements?: UIElement[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}

/* ------------------------------------------------------------------ */
/* UI elements the backend can ask the frontend to render             */
/* ------------------------------------------------------------------ */

export type UIElement =
  | TableElement
  | InputElement
  | ButtonElement
  | TextElement;

export interface TableElement {
  type: "table";
  title?: string;
  columns: string[];
  rows: Array<Array<string | number | boolean | null>>;
}

export interface InputElement {
  type: "input";
  name: string;
  label?: string;
  placeholder?: string;
  inputType?: "text" | "number" | "email" | "password";
  value?: string;
}

export interface ButtonElement {
  type: "button";
  label: string;
  /** Free-form action id the frontend can react to. */
  action?: string;
}

export interface TextElement {
  type: "text";
  title?: string;
  body: string;
}

/* ------------------------------------------------------------------ */
/* Wire format for POST /api/chat                                     */
/* ------------------------------------------------------------------ */

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  reply: string;
  elements: UIElement[];
}
