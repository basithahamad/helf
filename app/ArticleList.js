import { categoryHref } from '../lib/categories';

// The standard story list, shared by the home page's "Latest News" column and
// the /news, /category/… and /search pages.
const img = s => (s?.startsWith('/') || s?.startsWith('data:') ? s : `/${s}`);
const href = a => a.url || `/article/${encodeURIComponent(a.id)}`;

export function ArticleList({ articles, empty = 'Nothing here yet.' }) {
  if (!articles.length) {
    return <p style={{ color: 'var(--muted)', padding: '2rem 0' }}>{empty}</p>;
  }
  return (
    <div className="news-list">
      {articles.map(a => (
        <article className="item" key={a.id}>
          <a className="thumb" href={href(a)}>
            {a.image && <img src={img(a.image)} alt="" />}
          </a>
          <div>
            <a href={categoryHref(a.category || 'Latest News')}>
              <span className="kicker solid">{a.category || 'News'}</span>
            </a>
            <h3><a href={href(a)}>{a.title}</a></h3>
            <p>{a.excerpt}</p>
            <span className="meta">
              By <b>{a.author || 'Staff'}</b>{a.date ? ` · ${a.date}` : ''}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
