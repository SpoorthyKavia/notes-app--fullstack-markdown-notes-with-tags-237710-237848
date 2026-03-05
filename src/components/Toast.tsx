"use client";

import React from "react";

export function Toast({
  kind,
  message
}: {
  kind: "info" | "error" | "success";
  message: string;
}) {
  const border =
    kind === "error"
      ? "rgba(255,107,107,0.45)"
      : kind === "success"
        ? "rgba(81,207,102,0.45)"
        : "rgba(255,255,255,0.12)";

  return (
    <div className="toast" style={{ borderColor: border }}>
      {message}
    </div>
  );
}
