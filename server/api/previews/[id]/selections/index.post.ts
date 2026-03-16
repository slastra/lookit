import { nanoid } from 'nanoid';
import { useDb } from '~~/server/utils/db';
import { selectionsEmitter } from '~~/server/utils/selections-emitter';

export default defineEventHandler(async (event) => {
  const previewId = getRouterParam(event, 'id');
  if (!previewId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing preview id' });
  }

  const body = await readBody(event);
  if (!body?.name || !body?.lockup) {
    throw createError({ statusCode: 400, statusMessage: 'name and lockup are required' });
  }

  const db = useDb();

  const preview = db.query('SELECT id FROM previews WHERE id = ?').get(previewId);
  if (!preview) {
    throw createError({ statusCode: 404, statusMessage: 'Preview not found' });
  }

  const id = nanoid(12);
  db.run(
    'INSERT INTO selections (id, preview_id, name, lockup, message) VALUES (?, ?, ?, ?, ?)',
    [id, previewId, body.name, JSON.stringify(body.lockup), body.message || null],
  );

  const selection = {
    id,
    preview_id: previewId,
    name: body.name,
    lockup: body.lockup,
    message: body.message || null,
    created_at: Math.floor(Date.now() / 1000),
  };

  selectionsEmitter.emit(`selection:${previewId}`, selection);

  return selection;
});
