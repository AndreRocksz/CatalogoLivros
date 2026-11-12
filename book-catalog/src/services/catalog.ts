import type { Book, BookDraft } from "../types/book.ts";

export function cleanDraft(draft: BookDraft): BookDraft {
  return { title: draft.title.trim(), author: draft.author.trim() };
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function searchBooks(books: Book[], query: string): Book[] {
  const term = normalize(query.trim());
  return books.filter(({ title, author }) =>
    normalize(title).includes(term) || normalize(author).includes(term),
  );
}
