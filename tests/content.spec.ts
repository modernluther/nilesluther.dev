import { test, expect } from '@playwright/test';
const SLUGS = ['ace-ops','creative-concepts-pipeline','creative-concepts-site','vision-daemon','92y-presenter-pipeline','monet-and-venice-installation','monet-and-venice-symphony','here-on-tour'];
test('every project write-up exists', async ({ request }) => {
  for (const s of SLUGS) expect((await request.get(`/${s}/`)).status(), s).toBe(200);
});
