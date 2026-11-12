import type { Book } from "../types/book";
import styles from "./BookList.module.css";

export default function BookItem({ book, onDelete }: {
  book: Book;
  onDelete: (book: Book) => void;
}) {
  return (
    <li className={styles.item}>
      <div>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
      </div>
      <button type="button" aria-label={`Remover ${book.title}`} onClick={() => onDelete(book)}>
        Remover
      </button>
    </li>
  );
}
