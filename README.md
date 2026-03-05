# notes_frontend (Next.js)

Minimal markdown notes frontend for the **notes_app** system.

## Setup

1. Create an env file (or export env var):

```bash
cp .env.example .env.local
# then set NEXT_PUBLIC_API_BASE_URL, e.g.
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

2. Install & run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Backend dependency

This frontend expects a FastAPI backend that exposes REST endpoints under:

- `/api/v1/notes` (CRUD + listing with pagination/search/sort)
- `/api/v1/tags` (tags listing)

The base URL is configured via `NEXT_PUBLIC_API_BASE_URL`.
