import styles from "./elements.module.css";
import type { TableElement } from "../../types/chat";

export default function TableElementView({
  element,
}: {
  element: TableElement;
}) {
  return (
    <div className={styles.card}>
      {element.title && <h3 className={styles.title}>{element.title}</h3>}
      <table className={styles.table}>
        <thead>
          <tr>
            {element.columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {element.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>{cell === null ? "—" : String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
