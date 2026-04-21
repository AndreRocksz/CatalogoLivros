import type { Book } from "../types/book";

interface BookItemProps {
    book: Book;
    onDelete: (id: string) => void;
}

function BookItem({ book, onDelete }: BookItemProps) {
    const handleDelete = () => {
        if (!book._id) return;
        onDelete(book._id);
    };

    return (
        
        <div className="card">
            <h3>{book.title}</h3>
            <p><strong>Autor:</strong> {book.author}</p>
            <p><strong>Status:</strong> {book.status}</p>

            <button onClick={handleDelete}>Remover</button>
        </div>
    );
}

export default BookItem;