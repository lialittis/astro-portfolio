import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    pubDate: z.date(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
  }),
});

const updates = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),  // or `z.string()` if preferred
    tags: z.array(z.string()).optional(),
  }),
}); 

export const collections = { blog, updates };
