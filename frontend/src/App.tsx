import { useMemo, useState } from "react";
import styles from "./App.module.css";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import ElementsPanel from "./components/ElementsPanel";
import { sendMessage } from "./api/chat";
import type { ChatMessage, Conversation, UIElement } from "./types/chat";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function newConversation(title = "New chat"): Conversation {
  return { id: uid(), title, messages: [] };
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    newConversation(),
  ]);
  const [activeId, setActiveId] = useState<string>(() => conversations[0].id);
  const [loading, setLoading] = useState(false);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId]
  );

  // The most recent assistant elements drive the right-hand elements panel.
  const activeElements: UIElement[] = useMemo(() => {
    for (let i = active.messages.length - 1; i >= 0; i--) {
      const m = active.messages[i];
      if (m.role === "assistant" && m.elements && m.elements.length > 0) {
        return m.elements;
      }
    }
    return [];
  }, [active]);

  function updateConversation(id: string, fn: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }

  function handleNewChat() {
    const conv = newConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  }

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", text: trimmed };

    // Title the conversation after its first message.
    updateConversation(active.id, (c) => ({
      ...c,
      title: c.messages.length === 0 ? trimmed.slice(0, 40) : c.title,
      messages: [...c.messages, userMsg],
    }));

    setLoading(true);
    try {
      const res = await sendMessage({
        message: trimmed,
        conversationId: active.id,
      });
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        text: res.reply,
        elements: res.elements,
      };
      updateConversation(active.id, (c) => ({
        ...c,
        messages: [...c.messages, assistantMsg],
      }));
    } catch (err) {
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        text:
          "⚠️ Could not reach the backend. Is it running on :8080?\n" +
          (err instanceof Error ? err.message : String(err)),
      };
      updateConversation(active.id, (c) => ({
        ...c,
        messages: [...c.messages, assistantMsg],
      }));
    } finally {
      setLoading(false);
    }
  }

  const hasElements = activeElements.length > 0;

  return (
    <div className={styles.app}>
      <Sidebar
        conversations={conversations}
        activeId={active.id}
        onSelect={setActiveId}
        onNewChat={handleNewChat}
      />

      <main className={styles.main}>
        <div className={hasElements ? styles.splitWrapper : styles.singleWrapper}>
          <section className={styles.chatColumn}>
            <ChatPanel
              messages={active.messages}
              loading={loading}
              onSend={handleSend}
            />
          </section>

          {hasElements && (
            <section className={styles.elementsColumn}>
              <ElementsPanel elements={activeElements} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
