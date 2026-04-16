import { get, query, run } from "./db";

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createNote(
  userId: string,
  data: { title?: string; contentJson?: string } = {}
): Note {
  const id = crypto.randomUUID();
  const title = data.title?.trim() || "Untitled note";
  const contentJson = data.contentJson ?? EMPTY_DOC;
  run(
    `INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)`,
    [id, userId, title, contentJson]
  );
  return toNote(get<NoteRow>(`SELECT * FROM notes WHERE id = ?`, [id])!);
}

export function getNotesByUser(userId: string): Note[] {
  return query<NoteRow>(
    `SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC`,
    [userId]
  ).map(toNote);
}

export function getNoteById(userId: string, noteId: string): Note | null {
  const row = get<NoteRow>(
    `SELECT * FROM notes WHERE id = ? AND user_id = ?`,
    [noteId, userId]
  );
  return row ? toNote(row) : null;
}

export function deleteNote(userId: string, noteId: string): boolean {
  const note = getNoteById(userId, noteId);
  if (!note) return false;
  run(`DELETE FROM notes WHERE id = ? AND user_id = ?`, [noteId, userId]);
  return true;
}

export function getNoteByPublicSlug(slug: string): Note | null {
  const row = get<NoteRow>(
    `SELECT * FROM notes WHERE public_slug = ? AND is_public = 1`,
    [slug]
  );
  return row ? toNote(row) : null;
}

export function updateNote(
  userId: string,
  noteId: string,
  data: { title?: string; contentJson?: string }
): Note | null {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title.trim() || "Untitled note");
  }
  if (data.contentJson !== undefined) {
    fields.push("content_json = ?");
    values.push(data.contentJson);
  }
  if (fields.length === 0) return getNoteById(userId, noteId);

  fields.push("updated_at = datetime('now')");
  values.push(noteId, userId);

  run(
    `UPDATE notes SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
    values
  );
  return getNoteById(userId, noteId);
}
