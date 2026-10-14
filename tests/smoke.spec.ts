import { test, expect } from '@playwright/test';
test('home renders with the site background and Inter', async ({ page }) => {
  await page.goto('/');
  const body = page.locator('body');
  await expect(body).toHaveCSS('background-color', 'rgb(253, 253, 252)');
  await expect(body).toHaveCSS('font-size', '16px');
  expect(await body.evaluate(e => getComputedStyle(e).fontFamily)).toContain('Inter Variable');
});
