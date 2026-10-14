import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://nilesluther.dev',
  integrations: [sitemap()],
  build: { format: 'directory' },
  prefetch: false,
});
