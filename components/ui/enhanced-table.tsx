"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import Link from "next/link"

interface TokenTableRow {
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
  holdersCount?: number
  liquidity?: string
}

interface EnhancedTableProps {
  tokens: TokenTableRow[]
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function EnhancedTable({
  tokens,
  loading = false,
  emptyMessage = "No data available",
  className
}: EnhancedTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!tokens.length) {
    return (
      <Card className="border-border">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {tokens.map((token, index) => (
        <Link key={`${token.contractAddress}-${index}`} href={`/token/${token.contractAddress}`}>
          <Card className="group hover-glow-cyan transition-all duration-300 hover:scale-[1.01] cursor-pointer border-border hover:border-primary/50">
            <CardContent className="p-4">
              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                {/* Rank */}
                <div className="col-span-1">
                  <div className="relative">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all duration-300",
                        token.rank <= 3
                          ? "bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg"
                          : "bg-gradient-to-br from-primary to-secondary"
                      )}
                    >
                      #{token.rank}
                    </div>
                    {token.rank <= 3 && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Token Info */}
                <div className="col-span-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-border">
                        <span className="text-lg font-bold text-primary">
                          {token.ticker.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      {token.onPancakeSwap && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                          <span className="text-xs text-white font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {token.name}
                      </h3>
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
                <div className="col-span-1">
                  <Badge variant="outline" className="text-xs">
                    {token.baseAsset}
                  </Badge>
                </div>

                {/* Market Cap */}
                <div className="col-span-2">
                  <span className="font-medium text-foreground">{token.marketCap}</span>
                </div>

                {/* Volume */}
                {token.volume24h && (
                  <div className="col-span-2">
                    <span className="font-medium text-foreground">{token.volume24h}</span>
                  </div>
                )}

                {/* Change */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-1">
                    {token.change24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span
                      className={cn(
                        "font-medium",
                        token.change24h >= 0 ? "text-green-400" : "text-red-400"
                      )}
                    >
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm",
                          token.rank <= 3
                            ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                            : "bg-gradient-to-br from-primary to-secondary"
                        )}
                      >
                        #{token.rank}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{token.name}</h3>
                      <p className="text-sm text-muted-foreground">{token.ticker}</p>
                    </div>
                  </div>
                  
                  {token.onPancakeSwap && (
                    <Badge variant="secondary" className="text-xs">
                      PCS
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">{token.price}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Market Cap</p>
                    <p className="font-medium">{token.marketCap}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">24h Change</p>
                    <div className="flex items-center space-x-1">
                      {token.change24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span
                        className={cn(
                          "font-medium text-xs",
                          token.change24h >= 0 ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {token.change24h >= 0 ? "+" : ""}
                        {token.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
