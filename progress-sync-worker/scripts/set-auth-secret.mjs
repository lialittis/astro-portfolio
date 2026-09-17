import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const workerRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const wrangler = resolve(workerRoot, 'node_modules/.bin/wrangler')

const promptHidden = (label) => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Run this command in an interactive terminal')
  }

  return new Promise((resolveResponse, reject) => {
    let value = ''
    const finish = () => {
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdin.removeListener('data', onData)
      process.stdout.write('\n')
      resolveResponse(value)
    }
    const onData = (chunk) => {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003') {
          process.stdin.setRawMode(false)
          process.stdin.pause()
          reject(new Error('Cancelled'))
          return
        }
        if (character === '\r' || character === '\n') {
          finish()
          return
        }
        if (character === '\u007f') {
          if (value.length > 0) {
            value = value.slice(0, -1)
            process.stdout.write('\b \b')
          }
          continue
        }
        value += character
        process.stdout.write('•')
      }
    }

    process.stdout.write(label)
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', onData)
  })
}

let response = (await promptHidden('Full challenge response: ')).normalize('NFKC').trim()
if (response.length < 16) throw new Error('The complete response must contain at least 16 characters')

let authHash = createHash('sha256')
  .update(`progress-sync-auth:v1:${response}`)
  .digest('hex')
response = ''

const child = spawn(wrangler, ['secret', 'put', 'SYNC_AUTH_HASH'], {
  cwd: workerRoot,
  env: process.env,
  stdio: ['pipe', 'inherit', 'inherit'],
})
child.stdin.end(authHash)

const exitCode = await new Promise((resolveExit, reject) => {
  child.once('error', reject)
  child.once('exit', (code) => resolveExit(code ?? 1))
})

authHash = ''
if (exitCode !== 0) process.exitCode = exitCode
