// The category list, shared by the public nav, the admin's dropdown and the
// /category/<slug> pages. Slugs are derived, never stored — an article keeps its
// human-readable category ("HBCU Spotlight") and the URL uses the slug.
export const CATEGORIES = [
  'Featured Stories', 'Latest News', 'Leadership', 'HBCU Spotlight', 'Events',
  'Announcements', 'Commentary', 'Research & Policy', 'Alumni Voices'
];

export const categorySlug = name =>
  (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const categoryFromSlug = slug =>
  CATEGORIES.find(c => categorySlug(c) === slug) || null;

export const categoryHref = name => `/category/${categorySlug(name)}`;
