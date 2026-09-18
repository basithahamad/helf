import { SearchForm } from './Forms';
import { listCategories } from '../lib/store';
import { categoryHref } from '../lib/categories';

// Masthead, category nav and footer — shared by every page. Every label, link
// and image here comes from the site document or the categories table; nothing
// is written into the markup.
// `active` is the category name to highlight in the nav, if any.

export async function Masthead({ site, active }) {
  const brand = site.brand || {};
  const utility = site.utility || {};
  const categories = (await listCategories()).filter(c => c.inNav);

  return (
    <>
      <div className="utility">
        <div className="wrap">
          <span>{brand.utilityDate || ''}</span>
          <span>
            {utility.mainSiteUrl && (
              <a href={utility.mainSiteUrl} target="_blank" rel="noopener">{utility.mainSiteLabel}</a>
            )}
            {utility.aboutLabel && <>&nbsp;·&nbsp; <a href="/#about-helf">{utility.aboutLabel}</a></>}
            {utility.newsletterLabel && <>&nbsp;·&nbsp; <a href="/#subscribe">{utility.newsletterLabel}</a></>}
          </span>
        </div>
      </div>

      <header className="masthead">
        <div className="wrap">
          <a className="brand" href="/">
            {brand.logo && <img className="brand-logo" src={brand.logo} alt={brand.logoAlt || ''} />}
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
            <li><a className={active ? '' : 'active'} href="/">{brand.homeLabel || 'Home'}</a></li>
            {categories.map(c => (
              <li key={c.id}>
                <a className={active === c.name ? 'active' : ''} href={categoryHref(c.slug)}>{c.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

export async function SiteFooter({ site }) {
  const brand = site.brand || {};
  const footer = site.footer || {};
  const categories = (await listCategories()).filter(c => c.inFooter);

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand" style={{ marginBottom: '1.1rem' }}>
              {brand.logo && (
                <img className="brand-logo" style={{ width: 50, height: 50 }}
                  src={brand.logo} alt={brand.logoAlt || ''} />
              )}
              <span className="brand-name">
                <b style={{ color: '#fff', fontSize: '1.3rem' }}>
                  {brand.name} <i style={{ color: 'var(--gold-bright)' }}>{brand.nameEm}</i>
                </b>
                <span style={{ color: '#8e666e' }}>{footer.orgName}</span>
              </span>
            </div>
            <p>{footer.blurb}</p>
          </div>
          <div>
            <h4>{footer.sectionsHeading}</h4>
            <ul>
              {categories.map(c => (
                <li key={c.id}><a href={categoryHref(c.slug)}>{c.name}</a></li>
              ))}
              {footer.allStoriesLabel && <li><a href="/news">{footer.allStoriesLabel}</a></li>}
            </ul>
          </div>
          <div>
            <h4>{footer.aboutHeading}</h4>
            <ul>
              {footer.parentLinkUrl && (
                <li>
                  <a href={footer.parentLinkUrl} target="_blank" rel="noopener">{footer.parentLinkLabel}</a>
                </li>
              )}
              {footer.aboutReviewLabel && <li><a href="/#about-helf">{footer.aboutReviewLabel}</a></li>}
              {footer.newsletterLabel && <li><a href="/#subscribe">{footer.newsletterLabel}</a></li>}
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>{footer.copyright}</span>
          <span>
            <a href="/privacy">{footer.privacyLabel}</a>
            &nbsp;·&nbsp;
            <a href="/terms">{footer.termsLabel}</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
