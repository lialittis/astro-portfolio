import fs from 'fs'
import path from 'path'
import yaml from 'yaml'
import { deadlineToTimestamp, selectSubmissionWindow } from './conferenceTime'

interface TimelineEntry {
	deadline: string
	abstract_deadline?: string
	comment?: string
}

export interface SubmissionWindow {
	id: string
	label: string
	deadline: string
	deadlineDisplay: string
	deadlineUtc: string
	abstractDeadline?: string
	abstractDeadlineDisplay?: string
	abstractDeadlineUtc?: string
}

interface ConferenceYear {
	year: number
	id: string
	link: string
	timeline: TimelineEntry[]
	timezone: string
	date: string
	place: string
}

export interface Conference {
	title: string
	description: string
	sub: string
	rank: { ccf: string; core: string; thcpl: string }
	dblp: string
	confs: ConferenceYear[]
	latestconf: ConferenceYear
	deadline: string
	deadlineLabel: string
	deadlineDisplay: string
	deadlineSummary: string
	deadlineUtc: string
	submissionWindows: SubmissionWindow[]
}

const CATEGORY_LABELS = {
	DS: 'Systems',
	SE: 'Software',
	SC: 'Security',
} as const

const getSubmissionWindowLabel = (
	entry: TimelineEntry,
	index: number,
	total: number,
): string => {
	const comment = entry.comment?.trim()
	if (!comment) return total > 1 ? `Cycle ${index + 1}` : 'Main submission'

	const ordinalCycle = comment.match(
		/^(First|Second|Third)\s+(?:Paper\s+)?submission deadline$/i,
	)
	if (ordinalCycle) return `${ordinalCycle[1]} Cycle`

	const label = comment
		.replace(/^Submission Deadline Round\s+/i, 'Round ')
		.replace(/\s+submission deadline$/i, '')
		.replace(/\s+deadline$/i, '')
		.trim()

	return label.charAt(0).toUpperCase() + label.slice(1)
}

export const loadConferences = (baseDir = './conferences'): Conference[] => {
	const conferenceList: Conference[] = []

	// The clock intentionally tracks only CCF-A venues in the requested subjects.
	const categories = fs
		.readdirSync(baseDir, { withFileTypes: true })
		.filter(
			(dirent) =>
				dirent.isDirectory() &&
				dirent.name in CATEGORY_LABELS,
		)
		.map((dirent) => dirent.name)

	categories.forEach((category) => {
		const categoryPath = path.join(baseDir, category)

		// Read all YAML files inside each category
		const files = fs
			.readdirSync(categoryPath)
			.filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))

		files.forEach((file) => {
			const filePath = path.join(categoryPath, file)
			const content = fs.readFileSync(filePath, 'utf8')

			try {
				const parsed = yaml.parse(content)

				// Ensure the parsed data is structured correctly
				if (
					parsed &&
					typeof parsed === 'object' &&
					parsed.confs &&
					parsed.rank?.ccf === 'A'
				) {
					parsed.latestconf = parsed.confs[parsed.confs.length - 1]
					const subject = parsed.sub as keyof typeof CATEGORY_LABELS
					parsed.sub = CATEGORY_LABELS[subject]
					
					const submissionWindows = parsed.latestconf.timeline
						.map((entry: TimelineEntry, index: number) => {
							const timestamp = deadlineToTimestamp(
								entry.deadline,
								parsed.latestconf.timezone,
							)
							if (timestamp === null) return null

							const abstractTimestamp = entry.abstract_deadline
								? deadlineToTimestamp(
										entry.abstract_deadline,
										parsed.latestconf.timezone,
									)
								: null

							return {
								id: `${parsed.latestconf.id}-window-${index + 1}`,
								label: getSubmissionWindowLabel(
									entry,
									index,
									parsed.latestconf.timeline.length,
								),
								deadline: entry.deadline,
								deadlineDisplay: `${entry.deadline} ${parsed.latestconf.timezone}`,
								deadlineUtc: new Date(timestamp).toISOString(),
								...(entry.abstract_deadline && abstractTimestamp !== null
									? {
										abstractDeadline: entry.abstract_deadline,
										abstractDeadlineDisplay: `${entry.abstract_deadline} ${parsed.latestconf.timezone}`,
										abstractDeadlineUtc: new Date(abstractTimestamp).toISOString(),
									}
									: {}),
							} satisfies SubmissionWindow
						})
						.filter(
							(window: SubmissionWindow | null): window is SubmissionWindow =>
								window !== null,
						)

					if (submissionWindows.length === 0) {
						console.warn(`Warning: Skipping ${file}; no dated deadline`)
						return
					}

					submissionWindows.sort((a: SubmissionWindow, b: SubmissionWindow) => Date.parse(a.deadlineUtc) - Date.parse(b.deadlineUtc))
					const selected = selectSubmissionWindow(submissionWindows)!

					parsed.deadline = selected.deadline
					parsed.deadlineLabel = selected.label
					parsed.deadlineDisplay = selected.deadlineDisplay
					parsed.deadlineSummary = `${selected.label} · ${selected.deadlineDisplay}`
					parsed.deadlineUtc = selected.deadlineUtc
					parsed.submissionWindows = submissionWindows
					conferenceList.push(parsed)
				} else {
					console.warn(`Warning: Skipping ${file} due to invalid structure`)
				}
			} catch (error) {
				console.error(`Error parsing YAML file ${filePath}:`, error)
			}
		})
	})

	const now = Date.now()
	return conferenceList.sort((a, b) => {
		const aTime = Date.parse(a.deadlineUtc)
		const bTime = Date.parse(b.deadlineUtc)
		const aActive = aTime >= now
		const bActive = bTime >= now

		if (aActive !== bActive) return aActive ? -1 : 1
		return aActive ? aTime - bTime : bTime - aTime
	})
}

