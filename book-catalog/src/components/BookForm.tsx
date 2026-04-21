import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Book } from "../types/book";

interface BookFormProps {
    onAdd: (book: Omit<Book, "_id">) => void;
}
function BookForm({ onAdd }: BookFormProps) {
    const [formData, setFormData] = useState<Omit<Book, "_id">>({
        title: "",
        author: "",
        status: "Não lido",
    });

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.author) return;

        onAdd(formData);

        setFormData({
            title: "",
            author: "",
            status: "Não lido",
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="title"
                placeholder="Título"
                value={formData.title}
                onChange={handleChange}
            />

            <input
                type="text"
                name="author"
                placeholder="Autor"
                value={formData.author}
                onChange={handleChange}
            />

            <select
                name="status"
                value={formData.status}
                onChange={handleChange}
            >
                <option value="Não lido">Não lido</option>
                <option value="Lido">Lido</option>
            </select>

            <button type="submit">Adicionar</button>
        </form>
    );
}

export default BookForm;