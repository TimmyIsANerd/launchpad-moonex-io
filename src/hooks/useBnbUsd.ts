import { useQuery } from "@tanstack/react-query"

export type BnbUsdResponse = {
  usd: number
  source: string
  updatedAt: number // ms
}

async function fetchBnbUsd(): Promise<number> {
  const res = await fetch("/api/prices/bnb", { method: "GET" })
  if (!res.ok) throw new Error(`GET /api/prices/bnb -> HTTP ${res.status}`)
  const json = (await res.json()) as BnbUsdResponse
  const n = Number(json.usd)
  if (!Number.isFinite(n)) throw new Error("Invalid USD price from server")
  return n
}

export function useBnbUsd(staleTimeMs = 60_000) {
  return useQuery({
    queryKey: ["bnbUsd"],
    queryFn: fetchBnbUsd,
    staleTime: staleTimeMs,
    refetchInterval: staleTimeMs,
  })
}