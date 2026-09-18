import { Masthead, SiteFooter } from './Chrome';

// Privacy and Terms share this shell. The wording lives in the site document so
// the editor can change it in the admin without a deploy; these defaults
// describe what the site actually does today.
export function LegalPage({ site, heading, body }) {
  const paragraphs = (body || '').split(/\n\s*\n/).filter(Boolean);
  return (
    <>
      <Masthead site={site} />
      <article className="single">
        <div className="wrap narrow">
          <h1>{heading}</h1>
          <div className="article-body">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </article>
      <SiteFooter site={site} />
    </>
  );
}

export const DEFAULT_PRIVACY = `The H.E.L.F Review is published by the Higher Education Leadership Foundation. This page explains what we collect and why.

If you sign up for our newsletter we store the name and email address you give us, so that we can send you the newsletter. We do not sell or share that information, and every email includes a link to unsubscribe.

Our server keeps standard web logs — the page requested, the time, and the requesting IP address — which we use to keep the site running and secure. We do not use advertising or tracking cookies.

To ask what we hold about you, or to have it deleted, write to us and we will act on the request.`;

export const DEFAULT_TERMS = `The articles, photographs and other material on The H.E.L.F Review are published by the Higher Education Leadership Foundation and are protected by copyright.

You are welcome to read, link to and quote briefly from our work with attribution to The H.E.L.F Review. Republishing a full article, or using our photographs elsewhere, requires written permission.

We take care to be accurate. If you believe something we have published is wrong, tell us and we will review it and correct the record where correction is due.

The site is provided as it is. Links to other organisations are offered for convenience and we are not responsible for what those sites publish.`;
