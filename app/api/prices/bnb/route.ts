import { NextResponse } from "next/server"

export const revalidate = 60 // seconds - cache on the server for 1 minute

function parseUsdFromBscScan(json: any): { usd: number | null; ts: number | null } {
  if (!json) return { usd: null, ts: null }
  const res = json.result
  let usd: number | null = null
  let ts: number | null = null

  if (res && typeof res === "object") {
    const maybeUsd = (res.ethusd ?? res.bnbusd ?? res.usd ?? res.price) as string | number | undefined
    const maybeTs = (res.ethusd_timestamp ?? res.bnbusd_timestamp ?? res.timestamp ?? res.time) as
      | string
      | number
      | undefined
    if (maybeUsd != null) {
      const n = Number(maybeUsd)
      usd = Number.isFinite(n) ? n : null
    }
    if (maybeTs != null) {
      const n = Number(maybeTs)
      ts = Number.isFinite(n) ? n : null
    }
  } else if (typeof res === "string") {
    const n = Number(res)
    usd = Number.isFinite(n) ? n : null
  }

  return { usd, ts }
}

export async function GET() {
  const apiKey = process.env.BSCSCAN_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "BSCSCAN_API_KEY is not set" }, { status: 500 })
  }

  const url = `https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=${encodeURIComponent(apiKey)}`

  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) {
      return NextResponse.json({ error: `BscScan HTTP ${res.status}` }, { status: 502 })
    }
    const json = await res.json()
    const { usd, ts } = parseUsdFromBscScan(json)

    if (usd == null) {
      return NextResponse.json({ error: "Could not parse USD from BscScan payload", raw: json }, { status: 502 })
    }

    const payload = {
      usd,
      source: "bscscan",
      updatedAt: (ts ?? Math.floor(Date.now() / 1000)) * 1000, // ms
    }

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        // Allow downstream CDN/browser caching if desired
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch BNB USD price" }, { status: 502 })
  }
}