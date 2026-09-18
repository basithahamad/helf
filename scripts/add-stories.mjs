// Publishes the two partner-coverage stories through the public API, so they
// take exactly the same path the admin uses. Safe to re-run: a story with the
// same title is updated rather than duplicated.
//
//   node scripts/add-stories.mjs https://thehelfreview.com <admin-code>
const [, , base = 'http://127.0.0.1:8742', code = process.env.ADMIN_CODE] = process.argv;

if (!code) {
  console.error('usage: node scripts/add-stories.mjs <base-url> <admin-code>');
  process.exit(1);
}

// Order matters: the home page lists newest first, so the story created last
// sits in the first slot beside the lead.
const STORIES = [
  {
    title:
      'Blueprint for the Future: H.E.L.F. Convening at Virginia State Takes Hard Look at HBCU Presidential Leadership',
    category: 'Leadership',
    author: 'Dr. Jamal Watson',
    date: 'May 20, 2026',
    excerpt:
      'Sitting and emeritus presidents, trustees and scholars gathered at Virginia State University for H.E.L.F.’s third national convening — and turned the lens on the HBCU presidency itself.',
    image: '/assets/img/helf-news2.jpg',
    caption:
      'H.E.L.F.’s third national convening, held at Virginia State University, examined presidential transitions, board governance and the preparation the HBCU presidency demands.',
    body: `
<p>The Higher Education Leadership Foundation held its third national convening at Virginia State University, bringing sitting and emeritus presidents together with trustees and higher education scholars for three days on a single question: what does the HBCU presidency actually require?</p>

<p>Dr. Herman Felton Jr., Wiley University president and H.E.L.F. founder, set the terms early — the field needs to “interrogate — with data, with scholarship, with practitioner truth — what the HBCU presidency actually demands.” The convening was built to be uncomfortable in exactly that way.</p>

<div class="pull">
  <q>“Interrogate — with data, with scholarship, with practitioner truth — what the HBCU presidency actually demands.”</q>
  <cite>Dr. Herman J. Felton Jr. · President, Wiley University</cite>
</div>

<h2>The Unreadied President</h2>
<p>Much of the discussion centred on what participants called the “unreadied president” — leaders who arrive in the role without the preparation, the board relationship or the institutional support the job requires. Research presented at the convening indicated that the average HBCU presidency now lasts roughly three years.</p>

<p>That figure reframes presidential turnover as a structural problem rather than a series of individual failures, and puts board governance and succession planning at the centre of the conversation.</p>

<h2>Transitions and Governance</h2>
<p>Sessions examined how presidential transitions are handled — how successors are identified, how boards prepare for a change in leadership, and what an institution loses each time the cycle restarts without a plan.</p>

<p class="source-note">This story draws on reporting first published by Wiley University. <a href="https://www.wileyc.edu/news/news-from-our-partners-blueprint-for-the-future-h-e-l-f-convening-at-virginia-state-takes-hard-look-at-hbcu-presidential-leadership" target="_blank" rel="noopener">Read the original coverage at Wiley University →</a></p>
`.trim()
  },
  {
    title: 'HBCU Leaders Gather in Charlotte to Chart a Path Forward',
    category: 'Latest News',
    author: 'Dr. Jamal Watson',
    date: 'June 8, 2026',
    excerpt:
      'Presidents, chancellors and advocates filled Johnson C. Smith University for H.E.L.F.’s inaugural Futurist Symposium — a gathering Herman Felton framed as “a season of provocation.”',
    image: '/assets/img/helf-feature.jpg',
    caption:
      '<b>Dr. Freeman A. Hrabowski III</b>, president emeritus of UMBC, in conversation with <b>Dr. Herman Felton</b>, president of Wiley University and co-founder of the Higher Education Leadership Foundation, at “A Futurist Symposium: Mapping the Future for the HBCU” at Johnson C. Smith University.',
    body: `
<p>HBCU presidents, chancellors and higher education advocates gathered at Johnson C. Smith University in Charlotte for the Higher Education Leadership Foundation’s inaugural “A Futurist Symposium: Mapping the Future for the HBCU” — a meeting convened less to celebrate than to confront what comes next.</p>

<p>Dr. Herman J. Felton Jr., president and CEO of Wiley University and H.E.L.F.’s co-founder, framed the gathering as “a season of provocation,” pressing attendees to face the structural pressures bearing down on Black higher education: funding under threat, enrolment under strain, and institutions asked to do more with less.</p>

<div class="pull">
  <q>“You have to become an adept salesperson.”</q>
  <cite>Dr. Michael Lomax · President &amp; CEO, UNCF</cite>
</div>

<h2>Selling the Case for HBCUs</h2>
<p>UNCF president Dr. Michael Lomax told the room that advocacy is now inseparable from leadership — that presidents must be able to make the case for their institutions to donors, legislators and families with the same fluency they bring to running a campus.</p>

<p>Dr. David Rosowsky offered a different provocation: the “60-year degree,” a rethinking of the relationship between a university and its graduates as one that lasts a working lifetime rather than ending at commencement — with implications for how HBCUs design programmes, serve alumni and build durable revenue.</p>

<h2>What the Symposium Signalled</h2>
<p>Taken together, the sessions pointed at a shift H.E.L.F. has been pushing for a decade: that the HBCU presidency is a distinct discipline, and that preparing for it — and sustaining the people in it — cannot be left to chance.</p>

<p class="source-note">This story draws on reporting first published by UNCF. <a href="https://uncf.org/the-latest/higher-education-leadership-foundation-hbcu-leaders-gather-in-charlotte-to-chart-a-path-forward" target="_blank" rel="noopener">Read the original coverage at UNCF →</a></p>
`.trim()
  }
];

const headers = { 'Content-Type': 'application/json', 'x-admin-code': code };

// Match on title rather than a guessed slug — the server derives the id itself.
const all = await (await fetch(`${base}/api/articles`, { headers })).json();

for (const story of STORIES) {
  const existing = all.find(a => a.title === story.title);

  const res = existing
    ? await fetch(`${base}/api/articles?id=${encodeURIComponent(existing.id)}`,
        { method: 'PUT', headers, body: JSON.stringify(story) })
    : await fetch(`${base}/api/articles`,
        { method: 'POST', headers, body: JSON.stringify(story) });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`FAILED "${story.title}": ${res.status} ${data.error || ''}`);
    process.exit(1);
  }
  console.log(`${existing ? 'updated' : 'created'}: ${data.id}`);
}
