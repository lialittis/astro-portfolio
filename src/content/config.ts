import { defineCollection, z} from 'astro:content';
import { rssSchema } from '@astrojs/rss';

const blog = defineCollection({
  schema: rssSchema,
});

const updates = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),  // or `z.string()` if preferred
    tags: z.array(z.string()).optional(),
  }),
}); 

export const collections = { blog, updates };