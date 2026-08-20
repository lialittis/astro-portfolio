export const deadlineToTimestamp = (
	deadline: string,
	timezone: string,
): number | null => {
	const match = deadline.match(
		/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
	)
	if (!match) return null

	const [, year, month, day, hour, minute, second] = match.map(Number)
	let offsetHours: number

	if (timezone === 'AoE') {
		offsetHours = -12
	} else {
		const timezoneMatch = timezone.match(
			/^UTC(?:([+-])(\d{1,2})(?::?(\d{2}))?)?$/,
		)
		if (!timezoneMatch) return null

		const sign = timezoneMatch[1] === '-' ? -1 : 1
		const hours = Number(timezoneMatch[2] ?? 0)
		const minutes = Number(timezoneMatch[3] ?? 0)
		offsetHours = sign * (hours + minutes / 60)
	}

	return (
		Date.UTC(year, month - 1, day, hour, minute, second) -
		offsetHours * 60 * 60 * 1000
	)
}

export const formatRemainingTime = (
	deadlineUtc: string,
	includeSeconds = false,
): string => {
	const deadline = Date.parse(deadlineUtc)
	if (!Number.isFinite(deadline)) return 'TBD'

	const gap = deadline - Date.now()
	if (gap <= 0) return 'EXPIRED'

	const days = Math.floor(gap / (1000 * 60 * 60 * 24))
	const hours = Math.floor((gap / (1000 * 60 * 60)) % 24)
	const minutes = Math.floor((gap / (1000 * 60)) % 60)
	const seconds = Math.floor((gap / 1000) % 60)

	if (includeSeconds) return `${days}d ${hours}h ${minutes}m ${seconds}s`
	if (days > 0) return `${days}d ${hours}h`
	return `${hours}h ${minutes}m`
}
