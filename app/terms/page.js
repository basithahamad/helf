import { readSite } from '../../lib/store';
import { LegalPage } from '../LegalPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const site = await readSite();
  return { title: `${site.legal?.termsHeading || 'Terms'} — ${site.seo?.title || ''}` };
}

export default async function Terms() {
  const site = await readSite();
  return (
    <LegalPage site={site} heading={site.legal?.termsHeading} body={site.legal?.terms} />
  );
}
