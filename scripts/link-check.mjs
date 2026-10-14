import { LinkChecker } from 'linkinator';

// Absolute links on the site's own origin (canonical, og:image) resolve against the local build,
// so the check holds before the domain points at Vercel.
const site = new URL(process.env.SITE_URL || 'https://nilesluther.dev').origin;
const port = 4390;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const checker = new LinkChecker();
const result = await checker.check({
  path: 'dist', port, recurse: true, concurrency: 8, timeout: 20000, retry: true,
  linksToSkip: ['^mailto:', 'linkedin\\.com'],
  urlRewriteExpressions: [{ pattern: new RegExp(`^${esc(site)}/`), replacement: `http://localhost:${port}/` }],
});
const broken = result.links.filter((l) => l.state === 'BROKEN');
for (const l of broken) console.error(`${l.status} ${l.url} (from ${l.parent})`);
if (broken.length) process.exit(1);
console.log(`link check passed: ${result.links.length} links`);
