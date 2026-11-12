import { useState } from "react";
import type { FormEvent } from "react";
import type { BookDraft } from "../types/book";
import { cleanDraft } from "../services/catalog";
import styles from "./BookForm.module.css";

const emptyDraft = { title: "", author: "" };

export default function BookForm({ onAdd }: { onAdd: (draft: BookDraft) => boolean }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [submitted, setSubmitted] = useState(false);
  const clean = cleanDraft(draft);
  const missingTitle = submitted && !clean.title;
  const missingAuthor = submitted && !clean.author;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!clean.title || !clean.author) {
      const field = event.currentTarget.elements.namedItem(clean.title ? "author" : "title");
      if (field instanceof HTMLInputElement) field.focus();
      return;
    }

    // Preserve os campos para nova tentativa quando a gravação falhar.
    if (onAdd(clean)) {
      setDraft(emptyDraft);
      setSubmitted(false);
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="title">Título</label>
        <input id="title" name="title" required value={draft.title}
          aria-invalid={missingTitle} aria-describedby={missingTitle ? "title-error" : undefined}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        {missingTitle && <span id="title-error" role="alert">Informe o título.</span>}
      </div>
      <div className={styles.field}>
        <label htmlFor="author">Autor</label>
        <input id="author" name="author" required value={draft.author}
          aria-invalid={missingAuthor} aria-describedby={missingAuthor ? "author-error" : undefined}
          onChange={(event) => setDraft({ ...draft, author: event.target.value })} />
        {missingAuthor && <span id="author-error" role="alert">Informe o autor.</span>}
      </div>
      <button type="submit">Adicionar à estante</button>
    </form>
  );
}
