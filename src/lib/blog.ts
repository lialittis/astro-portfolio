import { getCollection } from 'astro:content'
import { isBlogVisible } from './blog-schema.mjs'

export async function getBlogPosts(includeDrafts = import.meta.env.DEV) {
  const posts = await getCollection('blog', ({ data }) => isBlogVisible(data, includeDrafts))
  return posts.sort((a, b) => (b.data.pubDate?.getTime() ?? 0) - (a.data.pubDate?.getTime() ?? 0))
}
