import { useDb } from '~~/server/utils/db';

interface SelectionRow {
  id: string;
  preview_id: string;
  name: string;
  lockup: string;
  message: string | null;
  created_at: number;
}

export default defineEventHandler((event) => {
  const previewId = getRouterParam(event, 'id');
  if (!previewId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing preview id' });
  }

  const db = useDb();

  const preview = db.query('SELECT id FROM previews WHERE id = ?').get(previewId);
  if (!preview) {
    throw createError({ statusCode: 404, statusMessage: 'Preview not found' });
  }

  const rows = db.query(
    'SELECT * FROM selections WHERE preview_id = ? ORDER BY created_at DESC',
  ).all(previewId) as SelectionRow[];

  return rows.map(row => ({
    ...row,
    lockup: JSON.parse(row.lockup),
  }));
});
