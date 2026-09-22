import { readSite, publishedArticles, mostReadArticles } from '../lib/store';
import { categoryHref } from '../lib/categories';
import { Masthead, SiteFooter } from './Chrome';
import { SubscribeForm } from './Forms';
import { ArticleList } from './ArticleList';
import { SITE_URL } from './layout';

// Articles are edited through /admin and must appear immediately.
export const dynamic = 'force-dynamic';

const href = a => a.url || `/article/${encodeURIComponent(a.id)}`;
const img = s => (s?.startsWith('/') || s?.startsWith('data:') ? s : `/${s}`);

// Copy written in the admin with blank lines between paragraphs should read as
// paragraphs on the page rather than one unbroken block.
const paragraphs = text => (text || '').split(/\n\s*\n/).map(t => t.trim()).filter(Boolean);

export default async function Home() {
  const [site, articles, mostRead] = await Promise.all([
    readSite(), publishedArticles(), mostReadArticles(4)
  ]);

  const editor = site.editor || {};
  const about = site.about || {};
  const sections = site.sections || {};

  const featured = articles.find(a => a.featured) || articles[0];
  const rest = articles.filter(a => a !== featured);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        name: site.seo?.siteName || site.seo?.title,
        url: SITE_URL,
        logo: site.brand?.logo ? `${SITE_URL}${site.brand.logo}` : undefined,
        parentOrganization: site.footer?.orgName
          ? { '@type': 'Organization', name: site.footer.orgName, url: site.footer.parentLinkUrl }
          : undefined
      },
      {
        '@type': 'WebSite',
        name: site.seo?.siteName || site.seo?.title,
        url: SITE_URL,
        // Lets search engines offer a search box straight into the site.
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Masthead site={site} />

      {featured && (
        <div className="ticker">
          <div className="wrap">
            <b>{sections.featuredLabel}</b>
            <span><a href={href(featured)}>“{featured.title}” {sections.featuredReadMore}</a></span>
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
                <a href="/news">{sections.viewAllLabel}</a>
              </div>
              <ArticleList articles={articles} empty={sections.emptyMessage} />
            </div>

            <aside>
              <div className="widget editor-w">
                <h3>{editor.widgetHeading}</h3>
                <div className="headshot">
                  <img src={img(editor.image)} alt={`${editor.name}, ${editor.role}`} />
                </div>
                <b>{editor.name}</b>
                <span className="role">{editor.role}</span>
                {/* Blank lines in the admin become real paragraphs; as one <p>
                    a longer welcome ran together into a single block. */}
                {paragraphs(editor.bio).map((para, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
                ))}
                <a className="more" href={editor.fullBioUrl || '#'}>{editor.fullBioLabel}</a>
              </div>

              {mostRead.length > 0 && (
                <div className="widget">
                  <h3>{sections.mostReadHeading}</h3>
                  {mostRead.map((a, i) => (
                    <div className="mini" key={a.id}>
                      <span className="n">{i + 1}</span>
                      <a href={href(a)}>{a.title}</a>
                    </div>
                  ))}
                </div>
              )}

              <div className="widget">
                <h3>{sections.eventsHeading}</h3>
                {(site.events || []).map((e, i) => (
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
                {paragraphs(about.text).map((para, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
                ))}
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
          {/* The band's photograph is a setting, not a stylesheet constant. */}
          <div
            className="inner"
            style={{
              backgroundImage:
                'linear-gradient(100deg,rgba(42,6,13,.93) 38%,rgba(86,13,24,.8) 68%,rgba(125,19,34,.6))' +
                (sections.subscribeImage ? `, url('${sections.subscribeImage}')` : '')
            }}
          >
            <div>
              <h2>{sections.subscribeHeading}</h2>
              <p>{sections.subscribeBlurb}</p>
            </div>
            <SubscribeForm />
          </div>
        </div>
      </section>

      <section className="commentary">
        <div className="wrap">
          <div className="sec-head">
            <h2>{sections.commentaryHeading}</h2>
            {/* Which category that link opens is itself a setting, not an assumption. */}
            <a href={categoryHref(sections.allCommentarySlug)}>{sections.allCommentaryLabel}</a>
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
