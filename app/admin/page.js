'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './admin.css';
import { SITE_SCHEMA, LISTS, CATEGORIES } from './siteSchema';

const CODE_KEY = 'helf_admin_code';
const MAX_EDGE = 1600;

// Paths kept from the original static site ("assets/img/…") have no leading
// slash; uploads ("/media/…") do.
const srcOf = s => (s?.startsWith('/') || s?.startsWith('data:') ? s : `/${s}`);

// Shrink big camera files before they go over the wire. Formats the canvas
// cannot re-encode faithfully (GIF, AVIF) are uploaded untouched.
function downscale(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return resolve(file);
    const rd = new FileReader();
    rd.onerror = () => reject(new Error('Could not read that file'));
    rd.onload = () => {
      const im = new Image();
      im.onerror = () => reject(new Error('That file is not an image'));
      im.onload = () => {
        const sc = Math.min(1, MAX_EDGE / Math.max(im.width, im.height));
        if (sc === 1 && file.size < 1_500_000) return resolve(file);
        const cv = document.createElement('canvas');
        cv.width = Math.round(im.width * sc);
        cv.height = Math.round(im.height * sc);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        cv.toBlob(b => resolve(b || file), 'image/jpeg', 0.85);
      };
      im.src = rd.result;
    };
    rd.readAsDataURL(file);
  });
}

export default function Admin() {
  const [code, setCode] = useState(null);
  const [articles, setArticles] = useState([]);
  const [site, setSite] = useState(null);
  const [subs, setSubs] = useState(null);
  const [tab, setTab] = useState('articles');
  const [editing, setEditing] = useState(null);   // article object | {} for new | null
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState('');

  const headers = useCallback(
    () => ({ 'Content-Type': 'application/json', 'x-admin-code': code || '' }),
    [code]
  );
  const flash = m => { setToast(m); setTimeout(() => setToast(''), 2400); };

  // Photos are stored as files on the server; the record only keeps the URL.
  const upload = useCallback(async file => {
    const body = new FormData();
    body.append('file', file, file.name || 'upload.jpg');
    const r = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-code': code || '' }, body });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  }, [code]);

  useEffect(() => {
    const saved = sessionStorage.getItem(CODE_KEY);
    if (saved) setCode(saved);
  }, []);

  const loadArticles = useCallback(async () => {
    const r = await fetch('/api/articles', { headers: headers() });
    if (r.ok) setArticles(await r.json());
  }, [headers]);

  useEffect(() => { if (code) loadArticles(); }, [code, loadArticles]);
  useEffect(() => {
    if (!code || tab !== 'site' || site) return;
    fetch('/api/site').then(r => r.json()).then(setSite).catch(() => setSite({}));
  }, [code, tab, site]);

  useEffect(() => {
    if (!code || tab !== 'subscribers' || subs) return;
    fetch('/api/subscribe', { headers: headers() })
      .then(r => (r.ok ? r.json() : []))
      .then(setSubs)
      .catch(() => setSubs([]));
  }, [code, tab, subs, headers]);

  if (!code) return <Gate onIn={setCode} />;

  async function saveArticle(body, id) {
    const r = id
      ? await fetch(`/api/articles?id=${encodeURIComponent(id)}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) })
      : await fetch('/api/articles', { method: 'POST', headers: headers(), body: JSON.stringify(body) });
    if (r.ok) {
      flash(body.status === 'draft' ? 'Saved as draft ✓' : id ? 'Article updated ✓' : 'Article published ✓');
      setEditing(null); loadArticles();
    } else flash('Save failed — check access code');
  }

  async function deleteArticle(id) {
    const r = await fetch(`/api/articles?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: headers() });
    if (r.ok) { flash('Article deleted'); setEditing(null); loadArticles(); }
    else flash('Delete failed');
  }

  async function saveSite() {
    const r = await fetch('/api/site', { method: 'PUT', headers: headers(), body: JSON.stringify(site) });
    if (r.ok) { setDirty(false); flash('Site content published'); }
    else flash('Save failed — try signing in again');
  }

  const TITLES = { articles: 'Articles', site: 'Site Content', subscribers: 'Subscribers' };
  const NOTES = {
    articles: 'Changes appear on the site immediately. Drafts are only visible here.',
    site: 'Edit the wording on the public page. Layout, colours and fonts are fixed by the design and are not editable here.',
    subscribers: 'Everyone who has signed up through the newsletter form on the public site.'
  };

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span><b>The H.E.L.F Review</b> · Content Editor</span>
          <span>
            <a href="/" target="_blank" rel="noopener">View site ↗</a>
            &nbsp;·&nbsp;
            <a href="#" onClick={e => { e.preventDefault(); sessionStorage.removeItem(CODE_KEY); location.reload(); }}>Sign out</a>
          </span>
        </div>
      </div>

      <main className="wrap">
        {editing ? (
          <ArticleEditor
            article={editing}
            onCancel={() => setEditing(null)}
            onSave={saveArticle}
            onDelete={deleteArticle}
            onUpload={upload}
          />
        ) : (
          <div className="list-view">
            <div className="head">
              <h1>{TITLES[tab]}</h1>
              {tab === 'articles' &&
                <button className="btn btn-crimson" onClick={() => setEditing({})}>＋ New Article</button>}
            </div>

            <div className="tabs">
              {Object.entries(TITLES).map(([key, label]) => (
                <button key={key} className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>{label}</button>
              ))}
            </div>

            <div className="note">{NOTES[tab]}</div>

            {tab === 'site'
              ? <SiteForm site={site} setSite={setSite} dirty={dirty} setDirty={setDirty} onSave={saveSite} onUpload={upload} />
              : tab === 'subscribers'
                ? <SubscriberTable subs={subs} />
                : <ArticleTable articles={articles} onEdit={setEditing} />}
          </div>
        )}
      </main>

      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </>
  );
}

function Gate({ onIn }) {
  const [v, setV] = useState('');
  const [err, setErr] = useState('');
  async function submit() {
    // No id and no body: a correct code gets 400, a wrong one 401. Nothing is written.
    const r = await fetch('/api/articles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-code': v }
    });
    if (r.status === 401) { setErr('Incorrect code — try again.'); return; }
    sessionStorage.setItem(CODE_KEY, v);
    onIn(v);
  }
  return (
    <div id="gate">
      <div className="box">
        <div style={{ fontSize: '2rem' }}>🔐</div>
        <h2>The H.E.L.F <i style={{ color: 'var(--crimson)' }}>Review</i></h2>
        <p>Content Editor — enter the access code to continue.</p>
        <input type="text" value={v} autoComplete="off" placeholder="Access code"
          onChange={e => setV(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        <button className="btn btn-crimson" style={{ width: '100%', justifyContent: 'center' }} onClick={submit}>Sign In</button>
        <div className="err">{err}</div>
      </div>
    </div>
  );
}

function ArticleTable({ articles, onEdit }) {
  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th /><th>Title</th><th className="t-hide">Category</th>
            <th className="t-hide">Author</th><th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map(a => (
            <tr key={a.id}>
              <td>{a.image ? <img className="thumb" src={srcOf(a.image)} alt="" /> : <span className="thumb" />}</td>
              <td className="t-title">{a.title}<small>{a.date || ''}</small></td>
              <td className="t-hide"><span className="pill">{a.category || 'News'}</span></td>
              <td className="t-hide">{a.author || '—'}</td>
              <td>
                {a.status === 'draft'
                  ? <span className="pill draft">Draft</span>
                  : a.featured
                    ? <span className="pill star">★ Featured</span>
                    : <span className="pill">Published</span>}
              </td>
              <td>
                <div className="actions">
                  <a className="btn btn-ghost btn-sm" target="_blank" rel="noopener"
                    href={a.url || `/article/${encodeURIComponent(a.id)}`}>View</a>
                  <button className="btn btn-ghost btn-sm" onClick={() => onEdit(a)}>Edit</button>
                </div>
              </td>
            </tr>
          ))}
          {!articles.length && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              No articles yet — click “New Article”.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SubscriberTable({ subs }) {
  if (!subs) return <div className="card" style={{ padding: '2rem' }}>Loading…</div>;

  const copyAll = () => navigator.clipboard?.writeText(subs.map(s => s.email).join(', '));
  const fmt = iso => (iso ? new Date(iso).toLocaleDateString('en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }) : '');

  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>Email</th><th className="t-hide">Name</th><th>Signed up</th>
            <th style={{ textAlign: 'right' }}>
              {subs.length > 0 &&
                <button className="btn btn-ghost btn-sm" onClick={copyAll}>Copy all emails</button>}
            </th>
          </tr>
        </thead>
        <tbody>
          {subs.map(s => (
            <tr key={s.id}>
              <td className="t-title">{s.email}</td>
              <td className="t-hide">{s.name || '—'}</td>
              <td>{fmt(s.createdAt)}</td>
              <td />
            </tr>
          ))}
          {!subs.length && (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              No sign-ups yet.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ArticleEditor({ article, onSave, onCancel, onDelete, onUpload }) {
  const a = article || {};
  const isNew = !a.id;
  const [f, setF] = useState({
    title: a.title || '', category: a.category || 'Latest News', author: a.author || '',
    date: a.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    excerpt: a.excerpt || '', status: a.status === 'draft' ? 'draft' : 'published',
    featured: !!a.featured, image: a.image || ''
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const [imgMsg, setImgMsg] = useState('');
  const fileRef = useRef(null);
  const bodyRef = useRef(null);

  // contenteditable is left uncontrolled — React must not re-render it while the
  // caret is in it. Seed once, read innerHTML on save.
  useEffect(() => { if (bodyRef.current) bodyRef.current.innerHTML = a.body || ''; }, [a.body]);

  async function pick(input) {
    const file = input.files[0];
    input.value = '';                       // so the same file can be picked twice
    if (!file) return;
    setImgMsg('Uploading…');
    try {
      set('image', await onUpload(await downscale(file)));
      setImgMsg('');
    } catch (err) {
      setImgMsg(err.message || 'Upload failed');
    }
  }

  const fmt = cmd => { document.execCommand(cmd, false, null); bodyRef.current?.focus(); };

  function submit(e) {
    e.preventDefault();
    onSave({ ...f, body: bodyRef.current?.innerHTML || '' }, a.id);
  }

  return (
    <div className="editor open">
      <div className="head">
        <h1>{isNew ? 'New Article' : 'Edit Article'}</h1>
        <button className="btn btn-ghost" onClick={onCancel}>← Back to Articles</button>
      </div>
      <div className="card">
        <form onSubmit={submit}>
          <div className="grid">
            <div className="full"><label>Title *</label>
              <input type="text" required value={f.title} placeholder="Article headline"
                onChange={e => set('title', e.target.value)} /></div>

            <div><label>Category</label>
              <select value={f.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select></div>

            <div><label>Author</label>
              <input type="text" value={f.author} placeholder="e.g. Jamal Watson"
                onChange={e => set('author', e.target.value)} /></div>

            <div><label>Date</label>
              <input type="text" value={f.date} onChange={e => set('date', e.target.value)} /></div>

            <div><label>Status</label>
              <select value={f.status} onChange={e => set('status', e.target.value)}>
                <option value="published">Published — visible on the site</option>
                <option value="draft">Draft — only visible here</option>
              </select></div>

            <div className="check full">
              <input type="checkbox" id="feat" checked={f.featured}
                onChange={e => set('featured', e.target.checked)} />
              <label htmlFor="feat" style={{ margin: 0, textTransform: 'none', letterSpacing: 0, fontSize: '.86rem' }}>
                Feature on homepage hero
              </label>
            </div>

            <div className="full"><label>Excerpt / summary</label>
              <textarea value={f.excerpt} placeholder="One or two sentences shown in article lists…"
                onChange={e => set('excerpt', e.target.value)} /></div>

            <div className="full">
              <label>Main image</label>
              <div className="imgdrop" onClick={() => fileRef.current?.click()}>
                {f.image && <img src={srcOf(f.image)} alt="" />}
                <span>{imgMsg || (f.image ? 'Click to replace photo' : 'Click to upload a photo (JPG/PNG)')}</span>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pick(e.target)} />
            </div>

            <div className="full">
              <label>Article body</label>
              <div className="rte-bar">
                <button type="button" onClick={() => fmt('bold')}><b>B</b></button>
                <button type="button" onClick={() => fmt('italic')}><i>I</i></button>
                <button type="button" onClick={() => fmt('insertUnorderedList')}>• List</button>
                <button type="button" onClick={() => fmt('formatBlock', 'h2')}>H2</button>
              </div>
              <div className="rte" ref={bodyRef} contentEditable suppressContentEditableWarning />
            </div>
          </div>

          <div className="form-foot">
            {!isNew && (
              <button type="button" className="btn btn-danger"
                onClick={() => confirm('Delete this article?') && onDelete(a.id)}>Delete</button>
            )}
            <span style={{ flex: 1 }} />
            <button type="submit" className="btn btn-crimson">
              {f.status === 'draft' ? 'Save Draft' : 'Save & Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// A stored image path plus an Upload button. The text box stays editable so an
// existing asset path can still be typed or pasted.
function ImageField({ label, value, onChange, onUpload }) {
  const ref = useRef(null);
  const [msg, setMsg] = useState('');

  async function pick(input) {
    const file = input.files[0];
    input.value = '';
    if (!file) return;
    setMsg('Uploading…');
    try {
      onChange(await onUpload(await downscale(file)));
      setMsg('');
    } catch (err) {
      setMsg(err.message || 'Upload failed');
    }
  }

  return (
    <>
      <label>{label}</label>
      <div className="imgfield">
        <div className="imgfield-thumb" onClick={() => ref.current?.click()}>
          {value ? <img src={srcOf(value)} alt="" /> : <span>none</span>}
        </div>
        <div className="imgfield-main">
          <input type="text" value={value ?? ''} placeholder="/media/… or assets/img/…"
            onChange={e => onChange(e.target.value)} />
          <div className="imgfield-row">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => ref.current?.click()}>Upload photo</button>
            <small>{msg}</small>
          </div>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pick(e.target)} />
    </>
  );
}

function SiteForm({ site, setSite, dirty, setDirty, onSave, onUpload }) {
  if (!site) return <div className="card" style={{ padding: '2rem' }}>Loading…</div>;

  const touch = fn => { setSite(prev => { const next = structuredClone(prev); fn(next); return next; }); setDirty(true); };
  const setField = (sec, k, v) => touch(n => { (n[sec] = n[sec] || {})[k] = v; });
  const setCell = (listKey, i, col, v) => touch(n => { n[listKey][i][col] = v; });
  const move = (listKey, i, d) => touch(n => {
    const arr = n[listKey], j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  });
  const remove = (listKey, i) => {
    if (confirm('Remove this entry?')) touch(n => n[listKey].splice(i, 1));
  };
  const add = list => touch(n => {
    (n[list.key] = n[list.key] || []).push(Object.fromEntries(list.cols.map(([k]) => [k, ''])));
  });

  return (
    <>
      {SITE_SCHEMA.map(sec => {
        const d = site[sec.key] || {};
        return (
          <div className="site-sec" key={sec.key}>
            <h2>{sec.title}{sec.hint && <small>{sec.hint}</small>}</h2>
            <div className="site-body">
              {sec.fields.map(f => (
                <div className={f.full ? 'full' : ''} key={f.k}>
                  {f.type === 'image'
                    ? <ImageField label={f.label} value={d[f.k]} onUpload={onUpload}
                        onChange={v => setField(sec.key, f.k, v)} />
                    : <>
                        <label>{f.label}</label>
                        {f.type === 'textarea'
                          ? <textarea value={d[f.k] ?? ''} onChange={e => setField(sec.key, f.k, e.target.value)} />
                          : <input type="text" value={d[f.k] ?? ''} onChange={e => setField(sec.key, f.k, e.target.value)} />}
                      </>}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {LISTS.map(list => {
        const rows = Array.isArray(site[list.key]) ? site[list.key] : [];
        return (
          <div className="site-sec" key={list.key}>
            <h2>{list.title}<small>{list.hint}</small></h2>
            <div className="site-body">
              <div className="sub-h">
                Entries <span style={{ color: 'var(--muted)', fontWeight: 600 }}>({rows.length})</span>
              </div>
              {rows.map((row, i) => (
                <div className="lrow" key={i}>
                  <div className="lnum">{String(i + 1).padStart(2, '0')}</div>
                  <div className="lfields">
                    {list.cols.map(([ck, clabel, ctype]) => (
                      <div key={ck}>
                        {ctype === 'image'
                          ? <ImageField label={clabel} value={row[ck]} onUpload={onUpload}
                              onChange={v => setCell(list.key, i, ck, v)} />
                          : <>
                              <label>{clabel}</label>
                              {ctype === 'textarea'
                                ? <textarea style={{ minHeight: 70 }} value={row[ck] ?? ''}
                                    onChange={e => setCell(list.key, i, ck, e.target.value)} />
                                : <input type="text" value={row[ck] ?? ''}
                                    onChange={e => setCell(list.key, i, ck, e.target.value)} />}
                            </>}
                      </div>
                    ))}
                  </div>
                  <div className="lacts">
                    <button type="button" className="mini" disabled={i === 0}
                      onClick={() => move(list.key, i, -1)}>↑</button>
                    <button type="button" className="mini" disabled={i === rows.length - 1}
                      onClick={() => move(list.key, i, 1)}>↓</button>
                    <button type="button" className="mini del"
                      onClick={() => remove(list.key, i)}>✕</button>
                  </div>
                </div>
              ))}
              <button type="button" className="add-row" onClick={() => add(list)}>＋ {list.addLabel}</button>
            </div>
          </div>
        );
      })}

      <div className="site-foot">
        <span className="dirty-note">{dirty ? 'Unsaved changes' : ''}</span>
        <button className="btn btn-crimson" onClick={onSave}>Save &amp; Publish</button>
      </div>
    </>
  );
}
