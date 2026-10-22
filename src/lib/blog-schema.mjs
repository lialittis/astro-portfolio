import { z } from 'astro/zod'

// Shared by Astro and the authoring CLI so their metadata rules stay in sync.
export const blogSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim(),
  pubDate: z.date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional()
}).superRefine((post, context) => {
  if (post.draft) return
  if (!post.description) {
    context.addIssue({ code: 'custom', path: ['description'], message: 'Published posts need a description.' })
  }
  if (!post.pubDate) {
    context.addIssue({ code: 'custom', path: ['pubDate'], message: 'Published posts need a publication date (YYYY-MM-DD).' })
  }
})

/** @param {{ draft?: boolean }} post */
export function isBlogVisible(post, includeDrafts = false) {
  return includeDrafts || !post.draft
}
