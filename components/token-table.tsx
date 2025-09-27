import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Token {
  rank: number
  name: string
  ticker: string
  baseAsset: string
  marketCap: string
  volume24h?: string
  price: string
  change24h: number
  contractAddress: string
  onPancakeSwap: boolean
}

interface TokenTableProps {
  tokens: Token[]
  showVolume?: boolean
}

export function TokenTable({ tokens, showVolume = false }: TokenTableProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Token</div>
        <div className="col-span-2">Base Asset</div>
        <div className="col-span-2">Market Cap</div>
        {showVolume && <div className="col-span-2">24H Volume</div>}
        <div className={showVolume ? "col-span-2" : "col-span-4"}>24H Change</div>
      </div>

      {/* Token Rows */}
      {tokens.map((token) => (
        <Link key={token.rank} href={`/token/${token.contractAddress}`}>
          <Card className="hover-glow-cyan transition-all duration-300 hover:scale-[1.02] cursor-pointer">
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Rank */}
                <div className="col-span-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                    {token.rank}
                  </div>
                </div>

                {/* Token Info */}
                <div className="col-span-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-sm font-bold">{token.ticker.slice(0, 2)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{token.name}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">{token.ticker}</p>
                        {token.onPancakeSwap && (
                          <Badge variant="secondary" className="text-xs">
                            PCS
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Base Asset */}
                <div className="col-span-2">
                  <span className="font-medium text-foreground">{token.baseAsset}</span>
                </div>

                {/* Market Cap */}
                <div className="col-span-2">
                  <span className="font-medium text-foreground">{token.marketCap}</span>
                </div>

                {/* 24H Volume (if shown) */}
                {showVolume && (
                  <div className="col-span-2">
                    <span className="font-medium text-foreground">{token.volume24h || "N/A"}</span>
                  </div>
                )}

                {/* 24H Change */}
                <div className={showVolume ? "col-span-2" : "col-span-4"}>
                  <span className={`font-medium ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
