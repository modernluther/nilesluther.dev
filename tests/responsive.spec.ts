import { test, expect } from '@playwright/test';
const PAGES = ['/', '/ace-ops/', '/creative-concepts-pipeline/', '/creative-concepts-site/', '/vision-daemon/', '/92y-presenter-pipeline/', '/monet-and-venice-installation/', '/monet-and-venice-symphony/', '/here-on-tour/'];
for (const width of [320, 360, 390, 430, 1280]) {
  for (const path of PAGES) {
    test(`${path} at ${width}px has no horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(sw).toBeLessThanOrEqual(cw);
    });
  }
}
test('next link stays on one line at 390px and the chevron never sits alone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  for (const path of PAGES.slice(1)) {
    await page.goto(path);
    const a = page.locator('nav.end a');
    const h = (await a.boundingBox())!.height;
    expect(h, path).toBeLessThan(40);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  for (const path of PAGES.slice(1)) {
    await page.goto(path);
    const chev = (await page.locator('nav.end .chev').boundingBox())!;
    const word = (await page.locator('nav.end .nw').boundingBox())!;
    expect(Math.abs(chev.y + chev.height / 2 - (word.y + word.height / 2)), path).toBeLessThan(12);
  }
});
test.describe('touch targets', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('inline links, back, and next are at least 44px tall without moving the layout', async ({ page }) => {
    await page.goto('/');
    for (const h of await page.locator('.prose a').evaluateAll((as) => as.map((a) => a.getBoundingClientRect().height))) expect(h).toBeGreaterThanOrEqual(44);
    await page.goto('/ace-ops/');
    for (const sel of ['a.back', 'nav.end a', '.meta a']) {
      expect((await page.locator(sel).first().boundingBox())!.height, sel).toBeGreaterThanOrEqual(44);
    }
    // The title sits where it does with a fine pointer: 64px top padding, a 32px back row, 64px gap.
    expect((await page.locator('.head').boundingBox())!.y).toBe(160);
  });
});
