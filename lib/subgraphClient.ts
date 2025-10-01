export type Json = Record<string, unknown>

// Minimal GraphQL fetcher tailored for the Goldsky subgraph.
// Intentionally framework-agnostic: works in server and client components.
export async function fetchGraphQL<T = Json>(
  query: string,
  variables?: Json,
  init?: RequestInit
): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SYSTEM_SUBGRAPH
  if (!url) throw new Error('NEXT_PUBLIC_SYSTEM_SUBGRAPH is not set')

  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : undefined
  const timeout = setTimeout(() => ctrl?.abort(), 15_000)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: ctrl?.signal,
      ...init,
    })
    if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`)
    const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> }
    if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join('; '))
    return json.data as T
  } finally {
    clearTimeout(timeout)
  }
}
