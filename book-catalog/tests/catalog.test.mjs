import assert from "node:assert/strict";
import test from "node:test";
import { cleanDraft, searchBooks } from "../src/services/catalog.ts";
import { loadBooks, saveBooks } from "../src/services/storage.ts";

const book = { id: "1", title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis" };
const other = { id: "2", title: "A Hora da Estrela", author: "Clarice Lispector" };

function memoryStorage(initial = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key, next) => { value = next; },
  };
}

test("limpa os campos e transforma espaços em campo vazio", () => {
  assert.deepEqual(cleanDraft({ title: " Livro ", author: "  " }), { title: "Livro", author: "" });
});

test("busca por título e autor sem exigir acentos ou caixa", () => {
  const books = [book, other];
  assert.deepEqual(searchBooks(books, " BRAS cubas "), [book]);
  assert.deepEqual(searchBooks(books, "machado"), [book]);
  assert.deepEqual(searchBooks(books, "  "), books);
  assert.deepEqual(searchBooks(books, "inexistente"), []);
});

test("grava, relê, localiza e persiste remoção", () => {
  const storage = memoryStorage();
  assert.deepEqual(loadBooks(storage), []);
  saveBooks(storage, [book, other]);
  const reopened = loadBooks(storage);
  assert.deepEqual(searchBooks(reopened, "bras cubas"), [book]);
  saveBooks(storage, reopened.filter(({ id }) => id !== book.id));
  assert.deepEqual(loadBooks(storage), [other]);
});

test("rejeita JSON inválido, registros incompletos e IDs duplicados", () => {
  for (const value of ["{", "{}", "[null]", "[{}]", JSON.stringify([book, book])]) {
    assert.throws(() => loadBooks(memoryStorage(value)));
  }
});

test("propaga falha de leitura ou gravação para a interface tratar", () => {
  assert.throws(() => loadBooks({ getItem() { throw new Error("Bloqueado"); } }), /Bloqueado/);
  assert.throws(() => saveBooks({ setItem() { throw new Error("Sem espaço"); } }, [book]), /Sem espaço/);
});
