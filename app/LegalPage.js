import { Masthead, SiteFooter } from './Chrome';

// Privacy and Terms share this shell. Both the heading and the body text live
// in the site document, so the editor changes them in the admin — there is no
// wording in this file.
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
