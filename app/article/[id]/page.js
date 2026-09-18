import { notFound } from 'next/navigation';
import { readSite, getArticle, publishedArticles } from '../../../lib/store';
import { Masthead, SiteFooter } from '../../Chrome';

export const dynamic = 'force-dynamic';

const img = s => (s?.startsWith('/') || s?.startsWith('data:') ? s : `/${s}`);

export async function generateMetadata({ params }) {
  const { id } = await params;
  const [a, site] = await Promise.all([getArticle(id), readSite()]);
  return a ? { title: `${a.title} — ${site.seo?.title || ''}`, description: a.excerpt } : {};
}

export default async function Article({ params }) {
  const { id } = await params;
  const [site, a, articles] = await Promise.all([readSite(), getArticle(id), publishedArticles()]);

  // Unknown id, or a draft — getArticle only returns published stories here.
  if (!a) notFound();

  const others = articles.filter(x => x.id !== a.id).slice(0, 3);

  return (
    <>
      <Masthead site={site} />

      <article className="single">
        <header className="article-head">
          {a.category && <div className="cat">{a.category}</div>}
          <h1>{a.title}</h1>
          {a.excerpt && <p className="standfirst">{a.excerpt}</p>}
          <div className="byline">
            <span className="who">
              <b>By {a.author || site.sections?.staffByline}</b>
              <span>{a.date || ''}</span>
            </span>
          </div>
        </header>

        {a.image && (
          <div className="article-hero">
            <figure>
              <img src={img(a.image)} alt={a.title} />
              {a.caption && <figcaption dangerouslySetInnerHTML={{ __html: a.caption }} />}
            </figure>
          </div>
        )}

        {/* Body is authored in the admin's rich-text field, which emits a
            small, fixed set of formatting tags. */}
        <div className="article-body"
          dangerouslySetInnerHTML={{ __html: a.body || `<p>${a.excerpt || ''}</p>` }} />
      </article>

      {others.length > 0 && (
        <section className="latest">
          <div className="wrap">
            <div className="sec-head"><h2>{site.sections?.moreFromHeading}</h2></div>
            <div className="news-list">
              {others.map(o => (
                <article className="item" key={o.id}>
                  <a className="thumb" href={o.url || `/article/${encodeURIComponent(o.id)}`}>
                    {o.image && <img src={img(o.image)} alt="" />}
                  </a>
                  <div>
                    <span className="kicker solid">{o.category || 'News'}</span>
                    <h3><a href={o.url || `/article/${encodeURIComponent(o.id)}`}>{o.title}</a></h3>
                    <p>{o.excerpt}</p>
                    <span className="meta">By <b>{o.author || 'Staff'}</b>{o.date ? ` · ${o.date}` : ''}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter site={site} />
    </>
  );
}
