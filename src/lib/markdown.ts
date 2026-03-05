import { marked } from "marked";
import DOMPurify from "dompurify";

// PUBLIC_INTERFACE
export function renderMarkdownToSafeHtml(markdown: string): string {
  /** Convert markdown to sanitized HTML for safe rendering in the UI. */
  const raw = marked.parse(markdown ?? "", {
    gfm: true,
    breaks: true
  }) as string;
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}
