import { apiFetch } from "@/lib/apiClient";
import type { Note, NoteUpsert, NotesListResponse, TagsListResponse } from "@/lib/types";

function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// PUBLIC_INTERFACE
export async function listNotes(opts: {
  page?: number;
  page_size?: number;
  q?: string;
  tag?: string;
  sort?: "updated_at" | "created_at" | "title";
  order?: "asc" | "desc";
  pinned?: boolean | null;
}): Promise<NotesListResponse> {
  /** List notes with pagination, search, tag filtering, sorting, and optional pinned filtering. */
  return apiFetch<NotesListResponse>(
    `/api/v1/notes${qs({
      page: opts.page,
      page_size: opts.page_size,
      q: opts.q,
      tag: opts.tag,
      sort: opts.sort,
      order: opts.order,
      pinned: opts.pinned === null ? undefined : opts.pinned
    })}`
  );
}

// PUBLIC_INTERFACE
export async function getNote(id: string): Promise<Note> {
  /** Fetch a single note by id. */
  return apiFetch<Note>(`/api/v1/notes/${encodeURIComponent(id)}`);
}

// PUBLIC_INTERFACE
export async function createNote(payload: NoteUpsert): Promise<Note> {
  /** Create a new note. */
  return apiFetch<Note>(`/api/v1/notes`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

// PUBLIC_INTERFACE
export async function updateNote(id: string, payload: NoteUpsert): Promise<Note> {
  /** Update an existing note. */
  return apiFetch<Note>(`/api/v1/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

// PUBLIC_INTERFACE
export async function deleteNote(id: string): Promise<void> {
  /** Delete a note by id. */
  return apiFetch<void>(`/api/v1/notes/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

// PUBLIC_INTERFACE
export async function listTags(): Promise<TagsListResponse> {
  /** List tags available for the user. */
  return apiFetch<TagsListResponse>(`/api/v1/tags`);
}
