// Push every stored subscriber to the configured mailing service.
//
//   node --env-file=.env scripts/sync-subscribers.mjs
//
// Run once after adding MAIL_PROVIDER / MAIL_API_KEY / MAIL_LIST_ID: sign-ups
// collected before then are in MySQL but not yet on the mailing list. Safe to
// re-run — an address already on the list counts as a success.
import { listSubscribers } from '../lib/store.js';
import { syncSubscriber, newsletterConfigured } from '../lib/newsletter.js';
import { db } from '../lib/db.js';

if (!newsletterConfigured()) {
  console.error('MAIL_PROVIDER, MAIL_API_KEY and MAIL_LIST_ID must all be set.');
  process.exit(1);
}

const subs = await listSubscribers();
console.log(`${subs.length} stored subscriber(s)`);

let sent = 0, failed = 0;
for (const s of subs) {
  const r = await syncSubscriber({ email: s.email, name: s.name });
  if (r.ok) { sent++; process.stdout.write('.'); }
  else { failed++; process.stdout.write('x'); }
}

console.log(`\nsynced ${sent}, failed ${failed}`);
await (await db()).end().catch(() => {});
