export type Note = {
  id: string;
  title: string;
  content: string;
  pinned?: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export type NotesListResponse = {
  items: Note[];
  total?: number;
  page?: number;
  page_size?: number;
};

export type Tag = {
  name: string;
  count?: number;
};

export type TagsListResponse = {
  items: Tag[];
};

export type NoteUpsert = {
  title: string;
  content: string;
  pinned?: boolean;
  tags?: string[];
};
