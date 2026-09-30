// Post-deploy check: drives the live admin in a real browser and proves the
// editor still saves. Every regression this project has shipped to the client
// was invisible to `next build` and visible here in ten seconds.
//
//   npm run test:admin -- https://SITE ADMIN_CODE
//
// It edits one field (the SEO description, whose only public trace is a meta
// tag), verifies the change reaches the database and the public page, exercises
// paste cleaning, then restores the original value exactly. Safe against a live
// site with real content.
//
// Needs a browser once per machine:  npx playwright install chromium

import { chromium } from 'playwright';

const SITE = process.argv[2] || 'https://thehelfreview.com';
const CODE = process.argv[3] || process.env.ADMIN_CODE;
const MATCH = process.argv[4] || 'News, analysis';
const MARKER = ' [[PWTEST]]';

const log = (ok, msg) => console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`);
let failures = 0;
const check = (cond, msg) => { if (!cond) failures++; log(cond, msg); return cond; };

if (!CODE) {
  console.error('usage: npm run test:admin -- https://SITE ADMIN_CODE');
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', e => { failures++; console.log('FAIL  page error:', e.message); });

// ---- sign in -------------------------------------------------------------
await page.goto(`${SITE}/admin`, { waitUntil: 'networkidle' });
await page.fill('input[type=password]', CODE);
await page.click('button[type=submit]');
await page.waitForSelector('.tabs button', { timeout: 15000 });
check(true, 'signed in');

// ---- open Site Content ---------------------------------------------------
await page.click('.tabs button:has-text("Site Content")');
// The SEO description: a genuine rich-text field whose only public trace is a
// meta tag, so the marker is invisible to readers during the few seconds it is
// there. Located by content, independent of surrounding markup.
const field = page.locator('[contenteditable]').filter({ hasText: MATCH }).first();
await field.waitFor({ timeout: 15000 });
const original = await field.innerHTML();
check(original.length > 0, `found the field (current value: ${original.slice(0, 44)}…)`);

const saveBtn = page.locator('.site-foot button');
check(await saveBtn.isDisabled(), 'Save is disabled before any edit');

// ---- type, and confirm the form hears it ---------------------------------
await field.click();
await page.keyboard.press('End');
await page.keyboard.type(MARKER, { delay: 12 });
await page.waitForTimeout(250);
check(await saveBtn.isEnabled(), 'typing enables Save (the form received the edit)');

// ---- save ----------------------------------------------------------------
await saveBtn.click();
await page.waitForSelector('.toast.show', { timeout: 15000 });
check(true, `saved (toast: "${(await page.locator('.toast').innerText()).trim()}")`);

// ---- reload and confirm it stuck -----------------------------------------
await page.reload({ waitUntil: 'networkidle' });
await page.click('.tabs button:has-text("Site Content")');
await field.waitFor({ timeout: 15000 });
const afterReload = await field.innerHTML();
check(afterReload.includes('[[PWTEST]]'), 'edit survived a reload of the admin');

// ---- confirm the public page really changed ------------------------------
const pub = await page.request.get(`${SITE}/`);
const html = await pub.text();
check(html.includes('[[PWTEST]]'), 'edit is live on the public page (meta description)');

// ---- paste from "Word" is cleaned ----------------------------------------
await field.click();
await field.evaluate(el => {
  const dt = new DataTransfer();
  dt.setData('text/html',
    '<p class="MsoNormal" style="font-family:Calibri;font-size:11pt">' +
    'Pasted <b>bold</b> and <span style="color:red">red</span></p>');
  dt.setData('text/plain', 'Pasted bold and red');
  el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
});
await page.waitForTimeout(250);
const pasted = await field.innerHTML();
check(pasted.includes('Pasted'), 'paste inserted the text');
check(!/MsoNormal|font-family|Calibri/i.test(pasted), 'paste dropped Word classes and fonts');
check(!/<p[ >]|<div[ >]/i.test(pasted), 'paste dropped block tags in an inline field');
check(/<b>bold<\/b>/i.test(pasted), 'paste kept real formatting (bold)');

// ---- restore the original value ------------------------------------------
await field.evaluate((el, html) => {
  el.innerHTML = html;
  el.dispatchEvent(new InputEvent('input', { bubbles: true }));
}, original);
await page.waitForTimeout(200);
await saveBtn.click();
await page.waitForSelector('.toast.show', { timeout: 15000 });
await page.reload({ waitUntil: 'networkidle' });
await page.click('.tabs button:has-text("Site Content")');
await field.waitFor({ timeout: 15000 });
const restored = await field.innerHTML();
check(restored === original, 'original value restored exactly');

await browser.close();
console.log(failures ? `\n${failures} FAILURE(S)` : '\nall checks passed');
process.exit(failures ? 1 : 0);
