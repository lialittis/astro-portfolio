import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decryptEnvelope, encryptDataset, validateDataset } from '../scripts/progress-vault.mjs'

const emptyDataset = {
  version: 1,
  updatedAt: '2026-09-17',
  items: [],
}

test('encrypts and decrypts a progress dataset', async () => {
  const secret = 'test-only technical answer :: a private test suffix'
  const envelope = await encryptDataset(emptyDataset, secret)
  const decrypted = await decryptEnvelope(envelope, secret)
  assert.deepEqual(decrypted, emptyDataset)
  assert.equal(envelope.kdf.iterations, 600_000)
  assert.equal(envelope.cipher.name, 'AES-GCM')
})

test('rejects the wrong answer', async () => {
  const envelope = await encryptDataset(
    emptyDataset,
    'test-only technical answer :: correct private suffix',
  )
  await assert.rejects(
    decryptEnvelope(envelope, 'test-only technical answer :: wrong private suffix'),
  )
})

test('rejects invalid work statuses', () => {
  const invalid = {
    ...emptyDataset,
    items: [
      {
        id: 'invalid',
        title: 'Invalid item',
        kind: 'project',
        summary: 'Invalid progress value.',
        status: 'unknown',
        priority: 'high',
        tasks: [],
        milestones: [],
      },
    ],
  }
  assert.throws(() => validateDataset(invalid), /status is invalid/)
})

test('rejects duplicate work item ids', () => {
  const item = {
    id: 'duplicate',
    title: 'Duplicate',
    kind: 'activity',
    summary: 'Duplicate identifier.',
    status: 'planned',
    priority: 'low',
    tasks: [],
    milestones: [],
  }
  assert.throws(
    () => validateDataset({ ...emptyDataset, items: [item, { ...item }] }),
    /duplicate id/,
  )
})
