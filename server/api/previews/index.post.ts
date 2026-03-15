import { nanoid } from 'nanoid';
import { useDb } from '~~/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid config' });
  }

  const id = nanoid(12);
  const db = useDb();

  db.run(
    'INSERT INTO previews (id, config) VALUES (?, ?)',
    [id, JSON.stringify(body)],
  );

  return { id, url: `/p/${id}` };
});
