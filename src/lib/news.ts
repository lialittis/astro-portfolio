import { getCollection, type CollectionEntry } from 'astro:content'
import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt()

export async function getSecurityNews() {
  return (await getCollection('updates', post => post.data.tags?.includes('security') ?? false))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.slug.localeCompare(b.slug))
}

export const newsUrl = (post: CollectionEntry<'updates'>) => `/security-news/${post.slug}/`
export const newsDate = (post: CollectionEntry<'updates'>) => post.data.date.toISOString().slice(0, 10)

// Existing daily digests have the date in their title; the list already shows it.
export function newsTitle(post: CollectionEntry<'updates'>) {
  return post.data.title.replace(/\s+[–—-]\s+\d{4}-\d{2}-\d{2}$/, '')
}

// Show the first source headline so date-based digests are distinguishable.
// Use Markdown's plain-text tokens, never source HTML, in collection previews.
export function newsPreview(post: CollectionEntry<'updates'>): string {
  const tokens = markdown.parse(post.body, {})
  const heading = tokens.findIndex(token => token.type === 'heading_open' && token.tag === 'h3')
  if (heading < 0) return ''
  return (tokens[heading + 1]?.children ?? [])
    .filter(token => token.type === 'text' || token.type === 'code_inline')
    .map(token => token.content)
    .join('')
}
