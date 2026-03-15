import { useDb } from '~~/server/utils/db';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' });
  }

  const db = useDb();
  const row = db.query('SELECT config FROM previews WHERE id = ?').get(id) as { config: string } | null;

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Preview not found' });
  }

  return JSON.parse(row.config);
});
