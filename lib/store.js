// Shared data access for The H.E.L.F Review.
//
//   articles.json  the blog itself
//   site.json      page copy (masthead, About panel, editor profile, footer)
//
// Vercel Blob when BLOB_READ_WRITE_TOKEN is present, otherwise the checked-in
// file under data/. That file is also the seed and the fallback, so a fresh
// deploy is never blank.
import fs from 'node:fs';
import path from 'node:path';

export const ADMIN_CODE = process.env.ADMIN_CODE || 'helf2026';

const DOCS = {
  site: { blob: 'helf-review/site.json', local: 'site.json', empty: {} },
  articles: { blob: 'helf-review/articles.json', local: 'articles.json', empty: [] }
};

const seedPath = name => path.join(process.cwd(), 'data', DOCS[name].local);

function seed(name) {
  try { return JSON.parse(fs.readFileSync(seedPath(name), 'utf8')); }
  catch { return DOCS[name].empty; }
}

export async function read(name) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: DOCS[name].blob });
      const hit = blobs.find(b => b.pathname === DOCS[name].blob);
      if (!hit) return seed(name);
      const r = await fetch(hit.url, { cache: 'no-store' });
      return await r.json();
    } catch {
      return seed(name);
    }
  }
  return seed(name);
}

export async function write(name, doc) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    await put(DOCS[name].blob, JSON.stringify(doc, null, 2), {
      access: 'public', contentType: 'application/json',
      addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 0
    });
  } else {
    fs.mkdirSync(path.dirname(seedPath(name)), { recursive: true });
    fs.writeFileSync(seedPath(name), JSON.stringify(doc, null, 2));
  }
  return doc;
}

export function authorised(request) {
  return request.headers.get('x-admin-code') === ADMIN_CODE;
}

// Drafts are never shown publicly. Articles written before drafts existed have
// no status and count as published.
export const isPublished = a => a.status !== 'draft';

export async function publishedArticles() {
  return (await read('articles')).filter(isPublished);
}

export function merge(base, incoming) {
  const out = { ...base };
  for (const [k, v] of Object.entries(incoming || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = { ...(base[k] || {}), ...v };
    else out[k] = v;
  }
  return out;
}

export function slugify(title) {
  return (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'article';
}
