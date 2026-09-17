// Image uploads, stored as plain files on the server.
//
// Files land under UPLOAD_DIR (default ./uploads, outside public/ so nothing is
// baked into the build) and are served back by app/media/[...path]/route.js.
// Names are content hashes: re-uploading the same photo reuses the file, and
// the URL can be cached forever.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

// The ignore comment keeps the bundler's file tracer from pulling the whole
// project in: this path is only known at runtime, never at build time.
export const UPLOAD_DIR = path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_MB || 8) * 1024 * 1024;

export const CONTENT_TYPES = {
  jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif'
};

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
  'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif'
};

export class UploadError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// The browser-declared type is a hint; confirm from the bytes before trusting it.
function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length > 6 && buf.subarray(0, 6).toString('latin1').startsWith('GIF8')) return 'gif';
  if (buf.length > 12 && buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  if (buf.length > 12 && buf.subarray(4, 8).toString('latin1') === 'ftyp' && buf.subarray(8, 12).toString('latin1').startsWith('avi')) return 'avif';
  return null;
}

export async function saveUpload(file) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new UploadError(400, 'no file uploaded');
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(413, `file is larger than ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB`);
  }
  if (file.type && !EXT_BY_TYPE[file.type]) throw new UploadError(415, `unsupported type ${file.type}`);

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_UPLOAD_BYTES) throw new UploadError(413, 'file too large');

  const ext = sniff(buf);
  if (!ext) throw new UploadError(415, 'only JPG, PNG, WebP, GIF and AVIF images are accepted');

  const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 24);
  const rel = path.posix.join(hash.slice(0, 2), `${hash}.${ext}`);
  const abs = path.join(UPLOAD_DIR, rel);

  await fs.mkdir(path.dirname(abs), { recursive: true });
  // Identical bytes mean the file is already there; skip the rewrite.
  try { await fs.access(abs); }
  catch { await fs.writeFile(abs, buf); }

  return { url: `/media/${rel}`, path: rel, bytes: buf.length, contentType: CONTENT_TYPES[ext] };
}

// Resolves a /media/… path to a file, refusing anything that escapes UPLOAD_DIR.
export function resolveMedia(segments) {
  const rel = path.posix.join(...segments.map(s => decodeURIComponent(s)));
  const abs = path.resolve(UPLOAD_DIR, rel);
  if (abs !== UPLOAD_DIR && !abs.startsWith(UPLOAD_DIR + path.sep)) return null;
  return abs;
}
