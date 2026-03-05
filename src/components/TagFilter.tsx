"use client";

import React from "react";
import type { Tag } from "@/lib/types";

export function TagFilter({
  tags,
  activeTag,
  onSelect
}: {
  tags: Tag[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
}) {
  return (
    <div className="row" aria-label="Tag filter">
      <button
        className={`button buttonSecondary`}
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={activeTag === null}
      >
        All
      </button>
      <div className="row" style={{ overflowX: "auto", paddingBottom: 4 }}>
        {tags.map((t) => (
          <button
            key={t.name}
            className="button buttonSecondary"
            type="button"
            onClick={() => onSelect(t.name)}
            aria-pressed={activeTag === t.name}
            title={t.count != null ? `${t.count} notes` : ""}
          >
            {t.name}
            {t.count != null ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
