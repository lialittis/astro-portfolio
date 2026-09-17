const STATE_PREFIX = 'task:'
const MAX_STATE_BYTES = 4 * 1024

const getAllowedOrigins = (env) =>
  new Set(
    (env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store',
  Vary: 'Origin',
})

const secureEqual = (left, right) => {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

const jsonResponse = (value, status, headers) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })

const isEnvelope = (value) =>
  value !== null &&
  typeof value === 'object' &&
  value.version === 1 &&
  typeof value.iv === 'string' &&
  typeof value.ciphertext === 'string'

const listTaskRecords = async (namespace) => {
  const records = []
  let cursor

  do {
    const page = await namespace.list({ prefix: STATE_PREFIX, cursor })
    const values = await Promise.all(
      page.keys.map(async ({ name }) => {
        const value = await namespace.get(name, { cacheTtl: 30 })
        if (value === null) return null
        try {
          const envelope = JSON.parse(value)
          if (!isEnvelope(envelope)) return null
          return { taskId: name.slice(STATE_PREFIX.length), envelope }
        } catch {
          return null
        }
      }),
    )
    records.push(...values.filter(Boolean))
    cursor = page.list_complete ? undefined : page.cursor
  } while (cursor)

  return records
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? ''
    if (!getAllowedOrigins(env).has(origin)) {
      return new Response('Origin denied', { status: 403 })
    }

    const headers = corsHeaders(origin)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })

    const suppliedAuth = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    if (!suppliedAuth || !env.SYNC_AUTH_HASH || !secureEqual(suppliedAuth, env.SYNC_AUTH_HASH)) {
      return new Response('Unauthorized', { status: 401, headers })
    }

    const url = new URL(request.url)
    if (url.pathname === '/state' && request.method === 'GET') {
      return jsonResponse(
        { version: 1, records: await listTaskRecords(env.PROGRESS_STATE) },
        200,
        headers,
      )
    }

    const taskMatch = url.pathname.match(/^\/state\/([a-f0-9]{64})$/)
    if (taskMatch && request.method === 'PUT') {
      const body = await request.text()
      if (new TextEncoder().encode(body).byteLength > MAX_STATE_BYTES) {
        return new Response('State too large', { status: 413, headers })
      }

      try {
        if (!isEnvelope(JSON.parse(body))) throw new Error('Invalid envelope')
      } catch {
        return new Response('Invalid state', { status: 400, headers })
      }

      await env.PROGRESS_STATE.put(`${STATE_PREFIX}${taskMatch[1]}`, body)
      return new Response(null, { status: 204, headers })
    }

    if (url.pathname === '/state' || taskMatch) {
      return new Response('Method not allowed', {
        status: 405,
        headers: { ...headers, Allow: 'GET,PUT,OPTIONS' },
      })
    }

    return new Response('Not found', { status: 404, headers })
  },
}
