import { readSite, searchArticles } from '../../lib/store';
import { Masthead, SiteFooter } from '../Chrome';
import { ArticleList } from '../ArticleList';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Search — The H.E.L.F Review' };

export default async function Search({ searchParams }) {
  const { q = '' } = await searchParams;
  const term = q.trim();
  const [site, results] = await Promise.all([
    readSite(),
    term ? searchArticles(term) : Promise.resolve([])
  ]);

  return (
    <>
      <Masthead site={site} />
      <section className="latest">
        <div className="wrap">
          <div className="sec-head">
            <h2>{term ? `Search: “${term}”` : 'Search'}</h2>
            {term && <span className="meta">{results.length} result{results.length === 1 ? '' : 's'}</span>}
          </div>
          {term
            ? <ArticleList articles={results} empty={`Nothing matched “${term}”. Try a different word.`} />
            : <p style={{ color: 'var(--muted)', padding: '2rem 0' }}>
                Type a word or phrase in the search box above to find stories.
              </p>}
        </div>
      </section>
      <SiteFooter site={site} />
    </>
  );
}
