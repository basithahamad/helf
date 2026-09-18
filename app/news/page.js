import { readSite, publishedArticles } from '../../lib/store';
import { Masthead, SiteFooter } from '../Chrome';
import { ArticleList } from '../ArticleList';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const site = await readSite();
  return { title: `${site.sections?.allStoriesHeading || 'All Stories'} — ${site.seo?.title || ''}` };
}

export default async function News() {
  const [site, articles] = await Promise.all([readSite(), publishedArticles()]);

  return (
    <>
      <Masthead site={site} />
      <section className="latest">
        <div className="wrap">
          <div className="sec-head">
            <h2>{site.sections?.allStoriesHeading}</h2>
            <span className="meta">{articles.length} published</span>
          </div>
          <ArticleList articles={articles} empty={site.sections?.emptyMessage} />
        </div>
      </section>
      <SiteFooter site={site} />
    </>
  );
}
