import { test, expect } from '@playwright/test';
test('no element animates on load', async ({ page }) => {
  await page.goto('/');
  const running = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
  expect(running).toBe(0);
});
test('title transition names match between home and write-up', async ({ page }) => {
  await page.goto('/');
  const homeName = await page.locator('.row-title').first().evaluate(e => getComputedStyle(e).viewTransitionName);
  await page.goto('/ace-ops/');
  const pageName = await page.locator('h1.title').evaluate(e => getComputedStyle(e).viewTransitionName);
  expect(homeName).toBe('t-ace-ops');
  expect(pageName).toBe(homeName);
});
test('reduced motion removes hover transitions', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/');
  await expect(page.locator('.row').first()).toHaveCSS('transition-duration', '0s');
  await ctx.close();
});
