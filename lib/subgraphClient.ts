export type Json = Record<string, unknown>

// Minimal GraphQL fetcher tailored for the Goldsky subgraph.
// Intentionally framework-agnostic: works in server and client components.
export async function fetchGraphQL<T = Json>(
  query: string,
  variables?: Json,
  init?: RequestInit
): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SYSTEM_SUBGRAPH
  
  console.log('🌐 fetchGraphQL: Starting GraphQL request')
  console.log('🌐 fetchGraphQL: URL:', url)
  console.log('🌐 fetchGraphQL: Query:', query)
  console.log('🌐 fetchGraphQL: Variables:', variables)
  
  if (!url) {
    const error = new Error('NEXT_PUBLIC_SYSTEM_SUBGRAPH is not set')
    console.error('❌ fetchGraphQL: Environment variable not set')
    throw error
  }

  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : undefined
  const timeout = setTimeout(() => ctrl?.abort(), 15_000)

  try {
    const requestBody = JSON.stringify({ query, variables })
    console.log('🌐 fetchGraphQL: Request body:', requestBody)
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: requestBody,
      signal: ctrl?.signal,
      ...init,
    })
    
    console.log('🌐 fetchGraphQL: Response status:', res.status)
    console.log('🌐 fetchGraphQL: Response headers:', Object.fromEntries(res.headers.entries()))
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ fetchGraphQL: HTTP Error response:', errorText)
      throw new Error(`GraphQL HTTP ${res.status}: ${errorText}`)
    }
    
    const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> }
    console.log('🌐 fetchGraphQL: Response data:', json.data)
    
    if (json.errors?.length) {
      console.error('❌ fetchGraphQL: GraphQL errors:', json.errors)
      throw new Error(json.errors.map(e => e.message).join('; '))
    }
    
    return json.data as T
  } catch (error) {
    console.error('❌ fetchGraphQL: Network or parsing error:', error)
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
