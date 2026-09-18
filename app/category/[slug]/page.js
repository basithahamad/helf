import { notFound } from 'next/navigation';
import { readSite, articlesByCategory } from '../../../lib/store';
import { categoryFromSlug } from '../../../lib/categories';
import { Masthead, SiteFooter } from '../../Chrome';
import { ArticleList } from '../../ArticleList';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const name = categoryFromSlug(slug);
  return name ? { title: `${name} — The H.E.L.F Review` } : {};
}

export default async function Category({ params }) {
  const { slug } = await params;
  const name = categoryFromSlug(slug);

  // Only the known categories get a page; anything else is a genuine 404
  // rather than an empty list for a made-up URL.
  if (!name) notFound();

  const [site, articles] = await Promise.all([readSite(), articlesByCategory(name)]);

  return (
    <>
      <Masthead site={site} active={name} />
      <section className="latest">
        <div className="wrap">
          <div className="sec-head">
            <h2>{name}</h2>
            <a href="/news">All Stories →</a>
          </div>
          <ArticleList
            articles={articles}
            empty={`No stories in ${name} yet — they'll appear here as they're published.`}
          />
        </div>
      </section>
      <SiteFooter site={site} />
    </>
  );
}
