import type { Book } from "../types/book";
import BookItem from "./BookItem";
import styles from "./BookList.module.css";

export default function BookList({ books, onDelete }: {
  books: Book[];
  onDelete: (book: Book) => void;
}) {
  if (books.length === 0) return null;

  return (
    <ul className={styles.list}>
      {books.map((book) => <BookItem key={book.id} book={book} onDelete={onDelete} />)}
    </ul>
  );
}
