import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';

let _db: Database | null = null;

export function useDb(): Database {
  if (_db) return _db;

  mkdirSync('data', { recursive: true });

  _db = new Database('data/lookit.db');
  _db.run('PRAGMA journal_mode = WAL');
  _db.run('PRAGMA foreign_keys = ON');

  _db.run(`
    CREATE TABLE IF NOT EXISTS previews (
      id TEXT PRIMARY KEY,
      config TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS selections (
      id TEXT PRIMARY KEY,
      preview_id TEXT NOT NULL REFERENCES previews(id),
      name TEXT NOT NULL,
      lockup TEXT NOT NULL,
      message TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  return _db;
}
