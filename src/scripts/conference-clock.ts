import { formatRemainingTime, selectSubmissionWindow } from '../lib/conferenceTime'
import type { SubmissionWindow } from '../lib/conferences'

type ClockConference = {
  title: string
  description: string
  sub: string
  id: string
  place: string
  submissionWindows: SubmissionWindow[]
}
const data: ClockConference[] = JSON.parse(document.getElementById('conference-data')!.textContent!)
const list = document.getElementById('conference-list')!
const table = document.getElementById('conference-table')!
const tbody = table.querySelector('tbody')!
const search = document.querySelector<HTMLInputElement>('#conference-search')!
const category = document.querySelector<HTMLSelectElement>('#conference-category')!
const status = document.querySelector<HTMLSelectElement>('#conference-status')!
const sort = document.querySelector<HTMLSelectElement>('#conference-sort')!
const count = document.getElementById('conference-count')!
const empty = document.getElementById('conference-empty')!
const viewButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-view]'))
const entries = data.map(conf => ({
  conf,
  detail: document.getElementById(`conference-${conf.id}`) as HTMLDetailsElement,
  row: Array.from(tbody.querySelectorAll<HTMLElement>('[data-table-conference]')).find(row => row.dataset.tableConference === conf.id)!,
  searchText: `${conf.title} ${conf.description} ${conf.sub} ${conf.place}`.toLowerCase(),
}))
let view = 'list'
let lastOrder = ''
const setText = (node: Element, text: string) => {
  if (node.textContent !== text) node.textContent = text
}
const setView = (next: string) => {
  view = next
  list.hidden = view !== 'list'
  table.hidden = view !== 'table'
  viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)))
}
const update = () => {
  const now = Date.now()
  const query = search.value.trim().toLowerCase()
  let visible = 0
  const ordered = entries.map(entry => {
    const { conf, detail, row } = entry
    const selected = selectSubmissionWindow(conf.submissionWindows, now)!
    const deadline = Date.parse(selected.deadlineUtc)
    const closed = deadline <= now
    const matches = entry.searchText.includes(query) && (!category.value || conf.sub === category.value)
    // Keep an inspected item available if its final deadline passes while reading.
    const show = matches && (status.value === 'all' || !closed || detail.open)
    detail.hidden = row.hidden = !show
    if (show) visible++
    for (const element of [detail, row]) {
      element.dataset.closed = String(closed)
      element.dataset.urgent = String(!closed && deadline - now < 7 * 86400000)
      setText(element.querySelector('[data-field="label"]')!, selected.label)
      const time = element.querySelector<HTMLTimeElement>('[data-field="deadline"]')!
      time.dateTime = selected.deadlineUtc
      setText(time, selected.deadlineDisplay)
      setText(element.querySelector('[data-field="remaining"]')!, closed ? 'Closed' : formatRemainingTime(selected.deadlineUtc))
    }
    conf.submissionWindows.forEach(window => {
      const item = Array.from(detail.querySelectorAll<HTMLElement>('[data-window]')).find(item => item.dataset.window === window.id)!
      const passed = Date.parse(window.deadlineUtc) <= now
      const next = !passed && window.id === selected.id
      item.classList.toggle('closed', passed)
      item.classList.toggle('next', next)
      setText(item.querySelector('[data-window-status]')!, passed ? 'Closed' : next ? 'Next deadline' : 'Upcoming')
      const abstract = item.querySelector('[data-abstract-state]')
      if (abstract) setText(abstract, Date.parse(window.abstractDeadlineUtc!) <= now ? ' · Closed' : '')
    })
    return { ...entry, deadline, closed }
  }).sort((a, b) => {
    if (sort.value === 'name') return a.conf.title.localeCompare(b.conf.title)
    if (sort.value === 'category') return a.conf.sub.localeCompare(b.conf.sub) || a.conf.title.localeCompare(b.conf.title)
    return Number(a.closed) - Number(b.closed) || (a.closed ? b.deadline - a.deadline : a.deadline - b.deadline)
  })
  const order = ordered.map(entry => entry.conf.id).join(',')
  // Avoid moving focused/open elements on every clock tick.
  if (order !== lastOrder && !list.contains(document.activeElement) && !table.contains(document.activeElement)) {
    ordered.forEach(({ detail, row }) => { list.append(detail); tbody.append(row) })
    lastOrder = order
  }
  setText(count, `${visible} ${visible === 1 ? 'conference' : 'conferences'} · ${status.value === 'all' ? 'all deadlines' : 'upcoming deadlines'}`)
  empty.hidden = visible !== 0
}
search.addEventListener('input', update)
category.addEventListener('change', update)
sort.addEventListener('change', update)
status.addEventListener('change', () => {
  if (status.value === 'upcoming') entries.forEach(({ detail }) => { detail.open = false })
  update()
})
viewButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view!)))
entries.forEach(({ detail }) => detail.addEventListener('toggle', update))
document.querySelectorAll<HTMLButtonElement>('[data-inspect]').forEach(button => {
  button.addEventListener('click', () => {
    const detail = entries.find(entry => entry.conf.id === button.dataset.inspect)!.detail
    detail.open = true
    setView('list')
    update()
    detail.querySelector('summary')!.focus()
    detail.scrollIntoView({ block: 'start', behavior: 'instant' })
  })
})
document.getElementById('conference-reset')!.addEventListener('click', () => {
  search.value = ''
  category.value = ''
  status.value = 'all'
  update()
  search.focus()
})
document.getElementById('conference-controls')!.hidden = false
document.getElementById('conference-views')!.hidden = false
update()
setInterval(update, 1000)
