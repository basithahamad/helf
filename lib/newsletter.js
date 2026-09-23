// Pushes a sign-up to the mailing service so the audience there stays current.
//
// Configure with:
//   MAIL_PROVIDER   brevo | mailchimp   (unset = store locally only)
//   MAIL_API_KEY    the provider's API key
//   MAIL_LIST_ID    Brevo list id, or Mailchimp audience id
//
// With nothing configured this is a no-op: the address is still stored in
// MySQL and exportable as CSV from the admin, so sign-ups are never lost while
// an account is being set up.

const provider = () => (process.env.MAIL_PROVIDER || '').trim().toLowerCase();

export const newsletterConfigured = () =>
  Boolean(provider() && process.env.MAIL_API_KEY && process.env.MAIL_LIST_ID);

async function toBrevo({ email, name }) {
  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': process.env.MAIL_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({
      email,
      attributes: name ? { FIRSTNAME: name } : undefined,
      listIds: [Number(process.env.MAIL_LIST_ID)],
      // Someone re-subscribing should update their record, not fail.
      updateEnabled: true
    })
  });
  if (r.ok || r.status === 204) return { ok: true };
  const body = await r.text().catch(() => '');
  // Already on the list is a success from our side.
  if (r.status === 400 && /duplicate_parameter|already/i.test(body)) return { ok: true, already: true };
  throw new Error(`brevo ${r.status}: ${body.slice(0, 200)}`);
}

async function toMailchimp({ email, name }) {
  // Mailchimp keys carry their data centre as a suffix: abc123...-us21
  const dc = (process.env.MAIL_API_KEY || '').split('-')[1];
  if (!dc) throw new Error('mailchimp key has no data-centre suffix');

  const r = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/lists/${process.env.MAIL_LIST_ID}/members`,
    {
      method: 'POST',
      headers: {
        authorization: `Basic ${Buffer.from(`key:${process.env.MAIL_API_KEY}`).toString('base64')}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: name ? { FNAME: name } : undefined
      })
    }
  );
  if (r.ok) return { ok: true };
  const body = await r.text().catch(() => '');
  if (r.status === 400 && /Member Exists/i.test(body)) return { ok: true, already: true };
  throw new Error(`mailchimp ${r.status}: ${body.slice(0, 200)}`);
}

// Never throws: the address is already saved locally, and a mailing-service
// outage must not turn a successful sign-up into an error for the visitor.
export async function syncSubscriber({ email, name }) {
  if (!newsletterConfigured()) return { skipped: true };
  try {
    return provider() === 'mailchimp'
      ? await toMailchimp({ email, name })
      : await toBrevo({ email, name });
  } catch (err) {
    console.error('newsletter sync failed', err.message);
    return { ok: false, error: err.message };
  }
}
