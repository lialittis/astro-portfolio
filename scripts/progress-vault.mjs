import { constants as fsConstants } from 'node:fs'
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { webcrypto } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse, stringify } from 'yaml'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_SOURCE = resolve(ROOT, 'data/progress.private.yml')
const EXAMPLE_SOURCE = resolve(ROOT, 'data/progress.example.yml')
const DEFAULT_ENVELOPE = resolve(ROOT, 'public/data/progress.enc.json')
const AAD = new TextEncoder().encode('progress-vault:v1')
const ITERATIONS = 600_000

const allowedKinds = new Set(['project', 'activity'])
const allowedStatuses = new Set(['planned', 'active', 'blocked', 'paused', 'done'])
const allowedPriorities = new Set(['high', 'medium', 'low'])
const allowedLanes = new Set(['now', 'next', 'later'])
const allowedMilestoneStates = new Set(['completed', 'current', 'upcoming'])

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const requireString = (value, path, { optional = false } = {}) => {
  if (optional && value === undefined) return
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${path} must be a non-empty string`)
  }
}

const requireDate = (value, path, { optional = false } = {}) => {
  if (optional && value === undefined) return
  requireString(value, path)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error(`${path} must use YYYY-MM-DD`)
  }
}

const requireUniqueIds = (entries, path) => {
  const ids = new Set()
  entries.forEach((entry, index) => {
    requireString(entry?.id, `${path}[${index}].id`)
    if (ids.has(entry.id)) throw new Error(`${path} contains duplicate id "${entry.id}"`)
    ids.add(entry.id)
  })
}

export function validateDataset(dataset) {
  if (!isPlainObject(dataset)) throw new Error('dataset must be an object')
  if (dataset.version !== 1) throw new Error('dataset.version must be 1')
  requireDate(dataset.updatedAt, 'dataset.updatedAt')
  if (!Array.isArray(dataset.items)) throw new Error('dataset.items must be an array')
  requireUniqueIds(dataset.items, 'dataset.items')

  dataset.items.forEach((item, itemIndex) => {
    const path = `dataset.items[${itemIndex}]`
    if (!isPlainObject(item)) throw new Error(`${path} must be an object`)
    requireString(item.title, `${path}.title`)
    requireString(item.summary, `${path}.summary`)
    if (!allowedKinds.has(item.kind)) throw new Error(`${path}.kind is invalid`)
    if (!allowedStatuses.has(item.status)) throw new Error(`${path}.status is invalid`)
    if (!allowedPriorities.has(item.priority)) throw new Error(`${path}.priority is invalid`)
    requireDate(item.startDate, `${path}.startDate`, { optional: true })
    requireDate(item.targetDate, `${path}.targetDate`, { optional: true })
    requireString(item.nextAction, `${path}.nextAction`, { optional: true })
    if (item.tags !== undefined && (!Array.isArray(item.tags) || item.tags.some((tag) => typeof tag !== 'string'))) {
      throw new Error(`${path}.tags must be an array of strings when provided`)
    }
    if (!Array.isArray(item.tasks)) throw new Error(`${path}.tasks must be an array`)
    if (!Array.isArray(item.milestones)) throw new Error(`${path}.milestones must be an array`)
    requireUniqueIds(item.tasks, `${path}.tasks`)
    requireUniqueIds(item.milestones, `${path}.milestones`)

    item.tasks.forEach((task, taskIndex) => {
      const taskPath = `${path}.tasks[${taskIndex}]`
      requireString(task.label, `${taskPath}.label`)
      if (!allowedLanes.has(task.lane)) throw new Error(`${taskPath}.lane is invalid`)
      if (typeof task.done !== 'boolean') throw new Error(`${taskPath}.done must be a boolean`)
      requireDate(task.dueDate, `${taskPath}.dueDate`, { optional: true })
      requireString(task.schedule, `${taskPath}.schedule`, { optional: true })
    })

    item.milestones.forEach((milestone, milestoneIndex) => {
      const milestonePath = `${path}.milestones[${milestoneIndex}]`
      requireString(milestone.label, `${milestonePath}.label`)
      requireDate(milestone.date, `${milestonePath}.date`)
      if (!allowedMilestoneStates.has(milestone.state)) {
        throw new Error(`${milestonePath}.state is invalid`)
      }
    })
  })

  return dataset
}

function normalizeSecret(secret) {
  const normalized = secret.normalize('NFKC').trim()
  if (normalized.length < 16) {
    throw new Error('The complete response must contain at least 16 characters')
  }
  return normalized
}

function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString('base64')
}

function base64ToBytes(value) {
  return new Uint8Array(Buffer.from(value, 'base64'))
}

async function deriveKey(secret, salt, usages) {
  const material = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(normalizeSecret(secret)),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usages,
  )
}

export async function encryptDataset(dataset, secret) {
  validateDataset(dataset)
  const salt = webcrypto.getRandomValues(new Uint8Array(16))
  const iv = webcrypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(secret, salt, ['encrypt'])
  const plaintext = new TextEncoder().encode(JSON.stringify(dataset))
  const ciphertext = await webcrypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: AAD },
    key,
    plaintext,
  )

  return {
    version: 1,
    kdf: {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: ITERATIONS,
      salt: bytesToBase64(salt),
    },
    cipher: {
      name: 'AES-GCM',
      iv: bytesToBase64(iv),
    },
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  }
}

export async function decryptEnvelope(envelope, secret) {
  if (!isPlainObject(envelope) || envelope.version !== 1) throw new Error('Unsupported envelope')
  if (envelope.kdf?.name !== 'PBKDF2' || envelope.kdf?.hash !== 'SHA-256') {
    throw new Error('Unsupported key derivation')
  }
  if (envelope.kdf.iterations !== ITERATIONS) throw new Error('Unexpected work factor')
  if (envelope.cipher?.name !== 'AES-GCM') throw new Error('Unsupported cipher')

  const salt = base64ToBytes(envelope.kdf.salt)
  const iv = base64ToBytes(envelope.cipher.iv)
  const ciphertext = base64ToBytes(envelope.ciphertext)
  const key = await deriveKey(secret, salt, ['decrypt'])
  const plaintext = await webcrypto.subtle.decrypt(
    { name: 'AES-GCM', iv, additionalData: AAD },
    key,
    ciphertext,
  )
  return validateDataset(JSON.parse(new TextDecoder().decode(plaintext)))
}

function promptHidden(label) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('A terminal is required for the hidden secret prompt')
  }

  return new Promise((resolveSecret, reject) => {
    let value = ''
    const stdin = process.stdin
    const finish = () => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.removeListener('data', onData)
      process.stdout.write('\n')
      resolveSecret(value)
    }
    const onData = (chunk) => {
      const input = chunk.toString('utf8')
      for (const char of input) {
        if (char === '\u0003') {
          stdin.setRawMode(false)
          stdin.pause()
          process.stdout.write('\n')
          reject(new Error('Cancelled'))
          return
        }
        if (char === '\r' || char === '\n') {
          finish()
          return
        }
        if (char === '\u007f') {
          if (value.length > 0) {
            value = value.slice(0, -1)
            process.stdout.write('\b \b')
          }
          continue
        }
        value += char
        process.stdout.write('•')
      }
    }

    process.stdout.write(label)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    stdin.on('data', onData)
  })
}

async function readYaml(path) {
  return validateDataset(parse(await readFile(path, 'utf8')))
}

async function initPrivateSource() {
  try {
    await access(DEFAULT_SOURCE, fsConstants.F_OK)
    throw new Error('data/progress.private.yml already exists')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  await copyFile(EXAMPLE_SOURCE, DEFAULT_SOURCE)
  console.log('Created data/progress.private.yml')
}

async function encryptPrivateSource(source = DEFAULT_SOURCE, destination = DEFAULT_ENVELOPE) {
  const dataset = await readYaml(source)
  const secret = await promptHidden('Challenge response (answer::private-suffix): ')
  const confirmation = await promptHidden('Repeat the challenge response: ')
  if (secret !== confirmation) throw new Error('The two answers do not match')
  const envelope = await encryptDataset(dataset, secret)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, `${JSON.stringify(envelope, null, 2)}\n`, 'utf8')
  console.log(`Encrypted ${dataset.items.length} work item(s) to ${destination}`)
}

async function decryptPrivateSource(source = DEFAULT_ENVELOPE, destination = DEFAULT_SOURCE) {
  try {
    await access(destination, fsConstants.F_OK)
    throw new Error('data/progress.private.yml already exists; move it before restoring')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const envelope = JSON.parse(await readFile(source, 'utf8'))
  const secret = await promptHidden('Challenge response (answer::private-suffix): ')
  const dataset = await decryptEnvelope(envelope, secret)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, stringify(dataset), 'utf8')
  console.log(`Restored ${dataset.items.length} work item(s) to ${destination}`)
}

async function main() {
  const [command, pathArgument] = process.argv.slice(2)
  if (command === 'init') return initPrivateSource()
  if (command === 'encrypt') return encryptPrivateSource(pathArgument ? resolve(pathArgument) : undefined)
  if (command === 'decrypt') return decryptPrivateSource(pathArgument ? resolve(pathArgument) : undefined)
  if (command === 'validate') {
    const dataset = await readYaml(pathArgument ? resolve(pathArgument) : DEFAULT_SOURCE)
    console.log(`Valid progress dataset: ${dataset.items.length} work item(s)`)
    return
  }
  throw new Error('Usage: progress-vault.mjs <init|encrypt|decrypt|validate> [path]')
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error) => {
    console.error(`Progress vault: ${error.message}`)
    process.exitCode = 1
  })
}
