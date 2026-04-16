# CLAUDE.md

We're building the app described in @SPEC.MD. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or aplication architecture.

Keep your replies extremely concise and focus on conveying the key information no unnecessary fluff, no long code snippes.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Auto-commit after completing a task

After each completed task (e.g. UI change, new feature, logic fix) invoke the `/git-commit` skill defined in `.claude/skills/git-commit/SKILL.md`. The skill creates a semantic commit following Conventional Commits based on the actual diff.

## Commands

```bash
bun dev          # Start dev server (http://localhost:3000)
bun run build    # Production build
bun run lint     # Run ESLint
```

No test runner is configured yet.

## Environment Setup

Copy `.env.example` to `.env.local` before running:

```
BETTER_AUTH_SECRET=<32+ char secret>
DB_PATH=data/app.db
```

## Architecture

This is a **Next.js 16 App Router** app using **Bun** as the runtime. It is a note-taking web app — see `SPEC.MD` for the full product spec.

### Key layers

**Data access** — `lib/db.ts` exposes a singleton Bun SQLite connection (`getDb()`) and thin helpers (`query<T>`, `get<T>`, `run`). All DB queries use raw SQL. The DB file path comes from `DB_PATH` env var (default: `data/app.db`).

**Note repository** — `lib/notes.ts` wraps all note CRUD. Every authenticated query filters by `user_id` to prevent cross-user access. The `Note` type maps snake_case DB columns to camelCase TypeScript fields (`content_json` → `contentJson`, etc.).

**Auth** — [better-auth](https://www.better-auth.com/) handles sessions. Server components and API routes call `getCurrentUser()` / `getSession()` from a server-side auth helper. better-auth manages its own `user`, `session`, `account`, and `verification` tables (camelCase column names as required by better-auth).

**API routes** — REST-like handlers under `app/api/notes/` (and `app/api/public-notes/`). All `/api/notes` routes require auth and return 401 otherwise. The share endpoint (`POST /api/notes/:id/share`) generates a nanoid slug (16+ chars) when enabling public sharing.

**Frontend routes**

| Path | Auth | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/dashboard` | Required | Note list + create |
| `/notes/[id]` | Required | TipTap editor |
| `/p/[slug]` | Public | Read-only note view |

**TipTap** — Notes are stored as `JSON.stringify(editor.getJSON())` in `content_json`. Load with `JSON.parse(row.content_json)` passed as `content` to `useEditor`. Extensions: `StarterKit` (headings H1–H3), `Code`, `CodeBlock`. The public viewer uses `editable: false`.

### DB schema (quick reference)

- `notes`: `id`, `user_id`, `title`, `content_json`, `is_public` (0/1), `public_slug` (nullable, unique)
- better-auth tables use camelCase column names (`userId`, `expiresAt`, etc.)
- Indexes on `notes(user_id)`, `notes(public_slug)`, `notes(is_public)`

### Styling

TailwindCSS v4 via PostCSS. Use `@tailwindcss/typography` (`prose` class) for read-only TipTap content rendering.
