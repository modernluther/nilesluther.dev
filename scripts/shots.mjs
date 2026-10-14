// Captures the write-up screenshots from the live sites.
// Every clip's visible text runs through the copy check; a violation fails the capture and writes nothing.
// Run: node scripts/shots.mjs [out-name ...] [--out <dir>]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { findViolations } from './copy-check.mjs';

const SHOTS = [
  {
    // The About page's Transparency section: the six levels that trace any metric back to its raw record.
    // A narrow clip keeps the text legible in the 668px column. The charts and the rest of the page name game terms.
    out: 'ace-ops', url: 'https://www.aceops.app/about',
    clip: { x: 312, y: 400, width: 816, height: 410 },
  },
  {
    // The public page only: the hero, with the cookie banner rejected.
    out: 'creative-concepts-pipeline', url: 'https://creative-conceptsllc.com/ai-brand-defense',
    prepare: async (page) => { await page.getByRole('button', { name: 'Reject' }).click(); },
    clip: { x: 60, y: 150, width: 820, height: 540 },
  },
  {
    // The README header of the public mirror: text only, no game imagery.
    out: 'vision-daemon', url: 'https://github.com/modernluther/vision-daemon',
    clip: { selector: 'article.markdown-body', pad: 24, height: 560 },
  },
  {
    out: 'monet-and-venice-symphony', url: 'https://monetandvenicesymphony.eth.limo',
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  },
  {
    // The first row of composition cards, cut above the card footers (their links carry arrow glyphs).
    // The intro paragraph above them breaks the copy rules and stays out.
    out: 'here-on-tour', url: 'https://hereontour.xyz',
    clip: { x: 130, y: 482, width: 1180, height: 570 },
  },
];

// Text a viewer sees inside the clip (document coordinates), read from the rendered DOM.
function textInClip(clip) {
  const hit = (r) => r.width > 0 && r.height > 0 && r.right > clip.x && r.left < clip.x + clip.width
    && r.bottom + scrollY > clip.y && r.top + scrollY < clip.y + clip.height;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const out = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!n.textContent.trim() || !el) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    if ([...range.getClientRects()].some(hit)) out.push(n.textContent.trim());
  }
  return out.join(' ');
}

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const dir = outIdx >= 0 ? args.splice(outIdx, 2)[1] : 'src/assets/shots';
const only = args;
mkdirSync(dir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
let failed = 0;
for (const s of SHOTS.filter((s) => !only.length || only.includes(s.out))) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(s.url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  if (s.prepare) await s.prepare(page);
  // Scroll the whole page once so lazy content renders, then return to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);
  let clip = s.clip;
  if (clip.selector) {
    const box = await page.locator(clip.selector).first().boundingBox();
    clip = { x: box.x - clip.pad, y: box.y - clip.pad, width: box.width + 2 * clip.pad, height: clip.height };
  }
  const text = await page.evaluate(textInClip, clip);
  const violations = findViolations(text);
  if (violations.length) {
    for (const v of violations) console.error(`${s.out}: ${v.rule}: "${v.match}"`);
    failed++;
  } else {
    await page.screenshot({ path: `${dir}/${s.out}.png`, clip, fullPage: true });
    console.log(`${s.out}: captured, clip text clean (${text.length} chars)`);
  }
  await page.close();
}
await browser.close();
if (failed) process.exit(1);
