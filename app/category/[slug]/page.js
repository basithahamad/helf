import { notFound } from 'next/navigation';
import { readSite, articlesByCategory, categoryBySlug } from '../../../lib/store';
import { Masthead, SiteFooter } from '../../Chrome';
import { ArticleList } from '../../ArticleList';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [category, site] = await Promise.all([categoryBySlug(slug), readSite()]);
  return category ? { title: `${category.name} — ${site.seo?.title || ''}` } : {};
}

export default async function Category({ params }) {
  const { slug } = await params;
  const category = await categoryBySlug(slug);

  // Only categories that exist in the database get a page; anything else is a
  // genuine 404 rather than an empty list for a made-up URL.
  if (!category) notFound();

  const [site, articles] = await Promise.all([readSite(), articlesByCategory(category.name)]);
  const sections = site.sections || {};

  return (
    <>
      <Masthead site={site} active={category.name} />
      <section className="latest">
        <div className="wrap">
          <div className="sec-head">
            <h2>{category.name}</h2>
            <a href="/news">{sections.allStoriesHeading} →</a>
          </div>
          <ArticleList
            articles={articles}
            empty={(sections.emptyCategoryMessage || '').replace('{category}', category.name)}
          />
        </div>
      </section>
      <SiteFooter site={site} />
    </>
  );
}
