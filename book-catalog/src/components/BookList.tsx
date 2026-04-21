import type { Book } from "../types/book";
import BookItem from "./BookItem";

interface BookListProps {
    books: Book[];
    onDelete: (id: string) => void;
}

function BookList ({ books, onDelete }: BookListProps) {
    
    return (
    <div className="list">
        {books.length === 0 ? (
        <p>Nenhum livro cadastrado.</p>
        ) : (
        books.map((book) => (
            <BookItem key={book._id || book.title} book={book} onDelete={onDelete} />
        ))
        )}
    </div>
    );
}

export default BookList;