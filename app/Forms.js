'use client';

import { useState } from 'react';

// Newsletter sign-up. Addresses are stored in MySQL (subscribers table) and
// listed in the admin's Subscribers tab. No third-party service is involved.
export function SubscribeForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');     // idle | sending | done | error
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setState('sending');
    try {
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Something went wrong — please try again.');
      setState('done');
    } catch (err) {
      setMsg(err.message);
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <p className="sub-note" style={{ fontSize: '.95rem' }}>
        Thank you — you’re on the list. Look out for The H.E.L.F Review in your inbox.
      </p>
    );
  }

  return (
    <form className="sub-form" onSubmit={submit}>
      <input type="text" placeholder="First name" aria-label="First name"
        value={name} onChange={e => setName(e.target.value)} />
      <input type="email" placeholder="Email address" aria-label="Email address" required
        value={email} onChange={e => setEmail(e.target.value)} />
      <button className="btn btn-gold" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Subscribing…' : 'Subscribe'}
      </button>
      <span className="sub-note">
        {state === 'error' ? msg : 'We respect your privacy. Unsubscribe at any time.'}
      </span>
    </form>
  );
}

export function SearchForm({ placeholder, defaultValue = '' }) {
  return (
    <form className="search" action="/search" method="get" role="search">
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </svg>
      <input type="search" name="q" defaultValue={defaultValue}
        placeholder={placeholder || 'Search stories…'} aria-label="Search" />
    </form>
  );
}
