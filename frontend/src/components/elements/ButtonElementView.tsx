import styles from "./elements.module.css";
import type { ButtonElement } from "../../types/chat";

export default function ButtonElementView({
  element,
}: {
  element: ButtonElement;
}) {
  return (
    <div className={styles.card}>
      <button
        className={styles.button}
        onClick={() =>
          // Hook this up to real behavior later; for now just log the action.
          console.log("button action:", element.action ?? element.label)
        }
      >
        {element.label}
      </button>
    </div>
  );
}
