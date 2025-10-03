import { useQuery } from "@tanstack/react-query"
import { fetchGraphQL } from "@/lib/subgraphClient"
import { moonexApi } from "@/lib/moonex-api"
import { Q_TOKENS_FOR_LANDING } from "@/src/queries"
import { formatEther } from "viem"

export type TokenRow = {
  id: string
  name: string
  symbol: string
  decimals: number
  createdAt: number
  displayName?: string | null
  logoURI?: string | null
  owner?: string | null
  priceInBase?: number | null
  volume24hBase?: number | null
  holdersCount?: number | null
  isComplete?: boolean
  raisedBase?: number | null
  lpThreshold?: number | null
  // Enhanced calculated metrics
  progressPercent?: number
  marketCapUSD?: number
  liquidityUSD?: number
  // Enhanced API metadata
  apiImage?: string | null
  socialLinks?: {
    website?: string
    twitter?: string
    telegram?: string
  }
  category?: string
  description?: string
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
    const eth = formatEther(bi)
    const n = Number(eth)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

function toWeiNumber(x: any): number | null {
  try {
    if (x === null || x === undefined) return null
    const n = Number(x)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function useTokensWithAPI(first = 200, skip = 0) {
  return useQuery({
    queryKey: ["tokensWithAPI", first, skip],
    queryFn: async () => {
      console.log('🎯 Fetching tokens from subgraph with API enhancement...')
      
      try {
        // Primary: Fetch from subgraph
        const subgraphData = await fetchGraphQL<{ tokens: any[] }>(Q_TOKENS_FOR_LANDING, {
          first,
          skip,
        })
        
        console.log('📊 Subgraph tokens:', subgraphData.tokens?.length || 0)
        
        // Secondary: Fetch API metadata for enhancement
        let apiMetadata: Record<string, any> = {}
        try {
          const apiResponse = await moonexApi.makeRequest<any>(`/api/memes?limit=${first}&skip=${skip}`)
          const apiTokens = apiResponse.data || []
          
          // Create lookup map by contract address
          apiMetadata = apiTokens.reduce((map: Record<string, any>, token: any) => {
            if (token.address) {
              map[token.address.toLowerCase()] = token
            }
            return map
          }, {})
          
          console.log('🔗 API metadata tokens:', Object.keys(apiMetadata).length)
        } catch (apiError) {
          console.warn('⚠️ Could not fetch API metadata:', apiError)
          // Continue without API data
        }

        const rows: TokenRow[] = (subgraphData.tokens || []).map((t) => {
          const address = t.id.toLowerCase()
          const apiData = apiMetadata[address] || {}
          
          // Calculate metrics
          const priceInBNB = toNumber(t?.stats?.priceInBase)
          const volumeInBNB = toEtherNumber(t?.stats?.volume24hBase) || 0
          const raisedAmount = toEtherNumber(t?.bondingCurve?.raisedBase) || 0
          const threshold = toEtherNumber(t?.bondingCurve?.lpThreshold) || 5
          const holdersCount = t?.stats?.holdersCount ?? 0
          const isComplete = !!t?.bondingCurve?.isComplete
          
          // Calculate progress percentage (accurate)
          const progressPercent = threshold > 0 ? Math.min(100, (raisedAmount / threshold) * 100) : 0
          
          // Use fallback BNB price (since API doesn't have it yet)
          const bnbPriceUSD = 250 // Fallback BNB price
          
          // Calculate market cap: price * circulating supply (estimated)
          const totalSupply = 1000000000 // 1B tokens default
          const marketCapBNB = priceInBNB ? priceInBNB * totalSupply : 0
          const marketCapUSD = marketCapBNB * bnbPriceUSD
          
          // Calculate liquidity: raised amount converted to estimated liquidity USD
          // For bonding curve tokens, liquidity roughly equals raised amount * 2-4x
          const liquidityBNB = raisedAmount * (isComplete ? 3 : 2) // Estimate liquidity multiplier
          const liquidityUSD = liquidityBNB * bnbPriceUSD
          
          return {
            id: t.id,
            name: t.name,
            symbol: t.symbol,
            decimals: t.decimals,
            createdAt: Number(t.createdAt) * 1000, // Convert to ms
            displayName: t.displayName ?? (apiData.name ?? null),
            logoURI: apiData.image || (t.logoURI ?? null), // Prefer API image
            owner: t.owner ?? null,
            priceInBase: priceInBNB,
            volume24hBase: volumeInBNB,
            holdersCount,
            isComplete,
            raisedBase: raisedAmount,
            lpThreshold: threshold,
            // Enhanced calculated metrics
            progressPercent,
            marketCapUSD,
            liquidityUSD,
            // Enhanced API metadata
            apiImage: apiData.image || null,
            socialLinks: apiData.socialLinks || {},
            category: apiData.category || 'Unknown',
            description: apiData.desc || null
          }
        })
        
        console.log('✅ Enhanced tokens ready:', rows.length)
        return rows
      } catch (error) {
        console.error('❌ Error fetching tokens:', error)
        throw error
      }
    },
    staleTime: 15_000, // 15 seconds
    refetchInterval: 30_000, // Refetch every 30 seconds
    retry: 3, // Retry on failure
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

// Simplified export for backwards compatibility
export const useTokens = useTokensWithAPI
