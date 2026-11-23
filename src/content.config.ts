import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { zestLoader } from './loaders/zest';

/**
 * Zes4U-compatible content structure:
 *
 * posts/<slug>/{zh,en,ja}.md
 * posts/<slug>/<chapter>/{zh,en,ja}.md
 * welcome-site/{zh,en,ja}.md
 *
 * Album media lives outside the collection in src/content/album and is read
 * by utils/album.ts, matching Zes4U's gallery pipeline.
 */
const palette = z.array(z.string()).length(3);

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: z.object({
      title: z.string(),
      index: z.string(),
      year: z.string(),
      role: z.string(),
      summary: z.string(),
      cover: z.string().optional(),
      tags: z.array(z.string()).default([]),
      palette,
      draft: z.boolean().default(false),
    }),
  }),

  posts: defineCollection({
    loader: zestLoader({ base: './src/content/post' }),
    schema: z.object({
      title: z.string(),
      category: z.string().min(1),
      tag: z.array(z.string()).default([]),
      description: z.string().optional(),
      pubDate: z.coerce.date().optional(),
      postImage: z.string().nullable().optional(),
      homepined: z.boolean().default(false),
      pinedOrder: z.number().default(0),
      draft: z.boolean().default(false),
      isSubpage: z.boolean().default(false),
    }),
  }),

  pages: defineCollection({
    loader: zestLoader({ base: './src/content/welcome-site' }),
    schema: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      pubDate: z.coerce.date().optional(),
    }),
  }),
};
