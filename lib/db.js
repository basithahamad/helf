// MySQL connection pool and schema for The H.E.L.F Review.
//
// Configure with DATABASE_URL (mysql://user:pass@host:3306/helf) or the
// discrete DB_* variables. The schema is created on first use and seeded from
// the checked-in files under data/, so a fresh server is never blank.
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS articles (
     id          VARCHAR(80)   NOT NULL,
     title       VARCHAR(400)  NOT NULL,
     category    VARCHAR(120)      NULL,
     author      VARCHAR(160)      NULL,
     date_label  VARCHAR(80)       NULL,
     excerpt     TEXT              NULL,
     body        MEDIUMTEXT        NULL,
     image       VARCHAR(600)      NULL,
     caption     VARCHAR(600)      NULL,
     url         VARCHAR(600)      NULL,
     status      VARCHAR(16)   NOT NULL DEFAULT 'published',
     featured    TINYINT(1)    NOT NULL DEFAULT 0,
     created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
     updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
     PRIMARY KEY (id),
     KEY idx_articles_feed (status, created_at)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // The category list behind the top nav, the footer column and the admin's
  // dropdown. Editable in the admin — nothing about it is fixed in code.
  `CREATE TABLE IF NOT EXISTS categories (
     id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
     name        VARCHAR(120)  NOT NULL,
     slug        VARCHAR(140)  NOT NULL,
     sort_order  INT           NOT NULL DEFAULT 0,
     in_nav      TINYINT(1)    NOT NULL DEFAULT 1,
     in_footer   TINYINT(1)    NOT NULL DEFAULT 0,
     PRIMARY KEY (id),
     UNIQUE KEY uniq_category_slug (slug)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Newsletter sign-ups from the public form. The email is unique, so a repeat
  // sign-up is a no-op rather than a duplicate row.
  `CREATE TABLE IF NOT EXISTS subscribers (
     id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
     email       VARCHAR(320)  NOT NULL,
     name        VARCHAR(160)      NULL,
     created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
     PRIMARY KEY (id),
     UNIQUE KEY uniq_subscriber_email (email)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // One row (id = 1) holding the page copy: masthead, About panel, editor
  // profile, commentary cards, footer. It is edited as a whole document.
  `CREATE TABLE IF NOT EXISTS site_doc (
     id          TINYINT UNSIGNED NOT NULL,
     doc         JSON          NOT NULL,
     updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
     PRIMARY KEY (id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

let poolPromise = null;

function createPool() {
  const common = {
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
    dateStrings: false,
    enableKeepAlive: true
  };
  return process.env.DATABASE_URL
    ? mysql.createPool({ uri: process.env.DATABASE_URL, ...common })
    : mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'helf_review',
        ...common
      });
}

// Every query goes through here, so the schema check runs once per process.
export function db() {
  if (!poolPromise) {
    poolPromise = (async () => {
      const pool = createPool();
      try {
        for (const stmt of SCHEMA) await pool.query(stmt);
        await seed(pool);
      } catch (err) {
        poolPromise = null;           // let the next request retry a cold DB
        await pool.end().catch(() => {});
        throw err;
      }
      return pool;
    })();
  }
  return poolPromise;
}

export async function query(sql, params = []) {
  const pool = await db();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

function seedFile(name) {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', name), 'utf8')); }
  catch { return null; }
}

// First run only: copy data/*.json into the tables. Anything already in MySQL
// wins — this never overwrites edited content.
async function seed(pool) {
  const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM articles');
  if (n === 0) {
    for (const a of seedFile('articles.json') || []) {
      await pool.execute(
        `INSERT IGNORE INTO articles
           (id, title, category, author, date_label, excerpt, body, image, caption, url, status, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.title, a.category ?? null, a.author ?? null, a.date ?? null, a.excerpt ?? null,
         a.body ?? null, a.image ?? null, a.caption ?? null, a.url ?? null,
         a.status === 'draft' ? 'draft' : 'published', a.featured ? 1 : 0]
      );
    }
  }
  const site = seedFile('site.json');
  if (site) {
    await pool.execute('INSERT IGNORE INTO site_doc (id, doc) VALUES (1, ?)', [JSON.stringify(site)]);
  }

  const [[{ c }]] = await pool.query('SELECT COUNT(*) AS c FROM categories');
  if (c === 0) {
    const cats = seedFile('categories.json') || [];
    for (const [i, cat] of cats.entries()) {
      await pool.execute(
        'INSERT IGNORE INTO categories (name, slug, sort_order, in_nav, in_footer) VALUES (?, ?, ?, ?, ?)',
        [cat.name, cat.slug, cat.sortOrder ?? i, cat.inNav === false ? 0 : 1, cat.inFooter ? 1 : 0]
      );
    }
  }
}
