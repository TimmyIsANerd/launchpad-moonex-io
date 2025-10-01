import { useQuery } from "@tanstack/react-query"
import { fetchGraphQL } from "@/lib/subgraphClient"
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
}

function toNumber(x: any): number | null {
  if (x === null || x === undefined) return null
  const n = Number(x)
  return Number.isFinite(n) ? n : null
}

function toEtherNumber(x: any): number | null {
  try {
    if (x === null || x === undefined) return null
    // subgraph often returns string; ensure BigInt conversion
    const bi = BigInt(typeof x === "string" ? x : String(x))
    const eth = formatEther(bi)
    const n = Number(eth)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function useTokens(first = 200, skip = 0) {
  return useQuery({
    queryKey: ["tokensForLanding", first, skip],
    queryFn: async () => {
      const data = await fetchGraphQL<{ tokens: any[] }>(Q_TOKENS_FOR_LANDING, {
        first,
        skip,
      })
      const rows: TokenRow[] = (data.tokens || []).map((t) => ({
        id: t.id,
        name: t.name,
        symbol: t.symbol,
        decimals: t.decimals,
        createdAt: Number(t.createdAt) * 1000, // ms
        displayName: t.displayName ?? null,
        logoURI: t.logoURI ?? null,
        owner: t.owner ?? null,
        priceInBase: toNumber(t?.stats?.priceInBase),
        volume24hBase: toNumber(t?.stats?.volume24hBase),
        holdersCount: t?.stats?.holdersCount ?? null,
        isComplete: !!t?.bondingCurve?.isComplete,
        raisedBase: toEtherNumber(t?.bondingCurve?.raisedBase),
        lpThreshold: toEtherNumber(t?.bondingCurve?.lpThreshold),
      }))
      return rows
    },
    staleTime: 15_000,
  })
}
