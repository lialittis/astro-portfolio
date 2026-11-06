import projects from './Projects'
import { getBlogPosts } from './blog'
import { LINKS } from './constants'
import { getCollection } from 'astro:content'

export async function getHomeContent() {
	const posts = (await getBlogPosts(false)).slice(0, 3)
	const updates = (await getCollection('updates'))
		.filter((post) => post.data.tags?.includes('security'))
		.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
	const latest = updates[0]
	return {
		news: latest
			? {
					title: latest.data.title,
					date: latest.data.date.toISOString().slice(0, 10)
				}
			: undefined,
		name: 'Tianchi Yu',
		chineseName: '于天池',
		intro:
			'Ph.D. student at the University of Padova, working on system security and AI infrastructure.',
		about:
			'Originally from China, with chapters in Switzerland, France, and Germany. This is a place for things I learn, things I build, and life along the way.',
		location: 'Munich, Germany',
		email: 'yu-tianchi@outlook.com',
		github: LINKS.github,
		posts: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			href: `/blog/${post.slug}/`,
			date: post.data.pubDate?.toISOString().slice(0, 10),
			label: post.data.pubDate?.toLocaleDateString('en-GB', {
				month: 'short',
				year: 'numeric',
				timeZone: 'UTC'
			})
		})),
		projects: projects
			.filter(
				(project) =>
					project.title === 'AI Infrastructure & GPU Study' ||
					project.title === 'Fun TUI in Rust'
			)
			.map((project) => ({
				...project,
				href: project.slug ? `/project/${project.slug}/` : project.url,
				summary: project.slug
					? 'Small experiments in GPU execution, inference, and numerical behaviour.'
					: 'Exploring the playful side of command-line interfaces with Rust.'
			}))
	}
}
export type HomeContent = Awaited<ReturnType<typeof getHomeContent>>
