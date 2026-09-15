import { SearchForm } from './Forms';

// Masthead, category nav and footer — shared by the home page and article pages.

export function Masthead({ site }) {
  const brand = site.brand || {};
  const about = site.about || {};
  return (
    <>
      <div className="utility">
        <div className="wrap">
          <span>{brand.utilityDate || ''}</span>
          <span>
            <a href={about.parentLinkUrl || 'https://heleaders.org/'} target="_blank" rel="noopener">
              H.E.L.F Main Site ↗
            </a>
            &nbsp;·&nbsp; <a href="/#about-helf">About</a>
            &nbsp;·&nbsp; <a href="/#subscribe">Newsletter</a>
          </span>
        </div>
      </div>

      <header className="masthead">
        <div className="wrap">
          <a className="brand" href="/">
            <img className="brand-logo" src="/assets/img/helf-logo.png"
              alt="H.E.L.F. — Higher Education Leadership Foundation crest" />
            <span className="brand-name">
              <b>{brand.name} <i>{brand.nameEm}</i></b>
              <span>{brand.tagline}</span>
            </span>
          </a>
          <div className="masthead-right">
            <SearchForm placeholder={brand.searchPlaceholder} />
            <a className="btn btn-crimson" href="/#subscribe">{brand.subscribeLabel}</a>
          </div>
        </div>
      </header>

      <nav className="catnav">
        <div className="wrap">
          <ul className="tabs">
            {['Home', 'Featured Stories', 'Latest News', 'Leadership', 'HBCU Spotlight',
              'Events', 'Announcements', 'Commentary', 'Research & Policy', 'Alumni Voices'
            ].map((c, i) => (
              <li key={c}><a className={i === 0 ? 'active' : ''} href={i === 0 ? '/' : '#'}>{c}</a></li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

export function SiteFooter({ site }) {
  const brand = site.brand || {};
  const footer = site.footer || {};
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand" style={{ marginBottom: '1.1rem' }}>
              <img className="brand-logo" style={{ width: 50, height: 50 }}
                src="/assets/img/helf-logo.png" alt="H.E.L.F. crest" />
              <span className="brand-name">
                <b style={{ color: '#fff', fontSize: '1.3rem' }}>
                  {brand.name} <i style={{ color: 'var(--gold-bright)' }}>{brand.nameEm}</i>
                </b>
                <span style={{ color: '#8e666e' }}>Higher Education Leadership Foundation</span>
              </span>
            </div>
            <p>{footer.blurb}</p>
          </div>
          <div>
            <h4>Sections</h4>
            <ul>
              {['Featured Stories', 'Latest News', 'Events', 'Announcements', 'Commentary']
                .map(s => <li key={s}><a href="#">{s}</a></li>)}
            </ul>
          </div>
          <div>
            <h4>About</h4>
            <ul>
              <li>
                <a href={footer.parentLinkUrl || 'https://heleaders.org/'} target="_blank" rel="noopener">
                  {footer.parentLinkLabel || 'H.E.L.F Main Site ↗'}
                </a>
              </li>
              <li><a href="/#about-helf">About The Review</a></li>
              <li><a href="/#subscribe">Newsletter</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>{footer.copyright}</span>
          <span><a href="#">Privacy Policy</a> &nbsp;·&nbsp; <a href="#">Terms of Use</a></span>
        </div>
      </div>
    </footer>
  );
}
