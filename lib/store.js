// Shared data access for The H.E.L.F Review.
//
//   articles   the blog itself, one row per story
//   site_doc   page copy (masthead, About panel, editor profile, footer)
//
// Both live in MySQL — see lib/db.js for connection settings and the schema.
// Uploaded images are files on the server; only their /media/… URL is stored.
import { db, query } from './db';
import { categorySlug } from './categories';

// No fallback on purpose: if ADMIN_CODE is unset — a missing .env, a renamed
// variable — every admin request is refused rather than quietly accepting a
// default that anyone could guess.
const ADMIN_CODE = process.env.ADMIN_CODE || '';

export function authorised(request) {
  const sent = request.headers.get('x-admin-code');
  return ADMIN_CODE.length > 0 && sent === ADMIN_CODE;
}

// Drafts are never shown publicly. Articles written before drafts existed have
// no status and count as published.
export const isPublished = a => a.status !== 'draft';

/* ---------------------------------------------------------------- articles */

// Editable fields, in the shape the admin and the pages use. `date` is a free
// text label ("September 5, 2026"), not a timestamp, so it keeps its own column
// name to stay clear of created_at.
const FIELDS = {
  title: 'title', category: 'category', author: 'author', date: 'date_label',
  excerpt: 'excerpt', body: 'body', image: 'image', caption: 'caption',
  url: 'url', status: 'status', featured: 'featured'
};

const SELECT = `SELECT id, title, category, author, date_label, excerpt, body, image,
                       caption, url, status, featured, created_at
                  FROM articles`;

const fromRow = r => r && {
  id: r.id, title: r.title, category: r.category, author: r.author, date: r.date_label,
  excerpt: r.excerpt, body: r.body, image: r.image, caption: r.caption, url: r.url,
  status: r.status, featured: !!r.featured, createdAt: r.created_at?.toISOString?.() ?? r.created_at
};

// Only known fields reach SQL, and each is normalised to something MySQL takes.
function toColumns(body) {
  const out = {};
  for (const [key, column] of Object.entries(FIELDS)) {
    if (!(key in body)) continue;
    const v = body[key];
    if (key === 'featured') out[column] = v ? 1 : 0;
    else if (key === 'status') out[column] = v === 'draft' ? 'draft' : 'published';
    else out[column] = v === '' || v === undefined ? null : v;
  }
  return out;
}

export async function listArticles({ includeDrafts = false } = {}) {
  const rows = await query(
    `${SELECT} ${includeDrafts ? '' : "WHERE status <> 'draft'"} ORDER BY created_at DESC, id`
  );
  return rows.map(fromRow);
}

export async function getArticle(id, { includeDrafts = false } = {}) {
  const rows = await query(
    `${SELECT} WHERE id = ?${includeDrafts ? '' : " AND status <> 'draft'"} LIMIT 1`, [id]
  );
  return rows.length ? fromRow(rows[0]) : null;
}

export const publishedArticles = () => listArticles();

// The Most Read panel. Ordered by real reads, falling back to newest while a
// story has none — so a fresh site shows something sensible rather than an
// empty box.
export async function mostReadArticles(limit = 4) {
  const rows = await query(
    `${SELECT} WHERE status <> 'draft' ORDER BY views DESC, created_at DESC LIMIT ${Number(limit) || 4}`
  );
  return rows.map(fromRow);
}

// Fire-and-forget: a failed counter must never break the page it is counting.
export async function recordView(id) {
  try {
    const pool = await db();
    await pool.execute('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
  } catch (err) {
    console.error('view count failed', err);
  }
}

export async function articlesByCategory(category) {
  const rows = await query(
    `${SELECT} WHERE status <> 'draft' AND category = ? ORDER BY created_at DESC, id`, [category]
  );
  return rows.map(fromRow);
}

// Plain substring search across the fields a reader would expect to match.
// LIKE wildcards in the query are escaped so a search for "100%" is literal.
export async function searchArticles(q) {
  const term = `%${String(q).replace(/[\\%_]/g, c => `\\${c}`)}%`;
  const rows = await query(
    `${SELECT} WHERE status <> 'draft'
       AND (title LIKE ? ESCAPE '\\\\' OR excerpt LIKE ? ESCAPE '\\\\'
            OR body LIKE ? ESCAPE '\\\\' OR author LIKE ? ESCAPE '\\\\')
     ORDER BY created_at DESC, id`,
    [term, term, term, term]
  );
  return rows.map(fromRow);
}

export async function createArticle(body) {
  const cols = toColumns(body);
  cols.id = await freeId(body.title);
  const keys = Object.keys(cols);

  await inTransaction(async conn => {
    if (cols.featured) await conn.execute('UPDATE articles SET featured = 0 WHERE featured = 1');
    await conn.execute(
      `INSERT INTO articles (${keys.map(k => `\`${k}\``).join(', ')})
       VALUES (${keys.map(() => '?').join(', ')})`,
      keys.map(k => cols[k])
    );
  });
  return getArticle(cols.id, { includeDrafts: true });
}

// Returns null when the id does not exist, so the route can answer 404.
export async function updateArticle(id, body) {
  const cols = toColumns(body);
  const keys = Object.keys(cols);

  const changed = await inTransaction(async conn => {
    const [[row]] = await conn.execute('SELECT id FROM articles WHERE id = ? FOR UPDATE', [id]);
    if (!row) return false;
    if (cols.featured) await conn.execute('UPDATE articles SET featured = 0 WHERE featured = 1');
    if (keys.length) {
      await conn.execute(
        `UPDATE articles SET ${keys.map(k => `\`${k}\` = ?`).join(', ')} WHERE id = ?`,
        [...keys.map(k => cols[k]), id]
      );
    }
    return true;
  });

  return changed ? getArticle(id, { includeDrafts: true }) : null;
}

export async function deleteArticle(id) {
  const pool = await db();
  const [res] = await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

async function freeId(title) {
  const base = slugify(title);
  const rows = await query('SELECT id FROM articles WHERE id = ? OR id LIKE ?', [base, `${base}-%`]);
  const taken = new Set(rows.map(r => r.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/* ------------------------------------------------------------ site content */

export async function readSite() {
  const rows = await query('SELECT doc FROM site_doc WHERE id = 1');
  if (!rows.length) return {};
  const doc = rows[0].doc;
  return typeof doc === 'string' ? JSON.parse(doc) : doc;
}

export async function writeSite(doc) {
  await query(
    'INSERT INTO site_doc (id, doc) VALUES (1, ?) ON DUPLICATE KEY UPDATE doc = VALUES(doc)',
    [JSON.stringify(doc)]
  );
  return doc;
}

/* -------------------------------------------------------------- categories */

const catFromRow = r => ({
  id: r.id, name: r.name, slug: r.slug, sortOrder: r.sort_order,
  inNav: !!r.in_nav, inFooter: !!r.in_footer
});

export async function listCategories() {
  const rows = await query(
    'SELECT id, name, slug, sort_order, in_nav, in_footer FROM categories ORDER BY sort_order, id'
  );
  return rows.map(catFromRow);
}

export async function categoryBySlug(slug) {
  const rows = await query(
    'SELECT id, name, slug, sort_order, in_nav, in_footer FROM categories WHERE slug = ? LIMIT 1', [slug]
  );
  return rows.length ? catFromRow(rows[0]) : null;
}

// The admin sends the whole list back. Rows with an id are updated, rows
// without are created, and anything missing is removed. Renaming a category
// also moves its articles, so nothing is orphaned by an edit.
export async function saveCategories(list) {
  return inTransaction(async conn => {
    const [existing] = await conn.execute('SELECT id, name FROM categories');
    const previous = new Map(existing.map(e => [e.id, e.name]));
    const kept = new Set();
    const usedSlugs = new Set();

    for (const [i, c] of list.entries()) {
      const name = String(c.name || '').trim();
      if (!name) continue;

      let slug = categorySlug(c.slug || name) || categorySlug(name) || `category-${i + 1}`;
      let n = 2;
      while (usedSlugs.has(slug)) slug = `${categorySlug(c.slug || name)}-${n++}`;
      usedSlugs.add(slug);

      const cols = [name, slug, i, c.inNav === false ? 0 : 1, c.inFooter ? 1 : 0];
      const id = Number(c.id) || 0;

      if (id && previous.has(id)) {
        await conn.execute(
          'UPDATE categories SET name=?, slug=?, sort_order=?, in_nav=?, in_footer=? WHERE id=?',
          [...cols, id]
        );
        const was = previous.get(id);
        if (was !== name) {
          await conn.execute('UPDATE articles SET category=? WHERE category=?', [name, was]);
        }
        kept.add(id);
      } else {
        const [res] = await conn.execute(
          'INSERT INTO categories (name, slug, sort_order, in_nav, in_footer) VALUES (?,?,?,?,?)', cols
        );
        kept.add(res.insertId);
      }
    }

    for (const e of existing) {
      if (!kept.has(e.id)) await conn.execute('DELETE FROM categories WHERE id=?', [e.id]);
    }
    return true;
  });
}

/* ------------------------------------------------------------- subscribers */

// Returns false when the address was already on the list. The public form
// reports success either way — whether someone is already subscribed is not
// something an anonymous visitor should be able to probe.
export async function addSubscriber(email, name) {
  const pool = await db();
  const [res] = await pool.execute(
    'INSERT IGNORE INTO subscribers (email, name) VALUES (?, ?)',
    [email.trim().toLowerCase(), name?.trim() || null]
  );
  return res.affectedRows > 0;
}

export async function listSubscribers() {
  const rows = await query('SELECT id, email, name, created_at FROM subscribers ORDER BY created_at DESC');
  return rows.map(r => ({
    id: r.id, email: r.email, name: r.name,
    createdAt: r.created_at?.toISOString?.() ?? r.created_at
  }));
}

/* ------------------------------------------------------------------ shared */

async function inTransaction(fn) {
  const pool = await db();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
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
