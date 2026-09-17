import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveMedia, CONTENT_TYPES } from '../../../lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const missing = () => new Response('Not found', { status: 404 });

// Serves uploaded images. They live outside public/ because public/ is fixed at
// build time; a route handler reads them from disk on every request instead.
export async function GET(_request, { params }) {
  const { path: segments } = await params;
  const abs = resolveMedia(segments || []);
  if (!abs) return missing();

  const type = CONTENT_TYPES[path.extname(abs).slice(1).toLowerCase()];
  if (!type) return missing();

  let file;
  try { file = await fs.readFile(abs); }
  catch { return missing(); }

  return new Response(file, {
    headers: {
      'Content-Type': type,
      'Content-Length': String(file.length),
      // File names are content hashes, so a stored URL never changes meaning.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
