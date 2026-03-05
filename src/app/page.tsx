"use client";

import React from "react";
import { NotesList } from "@/components/NotesList";
import { NoteEditor } from "@/components/NoteEditor";
import { TagFilter } from "@/components/TagFilter";
import { Toast } from "@/components/Toast";
import type { Note, NoteUpsert, Tag } from "@/lib/types";
import { createNote, deleteNote, getNote, listNotes, listTags, updateNote } from "@/lib/notesApi";
import type { ApiError } from "@/lib/apiClient";

type Mode = "view" | "edit" | "new";

export default function HomePage() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Note | null>(null);
  const [mode, setMode] = React.useState<Mode>("view");

  const [q, setQ] = React.useState("");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<"updated_at" | "created_at" | "title">("updated_at");
  const [order, setOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState<number | undefined>(undefined);

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const [notesRes, tagsRes] = await Promise.all([
        listNotes({
          page,
          page_size: pageSize,
          q,
          tag: activeTag ?? undefined,
          sort,
          order,
          pinned: null
        }),
        listTags()
      ]);
      setNotes(notesRes.items ?? []);
      setTotal(notesRes.total);
      setTags(tagsRes.items ?? []);
    } catch (e) {
      const ae = e as ApiError;
      setError(ae.message ?? "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q, activeTag, sort, order]);

  React.useEffect(() => {
    // Load selected note details (so editor always has full content).
    if (!selectedId) {
      setSelected(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const n = await getNote(selectedId);
        if (!cancelled) {
          setSelected(n);
          setMode("view");
        }
      } catch (e) {
        const ae = e as ApiError;
        if (!cancelled) setError(ae.message ?? "Failed to load note");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  function startNew() {
    setSelectedId(null);
    setSelected({ id: "new", title: "", content: "", pinned: false, tags: [] });
    setMode("new");
    setInfo(null);
    setError(null);
  }

  function startEdit() {
    if (!selected || mode === "new") return;
    setMode("edit");
  }

  async function handleSave(payload: NoteUpsert) {
    setError(null);
    setInfo(null);
    try {
      if (mode === "new") {
        const created = await createNote(payload);
        setInfo("Note created.");
        setSelectedId(created.id);
        setSelected(created);
      } else if (selected && selectedId) {
        const updated = await updateNote(selectedId, payload);
        setInfo("Note saved.");
        setSelected(updated);
      }
      await refreshAll();
      setMode("view");
    } catch (e) {
      const ae = e as ApiError;
      setError(ae.message ?? "Failed to save note");
    }
  }

  async function handleDelete() {
    if (mode === "new") {
      setSelectedId(null);
      setSelected(null);
      setMode("view");
      return;
    }
    if (!selectedId) return;
    setError(null);
    setInfo(null);
    try {
      await deleteNote(selectedId);
      setInfo("Note deleted.");
      setSelectedId(null);
      setSelected(null);
      setMode("view");
      await refreshAll();
    } catch (e) {
      const ae = e as ApiError;
      setError(ae.message ?? "Failed to delete note");
    }
  }

  const maxPage = total != null ? Math.max(1, Math.ceil(total / pageSize)) : undefined;

  return (
    <div className="appShell">
      <div className="card">
        <div className="cardHeader">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Notes</div>
              <div className="noteMeta">Markdown • Tags • Search • Pin</div>
            </div>
            <button className="button" type="button" onClick={startNew}>
              + New
            </button>
          </div>
          <div className="hr" />
        </div>

        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div className="row">
            <input
              className="input"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Search…"
              aria-label="Search notes"
            />
          </div>

          <TagFilter
            tags={tags}
            activeTag={activeTag}
            onSelect={(t) => {
              setPage(1);
              setActiveTag(t);
            }}
          />

          <div className="row">
            <select
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              aria-label="Sort field"
            >
              <option value="updated_at">Sort: Updated</option>
              <option value="created_at">Sort: Created</option>
              <option value="title">Sort: Title</option>
            </select>

            <select
              className="select"
              value={order}
              onChange={(e) => setOrder(e.target.value as any)}
              aria-label="Sort order"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>

            <select
              className="select"
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value));
              }}
              aria-label="Page size"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="noteMeta">
              Page {page}
              {maxPage != null ? ` / ${maxPage}` : ""}
              {total != null ? ` • ${total} total` : ""}
            </div>
            <div className="row">
              <button
                className="button buttonSecondary"
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <button
                className="button buttonSecondary"
                type="button"
                onClick={() => setPage((p) => (maxPage != null ? Math.min(maxPage, p + 1) : p + 1))}
                disabled={maxPage != null ? page >= maxPage : false}
              >
                Next
              </button>
            </div>
          </div>

          {loading ? <Toast kind="info" message="Loading…" /> : null}
          {error ? <Toast kind="error" message={error} /> : null}
          {info ? <Toast kind="success" message={info} /> : null}

          <div className="hr" />

          <NotesList
            notes={notes}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setInfo(null);
              setError(null);
            }}
          />
        </div>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="row">
              <span className="badge">Editor</span>
              {selectedId ? <span className="pill">ID: {selectedId}</span> : null}
            </div>

            <div className="row">
              <button
                className="button buttonSecondary"
                type="button"
                onClick={startEdit}
                disabled={!selectedId || mode === "new" || mode === "edit"}
              >
                Edit
              </button>
            </div>
          </div>
          <div className="hr" />
        </div>

        <div className="cardBody">
          {!selected && mode !== "new" ? (
            <Toast kind="info" message="Select a note on the left, or create a new one." />
          ) : (
            <NoteEditor
              note={selected}
              mode={mode}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancelNew={() => {
                setSelected(null);
                setMode("view");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
