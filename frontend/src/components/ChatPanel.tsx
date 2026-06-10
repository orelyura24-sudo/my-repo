import { useEffect, useRef, useState } from "react";
import styles from "./ChatPanel.module.css";
import type { ChatMessage } from "../types/chat";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (text: string) => void;
}

export default function ChatPanel({ messages, loading, onSend }: Props) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function submit() {
    if (!draft.trim() || loading) return;
    onSend(draft);
    setDraft("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <h2>How can I help?</h2>
            <p className={styles.hint}>
              Try asking for a <code>table</code>, an <code>input</code> form, or
              a <code>button</code> to see the right-side panel appear.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? `${styles.row} ${styles.rowUser}`
                : styles.row
            }
          >
            <div
              className={
                m.role === "user"
                  ? `${styles.bubble} ${styles.bubbleUser}`
                  : `${styles.bubble} ${styles.bubbleAssistant}`
              }
            >
              {m.role === "assistant" && m.text === "" ? (
                <span className={styles.typing}>
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                m.text
              )}
              {m.elements && m.elements.length > 0 && (
                <div className={styles.elementsNote}>
                  → {m.elements.length} element
                  {m.elements.length > 1 ? "s" : ""} shown on the right
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className={styles.composer}>
        <textarea
          className={styles.textarea}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message… (Shift+Enter for newline)"
          rows={1}
        />
        <button
          className={styles.sendBtn}
          onClick={submit}
          disabled={loading || !draft.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
