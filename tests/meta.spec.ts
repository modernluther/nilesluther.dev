import { test, expect } from '@playwright/test';
const PAGES = [['/', 'Niles Luther', '/og/home.png'], ['/vision-daemon/', 'Vision daemon · Niles Luther', '/og/vision-daemon.png']];
for (const [path, title, og] of PAGES) {
  test(`share tags on ${path}`, async ({ page, request }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    const img = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(img).toMatch(/^https?:\/\//);
    expect(new URL(img!).pathname).toBe(og);
    const res = await request.get(og);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
    const buf = await res.body();
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
  });
}
test('favicon, robots, sitemap, llms.txt', async ({ request }) => {
  for (const p of ['/favicon.svg', '/apple-touch-icon.png', '/robots.txt', '/sitemap-index.xml', '/llms.txt']) {
    expect((await request.get(p)).status(), p).toBe(200);
  }
});
