export interface BookDraft {
  title: string;
  author: string;
}

export interface Book extends BookDraft {
  id: string;
}
