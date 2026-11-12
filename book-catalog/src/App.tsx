import { useState } from "react";
import type { Book, BookDraft } from "./types/book";
import { searchBooks } from "./services/catalog";
import { loadBooks, saveBooks } from "./services/storage";
import BookList from "./components/BookList";
import BookForm from "./components/BookForm";
import styles from "./App.module.css";

function readCollection() {
  try {
    return { books: loadBooks(window.localStorage), readFailed: false };
  } catch {
    return { books: [], readFailed: true };
  }
}

export default function App() {
  const [collection, setCollection] = useState(readCollection);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [writeFailed, setWriteFailed] = useState(false);
  const { books, readFailed } = collection;
  const results = searchBooks(books, query);

  function updateCollection(next: Book[], success: string): boolean {
    try {
      // Atualize a tela só depois de o navegador aceitar a gravação.
      saveBooks(window.localStorage, next);
      setCollection({ books: next, readFailed: false });
      setWriteFailed(false);
      setMessage(success);
      return true;
    } catch {
      setWriteFailed(true);
      setMessage("Não foi possível salvar a alteração. Tente novamente.");
      return false;
    }
  }

  function addBook(draft: BookDraft): boolean {
    const saved = updateCollection(
      [{ ...draft, id: crypto.randomUUID() }, ...books],
      "Livro cadastrado.",
    );
    if (saved) setQuery("");
    return saved;
  }

  function removeBook(book: Book) {
    if (window.confirm(`Remover “${book.title}” da sua estante?`)) {
      const saved = updateCollection(books.filter(({ id }) => id !== book.id), "Livro removido.");
      if (saved) document.getElementById("search")?.focus();
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Minha Estante</h1>
        <p>Organize seus livros e confira o que você já tem antes de comprar.</p>
      </header>
      {readFailed ? (
        <p role="alert">Não foi possível abrir sua coleção. Recarregue a página para tentar novamente.</p>
      ) : (
        <div className={styles.layout}>
          <section className={styles.collection} aria-labelledby="collection-title">
            <h2 id="collection-title">Sua coleção</h2>
            <label htmlFor="search">Buscar por título ou autor</label>
            <input id="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
            <p className={styles.count} role="status">
              {books.length === 0 ? "Sua estante está vazia." :
                results.length === 0 ? "Nenhum livro encontrado." :
                `${results.length} ${results.length === 1 ? "livro" : "livros"}`}
            </p>
            <BookList books={results} onDelete={removeBook} />
          </section>
          <section className={styles.registration} aria-labelledby="registration-title">
            <h2 id="registration-title">Cadastrar livro</h2>
            <BookForm onAdd={addBook} />
            <p className={styles.note}>Os livros são salvos neste navegador.</p>
          </section>
        </div>
      )}
      <p className={styles.feedback} role="status">{!writeFailed && message}</p>
      <p className={styles.error} role="alert">{writeFailed && message}</p>
    </main>
  );
}
