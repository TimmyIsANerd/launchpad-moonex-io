import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TokenCardProps {
  rank: number
  name: string
  ticker: string
  price: string
  change: number
  marketCap: string
  creator: string
  onPancakeSwap: boolean
}

export function TokenCard({ rank, name, ticker, price, change, marketCap, creator, onPancakeSwap }: TokenCardProps) {
  return (
    <Card className="hover-glow-cyan transition-all duration-300 hover:scale-105 bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
              {rank}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{ticker}</p>
            </div>
          </div>
          {onPancakeSwap && <Badge className="bg-secondary text-secondary-foreground">PancakeSwap</Badge>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-medium text-foreground">{price}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">24h Change</span>
            <span className={`font-medium ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Market Cap</span>
            <span className="font-medium text-foreground">{marketCap}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Creator</span>
            <span className="font-mono text-xs text-primary">{creator}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
