import { test, expect } from '@playwright/test';
import { readTag, stripTag } from '../src/lib/tag';
test('readTag accepts only short lowercase slugs', () => {
  expect(readTag(new URL('https://x.dev/?r=sauce'))).toBe('sauce');
  expect(readTag(new URL('https://x.dev/?r=baseten-gtm-engineer'))).toBe('baseten-gtm-engineer');
  expect(readTag(new URL('https://x.dev/'))).toBeNull();
  expect(readTag(new URL('https://x.dev/?r=<script>'))).toBeNull();
  expect(readTag(new URL('https://x.dev/?r=Sauce'))).toBeNull();
  expect(readTag(new URL(`https://x.dev/?r=${'a'.repeat(65)}`))).toBeNull();
});
test('stripTag removes only r', () => {
  expect(stripTag(new URL('https://x.dev/ace-ops/?r=sauce'))).toBe('/ace-ops/');
  expect(stripTag(new URL('https://x.dev/?r=sauce&utm_source=x#top'))).toBe('/?utm_source=x#top');
});
test('a stashed tag lives 30 minutes, slides on use, and is revalidated on read', async () => {
  const { stashTag, stashedTag } = await import('../src/lib/tag');
  const store = new Map<string, string>();
  const s = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
  const t0 = 1_000_000;
  stashTag(s, 'sauce', t0);
  expect(stashedTag(s, t0 + 29 * 60e3)).toBe('sauce');
  stashTag(s, 'sauce', t0 + 29 * 60e3);
  expect(stashedTag(s, t0 + 58 * 60e3)).toBe('sauce');
  expect(stashedTag(s, t0 + 90 * 60e3)).toBeNull();
  expect(store.size).toBe(0);
  store.set('resume_tag', JSON.stringify({ tag: '<script>', exp: t0 * 10 }));
  expect(stashedTag(s, t0)).toBeNull();
  store.set('resume_tag', 'not json');
  expect(stashedTag(s, t0)).toBeNull();
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => {} };
  expect(() => stashTag(broken, 'sauce', t0)).not.toThrow();
  expect(stashedTag(broken, t0)).toBeNull();
});
