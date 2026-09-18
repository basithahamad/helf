import { readSite } from '../../lib/store';
import { LegalPage, DEFAULT_TERMS } from '../LegalPage';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Terms of Use — The H.E.L.F Review' };

export default async function Terms() {
  const site = await readSite();
  return (
    <LegalPage
      site={site}
      heading={site.legal?.termsHeading || 'Terms of Use'}
      body={site.legal?.terms || DEFAULT_TERMS}
    />
  );
}
