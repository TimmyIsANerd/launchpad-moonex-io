export interface TradeItem {
  id: string
  wallet: string
  action: "buy" | "sell"
  amount: string
  tokenAmount: string
  timestamp: string
}
