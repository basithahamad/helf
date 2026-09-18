// One-off: lift "Lightning in a Bottle" out of the hand-built HTML page in
// public/ and into data/articles.json, so the story lives in the database like
// every other article and can be edited in the admin.
//
//   node scripts/migrate-lead-article.mjs
//
// Idempotent: re-running just regenerates the same body from the same source.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'public', 'article-lightning-in-a-bottle.html');
const target = path.join(root, 'data', 'articles.json');

const html = fs.readFileSync(source, 'utf8');

const between = (open, close) => {
  const a = html.indexOf(open);
  const b = html.indexOf(close, a);
  if (a === -1 || b === -1) throw new Error(`could not find ${open}`);
  return html.slice(a + open.length, b);
};

// The story itself.
const body = between('<article class="article-body">', '</article>').trim();

// The "About the Editor" card. The anchor id lives on the <section> wrapper in
// the old page, so it is re-applied here — the editor's "Full Bio →" link jumps
// to /article/lightning-in-a-bottle#about-the-editor.
const authorBox = between('<section class="author-box" id="about-the-editor">', '</section>')
  .trim()
  .replace('<div class="author-card">', '<div class="author-card" id="about-the-editor">');

// Hero caption, kept as HTML so the <b> names survive.
const caption = between('<figcaption>', '</figcaption>').trim();

// Image paths in the old page are relative ("assets/img/…"); the app serves
// from the root.
const absolutise = s => s.replace(/(src|href)="assets\//g, '$1="/assets/');

const merged = absolutise(`${body}\n\n${authorBox}`);

const articles = JSON.parse(fs.readFileSync(target, 'utf8'));
const lead = articles.find(a => a.id === 'lightning-in-a-bottle');
if (!lead) throw new Error('lightning-in-a-bottle not found in data/articles.json');

lead.body = merged;
lead.caption = absolutise(caption);
lead.image = lead.image?.startsWith('/') ? lead.image : `/${lead.image}`;
delete lead.url;                       // it now renders at /article/lightning-in-a-bottle

fs.writeFileSync(target, `${JSON.stringify(articles, null, 2)}\n`);

console.log(`body: ${merged.length} chars, ${(merged.match(/<p>/g) || []).length} paragraphs, ` +
            `${(merged.match(/<h2>/g) || []).length} headings, ` +
            `${(merged.match(/class="pull"/g) || []).length} pull quotes`);
console.log(`caption: ${caption.slice(0, 60)}…`);
