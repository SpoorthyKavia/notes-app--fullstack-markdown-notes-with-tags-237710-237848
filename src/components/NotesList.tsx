"use client";

import React from "react";
import type { Note } from "@/lib/types";

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export function NotesList({
  notes,
  selectedId,
  onSelect
}: {
  notes: Note[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  const pinned = notes.filter((n) => n.pinned);
  const rest = notes.filter((n) => !n.pinned);

  const renderSection = (title: string, items: Note[]) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="badge">{title}</span>
          <span className="noteMeta">{items.length}</span>
        </div>
        <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
          {items.map((n) => (
            <div
              key={n.id}
              className={[
                "noteItem",
                selectedId === n.id ? "noteItemActive" : ""
              ].join(" ")}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(n.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(n.id);
              }}
              aria-label={`Open note ${n.title}`}
            >
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="noteTitle">{n.title || "(untitled)"}</div>
                {n.pinned ? <span className="pill">Pinned</span> : null}
              </div>
              <div className="noteMeta">
                Updated {fmtDate(n.updated_at)}{" "}
                {n.tags?.length ? `• ${n.tags.length} tags` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {renderSection("Pinned", pinned)}
      {pinned.length > 0 && rest.length > 0 ? <div className="hr" /> : null}
      {renderSection("Notes", rest)}
      {notes.length === 0 ? (
        <div className="toast">No notes match your filters.</div>
      ) : null}
    </div>
  );
}
