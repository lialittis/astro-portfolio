import { useMemo, useRef, useState, type FormEvent } from 'react'
import type {
  ProgressDataset,
  ProgressEnvelope,
  ProgressMilestone,
  ProgressTask,
  WorkItem,
  WorkStatus,
} from '../lib/progress'
import '../style/progress-vault.css'

const AAD = new TextEncoder().encode('progress-vault:v1')
const EXPECTED_ITERATIONS = 600_000
const TASK_STATE_PREFIX = 'progress-vault:task:v1:'

class VaultSetupError extends Error {}

const fromBase64 = (value: string) => {
  const binary = window.atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

const isProgressDataset = (value: unknown): value is ProgressDataset => {
  if (!value || typeof value !== 'object') return false
  const dataset = value as Partial<ProgressDataset>
  return dataset.version === 1 && typeof dataset.updatedAt === 'string' && Array.isArray(dataset.items)
}

const getTaskStateKey = async (projectId: string, taskId: string) => {
  const digest = await window.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${projectId}:${taskId}`),
  )
  const id = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${TASK_STATE_PREFIX}${id}`
}

const applyLocalTaskState = async (dataset: ProgressDataset): Promise<ProgressDataset> => ({
  ...dataset,
  items: await Promise.all(
    dataset.items.map(async (item) => ({
      ...item,
      tasks: await Promise.all(
        item.tasks.map(async (task) => {
          try {
            const saved = window.localStorage.getItem(await getTaskStateKey(item.id, task.id))
            if (saved === '1' || saved === '0') return { ...task, done: saved === '1' }
          } catch {
            // Keep the encrypted dataset value when browser storage is unavailable.
          }
          return task
        }),
      ),
    })),
  ),
})

const saveLocalTaskState = async (projectId: string, taskId: string, done: boolean) => {
  try {
    window.localStorage.setItem(await getTaskStateKey(projectId, taskId), done ? '1' : '0')
  } catch {
    // The checkbox still works for this session when browser storage is unavailable.
  }
}

const decryptDataset = async (envelope: ProgressEnvelope, answer: string) => {
  if (
    envelope.version !== 1 ||
    envelope.kdf?.name !== 'PBKDF2' ||
    envelope.kdf.hash !== 'SHA-256' ||
    envelope.kdf.iterations !== EXPECTED_ITERATIONS ||
    envelope.cipher?.name !== 'AES-GCM'
  ) {
    throw new Error('Unsupported vault format')
  }

  const material = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(answer.normalize('NFKC').trim()),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: fromBase64(envelope.kdf.salt),
      iterations: envelope.kdf.iterations,
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
  const plaintext = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: fromBase64(envelope.cipher.iv),
      additionalData: AAD,
    },
    key,
    fromBase64(envelope.ciphertext),
  )
  const dataset: unknown = JSON.parse(new TextDecoder().decode(plaintext))
  if (!isProgressDataset(dataset)) throw new Error('Invalid progress dataset')
  return dataset
}

const formatDate = (date?: string) => {
  if (!date) return 'No date'
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

const getDaysUntil = (date?: string) => {
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${date}T00:00:00`)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

const deadlineLabel = (item: WorkItem) => {
  const days = getDaysUntil(item.targetDate)
  if (days === null) return 'No target date'
  if (item.status === 'done') return `Completed · ${formatDate(item.targetDate)}`
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  return `${days}d remaining`
}

const statusLabel = (status: WorkStatus) => status.charAt(0).toUpperCase() + status.slice(1)

interface TimelineEntry extends ProgressMilestone {
  projectId: string
  projectTitle: string
}

interface TaskEntry extends ProgressTask {
  projectId: string
  projectTitle: string
}

type ToggleTask = (projectId: string, taskId: string) => void

function EmptyDashboard() {
  return (
    <section className="vault-empty" aria-labelledby="empty-title">
      <span className="vault-empty-icon" aria-hidden="true">◇</span>
      <div>
        <p className="vault-kicker">workspace ready</p>
        <h2 id="empty-title">Your progress vault is empty.</h2>
        <p>
          Add the first project or activity to <code>data/progress.private.yml</code>, then run{' '}
          <code>pnpm progress:encrypt</code>.
        </p>
      </div>
    </section>
  )
}

function WorkCard({ item, onToggleTask }: { item: WorkItem; onToggleTask: ToggleTask }) {
  const days = getDaysUntil(item.targetDate)
  const schedule = item.tasks.find((task) => task.schedule)?.schedule
  const deadlineClass =
    days !== null && days < 0 && item.status !== 'done'
      ? 'is-overdue'
      : days !== null && days <= 14 && item.status !== 'done'
        ? 'is-soon'
        : ''

  return (
    <article className={`vault-work-card status-${item.status}`}>
      <header>
        <div>
          <span className="vault-work-kind">{item.kind}</span>
          <h3>{item.title}</h3>
        </div>
        <span className={`vault-status status-${item.status}`}>{statusLabel(item.status)}</span>
      </header>

      <p className="vault-work-summary">{item.summary}</p>

      <dl className="vault-work-meta">
        <div>
          <dt>priority</dt>
          <dd className={`priority-${item.priority}`}>{item.priority}</dd>
        </div>
        <div>
          <dt>{schedule ? 'schedule' : 'target'}</dt>
          <dd>{schedule ?? formatDate(item.targetDate)}</dd>
        </div>
        {item.targetDate && (
          <div>
            <dt>health</dt>
            <dd className={deadlineClass}>{deadlineLabel(item)}</dd>
          </div>
        )}
      </dl>

      {item.tasks.length > 0 && (
        <div className="vault-context-tasks">
          <div className="vault-context-tasks-heading">
            <span>linked tasks</span>
            <span>{item.tasks.filter((task) => !task.done).length} open</span>
          </div>
          <ul>
            {item.tasks.map((task) => (
              <li className={task.done ? 'is-done' : ''} key={task.id}>
                <input
                  className="vault-task-checkbox vault-context-task-checkbox"
                  type="checkbox"
                  checked={task.done}
                  onChange={() => onToggleTask(item.id, task.id)}
                  aria-label={`${task.done ? 'Mark incomplete' : 'Mark complete'}: ${task.label}`}
                />
                <div>
                  <strong>{task.label}</strong>
                  {(task.schedule || task.dueDate) && (
                    <small>{task.schedule ?? `Due ${formatDate(task.dueDate)}`}</small>
                  )}
                </div>
                <span className={`vault-context-task-lane lane-${task.lane}`}>{task.lane}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const today = new Date()
  const todayIso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  const rows = [
    ...entries.map((entry) => ({ type: 'milestone' as const, date: entry.date, entry })),
    { type: 'today' as const, date: todayIso },
  ].sort((left, right) => left.date.localeCompare(right.date))

  return (
    <section className="vault-panel" aria-labelledby="timeline-title">
      <div className="vault-section-heading">
        <div>
          <p className="vault-kicker">chronological view</p>
          <h2 id="timeline-title">Milestone Timeline</h2>
        </div>
        <span>{entries.length} events</span>
      </div>
      {entries.length === 0 ? (
        <p className="vault-panel-empty">No milestones yet.</p>
      ) : (
        <ol className="vault-timeline">
          {rows.map((row) => {
            if (row.type === 'today') {
              return (
                <li className="timeline-today" key="timeline-today">
                  <time dateTime={row.date}>{formatDate(row.date)}</time>
                  <span className="vault-timeline-dot" aria-hidden="true" />
                  <div>
                    <strong>Today</strong>
                    <span>current position</span>
                  </div>
                </li>
              )
            }
            const { entry } = row
            return (
              <li className={`milestone-${entry.state}`} key={`${entry.projectId}-${entry.id}`}>
                <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                <span className="vault-timeline-dot" aria-hidden="true" />
                <div>
                  <strong>{entry.label}</strong>
                  <span>{entry.projectTitle}</span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function ImmediateTasks({ entries, onToggleTask }: { entries: TaskEntry[]; onToggleTask: ToggleTask }) {
  const laneOrder = { now: 0, next: 1, later: 2 }
  const orderedEntries = [...entries].sort((left, right) => {
    if (left.done !== right.done) return Number(left.done) - Number(right.done)
    const laneDifference = laneOrder[left.lane] - laneOrder[right.lane]
    if (laneDifference !== 0) return laneDifference
    return (left.dueDate ?? '9999-12-31').localeCompare(right.dueDate ?? '9999-12-31')
  })

  return (
    <section className="vault-panel vault-immediate-panel" aria-labelledby="tasks-title">
      <div className="vault-section-heading">
        <div>
          <p className="vault-kicker">what needs attention</p>
          <h2 id="tasks-title">Immediate Tasks</h2>
        </div>
        <span>{entries.filter((entry) => !entry.done).length} open</span>
      </div>
      {orderedEntries.length === 0 ? (
        <p className="vault-panel-empty">No tasks yet.</p>
      ) : (
        <ul className="vault-immediate-list">
          {orderedEntries.map((task) => {
            const days = getDaysUntil(task.dueDate)
            const dueClass =
              !task.done && days !== null && days < 0
                ? 'is-overdue'
                : !task.done && days !== null && days <= 3
                  ? 'is-soon'
                  : ''
            return (
              <li className={task.done ? 'is-done' : dueClass} key={`${task.projectId}-${task.id}`}>
                <input
                  className="vault-task-checkbox"
                  type="checkbox"
                  checked={task.done}
                  onChange={() => onToggleTask(task.projectId, task.id)}
                  aria-label={`${task.done ? 'Mark incomplete' : 'Mark complete'}: ${task.label}`}
                />
                <div className="vault-task-copy">
                  <strong>{task.label}</strong>
                  <span>{task.projectTitle}</span>
                </div>
                <div className="vault-task-due">
                  <span>{task.lane}</span>
                  {task.dueDate ? (
                    <time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time>
                  ) : (
                    <span className="vault-task-schedule">{task.schedule ?? 'No deadline'}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <p className="vault-local-state-note">Checkboxes are saved only in this browser.</p>
    </section>
  )
}

function Dashboard({
  dataset,
  onLock,
  onToggleTask,
}: {
  dataset: ProgressDataset
  onLock: () => void
  onToggleTask: ToggleTask
}) {
  const timeline = useMemo(
    () =>
      dataset.items
        .flatMap((item) =>
          item.milestones.map((milestone) => ({
            ...milestone,
            projectId: item.id,
            projectTitle: item.title,
          })),
        )
        .sort((left, right) => left.date.localeCompare(right.date)),
    [dataset],
  )
  const tasks = useMemo(
    () =>
      dataset.items.flatMap((item) =>
        item.tasks.map((task) => ({
          ...task,
          projectId: item.id,
          projectTitle: item.title,
        })),
      ),
    [dataset],
  )

  return (
    <div className="vault-dashboard">
      <div className="vault-toolbar">
        <div>
          <p className="vault-kicker">decryption successful</p>
          <h1>Reminder Board</h1>
          <p className="vault-updated">Last updated {formatDate(dataset.updatedAt)}</p>
        </div>
        <button className="vault-lock-button" type="button" onClick={onLock}>
          <span aria-hidden="true">■</span> lock vault
        </button>
      </div>

      {dataset.items.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <>
          <ImmediateTasks entries={tasks} onToggleTask={onToggleTask} />

          <section className="vault-work-section" aria-labelledby="work-title">
            <div className="vault-section-heading">
              <div>
                <p className="vault-kicker">compact context</p>
                <h2 id="work-title">Work Context</h2>
              </div>
              <span>{dataset.items.length} item{dataset.items.length === 1 ? '' : 's'}</span>
            </div>
            <div className="vault-work-grid">
              {dataset.items.map((item) => (
                <WorkCard item={item} onToggleTask={onToggleTask} key={item.id} />
              ))}
            </div>
          </section>

          {timeline.length > 0 && <Timeline entries={timeline} />}
        </>
      )}
    </div>
  )
}

export default function ProgressVault() {
  const [dataset, setDataset] = useState<ProgressDataset | null>(null)
  const [phase, setPhase] = useState<'locked' | 'unlocking' | 'error' | 'setup'>('locked')
  const [message, setMessage] = useState('')
  const answerRef = useRef<HTMLInputElement>(null)

  const toggleTask: ToggleTask = (projectId, taskId) => {
    if (!dataset) return
    const currentTask = dataset.items
      .find((item) => item.id === projectId)
      ?.tasks.find((task) => task.id === taskId)
    if (!currentTask) return

    const done = !currentTask.done
    setDataset({
      ...dataset,
      items: dataset.items.map((item) =>
        item.id === projectId
          ? {
              ...item,
              tasks: item.tasks.map((task) => task.id === taskId ? { ...task, done } : task),
            }
          : item,
      ),
    })
    void saveLocalTaskState(projectId, taskId, done)
  }

  const unlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const answer = answerRef.current?.value ?? ''
    if (answer.length < 16) {
      setMessage('Enter the code answer and your private suffix.')
      setPhase('error')
      return
    }

    setMessage('')
    setPhase('unlocking')
    try {
      const response = await fetch('/data/progress.enc.json', { cache: 'no-store' })
      if (response.status === 404) throw new VaultSetupError('The encrypted dataset has not been created yet.')
      if (!response.ok) throw new Error('The encrypted dataset could not be loaded.')
      const envelope = (await response.json()) as ProgressEnvelope
      const decrypted = await decryptDataset(envelope, answer)
      if (answerRef.current) answerRef.current.value = ''
      setDataset(await applyLocalTaskState(decrypted))
      setPhase('locked')
    } catch (error) {
      if (answerRef.current) {
        answerRef.current.value = ''
        answerRef.current.focus()
      }
      if (error instanceof VaultSetupError) {
        setMessage('Vault not initialized. Run pnpm progress:init, edit the private YAML, then run pnpm progress:encrypt.')
        setPhase('setup')
      } else {
        setMessage('Access denied. Check the answer, suffix, and capitalization.')
        setPhase('error')
      }
    }
  }

  const lock = () => {
    setDataset(null)
    setMessage('Vault locked. Decrypted progress data was removed from this page.')
    setPhase('locked')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => answerRef.current?.focus(), 250)
  }

  if (dataset) return <Dashboard dataset={dataset} onLock={lock} onToggleTask={toggleTask} />

  return (
    <section className="vault-gate" aria-labelledby="vault-title">
      <div className="vault-gate-mark" aria-hidden="true">
        <span>◆</span>
      </div>
      <p className="vault-kicker">encrypted workspace · AES-256-GCM</p>
      <h1 id="vault-title">Read the code.</h1>
      <div className="vault-code-challenge">
        <pre><code>int x = 1;{'\n'}printf(&quot;%d&quot;, x++ + ++x);</code></pre>
        <p>In C, what is this program's behavior?</p>
      </div>

      <form className="vault-form" onSubmit={unlock}>
        <label htmlFor="vault-answer">challenge_response</label>
        <div className="vault-input-row">
          <span aria-hidden="true">$</span>
          <input
            ref={answerRef}
            id="vault-answer"
            name="answer"
            type="password"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            disabled={phase === 'unlocking'}
            placeholder="answer::private-suffix"
            aria-describedby="vault-hint vault-message"
          />
          <button type="submit" disabled={phase === 'unlocking'}>
            {phase === 'unlocking' ? 'deriving key…' : 'decrypt'}
          </button>
        </div>
        <p id="vault-hint" className="vault-hint">
          Use the short code answer, two colons, and your private suffix. The complete response is case-sensitive.
        </p>
        <p
          id="vault-message"
          className={`vault-message ${phase === 'error' ? 'is-error' : phase === 'setup' ? 'is-setup' : ''}`}
          aria-live="polite"
        >
          {message}
        </p>
      </form>

      <div className="vault-security-note">
        <span aria-hidden="true">i</span>
        <p>The answer is processed locally. It is never sent to a server or stored by this page.</p>
      </div>
    </section>
  )
}
