"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface TokenListingCardProps {
  href: string
  status?: string // e.g., "Listed on PancakeSwap"
  logoEmoji?: string // fallback logo (emoji or text)
  baseAsset?: string // e.g., "BNB"
  ticker: string
  price?: string // formatted, e.g., "0.000123 BNB"
  change24h?: number | null // number for +/- color, null for unknown
  name: string // full descriptive name
  category?: string // e.g., "Meme"
  description?: string // short narrative
  creator?: string | null // address string to truncate
  marketCap?: string | null // formatted cap or placeholder
}

function truncateAddress(addr?: string | null) {
  if (!addr) return null
  if (addr.length <= 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function TokenListingCard({
  href,
  status = "Listed on PancakeSwap",
  logoEmoji = "🚀",
  baseAsset = "BNB",
  ticker,
  price = "—",
  change24h = null,
  name,
  category = "Meme",
  description,
  creator,
  marketCap,
}: TokenListingCardProps) {
  const changeColor =
    typeof change24h === "number"
      ? change24h >= 0
        ? "text-green-400"
        : "text-red-400"
      : "text-muted-foreground"

  return (
    <Link href={href} className="block">
      <Card className="bg-card border-border rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
        <CardContent className="p-5">
          {/* Header & Status Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Token Logo */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg">
                {logoEmoji}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Base:</span>
                  <span className="text-xs font-semibold text-foreground">{baseAsset}</span>
                </div>
                <div className="mt-1">
                  <Badge variant="secondary" className="text-xs bg-primary/15 text-primary">
                    {status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing and Ticker Row */}
          <div className="mt-4 flex items-center justify-between">
            <div className="truncate">
              <div className="text-xl font-extrabold text-foreground leading-tight">{ticker}</div>
            </div>
            <div className="text-right">
              <div className="text-foreground text-base font-semibold">{price ?? "—"}</div>
              <div className={cn("text-sm font-bold", changeColor)}>
                {typeof change24h === "number" ? `${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}%` : "—"}
              </div>
            </div>
          </div>

          {/* Detailed Information Block */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-foreground truncate">{name}</div>
              {category && (
                <Badge variant="outline" className="px-2 py-0.5 text-xs bg-secondary/10 text-secondary border-secondary/20">
                  {category}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Market Cap:</span>
                <span className="text-foreground font-medium">{marketCap ?? "—"}</span>
              </div>
              {truncateAddress(creator) && (
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-muted-foreground">created by:</span>
                  <span className="font-mono text-xs text-primary">{truncateAddress(creator)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}