/** Display-only Unix workspace model. These paths do not change URLs or grant access. */
export const HOME_DIRECTORY = '/home/tianchi'
export const workspace = {
	home: HOME_DIRECTORY,
	writing: `${HOME_DIRECTORY}/writing`,
	projects: `${HOME_DIRECTORY}/projects`,
	about: `${HOME_DIRECTORY}/about`,
	research: `${HOME_DIRECTORY}/research`,
	news: `${HOME_DIRECTORY}/news`,
	conferences: `${HOME_DIRECTORY}/conferences`,
	progress: '/root/progress'
} as const

export function displayPath(path: string): string {
	if (path === HOME_DIRECTORY) return '~'
	return path.startsWith(`${HOME_DIRECTORY}/`)
		? `~${path.slice(HOME_DIRECTORY.length)}`
		: path
}

export function shellQuote(value: string): string {
	return `'${value.replaceAll("'", "'\\''")}'`
}

export function projectFolder(project: {
	slug?: string
	title: string
}): string {
	return (
		project.slug ??
		project.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
	)
}
