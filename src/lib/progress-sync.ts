const AUTH_DOMAIN = 'progress-sync-auth:v1:'
const STATE_KEY_SALT = 'progress-sync-state:v1'
const STATE_AAD_PREFIX = 'progress-sync-task:v1:'
const KDF_ITERATIONS = 600_000
const LOCAL_STATE_PREFIX = 'progress-vault:task:v2:'
const LEGACY_LOCAL_STATE_PREFIX = 'progress-vault:task:v1:'

export interface TaskCompletionState {
  done: boolean
  updatedAt: number
}

export interface EncryptedTaskState {
  version: 1
  iv: string
  ciphertext: string
}

interface RemoteTaskRecord {
  taskId: string
  envelope: EncryptedTaskState
}

interface RemoteTaskCollection {
  version: 1
  records: RemoteTaskRecord[]
}

export interface SyncCredentials {
  authToken: string
  encryptionKey: CryptoKey
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return window.btoa(binary)
}

const base64ToBytes = (value: string) => {
  const binary = window.atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

const normalizeResponse = (response: string) => response.normalize('NFKC').trim()

const validateCompletionState = (value: unknown): value is TaskCompletionState => {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<TaskCompletionState>
  return typeof state.done === 'boolean' && typeof state.updatedAt === 'number' && state.updatedAt >= 0
}

const validateEnvelope = (value: unknown): value is EncryptedTaskState => {
  if (!value || typeof value !== 'object') return false
  const envelope = value as Partial<EncryptedTaskState>
  return envelope.version === 1 && typeof envelope.iv === 'string' && typeof envelope.ciphertext === 'string'
}

export const getOpaqueTaskId = async (projectId: string, taskId: string) => {
  const digest = await window.crypto.subtle.digest(
    'SHA-256',
    encoder.encode(`${projectId}:${taskId}`),
  )
  return bytesToHex(new Uint8Array(digest))
}

export const readLocalTaskState = (
  storage: Storage,
  opaqueTaskId: string,
): TaskCompletionState | null => {
  const current = storage.getItem(`${LOCAL_STATE_PREFIX}${opaqueTaskId}`)
  if (current !== null) {
    try {
      const parsed: unknown = JSON.parse(current)
      if (validateCompletionState(parsed)) return parsed
    } catch {
      // Ignore malformed local state and fall back to the encrypted dataset.
    }
  }

  const legacy = storage.getItem(`${LEGACY_LOCAL_STATE_PREFIX}${opaqueTaskId}`)
  if (legacy === '1' || legacy === '0') {
    return { done: legacy === '1', updatedAt: 0 }
  }

  return null
}

export const writeLocalTaskState = (
  storage: Storage,
  opaqueTaskId: string,
  state: TaskCompletionState,
) => {
  storage.setItem(`${LOCAL_STATE_PREFIX}${opaqueTaskId}`, JSON.stringify(state))
  storage.removeItem(`${LEGACY_LOCAL_STATE_PREFIX}${opaqueTaskId}`)
}

export const deriveSyncCredentials = async (response: string): Promise<SyncCredentials> => {
  const normalized = normalizeResponse(response)
  const authDigest = await window.crypto.subtle.digest(
    'SHA-256',
    encoder.encode(`${AUTH_DOMAIN}${normalized}`),
  )
  const material = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(normalized),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const encryptionKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(STATE_KEY_SALT),
      iterations: KDF_ITERATIONS,
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )

  return {
    authToken: bytesToHex(new Uint8Array(authDigest)),
    encryptionKey,
  }
}

export const encryptTaskState = async (
  taskId: string,
  state: TaskCompletionState,
  key: CryptoKey,
): Promise<EncryptedTaskState> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: encoder.encode(`${STATE_AAD_PREFIX}${taskId}`),
    },
    key,
    encoder.encode(JSON.stringify(state)),
  )

  return {
    version: 1,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  }
}

export const decryptTaskState = async (
  taskId: string,
  envelope: EncryptedTaskState,
  key: CryptoKey,
): Promise<TaskCompletionState> => {
  if (!validateEnvelope(envelope)) throw new Error('Unsupported task-state envelope')
  const plaintext = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToBytes(envelope.iv),
      additionalData: encoder.encode(`${STATE_AAD_PREFIX}${taskId}`),
    },
    key,
    base64ToBytes(envelope.ciphertext),
  )
  const state: unknown = JSON.parse(decoder.decode(plaintext))
  if (!validateCompletionState(state)) throw new Error('Invalid task state')
  return state
}

const syncEndpoint = (baseUrl: string, path: string) => `${baseUrl.replace(/\/$/, '')}${path}`

export const fetchRemoteTaskStates = async (
  baseUrl: string,
  credentials: SyncCredentials,
): Promise<Map<string, TaskCompletionState>> => {
  const response = await fetch(syncEndpoint(baseUrl, '/state'), {
    headers: { Authorization: `Bearer ${credentials.authToken}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(5_000),
  })
  if (!response.ok) throw new Error(`Task sync failed with ${response.status}`)

  const collection = (await response.json()) as Partial<RemoteTaskCollection>
  if (collection.version !== 1 || !Array.isArray(collection.records)) {
    throw new Error('Invalid remote task collection')
  }

  const states = new Map<string, TaskCompletionState>()
  await Promise.all(
    collection.records.map(async (record) => {
      if (!record || !/^[a-f0-9]{64}$/.test(record.taskId) || !validateEnvelope(record.envelope)) {
        throw new Error('Invalid remote task record')
      }
      states.set(
        record.taskId,
        await decryptTaskState(record.taskId, record.envelope, credentials.encryptionKey),
      )
    }),
  )
  return states
}

export const putRemoteTaskState = async (
  baseUrl: string,
  credentials: SyncCredentials,
  taskId: string,
  state: TaskCompletionState,
) => {
  const envelope = await encryptTaskState(taskId, state, credentials.encryptionKey)
  const response = await fetch(syncEndpoint(baseUrl, `/state/${taskId}`), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${credentials.authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envelope),
    signal: AbortSignal.timeout(5_000),
  })
  if (!response.ok) throw new Error(`Task sync failed with ${response.status}`)
}
