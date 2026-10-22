import { defineCollection, z } from 'astro:content';
import { blogSchema } from '../lib/blog-schema.mjs';

const blog = defineCollection({
  schema: blogSchema,
});

const updates = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),  // or `z.string()` if preferred
    tags: z.array(z.string()).optional(),
  }),
}); 

export const collections = { blog, updates };
