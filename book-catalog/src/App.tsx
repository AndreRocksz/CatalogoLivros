import { useEffect, useState } from "react";
import type { Book } from "./types/book";
import { api } from "./services/api";
import BookList from "./components/BookList";
import BookForm from "./components/BookForm";

function App() {

  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
  const loadBooks = async () => {
    try {
      const response = await api.get("/");
      setBooks(response.data);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    }
  };

  loadBooks();
}, []);

  const addBook = async (book: Omit<Book, "_id">) => {
    try{
      const response = await api.post("/", book);
      setBooks((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
    }
  };

  const deleteBook = async (id: string) => {
    try {
      await api.delete(`/${id}`);
      setBooks((prev) => prev.filter((book) => book._id !== id));
    } catch (error) {
      console.error("Erro ao deletar livro:", error);
    }
  };

  return (
    <div>
      <h1>Catálogo de Livros</h1>
      <BookForm onAdd={addBook} />
      <BookList books={books} onDelete={deleteBook} />
    </div>
  );
}

export default App;