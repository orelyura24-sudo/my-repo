import styles from "./Sidebar.module.css";
import type { Conversation } from "../types/chat";

interface Props {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
}: Props) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.logo}>Chat</span>
        <button className={styles.newBtn} onClick={onNewChat} title="New chat">
          + New
        </button>
      </div>

      <nav className={styles.list}>
        {conversations.map((c) => (
          <button
            key={c.id}
            className={
              c.id === activeId
                ? `${styles.item} ${styles.itemActive}`
                : styles.item
            }
            onClick={() => onSelect(c.id)}
          >
            <span className={styles.itemTitle}>{c.title}</span>
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <span className={styles.footerText}>Signed in</span>
      </div>
    </aside>
  );
}
