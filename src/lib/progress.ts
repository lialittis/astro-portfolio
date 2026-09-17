export const workKinds = ['project', 'activity'] as const
export const workStatuses = ['planned', 'active', 'blocked', 'paused', 'done'] as const
export const priorities = ['high', 'medium', 'low'] as const
export const taskLanes = ['now', 'next', 'later'] as const
export const milestoneStates = ['completed', 'current', 'upcoming'] as const

export type WorkKind = (typeof workKinds)[number]
export type WorkStatus = (typeof workStatuses)[number]
export type Priority = (typeof priorities)[number]
export type TaskLane = (typeof taskLanes)[number]
export type MilestoneState = (typeof milestoneStates)[number]

export interface ProgressTask {
  id: string
  label: string
  lane: TaskLane
  done: boolean
  dueDate?: string
  schedule?: string
}

export interface ProgressMilestone {
  id: string
  label: string
  date: string
  state: MilestoneState
}

export interface WorkItem {
  id: string
  title: string
  kind: WorkKind
  summary: string
  status: WorkStatus
  priority: Priority
  startDate?: string
  targetDate?: string
  nextAction?: string
  tags?: string[]
  tasks: ProgressTask[]
  milestones: ProgressMilestone[]
}

export interface ProgressDataset {
  version: 1
  updatedAt: string
  items: WorkItem[]
}

export interface ProgressEnvelope {
  version: 1
  kdf: {
    name: 'PBKDF2'
    hash: 'SHA-256'
    iterations: number
    salt: string
  }
  cipher: {
    name: 'AES-GCM'
    iv: string
  }
  ciphertext: string
}
