import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { albumLoader } from './loaders/album';

const palette = z.array(z.string()).length(3);
const tri = z.tuple([z.string(), z.string(), z.string()]);

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

const album = defineCollection({
  loader: albumLoader({ file: './src/content/album/photo-video.json' }),
  schema: z.object({
    draft: z.boolean().default(false),
    type: z.enum(['photo', 'video']).default('photo'),
    category: z.string().default(''),
    tag: z.array(z.string()).default([]),
    location: z.string().default(''),
    place: tri.optional(),
    date: z.string().default(''),
    photographer: z.string().default('zes'),
    title: tri,
    description: z.string().default(''),
    text: tri,
    exif: z.record(z.string(), z.string()).default({}),
    related: z.array(z.string()).default([]),
    ratio: z.enum(['portrait', 'square', 'landscape']).default('landscape'),
    palette: tri.optional(),
    src: z.string().default(''),
  }),
});

export const collections = { post, project, album };
