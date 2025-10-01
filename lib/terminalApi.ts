type Query = Record<string, string | number | boolean | undefined>

function qs(query?: Query) {
  if (!query) return ''
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined) p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

export async function apiGet<T>(path: string, query?: Query, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_TERMINAL_API_URL || 'http://localhost:1337'
  const url = `${base}${path}${qs(query)}`
  const res = await fetch(url, { method: 'GET', ...init })
  if (!res.ok) throw new Error(`GET ${path} -> HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function apiPost<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_TERMINAL_API_URL || 'http://localhost:1337'
  const url = `${base}${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  })
  if (!res.ok) throw new Error(`POST ${path} -> HTTP ${res.status}`)
  return (await res.json()) as T
}
