import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const banned = JSON.parse(readFileSync(new URL('./banned.json', import.meta.url), 'utf8'));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RULES = [
  { rule: 'em dash', re: /—/g },
  { rule: 'not X, it is Y', re: /\b(?:it'?s|it is|this is|that'?s)\s+not\b[^.!?]{1,60}[,;:]\s*(?:it'?s|it is|but)\b/gi },
  { rule: 'not X but Y', re: /\bnot\s+(?:just\s+|only\s+)?[\w\s-]{1,30},?\s+but\s+(?:also\s+)?\w+/gi },
  { rule: 'Not X. Not Y.', re: /\bNot\s+[^.]{1,30}\.\s+Not\s+[^.]{1,30}\./g },
  ...banned.words.filter((w) => !banned.caseSensitive.includes(w)).map((w) => ({ rule: `banned: ${w}`, re: new RegExp(`\\b${esc(w)}\\b`, 'gi') })),
  ...banned.caseSensitive.map((w) => ({ rule: `banned: ${w}`, re: new RegExp(`\\b${esc(w)}\\b`, 'g') })),
];

export function findViolations(text) {
  const out = [];
  for (const { rule, re } of RULES) for (const m of text.matchAll(re)) out.push({ rule, match: m[0] });
  return out;
}

export function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<meta[^>]+content="([^"]*)"[^>]*>/gi, ' $1 ')
    .replace(/<img[^>]+alt="([^"]*)"[^>]*>/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2] ?? 'dist';
  let failed = 0;
  for (const file of walk(dir).filter((f) => f.endsWith('.html') || f.endsWith('llms.txt'))) {
    const text = file.endsWith('.html') ? visibleText(readFileSync(file, 'utf8')) : readFileSync(file, 'utf8');
    for (const v of findViolations(text)) { console.error(`${file}: ${v.rule}: "${v.match}"`); failed++; }
  }
  if (failed) { console.error(`${failed} copy violation(s)`); process.exit(1); }
  console.log('copy check passed');
}
