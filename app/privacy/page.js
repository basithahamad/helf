import { readSite } from '../../lib/store';
import { LegalPage, DEFAULT_PRIVACY } from '../LegalPage';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Privacy Policy — The H.E.L.F Review' };

export default async function Privacy() {
  const site = await readSite();
  return (
    <LegalPage
      site={site}
      heading={site.legal?.privacyHeading || 'Privacy Policy'}
      body={site.legal?.privacy || DEFAULT_PRIVACY}
    />
  );
}
