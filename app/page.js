import { read, publishedArticles } from '../lib/store';
import { Masthead, SiteFooter } from './Chrome';
import { SubscribeForm } from './Forms';

// Articles are edited through /admin and must appear immediately.
export const dynamic = 'force-dynamic';

const href = a => a.url || `/article/${encodeURIComponent(a.id)}`;
const img = s => (s?.startsWith('/') || s?.startsWith('data:') ? s : `/${s}`);

export default async function Home() {
  const [site, articles] = await Promise.all([read('site'), publishedArticles()]);

  const editor = site.editor || {};
  const about = site.about || {};
  const sections = site.sections || {};

  const featured = articles.find(a => a.featured) || articles[0];
  const rest = articles.filter(a => a !== featured);

  return (
    <>
      <Masthead site={site} />

      {featured && (
        <div className="ticker">
          <div className="wrap">
            <b>Featured</b>
            <span><a href={href(featured)}>“{featured.title}” Read the story →</a></span>
          </div>
        </div>
      )}

      <section className="hero">
        <div className="wrap">
          <div className={`mosaic${rest.length ? '' : ' solo'}`}>
            {featured && (
              <article className="story lead">
                {featured.image && <img src={img(featured.image)} alt={featured.title} />}
                <div className="veil" />
                <div className="txt">
                  <span className="kicker gold">{featured.category || 'Feature'}</span>
                  <h2><a href={href(featured)}>{featured.title}</a></h2>
                  <p className="dek">{featured.excerpt}</p>
                  <span className="meta">
                    By <b>{featured.author || 'Staff'}</b>{featured.date ? ` · ${featured.date}` : ''}
                  </span>
                </div>
              </article>
            )}
            {rest.slice(0, 2).map(a => (
              <article className="story small" key={a.id}>
                {a.image && <img src={img(a.image)} alt={a.title} />}
                <div className="veil" />
                <div className="txt">
                  <span className="kicker ghost">{a.category || 'News'}</span>
                  <h3><a href={href(a)}>{a.title}</a></h3>
                  <span className="meta">{a.date || ''}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="latest">
        <div className="wrap">
          <div className="cols">
            <div>
              <div className="sec-head">
                <h2>{sections.latestHeading}</h2>
                <a href="#">View All →</a>
              </div>
              <div className="news-list">
                {articles.map(a => (
                  <article className="item" key={a.id}>
                    <a className="thumb" href={href(a)}>
                      {a.image && <img src={img(a.image)} alt="" />}
                    </a>
                    <div>
                      <span className="kicker solid">{a.category || 'News'}</span>
                      <h3><a href={href(a)}>{a.title}</a></h3>
                      <p>{a.excerpt}</p>
                      <span className="meta">
                        By <b>{a.author || 'Staff'}</b>{a.date ? ` · ${a.date}` : ''}
                      </span>
                    </div>
                  </article>
                ))}
                {!articles.length && (
                  <p style={{ color: 'var(--muted)', padding: '2rem 0' }}>
                    No articles published yet.
                  </p>
                )}
              </div>
            </div>

            <aside>
              <div className="widget editor-w">
                <h3>{editor.widgetHeading}</h3>
                <div className="headshot">
                  <img src={img(editor.image)} alt={`${editor.name}, ${editor.role}`} />
                </div>
                <b>{editor.name}</b>
                <span className="role">{editor.role}</span>
                <p>{editor.bio}</p>
                <a className="more" href={editor.fullBioUrl || '#'}>{editor.fullBioLabel}</a>
              </div>

              <div className="widget">
                <h3>Most Read</h3>
                {articles.slice(0, 4).map((a, i) => (
                  <div className="mini" key={a.id}>
                    <span className="n">{i + 1}</span>
                    <a href={href(a)}>{a.title}</a>
                  </div>
                ))}
              </div>

              <div className="widget">
                <h3>Upcoming Events</h3>
                <div className="event">
                  <div className="date-chip"><b>15</b><span>May</span></div>
                  <div>
                    <h4><a href="#">Ideation, Innovation &amp; Collaboration Convening</a></h4>
                    <span className="meta">Virginia State University</span>
                  </div>
                </div>
                <div className="event">
                  <div className="date-chip"><b>—</b><span>TBA</span></div>
                  <div>
                    <h4><a href="#">H.E.L.F. Leadership Institute</a></h4>
                    <span className="meta">Dates to be announced</span>
                  </div>
                </div>
              </div>

              <div className="widget about-widget" id="about-helf">
                <h3>{about.heading}</h3>
                <p>{about.text}</p>
                <a className="btn btn-gold" style={{ marginTop: '1.2rem' }}
                  href={about.parentLinkUrl} target="_blank" rel="noopener">
                  {about.parentLinkLabel}
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="subscribe" id="subscribe">
        <div className="wrap">
          <div className="inner">
            <div>
              <h2>Get <i>{site.brand?.name} {site.brand?.nameEm}</i> in your inbox</h2>
              <p>
                Featured stories, event announcements, and leadership insights from the
                Higher Education Leadership Foundation.
              </p>
            </div>
            <SubscribeForm />
          </div>
        </div>
      </section>

      <section className="commentary">
        <div className="wrap">
          <div className="sec-head">
            <h2>{sections.commentaryHeading}</h2>
            <a href="#">All Commentary →</a>
          </div>
          <div className="comm-grid">
            {(site.commentary || []).map((c, i) => (
              <article className="comm" key={i}>
                <q>{c.quote}</q>
                <div className="author">
                  <div className="avatar"><img src={img(c.image)} alt="" /></div>
                  <div><b>{c.name}</b><span>{c.title}</span></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter site={site} />
    </>
  );
}
