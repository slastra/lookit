import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';

let _db: Database | null = null;

/** Bumped when a migration below needs to run against an existing database. */
const FONT_NAMES_VERSION = 1;

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

  repairFontNames(_db);

  return _db;
}

/**
 * The editor's font multiselect used to emit whole `{ label, value }` option
 * objects, so previews saved before that was fixed hold options where they
 * should hold names — which reach font-family as "[object Object]" and are
 * silently ignored. The client repairs them on read too, but that leaves the
 * bad shape on disk; this rewrites it once.
 */
function repairFontNames(db: Database) {
  const [row] = db.query('PRAGMA user_version').all() as { user_version: number }[];
  if ((row?.user_version ?? 0) >= FONT_NAMES_VERSION) return;

  const toName = (font: unknown): unknown =>
    font && typeof font === 'object' && 'value' in font
      ? (font as { value: unknown }).value
      : font;

  const previews = db.query('SELECT id, config FROM previews').all() as { id: string; config: string }[];
  for (const preview of previews) {
    let config: Record<string, unknown>;
    try {
      config = JSON.parse(preview.config);
    }
    catch {
      continue;
    }

    const before = JSON.stringify(config);
    if (Array.isArray(config.fonts)) config.fonts = config.fonts.map(toName);
    config.defaultWordmarkFont = toName(config.defaultWordmarkFont);
    config.defaultTaglineFont = toName(config.defaultTaglineFont);

    const after = JSON.stringify(config);
    if (after !== before) {
      db.run('UPDATE previews SET config = ? WHERE id = ?', [after, preview.id]);
    }
  }

  db.run(`PRAGMA user_version = ${FONT_NAMES_VERSION}`);
}
