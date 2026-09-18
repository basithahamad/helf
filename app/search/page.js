import { readSite, searchArticles } from '../../lib/store';
import { Masthead, SiteFooter } from '../Chrome';
import { ArticleList } from '../ArticleList';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const site = await readSite();
  return { title: `${site.sections?.searchHeading || 'Search'} — ${site.seo?.title || ''}` };
}

export default async function Search({ searchParams }) {
  const { q = '' } = await searchParams;
  const term = q.trim();
  const [site, results] = await Promise.all([
    readSite(),
    term ? searchArticles(term) : Promise.resolve([])
  ]);
  const sections = site.sections || {};

  return (
    <>
      <Masthead site={site} />
      <section className="latest">
        <div className="wrap">
          <div className="sec-head">
            <h2>{term ? `${sections.searchHeading}: “${term}”` : sections.searchHeading}</h2>
            {term && <span className="meta">{results.length} result{results.length === 1 ? '' : 's'}</span>}
          </div>
          {term
            ? <ArticleList
                articles={results}
                empty={(sections.searchEmptyMessage || '').replace('{query}', term)}
              />
            : <p style={{ color: 'var(--muted)', padding: '2rem 0' }}>
                {sections.searchPromptMessage}
              </p>}
        </div>
      </section>
      <SiteFooter site={site} />
    </>
  );
}
