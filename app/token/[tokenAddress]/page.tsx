"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PriceChart } from "@/components/price-chart"
import { BuySellPanel } from "@/components/buy-sell-panel"
import { TradesComments } from "@/components/trades-comments"
import type { TradeItem } from "@/src/types/trade"
import { HoldersTable } from "@/components/holders-table"
import { useWallet } from "@/components/wallet-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Globe, Twitter, MessageCircle } from "lucide-react"
import { BondingCurveProgress } from "@/components/bonding-curve-progress"
import { toast } from "sonner"
import { useTokenCandles, useTokenDetail } from "@/src/hooks/useTokenDetail"
import { formatBNB } from "@/lib/format"
import { riseTestnet } from "@/lib/wagmi"
import { useBnbUsd } from "@/src/hooks/useBnbUsd"

function fmt(num?: number | null, digits = 6, suffix = "") {
  if (num == null) return "—"
  return `${Number(num).toFixed(digits)}${suffix}`
}

interface TokenDetailPageProps {
  params: {
    tokenAddress: string
  }
}

function relativeTime(tsMs: number) {
  const diffSec = Math.max(0, Math.floor((Date.now() - tsMs) / 1000))
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minutes ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hours ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay} days ago`
}

export default function TokenDetailPage({ params }: TokenDetailPageProps) {
  const { isConnected } = useWallet()
  const { data } = useTokenDetail(params.tokenAddress)
  const { data: candles } = useTokenCandles(params.tokenAddress, "1D")
  const { data: bnbUsd } = useBnbUsd()

  const tokenName = data?.token.displayName || data?.token.name || "—"
  const tokenSymbol = data?.token.symbol || "—"
  const onPancakeSwap = !!data?.curve?.isComplete

  const chartData = (candles || []).map((c) => ({ time: new Date(c.time).toLocaleTimeString(), price: c.close }))

  // Compute 24h change using candles (first vs last close over the period)
  const change24h = (() => {
    const cs = candles || []
    if (cs.length < 2) return undefined
    const first = cs[0].close
    const last = cs[cs.length - 1].close
    if (!first || first === 0) return undefined
    return ((last - first) / first) * 100
  })()

  const trades: TradeItem[] = [
    ...(data?.contributions || []).map((e) => ({
      id: e.id,
      wallet: e.user,
      action: "buy" as const,
      amount: `${e.baseIn.toFixed(4)} BNB`,
      tokenAmount: `${e.tokensOut.toLocaleString()} ${tokenSymbol}`,
      timestamp: relativeTime(e.timestamp),
    })),
    ...(data?.redemptions || []).map((e) => ({
      id: e.id,
      wallet: e.user,
      action: "sell" as const,
      amount: `${e.baseOut.toFixed(4)} BNB`,
      tokenAmount: `${e.tokensIn.toLocaleString()} ${tokenSymbol}`,
      timestamp: relativeTime(e.timestamp),
    })),
  ].slice(0, 50)

  const holders = (data?.holders || []).map((h, idx) => ({
    rank: idx + 1,
    address: h.user,
    balance: h.balance.toLocaleString(),
  }))

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const curve = data?.curve
  const progressPercent = curve?.lpThreshold
    ? Math.max(0, Math.min(100, (100 * (curve.raisedBase || 0)) / (curve.lpThreshold || 1)))
    : 0

  const bondingCurve = {
    progressPercent,
    remainingToken: 0,
    tokenSymbol: tokenSymbol,
    baseSymbol: "BNB",
    baseInCurve: curve?.raisedBase || 0,
    raisedAmount: curve?.raisedBase || 0,
    targetMarketCap: 5000,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Token Header */}
          <Card className="mb-8 border-border">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Token Identity */}
                <div className="flex items-center space-x-4">
                  <img
                    src={data?.token.logoURI || "/placeholder.svg"}
                    alt={`${tokenName} logo`}
                    className="w-16 h-16 rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <h1 className="text-2xl font-bold gradient-cosmic">{tokenName}</h1>
                      <span className="text-lg text-muted-foreground">({tokenSymbol})</span>
                      {onPancakeSwap && (
                        <Badge className="bg-secondary text-secondary-foreground">PancakeSwap</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-none">
                        {params.tokenAddress}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(params.tokenAddress)}
                        className="h-6 w-6 flex-shrink-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Placeholders retained; actual links to be wired later via off-chain metadata */}
                  <Button size="icon" variant="outline" className="border-border bg-transparent">
                    <Globe className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="border-border bg-transparent">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="border-border bg-transparent">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Token Description */}
              <div className="mt-4">
                <p className="text-muted-foreground text-pretty">—</p>
              </div>
            </CardContent>
          </Card>

          {/* Key Stats Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-bold text-foreground">
                  {(() => {
                    const pBase = data?.token.stats?.priceInBase
                    if (pBase == null) return "—"
                    if (bnbUsd == null) return "—"
                    const usd = pBase * bnbUsd
                    return formatUSD(usd, 6)
                  })()}
                </h3>
                <p className="text-sm text-muted-foreground">Price</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className={`text-lg font-bold ${typeof change24h === "number" ? (change24h >= 0 ? "text-green-400" : "text-red-400") : "text-muted-foreground"}`}>
                  {typeof change24h === "number" ? `${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}%` : "—"}
                </h3>
                <p className="text-sm text-muted-foreground">24h Change</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-bold text-foreground">{onPancakeSwap ? "—" : "$5,000"}</h3>
                <p className="text-sm text-muted-foreground">Market Cap</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-bold text-foreground">{formatBNB(data?.token.stats?.volume24hBase ?? null, 2)}</h3>
                <p className="text-sm text-muted-foreground">24h Volume</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-bold text-muted-foreground">—</h3>
                <p className="text-sm text-muted-foreground">Liquidity</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-bold text-foreground">{data?.token.stats?.holdersCount ?? "—"}</h3>
                <p className="text-sm text-muted-foreground">Holders</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Chart and Trades/Comments */}
            <div className="lg:col-span-2 space-y-8">
              <PriceChart
                tokenName={tokenName}
                currentPrice={(() => {
                  const pBase = data?.token.stats?.priceInBase
                  if (pBase == null || bnbUsd == null) return "—"
                  return formatUSD(pBase * bnbUsd, 6)
                })()}
                change24h={change24h}
                data={chartData}
              />
              <TradesComments tokenTicker={tokenSymbol} isWalletConnected={isConnected} trades={trades} />
            </div>

            {/* Right Column - Trading Panel */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <BondingCurveProgress
                  progressPercent={bondingCurve.progressPercent}
                  remainingToken={bondingCurve.remainingToken}
                  tokenSymbol={bondingCurve.tokenSymbol}
                  baseSymbol={bondingCurve.baseSymbol}
                  baseInCurve={bondingCurve.baseInCurve}
                  raisedAmount={bondingCurve.raisedAmount}
                  targetMarketCap={bondingCurve.targetMarketCap}
                />
                <BuySellPanel
                  tokenName={tokenName}
                  tokenTicker={tokenSymbol}
                  currentPrice={formatBNB(data?.token.stats?.priceInBase, 6)}
                  isWalletConnected={isConnected}
                  curveAddress={data?.curve?.id as string | undefined}
                  tokenAddress={data?.token.id as string}
                  tokenDecimals={data?.token.decimals as number}
                  baseSymbol={riseTestnet.nativeCurrency.symbol}
                  priceInBase={data?.token.stats?.priceInBase != null ? Number(data?.token.stats?.priceInBase) : null}
                />
              </div>
            </div>
          </div>

          {/* Additional Token Info */}
          <Card className="mt-8 border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Token Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Supply</p>
                  <p className="font-medium text-foreground">—</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Creator</p>
                  <p className="font-mono text-primary truncate">{data?.token.owner ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">{data ? new Date(data.token.createdAt).toLocaleString() : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Network</p>
                  <p className="font-medium text-foreground">BNB Chain</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <HoldersTable tokenTicker={tokenSymbol} holders={holders} showShare={false} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
