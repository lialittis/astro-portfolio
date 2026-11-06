import { displayPath, workspace } from './terminal'

export const navigation = [
	{ href: '/', path: displayPath(workspace.home), label: 'home' },
	{ href: '/blog', path: displayPath(workspace.writing), label: 'writing' },
	{
		href: '/project',
		path: displayPath(workspace.projects),
		label: 'projects'
	},
	{ href: '/me', path: displayPath(workspace.about), label: 'about' },
	{
		href: '/publications',
		path: displayPath(workspace.research),
		label: 'research'
	},
	{ href: '/security-news', path: displayPath(workspace.news), label: 'news' },
	{
		href: '/confclock',
		path: displayPath(workspace.conferences),
		label: 'conferences'
	},
	{
		href: '/progress',
		path: displayPath(workspace.progress),
		label: 'progress',
		locked: true
	}
] as const

export const isCurrentRoute = (pathname: string, href: string) =>
	href === '/'
		? pathname === '/'
		: pathname === href || pathname.startsWith(`${href}/`)
