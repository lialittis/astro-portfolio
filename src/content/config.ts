import { defineCollection, z} from 'astro:content';
import { rssSchema } from '@astrojs/rss';

const blog = defineCollection({
  schema: rssSchema,
});

export const security_news_collections = {
  updates: defineCollection({
    schema: z.object({
      title: z.string(),
      date: z.string(),  // or `z.date()` if preferred
      tags: z.array(z.string()).optional(),
    }),
  }),
};

export const collections = { blog };