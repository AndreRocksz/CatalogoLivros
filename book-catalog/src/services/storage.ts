import type { Book } from "../types/book.ts";

const storageKey = "minha-estante.books";

function isBook(value: unknown): value is Book {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value && typeof value.id === "string" && value.id.length > 0 &&
    "title" in value && typeof value.title === "string" && value.title.trim().length > 0 &&
    "author" in value && typeof value.author === "string" && value.author.trim().length > 0
  );
}

export function loadBooks(storage: Pick<Storage, "getItem">): Book[] {
  const raw = storage.getItem(storageKey);
  if (raw === null) return [];

  // O JSON vem de fora do TypeScript. Confira sua estrutura antes de usá-lo.
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(isBook)) {
    throw new Error("Formato inválido da coleção.");
  }
  if (new Set(data.map((book) => book.id)).size !== data.length) {
    throw new Error("Identificadores repetidos na coleção.");
  }
  return data;
}

export function saveBooks(storage: Pick<Storage, "setItem">, books: Book[]): void {
  storage.setItem(storageKey, JSON.stringify(books));
}
