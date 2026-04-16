# Technical Specification – Note Taking Web App

## 1. Overview

A web application where authenticated users can create, view, edit, delete, and publicly share rich-text notes. Notes are created with TipTap, stored as JSON in a SQLite database, and rendered in the browser with formatting.

### Core Features

- User authentication (sign up, login, logout) via better-auth
- Authenticated note management (CRUD)
- Rich text editor using TipTap with:
  - Bold, Italic
  - Heading levels (H1–H3) + normal text
  - Inline code + code blocks
  - Bullet lists
  - Horizontal rules
- Public sharing of notes via a public URL (toggle on/off)

### Tech Stack

- Next.js (App Router) + Bun runtime
- TypeScript
- TailwindCSS
- SQLite via Bun's SQLite client with raw SQL

---

## 2. Architecture

### 2.1 High-Level Architecture

- **Frontend & Backend:** Next.js (App Router)
  - Server components for data fetching
  - Client components for TipTap editor and interactive UI
  - Route Handlers (`app/api/.../route.ts`) for JSON APIs
- **Runtime:** Bun (for dev & production)
- **Database:** Single SQLite file (e.g., `data/app.db`) accessed via Bun's SQLite client
- **Auth:** better-auth integrated into Next.js (middleware + server helpers)

### 2.2 Application Layers

**Presentation layer**

- Next.js pages and components
- TailwindCSS for styling
- TipTap editor component

**API layer**

- REST-like JSON endpoints for notes CRUD & sharing

**Data access layer**

- Raw SQL queries executed via Bun's SQLite client
- A small helper module for DB access

---

## 3. Functional Requirements

### 3.1 Authentication

Users can:

- Register (email + password, minimum validation)
- Log in / log out

Authentication state is accessible on server (for SSR) and on client (for protected UI).

Unauthenticated users:

- Can access public shared note URLs (read-only)
- Cannot access dashboard or personal notes

### 3.2 Notes Management (Authenticated)

**Create a new note:**

- Default title: `"Untitled note"`
- Default empty TipTap document

**View a list of own notes:**

- Show title, last updated at, shared status

**View a single note:**

- Load editor with stored TipTap JSON document

**Update note:**

- Change title
- Change content (TipTap JSON)
- Auto-update `updated_at`

**Delete note:**

- Hard delete

### 3.3 Note Sharing

Users can toggle note "public sharing":

**When enabled:**

- Note gets a unique public slug (e.g. `abcdef1234`)
- Accessible via `/p/{slug}` for anonymous users

**When disabled:**

- Public URL returns 404 / "Note not found"

**Public page rendering:**

- Reads note from DB by `public_slug`
- Shows title and content in read-only mode
- No editing or owner information necessary

---

## 4. Non-Functional Requirements

| Concern | Requirement |
|---|---|
| **Performance** | Notes list & note view should load under ~300 ms for typical DB sizes |
| **Security** | All note operations are scoped to authenticated user's `user_id`; public notes are read-only with no leaked private data |
| **Reliability** | Graceful handling of DB errors |
| **Maintainability** | Type-safe APIs and DB types; modularized DB and auth helpers |
| **UX** | Simple, minimal UI with keyboard-friendly editor |

---

## 5. Data Model & Database Schema (SQLite)

### 5.1 Tables

#### better-auth Core Tables

better-auth manages its own tables for authentication. The schema below matches the official better-auth core schema. Field names use camelCase as required by better-auth.

---

##### `user`

```sql
CREATE TABLE user (
  id          TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image       TEXT,
  createdAt   TEXT    NOT NULL DEFAULT (datetime('now')),
  updatedAt   TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | TEXT | ✓ | Unique identifier (primary key) |
| `name` | TEXT | ✓ | User's display name |
| `email` | TEXT | ✓ | Email address — unique |
| `emailVerified` | INTEGER | ✓ | `1` if email is verified, `0` otherwise |
| `image` | TEXT | | Profile image URL (optional) |
| `createdAt` | TEXT | ✓ | Account creation timestamp |
| `updatedAt` | TEXT | ✓ | Last update timestamp |

---

##### `session`

```sql
CREATE TABLE session (
  id          TEXT PRIMARY KEY,
  userId      TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  expiresAt   TEXT NOT NULL,
  ipAddress   TEXT,
  userAgent   TEXT,
  createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | TEXT | ✓ | Unique identifier (primary key) |
| `userId` | TEXT | ✓ | Foreign key → `user.id` (cascade delete) |
| `token` | TEXT | ✓ | Unique session token |
| `expiresAt` | TEXT | ✓ | Session expiry timestamp |
| `ipAddress` | TEXT | | Client IP address (optional) |
| `userAgent` | TEXT | | Client user-agent string (optional) |
| `createdAt` | TEXT | ✓ | Session creation timestamp |
| `updatedAt` | TEXT | ✓ | Last update timestamp |

---

##### `account`

```sql
CREATE TABLE account (
  id                    TEXT PRIMARY KEY,
  userId                TEXT NOT NULL,
  accountId             TEXT NOT NULL,
  providerId            TEXT NOT NULL,
  accessToken           TEXT,
  refreshToken          TEXT,
  accessTokenExpiresAt  TEXT,
  refreshTokenExpiresAt TEXT,
  scope                 TEXT,
  idToken               TEXT,
  password              TEXT,
  createdAt             TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt             TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | TEXT | ✓ | Unique identifier (primary key) |
| `userId` | TEXT | ✓ | Foreign key → `user.id` (cascade delete) |
| `accountId` | TEXT | ✓ | Account ID from the provider (or `userId` for credential accounts) |
| `providerId` | TEXT | ✓ | Provider identifier (e.g. `"credential"`, `"google"`) |
| `accessToken` | TEXT | | Access token returned by provider (optional) |
| `refreshToken` | TEXT | | Refresh token returned by provider (optional) |
| `accessTokenExpiresAt` | TEXT | | Access token expiry (optional) |
| `refreshTokenExpiresAt` | TEXT | | Refresh token expiry (optional) |
| `scope` | TEXT | | OAuth scope (optional) |
| `idToken` | TEXT | | ID token returned by provider (optional) |
| `password` | TEXT | | Hashed password for email/password auth (optional) |
| `createdAt` | TEXT | ✓ | Account creation timestamp |
| `updatedAt` | TEXT | ✓ | Last update timestamp |

---

##### `verification`

```sql
CREATE TABLE verification (
  id         TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value      TEXT NOT NULL,
  expiresAt  TEXT NOT NULL,
  createdAt  TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | TEXT | ✓ | Unique identifier (primary key) |
| `identifier` | TEXT | ✓ | Identifier for the verification request |
| `value` | TEXT | ✓ | Value to be verified |
| `expiresAt` | TEXT | ✓ | Expiry timestamp |
| `createdAt` | TEXT | ✓ | Creation timestamp |
| `updatedAt` | TEXT | ✓ | Last update timestamp |

---

#### `notes`

```sql
CREATE TABLE notes (
  id           TEXT    PRIMARY KEY,
  user_id      TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  content_json TEXT    NOT NULL,
  is_public    INTEGER NOT NULL DEFAULT 0,
  public_slug  TEXT    UNIQUE,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user(id)
);
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | TEXT | ✓ | Unique identifier (primary key) |
| `user_id` | TEXT | ✓ | Foreign key → `user.id` |
| `title` | TEXT | ✓ | Note title |
| `content_json` | TEXT | ✓ | Stringified TipTap JSON document |
| `is_public` | INTEGER | ✓ | `1` if publicly shared, `0` otherwise |
| `public_slug` | TEXT | | Unique slug for public URL (optional) |
| `created_at` | TEXT | ✓ | Creation timestamp |
| `updated_at` | TEXT | ✓ | Last update timestamp |

### 5.2 Indexes

```sql
CREATE INDEX idx_notes_user_id    ON notes(user_id);
CREATE INDEX idx_notes_public_slug ON notes(public_slug);
CREATE INDEX idx_notes_is_public  ON notes(is_public);
```

---

## 6. Backend: DB & API Layer

### 6.1 Database Access Module

**File:** `lib/db.ts`

- Initialize Bun SQLite client with DB file (`app.db`)
- Export helper functions:
  - `getDb()` – returns singleton DB connection
  - `query<T>(sql, params?): T[]`
  - `get<T>(sql, params?): T | undefined`
  - `run(sql, params?)`

### 6.2 Note Repository Functions

**File:** `lib/notes.ts`

**TypeScript types:**

```typescript
export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string; // stringified TipTap doc
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};
```

**Repository functions:**

- `createNote(userId: string, data: { title?: string; contentJson?: string }): Promise<Note>`
- `getNoteById(userId: string, noteId: string): Promise<Note | null>`
- `getNotesByUser(userId: string): Promise<Note[]>`
- `updateNote(userId: string, noteId: string, data: Partial<{ title: string; contentJson: string }>): Promise<Note | null>`
- `deleteNote(userId: string, noteId: string): Promise<void>`
- `setNotePublic(userId: string, noteId: string, isPublic: boolean): Promise<Note | null>`
- `getNoteByPublicSlug(slug: string): Promise<Note | null>`

Each function enforces `user_id = ?` in SQL where applicable to prevent cross-user access.

---

## 7. API Design (Next.js Route Handlers)

Base path: `/api/notes`.

### 7.1 Authentication Access

All `/api/notes` handlers (except public read) must:

- Check auth via a server helper (`getCurrentUser()` / `getSession()` from better-auth)
- Return `401` if not authenticated

### 7.2 Endpoints

#### `GET /api/notes`

List notes for the current user.

**Response 200:**

```json
[
  {
    "id": "note-id",
    "title": "My Note",
    "isPublic": true,
    "updatedAt": "2025-01-01T12:00:00Z"
  }
]
```

> `contentJson` is omitted from list responses for performance.

---

#### `POST /api/notes`

Create a new note.

**Request body:**

```json
{
  "title": "Optional title",
  "contentJson": { "type": "doc" }
}
```

- Default title: `"Untitled note"`
- Default `contentJson`: empty TipTap document

**Response 201:** created `Note`

---

#### `GET /api/notes/:id`

Get a single note owned by the current user.

**Response:**

- `200` with full note including `contentJson`
- `404` if not found or not owned by the current user

---

#### `PUT /api/notes/:id`

Update note title and/or content.

**Request body:**

```json
{
  "title": "New title",
  "contentJson": { "type": "doc" }
}
```

**Response:**

- `200` with updated note
- `404` if not found

---

#### `DELETE /api/notes/:id`

Delete a note (hard delete).

**Response:**

- `204` on success
- `404` if not found

---

#### `POST /api/notes/:id/share`

Toggle public sharing.

**Request body:**

```json
{ "isPublic": true }
```

**Behavior:**

- `isPublic = true` and no existing `public_slug` → generate a new slug via `nanoid()` (16+ chars)
- `isPublic = false` → set `is_public = 0` and `public_slug = NULL`

**Response 200:**

```json
{
  "id": "note-id",
  "isPublic": true,
  "publicSlug": "abcdef1234"
}
```

---

### 7.3 Public Note Endpoint

#### `GET /api/public-notes/:slug`

Read-only access to public notes.

**Response 200:**

```json
{
  "title": "Public note",
  "contentJson": { "type": "doc" }
}
```

- `404` if slug not found or `is_public = 0`

> Alternatively: skip this API endpoint and resolve the note directly in the `/p/[slug]` server component.

---

## 8. Frontend – Pages & Components

### 8.1 Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page with "Log in / Sign up" CTA |
| `/dashboard` | Authenticated | List of user notes + "Create note" button |
| `/notes/[id]` | Authenticated | Note editor (TipTap, title, share toggle, delete) |
| `/p/[slug]` | Public | Read-only public note view |

### 8.2 Layout & Navigation

- `app/layout.tsx` – global layout with header (app name, login/logout, theme)
- `app/(auth)/login` and `app/(auth)/register` – auth pages (if better-auth does not provide its own UI)

### 8.3 Components

**`components/NoteList.tsx`**

- Props: `notes: { id, title, updatedAt, isPublic }[]`
- Renders list with links to `/notes/[id]`

**`components/NoteEditor.tsx`**

- TipTap-based rich text editor
- Controlled by parent via `onChange` callback

**`components/ShareToggle.tsx`**

- Switch/checkbox for `isPublic`
- Displays public URL when sharing is enabled

**`components/DeleteNoteButton.tsx`**

- Confirms action and calls `DELETE /api/notes/:id`

**`components/PublicNoteViewer.tsx`**

- Renders TipTap content in read-only mode (`editable: false`)

---

## 9. TipTap Integration

### 9.1 Extensions

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Code,
    CodeBlock,
  ],
  content: initialContentJson, // parsed TipTap JSON
  onUpdate: ({ editor }) => {
    onChange(editor.getJSON());
  },
});
```

Content is stored in the DB as `JSON.stringify(json)`; when loading, pass `JSON.parse(row.content_json)` as `content`.

### 9.2 Toolbar

| Button | TipTap command |
|---|---|
| Bold | `toggleBold()` |
| Italic | `toggleItalic()` |
| H1 / H2 / H3 | `toggleHeading({ level: n })` |
| Paragraph | `setParagraph()` |
| Bullet list | `toggleBulletList()` |
| Inline code | `toggleCode()` |
| Code block | `toggleCodeBlock()` |
| Horizontal rule | `setHorizontalRule()` |

---

## 10. Styling (TailwindCSS)

- Configure Tailwind in `tailwind.config.ts`
- Minimal design: neutral background, card-like note containers, utility classes
- Use `@tailwindcss/typography` (`prose`) for read-only content rendering

---

## 11. Security Considerations

| Area | Measure |
|---|---|
| **Auth enforcement** | All `/dashboard` and `/notes/[id]` routes check auth on server; API routes verify user and attach `userId` from session |
| **Authorization** | Every note query in an authenticated context filters by `user_id` |
| **Public notes** | Slug is 16+ chars of random data (nanoid) to prevent enumeration |
| **XSS** | Primary data is TipTap JSON, not raw HTML; rendering uses TipTap's own serializer — no `dangerouslySetInnerHTML` with unsanitized input |
| **Rate limiting** | Optional enhancement: per-IP or per-user rate limiting on API routes |

---

## 12. Development Workflow

1. Initialize Next.js app with Bun & TypeScript
2. Set up TailwindCSS
3. Integrate better-auth and session handling
4. Implement SQLite DB initialization and migrations (e.g. `scripts/init-db.ts` or a `.sql` file)
5. Build DB helpers and note repository (`lib/db.ts`, `lib/notes.ts`)
6. Implement `/api/notes` and sharing API endpoints
7. Build dashboard and note editor pages
8. Integrate TipTap editor and toolbar
9. Implement public note page `/p/[slug]`
10. Add polish: loading states, toast messages, error handling
