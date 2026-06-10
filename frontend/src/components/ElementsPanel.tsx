import styles from "./ElementsPanel.module.css";
import type { UIElement } from "../types/chat";
import TableElementView from "./elements/TableElementView";
import InputElementView from "./elements/InputElementView";
import ButtonElementView from "./elements/ButtonElementView";
import TextElementView from "./elements/TextElementView";

interface Props {
  elements: UIElement[];
}

function renderElement(el: UIElement, key: number) {
  switch (el.type) {
    case "table":
      return <TableElementView key={key} element={el} />;
    case "input":
      return <InputElementView key={key} element={el} />;
    case "button":
      return <ButtonElementView key={key} element={el} />;
    case "text":
      return <TextElementView key={key} element={el} />;
    default:
      // Exhaustiveness guard — surfaces unknown element types instead of
      // silently dropping them.
      return (
        <pre key={key} className={styles.unknown}>
          {JSON.stringify(el, null, 2)}
        </pre>
      );
  }
}

export default function ElementsPanel({ elements }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>Elements</div>
      <div className={styles.body}>
        {elements.map((el, i) => renderElement(el, i))}
      </div>
    </div>
  );
}
