import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    order: z.number().int().min(1),
    summary: z.string().max(90),
    dates: z.string(),
    links: z.array(z.object({ label: z.string(), href: z.url({ protocol: /^https$/ }) })),
    shot: z.object({ src: image(), alt: z.string(), caption: z.string() }).optional(),
    results: z.array(z.object({ value: z.string(), label: z.string() })).min(2).max(4),
  }),
});

export const collections = { projects };
