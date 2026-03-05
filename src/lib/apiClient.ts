export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Intentionally do not hardcode; frontend must be configured via env.
  return base?.replace(/\/+$/, "") ?? "";
}

async function parseError(res: Response): Promise<ApiError> {
  let details: unknown = undefined;
  try {
    details = await res.json();
  } catch {
    // ignore
  }
  return {
    status: res.status,
    message: (details as any)?.detail || res.statusText || "Request failed",
    details
  };
}

// PUBLIC_INTERFACE
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  /** Fetch JSON from notes_backend API with consistent base URL and error mapping. */
  const base = getBaseUrl();
  if (!base) {
    throw {
      status: 0,
      message:
        "NEXT_PUBLIC_API_BASE_URL is not set. Please configure it (see .env.example)."
    } satisfies ApiError;
  }

  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  // Some endpoints may return 204.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
