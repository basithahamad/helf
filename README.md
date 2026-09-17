# The H.E.L.F Review

Public site plus a small CMS at `/admin`, built with Next.js. Content lives in
**MySQL**; uploaded photos are **files on the server**.

## Setup

```bash
npm install
cp .env.example .env.local     # fill in the MySQL settings and ADMIN_CODE
npm run dev                    # http://localhost:8742
```

Create the database once — the tables and the starting content are created
automatically on the first request:

```sql
CREATE DATABASE helf_review CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'helf'@'localhost' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON helf_review.* TO 'helf'@'localhost';
```

`lib/db.js` creates `articles` and `site_doc` if they are missing and seeds them
from `data/articles.json` and `data/site.json`. Seeding only happens when the
tables are empty, so it never overwrites edited content.

## Where things live

| | |
|---|---|
| `lib/db.js` | pool, schema, first-run seed |
| `lib/store.js` | articles + site content queries |
| `lib/uploads.js` | writing and resolving uploaded files |
| `app/api/upload` | `POST` multipart image upload (admin only) |
| `app/media/[...path]` | serves the uploaded files |

Photos are downscaled to 1600px in the browser, uploaded, then stored under
`UPLOAD_DIR` (default `./uploads`) with a content-hash name such as
`8e/8efa8abf….jpg` and referenced as `/media/8e/8efa8abf….jpg`. Identical files
are stored once and served `immutable`, so the URL can be cached forever.

Uploads deliberately sit **outside** `public/`: that folder is fixed at build
time, so files written there after a build are not served.

## Deployment notes

- `UPLOAD_DIR` must be writable and on persistent storage — back it up along
  with the database. A build does not touch it.
- Behind nginx, raise the body limit to match `MAX_UPLOAD_MB`:
  `client_max_body_size 8m;`
- `ADMIN_CODE` is the only thing protecting `/admin` and the upload endpoint.
  Set a real one and serve the site over HTTPS.
