import { test, expect } from '@playwright/test';
test('home structure', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Niles Luther');
  await expect(page.locator('header img')).toHaveAttribute('alt', '');
  await expect(page.locator('header .identity')).toHaveText('Engineer. Composer.');
  await expect(page.locator('.label')).toHaveText(['About', 'Projects', 'More']);
  await expect(page.locator('.row')).toHaveCount(8);
  await expect(page.locator('.row-title').first()).toHaveText('ACE // OPS');
  await expect(page.locator('a[href="mailto:niles@nilesluther.com"]')).toBeVisible();
  await expect(page.locator('text=resume')).toHaveCount(0);
});
test('row hover fills', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('.row').first();
  await row.hover();
  await expect(row).toHaveCSS('background-color', 'rgb(245, 244, 244)');
});
test('first project is above the fold on a 13-inch laptop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 790 });
  await page.goto('/');
  const box = await page.locator('.row').first().boundingBox();
  expect(box!.y + box!.height).toBeLessThan(790);
});
test('spec font features reach the body', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFeatureSettings)).toBe('"cv01", "ss03"');
  // The self-hosted face carries cv01: its alternate one is narrower than the default one.
  const width = (ff: string) => page.evaluate(async (ff) => {
    // Load the face explicitly: fonts.ready can resolve before a new span requests it.
    const faces = await document.fonts.load("16px 'Inter Variable'", '1');
    if (!faces.length) throw new Error('Inter Variable did not load');
    const s = document.createElement('span');
    // cv01's one is 17 of 2048 units narrower. Linux rounds each advance to a whole pixel, so measure
    // at 200px (81.3 against 79.7 px a glyph) with the optical size pinned.
    s.style.cssText = `font: 200px 'Inter Variable'; font-variation-settings: 'opsz' 14; font-feature-settings: ${ff}; position: absolute; white-space: nowrap`;
    s.textContent = '1'.repeat(10);
    document.body.append(s);
    const w = s.getBoundingClientRect().width;
    s.remove();
    return w;
  }, ff);
  expect(await width('normal') - await width('"cv01"')).toBeGreaterThan(5);
});
