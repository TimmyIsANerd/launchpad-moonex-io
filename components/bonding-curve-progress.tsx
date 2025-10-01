"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import React from "react"

type Props = {
  progressPercent: number
  remainingToken: number
  tokenSymbol: string
  baseSymbol: string
  baseInCurve: number
  raisedAmount?: number
  targetMarketCap: number
}

function formatNumber(n: number, opts: Intl.NumberFormatOptions = {}) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 8, ...opts })
}

export function BondingCurveProgress({
  progressPercent,
  remainingToken,
  tokenSymbol,
  baseSymbol,
  baseInCurve,
  raisedAmount,
  targetMarketCap,
}: Props) {
  const pct = Math.max(0, Math.min(100, progressPercent))
  const raised = raisedAmount ?? baseInCurve

  return (
    <Card className="border-border">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold text-foreground">Bonding Curve Progress</span>
          </div>
          <span className="text-emerald-400 font-semibold tracking-tight">{pct.toFixed(2)}%</span>
        </div>

        {/* Progress Bar with glow */}
        <div className="relative w-full h-3 rounded-lg bg-gradient-to-b from-muted/70 to-muted border border-border overflow-hidden">
          <div
            className="relative h-full rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300"
            style={{ width: `${pct}%` }}
          >
            {/* glow */}
            <div className="pointer-events-none absolute inset-0 bg-emerald-400/30 blur-[6px]" />
            {/* top highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/30" />
          </div>
          {/* subtle inner shadow */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]" />
        </div>

        {/* Details */}
        <div className="mt-4 text-sm leading-relaxed text-muted-foreground space-y-3">
          <p>
            There are {" "}
            <span className="font-mono font-medium text-foreground">{formatNumber(remainingToken, { maximumFractionDigits: 6 })} {tokenSymbol}</span>{" "}
            still available for sale in the bonding curve and there is {" "}
            <span className="font-mono font-medium text-foreground">{formatNumber(baseInCurve, { maximumFractionDigits: 8 })} {baseSymbol}</span>{" "}
            (Raised amount : {" "}
            <span className="font-mono font-semibold text-emerald-400">{formatNumber(raised, { maximumFractionDigits: 8 })}{baseSymbol ? ` ${baseSymbol}` : ""}</span>) in the bonding curve.
          </p>

          <p>
            When the market cap reaches {" "}
            <span className="font-semibold text-foreground">${formatNumber(targetMarketCap, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>{" "}
            all the liquidity from the bonding curve will be deposited into PancakeSwap and burned. Progression increases as the price goes up.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
