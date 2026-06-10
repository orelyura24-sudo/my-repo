import styles from "./elements.module.css";
import type { TextElement } from "../../types/chat";

export default function TextElementView({
  element,
}: {
  element: TextElement;
}) {
  return (
    <div className={styles.card}>
      {element.title && <h3 className={styles.title}>{element.title}</h3>}
      <p className={styles.body}>{element.body}</p>
    </div>
  );
}
