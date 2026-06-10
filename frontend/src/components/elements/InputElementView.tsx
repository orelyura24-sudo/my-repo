import { useState } from "react";
import styles from "./elements.module.css";
import type { InputElement } from "../../types/chat";

export default function InputElementView({
  element,
}: {
  element: InputElement;
}) {
  const [value, setValue] = useState(element.value ?? "");

  return (
    <div className={styles.card}>
      {element.label && (
        <label className={styles.label} htmlFor={element.name}>
          {element.label}
        </label>
      )}
      <input
        id={element.name}
        name={element.name}
        type={element.inputType ?? "text"}
        className={styles.input}
        placeholder={element.placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
