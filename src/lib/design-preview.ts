import projects from './Projects'
import { getBlogPosts } from './blog'
import { LINKS } from './constants'

export const directions = [
	{
		slug: 'paper',
		letter: 'A',
		name: 'Paper Terminal',
		chinese: '纸上终端',
		note: '暖纸色、细线网格与克制的终端语言。',
		mood: 'Quiet / Precise / Familiar'
	},
	{
		slug: 'journal',
		letter: 'B',
		name: 'Personal Journal',
		chinese: '个人编辑室',
		note: '编辑式排版、大标题与有节奏的内容编排。',
		mood: 'Editorial / Personal / Open'
	},
	{
		slug: 'observatory',
		letter: 'C',
		name: 'Pixel Observatory',
		chinese: '像素观察站',
		note: '像素窗景、柔和灯光与可以探索的小细节。',
		mood: 'Playful / Ambient / Curious'
	},
	{
		slug: 'pixel-terminal',
		letter: 'D',
		name: 'Pixel Terminal',
		chinese: '像素终端',
		note: '把像素书房放进终端工作台，用路径和命令串起内容。',
		mood: 'Pixel / Terminal / Personal'
	}
] as const
export type Direction = (typeof directions)[number]['slug']

export async function getPreviewContent() {
	const posts = (await getBlogPosts(false)).slice(0, 3)
	return {
		name: 'Tianchi Yu',
		chineseName: '于天池',
		intro:
			'A researcher exploring system security, AI infrastructure, and the small details that make computers work.',
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
export type PreviewContent = Awaited<ReturnType<typeof getPreviewContent>>
