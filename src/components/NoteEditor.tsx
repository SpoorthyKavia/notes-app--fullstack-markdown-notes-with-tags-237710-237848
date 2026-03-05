"use client";

import React, { useMemo, useState } from "react";
import type { Note, NoteUpsert } from "@/lib/types";
import { renderMarkdownToSafeHtml } from "@/lib/markdown";

export function NoteEditor({
  note,
  mode,
  onSave,
  onDelete,
  onCancelNew
}: {
  note: Note | null;
  mode: "view" | "edit" | "new";
  onSave: (payload: NoteUpsert) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancelNew: () => void;
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [pinned, setPinned] = useState(Boolean(note?.pinned));
  const [tagsText, setTagsText] = useState((note?.tags ?? []).join(", "));
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);

  // When note changes (selection), refresh local state.
  React.useEffect(() => {
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setPinned(Boolean(note?.pinned));
    setTagsText((note?.tags ?? []).join(", "));
    setTab("edit");
  }, [note?.id]);

  const previewHtml = useMemo(
    () => renderMarkdownToSafeHtml(content),
    [content]
  );

  const disabled = mode === "view";

  async function handleSave() {
    setSaving(true);
    try {
      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        title: title.trim() || "(untitled)",
        content,
        pinned,
        tags
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row">
          <span className="badge">
            {mode === "new" ? "New note" : mode === "edit" ? "Edit note" : "Note"}
          </span>
          <span className="noteMeta">
            Tip: <span className="kbd">Ctrl</span>+<span className="kbd">S</span>{" "}
            to save (while editing)
          </span>
        </div>

        <div className="row">
          {mode !== "view" ? (
            <button
              className={`button ${"buttonSecondary"}`}
              onClick={() => setTab(tab === "edit" ? "preview" : "edit")}
              type="button"
            >
              {tab === "edit" ? "Preview" : "Edit"}
            </button>
          ) : null}

          {mode === "new" ? (
            <button
              className="button buttonSecondary"
              onClick={onCancelNew}
              type="button"
            >
              Cancel
            </button>
          ) : null}

          {mode !== "view" ? (
            <button className="button" onClick={handleSave} disabled={saving} type="button">
              {saving ? "Saving..." : "Save"}
            </button>
          ) : null}

          {mode !== "new" ? (
            <button
              className="button buttonDanger"
              onClick={onDelete}
              disabled={!note}
              type="button"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <div className="row">
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          disabled={disabled}
          aria-label="Note title"
        />
      </div>

      <div className="row">
        <label className="pill">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            disabled={disabled}
          />{" "}
          Pinned
        </label>

        <input
          className="input"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="Tags (comma-separated)"
          disabled={disabled}
          aria-label="Note tags"
        />
      </div>

      {mode === "view" ? (
        <div className="preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      ) : tab === "edit" ? (
        <textarea
          className="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write markdown..."
          aria-label="Note content"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
              e.preventDefault();
              void handleSave();
            }
          }}
        />
      ) : (
        <div className="preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      )}
    </div>
  );
}
