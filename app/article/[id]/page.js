import { notFound } from 'next/navigation';
import { read, publishedArticles } from '../../../lib/store';
import { Masthead, SiteFooter } from '../../Chrome';

export const dynamic = 'force-dynamic';

const img = s => (s?.startsWith('/') || s?.startsWith('data:') ? s : `/${s}`);

export async function generateMetadata({ params }) {
  const { id } = await params;
  const a = (await publishedArticles()).find(x => x.id === id);
  return a ? { title: `${a.title} — The H.E.L.F Review`, description: a.excerpt } : {};
}

export default async function Article({ params }) {
  const { id } = await params;
  const [site, articles] = await Promise.all([read('site'), publishedArticles()]);
  const a = articles.find(x => x.id === id);

  // Unknown id, or a draft — drafts are filtered out before we get here.
  if (!a) notFound();

  const others = articles.filter(x => x.id !== a.id).slice(0, 3);

  return (
    <>
      <Masthead site={site} />

      <article className="single">
        <div className="wrap narrow">
          <span className="kicker solid">{a.category || 'News'}</span>
          <h1>{a.title}</h1>
          {a.excerpt && <p className="dek">{a.excerpt}</p>}
          <div className="byline">
            By <b>{a.author || 'Staff'}</b>{a.date ? ` · ${a.date}` : ''}
          </div>
        </div>

        {a.image && (
          <div className="wrap">
            <figure className="hero-figure">
              <img src={img(a.image)} alt={a.title} />
              {a.caption && <figcaption>{a.caption}</figcaption>}
            </figure>
          </div>
        )}

        <div className="wrap narrow">
          {a.body
            // Body is authored in the admin's rich-text field, which emits a
            // small, fixed set of formatting tags.
            ? <div className="article-body" dangerouslySetInnerHTML={{ __html: a.body }} />
            : <p className="article-body">{a.excerpt}</p>}
        </div>
      </article>

      {others.length > 0 && (
        <section className="latest">
          <div className="wrap">
            <div className="sec-head"><h2>More from The Review</h2></div>
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
