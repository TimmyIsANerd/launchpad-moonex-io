import { useQuery } from "@tanstack/react-query"
import { moonexApi } from "@/lib/moonex-api"

export type APITokenRow = {
  id?: string
  _id: string
  name: string
  ticker: string
  desc: string
  address: string
  image?: string | null
  createdAt: string
  category: string
  feeRecipient: string
  feePercentage: number
  launchStatus: {
    type: 'PREPARING' | 'BONDING' | 'LISTED' | 'COMPLETED' | 'FAILED'
    preparedAt?: string
    launchedAt?: string
    listedAt?: string
    completedAt?: string
    totalRaised?: string
    tokensSold?: string
    transactionHash?: string
  }
  bondingCurveParams?: {
    p0: string
    k: string
  }
  maxSupply?: string
  lpThreshold?: string
  socialLinks?: {
    website?: string
    twitter?: string
    telegram?: string
  }
}

function toNumber(x: any): number | null {
  if (x === null || x === undefined) return null
  const n = Number(x)
  return Number.isFinite(n) ? n : null
}

function toEtherNumber(x: any): number | null {
  try {
    if (x === null || x === undefined) return null
    const bi = BigInt(typeof x === "string" ? x : String(x))
    const eth = String(Number(bi) / 1e18)
    const n = Number(eth)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function useTokensFromAPI(limit = 200, skip = 0) {
  return useQuery({
    queryKey: ["tokensFromAPI", limit, skip],
    queryFn: async () => {
      console.log('🎯 Fetching tokens from Hono API...')
      
      try {
        // Fetch memes/tokens from your API
        const apiData = await moonexApi.makeRequest<any>(`/api/memes?limit=${limit}&skip=${skip}`)
        const rawTokens = apiData.data || []
        
        console.log('📊 Raw tokens from API:', rawTokens.length)
        
        if (!rawTokens.length) {
          console.warn('⚠️ No tokens found in API. Returning empty array.')
          return []
        }

        const rows: APITokenRow[] = rawTokens.map((token: any) => ({
          id: token.address || token._id,
          _id: token._id,
          name: token.name || 'Unnamed Token',
          ticker: token.ticker || 'UNKNOWN',
          desc: token.desc || '',
          address: token.address || '',
          image: token.image || null,
          createdAt: token.createdAt || new Date().toISOString(),
          category: token.category || 'Meme',
          feeRecipient: token.feeRecipient || '',
          feePercentage: toNumber(token.feePercentage) || 1.5,
          launchStatus: token.launchStatus || { type: 'PREPARING' },
          bondingCurveParams: token.bondingCurveParams || { p0: '6250000', k: '0' },
          maxSupply: token.maxSupply || '1000000000000000000000000000',
          lpThreshold: token.lpThreshold || '50000000000000000000',
          socialLinks: token.socialLinks || {}
        }))
        
        console.log('✅ Processed tokens:', rows.length)
        return rows
      } catch (error) {
        console.error('❌ Error fetching tokens from API:', error)
        throw error
      }
    },
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
    enabled: true // Always enabled, let it fail and fallback to mock data
  })
}

// Combined hook that tries API first, fallback to subgraph, then mock data
export function useTokens(fallbackFirst = 200, fallbackSkip = 0) {
  const apiQuery = useTokensFromAPI(fallbackFirst, fallbackSkip)
  
  return {
    ...apiQuery,
    data: apiQuery.data || [],
    error: apiQuery.error,
    isLoading: apiQuery.isLoading,
    isSuccess: apiQuery.isSuccess
  }
}
