import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";

const DB_PATH = path.resolve(process.env.DB_PATH ?? path.join(process.cwd(), "data/app.db"));

// Ensure the parent directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH, { create: true });

// Enable WAL mode for better read concurrency
db.run("PRAGMA journal_mode = WAL;");

// Bootstrap all tables on first run
db.exec(`
  -- better-auth tables (camelCase columns as required by better-auth)
  CREATE TABLE IF NOT EXISTS user (
    id            TEXT    PRIMARY KEY,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image         TEXT,
    createdAt     TEXT    NOT NULL DEFAULT (datetime('now')),
    updatedAt     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS session (
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

  CREATE TABLE IF NOT EXISTS account (
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

  CREATE TABLE IF NOT EXISTS verification (
    id         TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value      TEXT NOT NULL,
    expiresAt  TEXT NOT NULL,
    createdAt  TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Notes table (snake_case columns)
  CREATE TABLE IF NOT EXISTS notes (
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

  CREATE INDEX IF NOT EXISTS idx_notes_user_id    ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug);
  CREATE INDEX IF NOT EXISTS idx_notes_is_public  ON notes(is_public);
`);

export function getDb(): Database {
  return db;
}

export function query<T>(sql: string, params: unknown[] = []): T[] {
  return db.query(sql).all(...params) as T[];
}

export function get<T>(sql: string, params: unknown[] = []): T | undefined {
  return db.query(sql).get(...params) as T | undefined;
}

export function run(sql: string, params: unknown[] = []): void {
  db.query(sql).run(...params);
}
