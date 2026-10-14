import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

// The budget guards the page's own weight: the headshot and the analytics library are excluded.
// The library is the chunk the entry script imports on demand; no page references it directly.
const html = readFileSync('dist/index.html', 'utf8');
const analytics = readdirSync('dist/_astro').filter((f) => f.endsWith('.js') && !html.includes(f) && readFileSync(`dist/_astro/${f}`, 'utf8').includes('posthog'));
const skip = (url) => url.includes('avatar') || url.includes('/ingest') || analytics.some((f) => url.endsWith(f));

const server = spawn('npx', ['astro', 'preview', '--port', '4399', '--ignore-lock'], { stdio: 'ignore' });
let bytes = 0;
const counted = [];
try {
  // Wait for the preview server to answer, up to 30 seconds.
  const deadline = Date.now() + 30_000;
  for (;;) {
    try { if ((await fetch('http://localhost:4399/')).ok) break; } catch {}
    if (Date.now() > deadline) throw new Error('preview server did not start within 30 s');
    await new Promise((r) => setTimeout(r, 250));
  }
  const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' });
  const page = await browser.newPage();
  page.on('response', async (res) => {
    if (skip(res.url())) return;
    try { const b = (await res.body()).length; bytes += b; counted.push([res.url(), b]); } catch {}
  });
  await page.goto('http://localhost:4399/', { waitUntil: 'networkidle' });
  await browser.close();
} finally {
  server.kill();
}
const kb = (bytes / 1024).toFixed(1);
for (const [u, b] of counted) console.log(`${(b / 1024).toFixed(1)} KB  ${u}`);
if (!counted.length) { console.error('no responses counted'); process.exit(1); }
if (bytes > 100 * 1024) { console.error(`home page is ${kb} KB, over the 100 KB budget`); process.exit(1); }
console.log(`weight check passed: ${kb} KB`);
