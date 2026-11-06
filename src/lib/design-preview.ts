import { getHomeContent } from './home'

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

export const getPreviewContent = getHomeContent
export type PreviewContent = Awaited<ReturnType<typeof getPreviewContent>>
