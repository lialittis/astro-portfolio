import assert from 'node:assert/strict'
import { test } from 'node:test'
import worker from '../src/index.js'

const origin = 'https://tianchiyu.me'
const auth = 'test-auth-hash'

class MemoryKv {
  values = new Map()

  async get(key) {
    return this.values.get(key) ?? null
  }

  async put(key, value) {
    this.values.set(key, value)
  }

  async list({ prefix }) {
    return {
      keys: Array.from(this.values.keys())
        .filter((key) => key.startsWith(prefix))
        .map((name) => ({ name })),
      list_complete: true,
    }
  }
}

const makeEnv = () => ({
  ALLOWED_ORIGINS: `${origin},http://localhost:4321`,
  SYNC_AUTH_HASH: auth,
  PROGRESS_STATE: new MemoryKv(),
})

const request = (path, init = {}) =>
  new Request(`https://progress-sync.example.workers.dev${path}`, {
    ...init,
    headers: {
      Origin: origin,
      Authorization: `Bearer ${auth}`,
      ...init.headers,
    },
  })

test('rejects an unapproved origin', async () => {
  const response = await worker.fetch(
    new Request('https://progress-sync.example.workers.dev/state', {
      headers: { Origin: 'https://attacker.example', Authorization: `Bearer ${auth}` },
    }),
    makeEnv(),
  )
  assert.equal(response.status, 403)
})

test('rejects invalid authentication', async () => {
  const response = await worker.fetch(
    request('/state', { headers: { Authorization: 'Bearer wrong' } }),
    makeEnv(),
  )
  assert.equal(response.status, 401)
})

test('fails closed when the Worker secret is missing', async () => {
  const env = makeEnv()
  delete env.SYNC_AUTH_HASH
  const response = await worker.fetch(request('/state'), env)
  assert.equal(response.status, 401)
})

test('stores and returns encrypted task records', async () => {
  const env = makeEnv()
  const taskId = 'a'.repeat(64)
  const envelope = { version: 1, iv: 'test-iv', ciphertext: 'test-ciphertext' }

  const write = await worker.fetch(
    request(`/state/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope),
    }),
    env,
  )
  assert.equal(write.status, 204)

  const read = await worker.fetch(request('/state'), env)
  assert.equal(read.status, 200)
  assert.deepEqual(await read.json(), {
    version: 1,
    records: [{ taskId, envelope }],
  })
})
