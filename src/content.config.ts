import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const palette = z.array(z.string()).length(3);

const post = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/post' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    reading: z.number().default(4),
    palette,
  }),
});

const project = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/project' }),
  schema: z.object({
    title: z.string(),
    index: z.string(),
    year: z.string(),
    role: z.string(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    palette,
  }),
});

export const collections = { post, project };
