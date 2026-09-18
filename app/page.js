import { readSite, publishedArticles } from '../lib/store';
import { categoryHref } from '../lib/categories';
import { Masthead, SiteFooter } from './Chrome';
import { SubscribeForm } from './Forms';
import { ArticleList } from './ArticleList';

// Shown until the editor adds their own in the admin's Site Content tab.
const DEFAULT_EVENTS = [
  { day: '15', month: 'May', title: 'Ideation, Innovation & Collaboration Convening', meta: 'Virginia State University' },
  { day: '—', month: 'TBA', title: 'H.E.L.F. Leadership Institute', meta: 'Dates to be announced' }
];

// Articles are edited through /admin and must appear immediately.
export const dynamic = 'force-dynamic';

const href = a => a.url || `/article/${encodeURIComponent(a.id)}`;
const img = s => (s?.startsWith('/') || s?.startsWith('data:') ? s : `/${s}`);

export default async function Home() {
  const [site, articles] = await Promise.all([readSite(), publishedArticles()]);

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
                <a href="/news">View All →</a>
              </div>
              <ArticleList articles={articles} empty="No articles published yet." />
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
                <h3>{sections.eventsHeading || 'Upcoming Events'}</h3>
                {(site.events?.length ? site.events : DEFAULT_EVENTS).map((e, i) => (
                  <div className="event" key={i}>
                    <div className="date-chip"><b>{e.day}</b><span>{e.month}</span></div>
                    <div>
                      {/* An event only becomes a link once it has somewhere to go. */}
                      <h4>{e.url ? <a href={e.url}>{e.title}</a> : e.title}</h4>
                      <span className="meta">{e.meta}</span>
                    </div>
                  </div>
                ))}
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
            <a href={categoryHref('Commentary')}>All Commentary →</a>
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
