import rss from "@astrojs/rss";
import { getBlogPosts } from "../lib/blog";
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export async function GET(context) {
  // RSS always contains published posts, including during local development.
  const blog = await getBlogPosts(false);
  return rss({
    title: "Tianchi YU(于天池)'s Blog",
    description: "my blog",
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      content: sanitizeHtml(parser.render(post.body)),
      // Compute RSS link from post `slug`
      // This example assumes all posts are rendered as `/blog/[slug]` routes
      link: `/blog/${post.slug}/`,
    })),
  });
}
