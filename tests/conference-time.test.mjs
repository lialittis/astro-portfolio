import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deadlineToTimestamp, formatRemainingTime, selectSubmissionWindow } from '../src/lib/conferenceTime.ts'

test('source timezone offsets preserve the submission instant', () => {
  assert.equal(deadlineToTimestamp('2026-11-06 23:59:59', 'AoE'), Date.parse('2026-11-07T11:59:59Z'))
  assert.equal(deadlineToTimestamp('2026-11-06 23:59:59', 'UTC-12'), Date.parse('2026-11-07T11:59:59Z'))
  assert.equal(deadlineToTimestamp('2026-11-06 12:00:00', 'UTC+05:30'), Date.parse('2026-11-06T06:30:00Z'))
  assert.equal(deadlineToTimestamp('2026-11-06 12:00:00', 'UTC'), Date.parse('2026-11-06T12:00:00Z'))
  assert.equal(deadlineToTimestamp('TBD', 'AoE'), null)
  assert.equal(deadlineToTimestamp('2026-11-06 12:00:00', 'unknown'), null)
})

test('selects the nearest future round regardless of source order', () => {
  const first = { id: 'first', deadlineUtc: '2026-11-07T12:00:00Z' }
  const second = { id: 'second', deadlineUtc: '2027-01-01T12:00:00Z' }
  const windows = [second, first]
  assert.equal(selectSubmissionWindow(windows, Date.parse('2026-11-06T00:00:00Z')), first)
  assert.deepEqual(windows, [second, first], 'source ordering is not mutated')
  assert.equal(selectSubmissionWindow(windows, Date.parse(first.deadlineUtc)), second)
  assert.equal(selectSubmissionWindow(windows, Date.parse(second.deadlineUtc)), second)
  assert.equal(selectSubmissionWindow(windows, Date.parse('2028-01-01T00:00:00Z')), second)
})

test('handles missing or undated windows', () => {
  assert.equal(selectSubmissionWindow([]), undefined)
  assert.equal(selectSubmissionWindow([{ deadlineUtc: 'TBD' }]), undefined)
})

test('countdown expires at the deadline and keeps sub-day precision', context => {
  context.mock.method(Date, 'now', () => Date.parse('2026-11-06T12:00:00Z'))
  assert.equal(formatRemainingTime('2026-11-06T12:00:00Z'), 'EXPIRED')
  assert.equal(formatRemainingTime('2026-11-06T12:05:30Z'), '0h 5m')
  assert.equal(formatRemainingTime('2026-11-06T12:05:30Z', true), '0d 0h 5m 30s')
  assert.equal(formatRemainingTime('2026-11-07T15:00:00Z'), '1d 3h')
})
