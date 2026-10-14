import { test, expect, type Page } from '@playwright/test';

type Event = { event: string; properties: Record<string, unknown> };

// PostHog drops events from automated browsers (navigator.webdriver, and the HeadlessChrome brand
// in userAgentData on the headless shell CI uses). Present as a normal browser.
async function asVisitor(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
    Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => undefined });
  });
}

test('tag is registered on every page view and stripped from the address bar', async ({ page }) => {
  test.skip(!process.env.PUBLIC_POSTHOG_KEY, 'needs a key at build time');
  await asVisitor(page);
  const events: Event[] = [];
  await page.route('**/ingest/**', async (route) => {
    const req = route.request();
    if (req.method() === 'POST' && new URL(req.url()).pathname.startsWith('/ingest/e/')) {
      const body = JSON.parse(req.postData() ?? '{}');
      events.push(...(body.batch ?? [body]));
    }
    await route.fulfill({ status: 200, body: '{}' });
  });
  const firstBatch = page.waitForRequest((r) => new URL(r.url()).pathname.startsWith('/ingest/e/'));
  await page.goto('/?r=sauce');
  await expect(page).toHaveURL(/\/$/);
  await firstBatch;
  await page.locator('.row').first().click();
  await expect(page).toHaveURL(/\/ace-ops\/$/);
  await expect.poll(() => events.filter((e) => e.event === '$pageview').length, { timeout: 10_000 }).toBe(2);
  const views = events.filter((e) => e.event === '$pageview');
  expect(views.map((e) => new URL(String(e.properties.$current_url)).pathname)).toEqual(['/', '/ace-ops/']);
  for (const v of views) {
    expect(v.properties.resume_tag).toBe('sauce');
    expect(String(v.properties.$current_url)).not.toContain('r=');
  }
});

test('a hostile tag is ignored and never echoed', async ({ page }) => {
  await asVisitor(page);
  const events: Event[] = [];
  await page.route('**/ingest/**', async (route) => {
    const req = route.request();
    if (req.method() === 'POST' && new URL(req.url()).pathname.startsWith('/ingest/e/')) {
      events.push(...(JSON.parse(req.postData() ?? '{}').batch ?? []));
    }
    await route.fulfill({ status: 200, body: '{}' });
  });
  await page.goto('/?r=%3Cscript%3Ealert(1)%3C/script%3E');
  await expect(page).toHaveURL(/\/$/);
  expect(await page.content()).not.toContain('alert(1)');
  if (process.env.PUBLIC_POSTHOG_KEY) {
    await expect.poll(() => events.filter((e) => e.event === '$pageview').length, { timeout: 10_000 }).toBe(1);
    expect(events.every((e) => !('resume_tag' in e.properties))).toBe(true);
  }
});

test('page renders with no console errors when analytics is blocked', async ({ page }) => {
  await asVisitor(page);
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.location().url.includes('/ingest/')) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/ingest/**', (r) => r.abort());
  await page.goto('/');
  await expect(page.locator('.row')).toHaveCount(8);
  await page.waitForTimeout(4000);
  expect(errors).toEqual([]);
});

test('a project opened in a new tab keeps the tag', async ({ context, page }) => {
  test.skip(!process.env.PUBLIC_POSTHOG_KEY, 'needs a key at build time');
  await context.route('**/ingest/**', (route) => route.fulfill({ status: 200, body: '{}' }));
  await page.goto('/?r=sauce');
  await expect(page).toHaveURL(/\/$/);
  const opened = context.waitForEvent('page');
  await page.locator('.row').first().click({ modifiers: ['ControlOrMeta'] });
  const tab = await opened;
  await tab.waitForLoadState();
  await expect(tab).toHaveURL(/\/ace-ops\/$/);
  // The new tab starts with empty sessionStorage. Its PostHog instance must still hold the tag as a
  // super property, which every event it sends carries. (Its events are checked by persistence: init
  // scripts that hide automation can miss a modifier-click tab, and PostHog then drops its events.)
  const key = `ph_${process.env.PUBLIC_POSTHOG_KEY}_posthog`;
  await expect.poll(() => tab.evaluate((k) => JSON.parse(sessionStorage.getItem(k) ?? '{}').resume_tag ?? null, key), { timeout: 10_000 }).toBe('sauce');
});

test('a valid tag never reaches the DOM', async ({ page }) => {
  await page.route('**/ingest/**', (r) => r.fulfill({ status: 200, body: '{}' }));
  await page.goto('/?r=sauce');
  await expect(page).toHaveURL(/\/$/);
  expect(await page.content()).not.toContain('sauce');
});

test('the tag is stripped and the page works when the analytics library is blocked', async ({ page }) => {
  await asVisitor(page);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  let blocked = 0;
  await page.route('**/_astro/*.js', async (route) => {
    const res = await route.fetch();
    // The library chunk: the only large script, loaded on demand by the small entry script.
    const body = await res.text();
    if (body.includes('posthog') && body.length > 50_000) { blocked++; return route.abort(); }
    return route.fulfill({ response: res });
  });
  await page.route('**/ingest/**', (r) => r.abort());
  await page.goto('/?r=sauce');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.row')).toHaveCount(8);
  await page.waitForTimeout(1500);
  if (process.env.PUBLIC_POSTHOG_KEY) expect(blocked).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
