export const navigation = [
	{ href: '/', label: 'home' },
	{ href: '/blog', label: 'writing' },
	{ href: '/project', label: 'projects' },
	{ href: '/me', label: 'about' },
	{ href: '/publications', label: 'research' },
	{ href: '/security-news', label: 'news' },
	{ href: '/confclock', label: 'conferences' },
	{ href: '/progress', label: 'progress', locked: true }
] as const

export const isCurrentRoute = (pathname: string, href: string) =>
	href === '/'
		? pathname === '/'
		: pathname === href || pathname.startsWith(`${href}/`)
