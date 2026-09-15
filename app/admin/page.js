'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './admin.css';
import { SITE_SCHEMA, COMMENTARY, CATEGORIES } from './siteSchema';

const CODE_KEY = 'helf_admin_code';

export default function Admin() {
  const [code, setCode] = useState(null);
  const [articles, setArticles] = useState([]);
  const [site, setSite] = useState(null);
  const [tab, setTab] = useState('articles');
  const [editing, setEditing] = useState(null);   // article object | {} for new | null
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState('');

  const headers = useCallback(
    () => ({ 'Content-Type': 'application/json', 'x-admin-code': code || '' }),
    [code]
  );
  const flash = m => { setToast(m); setTimeout(() => setToast(''), 2400); };

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

  const isSite = tab === 'site';

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
          />
        ) : (
          <div className="list-view">
            <div className="head">
              <h1>{isSite ? 'Site Content' : 'Articles'}</h1>
              {!isSite && <button className="btn btn-crimson" onClick={() => setEditing({})}>＋ New Article</button>}
            </div>

            <div className="tabs">
              <button className={tab === 'articles' ? 'on' : ''} onClick={() => setTab('articles')}>Articles</button>
              <button className={tab === 'site' ? 'on' : ''} onClick={() => setTab('site')}>Site Content</button>
            </div>

            <div className="note">
              {isSite
                ? 'Edit the wording on the public page. Layout, colours and fonts are fixed by the design and are not editable here.'
                : 'Changes appear on the site immediately. Drafts are only visible here.'}
            </div>

            {isSite
              ? <SiteForm site={site} setSite={setSite} dirty={dirty} setDirty={setDirty} onSave={saveSite} />
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
              <td>{a.image ? <img className="thumb" src={a.image.startsWith('/') || a.image.startsWith('data:') ? a.image : `/${a.image}`} alt="" /> : <span className="thumb" />}</td>
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

function ArticleEditor({ article, onSave, onCancel, onDelete }) {
  const a = article || {};
  const isNew = !a.id;
  const [f, setF] = useState({
    title: a.title || '', category: a.category || 'Latest News', author: a.author || '',
    date: a.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    excerpt: a.excerpt || '', status: a.status === 'draft' ? 'draft' : 'published',
    featured: !!a.featured, image: a.image || ''
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const fileRef = useRef(null);
  const bodyRef = useRef(null);

  // contenteditable is left uncontrolled — React must not re-render it while the
  // caret is in it. Seed once, read innerHTML on save.
  useEffect(() => { if (bodyRef.current) bodyRef.current.innerHTML = a.body || ''; }, [a.body]);

  function pick(input) {
    const file = input.files[0]; if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      const im = new Image();
      im.onload = () => {
        const max = 1600, sc = Math.min(1, max / Math.max(im.width, im.height));
        const cv = document.createElement('canvas');
        cv.width = im.width * sc; cv.height = im.height * sc;
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        set('image', cv.toDataURL('image/jpeg', 0.85));
      };
      im.src = rd.result;
    };
    rd.readAsDataURL(file);
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
                {f.image && <img src={f.image.startsWith('/') || f.image.startsWith('data:') ? f.image : `/${f.image}`} alt="" />}
                <span>{f.image ? 'Click to replace photo' : 'Click to upload a photo (JPG/PNG)'}</span>
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

function SiteForm({ site, setSite, dirty, setDirty, onSave }) {
  if (!site) return <div className="card" style={{ padding: '2rem' }}>Loading…</div>;

  const touch = fn => { setSite(prev => { const next = structuredClone(prev); fn(next); return next; }); setDirty(true); };
  const setField = (sec, k, v) => touch(n => { (n[sec] = n[sec] || {})[k] = v; });
  const setCell = (i, col, v) => touch(n => { n.commentary[i][col] = v; });
  const move = (i, d) => touch(n => {
    const arr = n.commentary, j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  });
  const remove = i => { if (confirm('Remove this card?')) touch(n => n.commentary.splice(i, 1)); };
  const add = () => touch(n => {
    (n.commentary = n.commentary || []).push(Object.fromEntries(COMMENTARY.cols.map(([k]) => [k, ''])));
  });

  const cards = Array.isArray(site.commentary) ? site.commentary : [];

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
                  <label>{f.label}</label>
                  {f.type === 'textarea'
                    ? <textarea value={d[f.k] ?? ''} onChange={e => setField(sec.key, f.k, e.target.value)} />
                    : <input type="text" value={d[f.k] ?? ''} onChange={e => setField(sec.key, f.k, e.target.value)} />}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="site-sec">
        <h2>{COMMENTARY.title}<small>{COMMENTARY.hint}</small></h2>
        <div className="site-body">
          <div className="sub-h">Cards <span style={{ color: 'var(--muted)', fontWeight: 600 }}>({cards.length})</span></div>
          {cards.map((c, i) => (
            <div className="lrow" key={i}>
              <div className="lnum">{String(i + 1).padStart(2, '0')}</div>
              <div className="lfields">
                {COMMENTARY.cols.map(([ck, clabel, ctype]) => (
                  <div key={ck}>
                    <label>{clabel}</label>
                    {ctype === 'textarea'
                      ? <textarea style={{ minHeight: 70 }} value={c[ck] ?? ''} onChange={e => setCell(i, ck, e.target.value)} />
                      : <input type="text" value={c[ck] ?? ''} onChange={e => setCell(i, ck, e.target.value)} />}
                  </div>
                ))}
              </div>
              <div className="lacts">
                <button type="button" className="mini" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" className="mini" disabled={i === cards.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button type="button" className="mini del" onClick={() => remove(i)}>✕</button>
              </div>
            </div>
          ))}
          <button type="button" className="add-row" onClick={add}>＋ Add Card</button>
        </div>
      </div>

      <div className="site-foot">
        <span className="dirty-note">{dirty ? 'Unsaved changes' : ''}</span>
        <button className="btn btn-crimson" onClick={onSave}>Save &amp; Publish</button>
      </div>
    </>
  );
}
