'use client';

// Carried over from the static site. Both are still placeholders — nothing is
// sent or stored yet. Wiring them to Brevo is tracked separately.
export function SubscribeForm() {
  return (
    <form
      className="sub-form"
      onSubmit={e => { e.preventDefault(); alert('Demo only — this form will connect to Brevo.'); }}
    >
      <input type="text" placeholder="First name" aria-label="First name" />
      <input type="email" placeholder="Email address" aria-label="Email address" required />
      <button className="btn btn-gold" type="submit">Subscribe</button>
      <span className="sub-note">We respect your privacy. Unsubscribe at any time.</span>
    </form>
  );
}

export function SearchForm({ placeholder }) {
  return (
    <form className="search" onSubmit={e => e.preventDefault()}>
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </svg>
      <input type="search" placeholder={placeholder || 'Search stories…'} aria-label="Search" />
    </form>
  );
}
