import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import YAML from 'yaml'

const SOURCE_URL = 'https://ccfddl.com/conference/allconf.yml'
const INCLUDED_SUBJECTS = new Set(['DS', 'SE', 'SC'])
const INCLUDED_CCF_RANK = 'A'
const CONFERENCE_ROOT = path.resolve('conferences')

const source = process.argv[2] ?? SOURCE_URL
const yamlText = source.startsWith('http')
	? await fetch(source).then((response) => {
		if (!response.ok) {
			throw new Error(`Could not download ${source}: ${response.status}`)
		}
		return response.text()
	})
	: await fs.readFile(path.resolve(source), 'utf8')

const allConferences = YAML.parse(yamlText)

if (!Array.isArray(allConferences)) {
	throw new Error('Expected the CCFDDL source to contain a conference list')
}

const selected = allConferences.filter(
	(conference) =>
		INCLUDED_SUBJECTS.has(conference.sub) &&
		conference.rank?.ccf === INCLUDED_CCF_RANK,
)

if (selected.length === 0) {
	throw new Error('No matching conferences found; refusing to replace local data')
}

const slugify = (title) =>
	title
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')

for (const subject of INCLUDED_SUBJECTS) {
	const subjectDirectory = path.join(CONFERENCE_ROOT, subject)
	await fs.mkdir(subjectDirectory, { recursive: true })

	const existingFiles = (await fs.readdir(subjectDirectory)).filter((file) =>
		/\.ya?ml$/.test(file),
	)
	const expectedFiles = new Set(
		selected
			.filter((conference) => conference.sub === subject)
			.map((conference) => `${slugify(conference.title)}.yml`),
	)

	for (const file of existingFiles) {
		if (!expectedFiles.has(file)) {
			await fs.rm(path.join(subjectDirectory, file))
		}
	}
}

for (const conference of selected) {
	if (!conference.title || !conference.confs?.length) {
		throw new Error(`Invalid conference entry: ${conference.title ?? 'unknown'}`)
	}

	const outputPath = path.join(
		CONFERENCE_ROOT,
		conference.sub,
		`${slugify(conference.title)}.yml`,
	)
	const header = `# Source: ${SOURCE_URL}\n# Filter: CCF ${INCLUDED_CCF_RANK}, ${[
		...INCLUDED_SUBJECTS,
	].join('/')}\n`
	await fs.writeFile(outputPath, header + YAML.stringify(conference), 'utf8')
}

const counts = Object.fromEntries(
	[...INCLUDED_SUBJECTS].map((subject) => [
		subject,
		selected.filter((conference) => conference.sub === subject).length,
	]),
)

console.log(`Synchronized ${selected.length} conferences`, counts)
