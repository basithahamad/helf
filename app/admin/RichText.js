'use client';

import { useEffect, useRef, useState } from 'react';

// Rich-text editor for the article body.
//
// Built on contentEditable + document.execCommand. execCommand is formally
// deprecated but is still the only API every browser implements consistently
// without pulling in an editor framework; the alternative (ProseMirror, TipTap,
// Lexical) is a large dependency for a newsroom that needs bold, links, colour
// and headings.
//
// The editor is uncontrolled — React must not re-render it while the caret is
// inside — so the parent reads `editorRef.current.innerHTML` when saving.

// Palette from the site's own design tokens, plus neutrals. Anything else is
// available through the custom picker.
const COLOURS = [
  ['#7d1322', 'Crimson'],
  ['#2a060d', 'Crimson ink'],
  ['#c8a45e', 'Gold'],
  ['#26272c', 'Body text'],
  ['#6b7078', 'Muted grey'],
  ['#1a7f4b', 'Green'],
  ['#1b5fa8', 'Blue']
];


// Pasting from Word or Google Docs brings block elements, MsoNormal classes and
// inline font styles with it. Inside an inline field that block markup is
// invalid — these values render inside an existing <p> — and in an article it
// overrides the site's own typography. Both are cleaned on the way in.
const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'BLOCKQUOTE']);
const KEEP_TAGS = new Set([
  'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'A',
  'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE'
]);

function cleanPastedHtml(html, inline) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');

  const walk = node => {
    for (const child of [...node.children]) {
      walk(child);

      const tag = child.tagName;
      const isBlock = BLOCK_TAGS.has(tag);
      const keep = KEEP_TAGS.has(tag) && !(inline && isBlock);

      if (keep) {
        // Word's fonts and colours must not outrank the site's own.
        for (const attr of [...child.attributes]) {
          if (!(tag === 'A' && attr.name === 'href')) child.removeAttribute(attr.name);
        }
        if (tag === 'A') { child.setAttribute('target', '_blank'); child.setAttribute('rel', 'noopener'); }
      } else {
        // Unwrap: keep the words, drop the element. A block becomes a line break
        // so pasted paragraphs still read as separate lines in an inline field.
        if (inline && isBlock) child.after(doc.createElement('br'));
        child.replaceWith(...child.childNodes);
      }
    }
  };
  walk(doc.body);

  return doc.body.innerHTML.replace(/(<br>\s*){3,}/g, '<br><br>').trim();
}

export function RichText({ editorRef, initialHtml = '', withPullQuote = false, inline = false, onChange }) {
  const saved = useRef(null);
  const seeded = useRef(false);
  const [colourOpen, setColourOpen] = useState(false);

  // Content is pushed in only while the caret is elsewhere. Writing innerHTML
  // during typing would reset the caret to the start of the field; skipping it
  // entirely would leave stale text behind when rows are reordered or a
  // different record is opened.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (!seeded.current || (document.activeElement !== el && el.innerHTML !== initialHtml)) {
      el.innerHTML = initialHtml;
      seeded.current = true;
    }
  }, [editorRef, initialHtml]);

  // execCommand writes <font> tags by default; CSS styling is what the rest of
  // the site understands.
  useEffect(() => {
    try { document.execCommand('styleWithCSS', false, true); } catch {}
  }, []);

  const remember = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
      saved.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Clicking a toolbar control moves focus out of the editor and drops the
  // selection, so it is restored before every command.
  const restore = () => {
    editorRef.current?.focus();
    if (!saved.current) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(saved.current);
  };

  const run = (cmd, value = null) => {
    restore();
    document.execCommand(cmd, false, value);
    remember();
  };

  const block = tag => run('formatBlock', `<${tag}>`);

  // execCommand's fontSize takes a 1-7 scale rather than pixels; these are the
  // three a writer actually reaches for.
  const SIZES = [['Small', '2'], ['Normal', '3'], ['Large', '5']];

  function addLink() {
    restore();
    const url = prompt('Link address — include https://', 'https://');
    if (!url) return;
    run('createLink', url);
  }

  function insertPullQuote() {
    restore();
    run('insertHTML',
      '<div class="pull"><q>Quote goes here</q><cite>Who said it</cite></div><p><br></p>');
  }

  // A section break on its own, as opposed to the rules a pull quote draws.
  function insertDivider() {
    restore();
    run('insertHTML', '<hr><p><br></p>');
  }

  // Buttons use onMouseDown + preventDefault so the selection survives the click.
  const Btn = ({ onPress, title, children, wide }) => (
    <button type="button" title={title} className={wide ? 'wide' : undefined}
      onMouseDown={e => { e.preventDefault(); onPress(); }}>
      {children}
    </button>
  );

  return (
    <>
      <div className="rte-bar">
        <Btn onPress={() => run('bold')} title="Bold (Ctrl+B)"><b>B</b></Btn>
        <Btn onPress={() => run('italic')} title="Italic (Ctrl+I)"><i>I</i></Btn>
        <Btn onPress={() => run('underline')} title="Underline (Ctrl+U)"><u>U</u></Btn>
        <Btn onPress={() => run('strikeThrough')} title="Strikethrough"><s>S</s></Btn>

        <span className="rte-sep" />

        {/* Block formatting is hidden for fields rendered inside an existing
            <p> on the public page, where a heading or list is invalid markup. */}
        {!inline && (
          <>
            <Btn onPress={() => block('p')} title="Normal paragraph" wide>¶ Text</Btn>
            <Btn onPress={() => block('h2')} title="Section heading" wide>H2</Btn>
            <Btn onPress={() => block('h3')} title="Sub-heading" wide>H3</Btn>

            <span className="rte-sep" />

            <Btn onPress={() => run('insertUnorderedList')} title="Bulleted list" wide>• List</Btn>
            <Btn onPress={() => run('insertOrderedList')} title="Numbered list" wide>1. List</Btn>

            <span className="rte-sep" />
          </>
        )}

        <Btn onPress={addLink} title="Add link" wide>🔗 Link</Btn>
        <Btn onPress={() => run('unlink')} title="Remove link" wide>Unlink</Btn>
        {withPullQuote && <Btn onPress={insertPullQuote} title="Insert a pull quote" wide>❝ Pull quote</Btn>}
        {withPullQuote && <Btn onPress={insertDivider} title="Insert a divider line" wide>— Divider</Btn>}

        <span className="rte-sep" />

        <div className="rte-colour">
          <Btn onPress={() => setColourOpen(o => !o)} title="Text colour" wide>
            <span className="swatch-dot" style={{ background: 'linear-gradient(135deg,#7d1322,#c8a45e)' }} />
            Colour ▾
          </Btn>
          {colourOpen && (
            <div className="rte-palette">
              {COLOURS.map(([hex, name]) => (
                <button key={hex} type="button" title={name} className="swatch"
                  style={{ background: hex }}
                  onMouseDown={e => { e.preventDefault(); run('foreColor', hex); setColourOpen(false); }} />
              ))}
              <label className="swatch custom" title="Any other colour">
                +
                <input type="color" onChange={e => { run('foreColor', e.target.value); setColourOpen(false); }} />
              </label>
            </div>
          )}
        </div>

        <span className="rte-sep" />

        {SIZES.map(([label, value]) => (
          <Btn key={value} onPress={() => run('fontSize', value)} title={`${label} text`} wide>
            {label}
          </Btn>
        ))}

        <Btn onPress={() => run('removeFormat')} title="Strip formatting from the selection" wide>
          Clear
        </Btn>
      </div>

      <div
        className={inline ? 'rte rte-inline' : 'rte'}
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onKeyUp={remember}
        onMouseUp={remember}
        onBlur={remember}
        // Without this the field accepts typing but the form never learns of
        // it, so Save writes back the value that was already there.
        onInput={onChange ? e => onChange(e.currentTarget.innerHTML) : undefined}
        onPaste={e => {
          const html = e.clipboardData.getData('text/html');
          const text = e.clipboardData.getData('text/plain');
          if (!html && !text) return;

          const asPlain = () => text
            .replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
            .split(String.fromCharCode(13)).join('')
            .split(String.fromCharCode(10)).join(inline ? '<br>' : '</p><p>');

          let cleaned;
          try {
            cleaned = html ? cleanPastedHtml(html, inline) : asPlain();
          } catch {
            // Never swallow a paste: fall back to the plain text rather than
            // losing what the writer copied.
            cleaned = asPlain();
          }
          if (!cleaned) return;

          e.preventDefault();
          // Insert at the live caret. run() restores the remembered range,
          // which can be staler than where the paste actually happened.
          document.execCommand('insertHTML', false, cleaned);
          remember();
          onChange?.(e.currentTarget.innerHTML);
        }}
        // In inline mode Enter would open a new block; a line break keeps the
        // value valid inside the paragraph it will be rendered in.
        onKeyDown={inline ? e => {
          if (e.key === 'Enter') { e.preventDefault(); run('insertHTML', '<br>'); }
        } : undefined}
      />
    </>
  );
}
