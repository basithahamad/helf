import { readSite, publishedArticles } from '../../lib/store';
import { Masthead, SiteFooter } from '../Chrome';
import { ArticleList } from '../ArticleList';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'All Stories — The H.E.L.F Review' };

export default async function News() {
  const [site, articles] = await Promise.all([readSite(), publishedArticles()]);

  return (
    <>
      <Masthead site={site} />
      <section className="latest">
        <div className="wrap">
          <div className="sec-head">
            <h2>All Stories</h2>
            <span className="meta">{articles.length} published</span>
          </div>
          <ArticleList articles={articles} empty="No stories published yet." />
        </div>
      </section>
      <SiteFooter site={site} />
    </>
  );
}
