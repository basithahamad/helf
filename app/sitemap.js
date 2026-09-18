import { publishedArticles, listCategories } from '../lib/store';
import { SITE_URL } from './layout';

export const dynamic = 'force-dynamic';

// Built from the database on request, so a story published in the admin is in
// the sitemap immediately rather than at the next deploy.
export default async function sitemap() {
  const [articles, categories] = await Promise.all([publishedArticles(), listCategories()]);

  const newest = articles[0]?.createdAt ? new Date(articles[0].createdAt) : new Date();

  return [
    { url: `${SITE_URL}/`, lastModified: newest, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/news`, lastModified: newest, changeFrequency: 'daily', priority: 0.8 },
    ...categories.map(c => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: newest,
      changeFrequency: 'weekly',
      priority: 0.6
    })),
    ...articles.map(a => ({
      url: `${SITE_URL}/article/${encodeURIComponent(a.id)}`,
      lastModified: a.createdAt ? new Date(a.createdAt) : newest,
      changeFrequency: 'monthly',
      priority: a.featured ? 0.9 : 0.7
    })),
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 }
  ];
}
