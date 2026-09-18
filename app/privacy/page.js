import { readSite } from '../../lib/store';
import { LegalPage } from '../LegalPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const site = await readSite();
  return { title: `${site.legal?.privacyHeading || 'Privacy'} — ${site.seo?.title || ''}` };
}

export default async function Privacy() {
  const site = await readSite();
  return (
    <LegalPage site={site} heading={site.legal?.privacyHeading} body={site.legal?.privacy} />
  );
}
