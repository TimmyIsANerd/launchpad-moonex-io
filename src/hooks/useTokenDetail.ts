import { useQuery } from "@tanstack/react-query"
import { fetchGraphQL } from "@/lib/subgraphClient"
import { Q_TOKEN_DETAIL, Q_CANDLES_1M, Q_CANDLES_5M, Q_CANDLES_1H, Q_CANDLES_1D } from "@/src/queries"

function bnToFloat(x: any, decimals = 18): number {
  if (x === null || x === undefined) return 0
  const v = typeof x === "string" ? x : String(x)
  const big = BigInt(v)
  // Calculate base using Math.pow to avoid BigInt exponentiation issues
  const base = Math.pow(10, decimals)
  // Convert to JS number cautiously (ok for display ranges)
  return Number(big) / base
}

export type TokenDetail = {
  token: {
    id: string
    name: string
    symbol: string
    decimals: number
    owner: string
    createdAt: number
    displayName?: string | null
    logoURI?: string | null
    totalSupply?: number | null
    stats?: {
      priceInBase?: number | null
      volume24hBase?: number | null
      cumulativeVolumeBase?: number | null
      holdersCount?: number | null
      lastUpdated?: number | null
    }
  }
  curve?: {
    id: string
    isComplete: boolean
    completedAt?: number | null
    raisedBase: number // in base asset units (assumed 18)
    tokensSold: number // token units (depends on token decimals, unknown here)
    lpThreshold?: number | null // base units
    tradeFeeBps?: number | null
    saleStart?: number | null
  }
  contributions: Array<{ id: string; user: string; baseIn: number; tokensOut: number; priceInBase: number; timestamp: number }>
  redemptions: Array<{ id: string; user: string; tokensIn: number; baseOut: number; priceInBase: number; timestamp: number }>
  holders: Array<{ id: string; user: string; balance: number; updatedAt: number }>
}

export function useTokenDetail(tokenId: string) {
  return useQuery({
    queryKey: ["tokenDetail", tokenId],
    enabled: !!tokenId,
    queryFn: async () => {
      const data = await fetchGraphQL<any>(Q_TOKEN_DETAIL, { id: tokenId })
      const t = data.token
      const curve = (data.bondingCurves?.[0] as any) || null
      const out: TokenDetail = {
        token: {
          id: t.id,
          name: t.name,
          symbol: t.symbol,
          decimals: Number(t.decimals),
          owner: t.owner,
          createdAt: Number(t.createdAt) * 1000,
          displayName: t.displayName ?? null,
          logoURI: t.logoURI ?? null,
          totalSupply: t.totalSupply != null ? Number(t.totalSupply) : null,
          stats: t.stats
            ? {
                priceInBase: t.stats.priceInBase != null ? Number(t.stats.priceInBase) : null,
                volume24hBase: t.stats.volume24hBase != null ? Number(t.stats.volume24hBase) : null,
                cumulativeVolumeBase: t.stats.cumulativeVolumeBase != null ? Number(t.stats.cumulativeVolumeBase) : null,
                holdersCount: t.stats.holdersCount ?? null,
                lastUpdated: t.stats.lastUpdated != null ? Number(t.stats.lastUpdated) * 1000 : null,
              }
            : undefined,
        },
        curve: curve
          ? {
              id: curve.id,
              isComplete: !!curve.isComplete,
              completedAt: curve.completedAt != null ? Number(curve.completedAt) * 1000 : null,
              raisedBase: bnToFloat(curve.raisedBase, 18),
              tokensSold: Number(curve.tokensSold ?? 0),
              lpThreshold: curve.lpThreshold != null ? bnToFloat(curve.lpThreshold, 18) : null,
              tradeFeeBps: curve.tradeFeeBps ?? null,
              saleStart: curve.saleStart != null ? Number(curve.saleStart) * 1000 : null,
            }
          : undefined,
        contributions: (data.contributions || []).map((e: any) => ({
          id: e.id,
          user: e.user,
          baseIn: bnToFloat(e.baseIn, 18),
          tokensOut: Number(e.tokensOut ?? 0),
          priceInBase: Number(e.priceInBase ?? 0),
          timestamp: Number(e.timestamp) * 1000,
        })),
        redemptions: (data.redemptions || []).map((e: any) => ({
          id: e.id,
          user: e.user,
          tokensIn: Number(e.tokensIn ?? 0),
          baseOut: bnToFloat(e.baseOut, 18),
          priceInBase: Number(e.priceInBase ?? 0),
          timestamp: Number(e.timestamp) * 1000,
        })),
        holders: (data.tokenHolders || []).map((h: any) => ({
          id: h.id,
          user: h.user,
          balance: Number(h.balance ?? 0),
          updatedAt: Number(h.updatedAt) * 1000,
        })),
      }
      return out
    },
    staleTime: 10_000,
  })
}

export type Timeframe = "1H" | "1D" | "1W"

function rangeFor(timeframe: Timeframe) {
  const nowSec = Math.floor(Date.now() / 1000)
  if (timeframe === "1H") return { from: nowSec - 60 * 60, to: nowSec, interval: "1m" as const }
  if (timeframe === "1D") return { from: nowSec - 24 * 60 * 60, to: nowSec, interval: "1h" as const }
  return { from: nowSec - 7 * 24 * 60 * 60, to: nowSec, interval: "1h" as const } // 1W: use 1h buckets for now
}

export function useTokenCandles(tokenId: string, timeframe: Timeframe) {
  return useQuery({
    queryKey: ["tokenCandles", tokenId, timeframe],
    enabled: !!tokenId,
    queryFn: async () => {
      const { from, to, interval } = rangeFor(timeframe)
      const vars = { token: tokenId, from, to, first: 500 }
      let data: any
      if (interval === "1m") data = await fetchGraphQL<any>(Q_CANDLES_1M, vars)
      else if (interval === "1h") data = await fetchGraphQL<any>(Q_CANDLES_1H, vars)
      else data = await fetchGraphQL<any>(Q_CANDLES_1H, vars)
      const rows = (data.candle1ms || data.candle1hs || data.candle1ds || []).map((c: any) => ({
        time: Number(c.startTimestamp) * 1000,
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        volume: Number(c.volumeBase),
      }))
      return rows
    },
    staleTime: 15_000,
  })
}
