import { addSubscriber, listSubscribers, authorised } from '../../../lib/store';
import { syncSubscriber } from '../../../lib/newsletter';

export const dynamic = 'force-dynamic';

// Deliberately loose: enough to catch typos, not so strict it rejects valid
// addresses. Real verification is a confirmation email, not a regex.
const looksLikeEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = (body?.email || '').trim();
  const name = (body?.name || '').trim();

  if (!looksLikeEmail(email)) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (email.length > 320) {
    return Response.json({ error: 'That email address is too long.' }, { status: 400 });
  }

  try {
    await addSubscriber(email, name);
  } catch (err) {
    console.error('subscribe failed', err);
    return Response.json({ error: 'Something went wrong — please try again.' }, { status: 500 });
  }

  // Mirror it to the mailing service if one is configured. The address is
  // already stored, so a failure here is logged rather than shown to the
  // visitor — they did sign up.
  await syncSubscriber({ email, name });
  // Same answer whether or not the address was already on the list.
  return Response.json({ ok: true }, { status: 201 });
}

// The admin's Subscribers tab.
export async function GET(request) {
  if (!authorised(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  return Response.json(await listSubscribers(), { headers: { 'Cache-Control': 'no-store' } });
}
