// Categories live in MySQL (see lib/db.js) and are edited in the admin. This
// module only holds the slug rule — the list itself is never hardcoded.
export const categorySlug = name =>
  (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const categoryHref = slugOrName => `/category/${categorySlug(slugOrName)}`;
