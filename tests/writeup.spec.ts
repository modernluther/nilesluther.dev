import { test, expect } from '@playwright/test';
test('write-up structure', async ({ page }) => {
  await page.goto('/ace-ops/');
  await expect(page.locator('a.back')).toHaveAttribute('href', '/');
  await expect(page.locator('h1.title')).toHaveText('ACE // OPS');
  await expect(page.locator('p.meta')).toContainText('April 2026 to present');
  await expect(page.locator('article h2')).toHaveText(['Problem', 'What I built']);
  await expect(page.locator('.results dt')).toHaveCount(4);
  await expect(page.locator('nav.end a')).toHaveAttribute('href', '/creative-concepts-pipeline/');
  await expect(page.locator('body')).not.toContainText(/[←→]/);
});
test('last project links to the first', async ({ page }) => {
  await page.goto('/here-on-tour/');
  await expect(page.locator('nav.end a')).toHaveAttribute('href', '/ace-ops/');
});
test('ACE // OPS shows its screenshot through the image pipeline', async ({ page }) => {
  await page.goto('/ace-ops/');
  const img = page.locator('figure.shot img');
  await expect(img).toBeVisible();
  expect(await img.getAttribute('src')).toMatch(/\/_astro\/.+\.(webp|avif|png)/);
});
test('write-up content sits in a main landmark, with back and next outside it', async ({ page }) => {
  await page.goto('/ace-ops/');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('main h1.title')).toHaveCount(1);
  await expect(page.locator('main .results')).toHaveCount(1);
  await expect(page.locator('main a.back, main nav.end')).toHaveCount(0);
});
test('meta separators stay attached to the link after them', async ({ page }) => {
  await page.goto('/monet-and-venice-installation/');
  expect(await page.locator('p.meta').evaluate((p) => p.textContent)).toMatch(/2026 ·\u00a0Genelec feature ·\u00a0Video/);
});
test('the 92Y write-up links the course page and carries no disclosure', async ({ page }) => {
  await page.goto('/92y-presenter-pipeline/');
  await expect(page.locator('p.meta a')).toHaveAttribute('href', /roundtable\.org\/live-courses/);
  expect((await page.content()).toLowerCase()).not.toContain('vulnerab');
  await expect(page.locator('figure.shot img')).toBeVisible();
});
test('no write-up has a Decisions section', async ({ page }) => {
  for (const s of ['ace-ops', 'vision-daemon', 'here-on-tour']) {
    await page.goto(`/${s}/`);
    await expect(page.locator('article h2', { hasText: 'Decisions' })).toHaveCount(0);
  }
});
test('the vision daemon write-up has no screenshot', async ({ page }) => {
  await page.goto('/vision-daemon/');
  await expect(page.locator('figure.shot')).toHaveCount(0);
});
