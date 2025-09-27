"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Crown, Trophy, Medal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { slideUp, staggerContainer, staggerItem, cardHover, buttonPress } from "@/lib/animations"

const sampleHolders = [
  {
    rank: 1,
    address: "0x1234567890abcdef1234567890abcdef12345678",
    balance: "45,000,000",
    percentage: 4.5,
    isCreator: true,
  },
  {
    rank: 2,
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    balance: "32,500,000",
    percentage: 3.25,
    isWhale: true,
  },
  {
    rank: 3,
    address: "0x9876543210fedcba9876543210fedcba98765432",
    balance: "28,750,000",
    percentage: 2.88,
    isWhale: true,
  },
  { rank: 4, address: "0x5555666677778888999900001111222233334444", balance: "22,100,000", percentage: 2.21 },
  { rank: 5, address: "0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff", balance: "19,800,000", percentage: 1.98 },
  { rank: 6, address: "0x1111222233334444555566667777888899990000", balance: "18,500,000", percentage: 1.85 },
  { rank: 7, address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef", balance: "16,750,000", percentage: 1.68 },
  { rank: 8, address: "0xcafebabecafebabecafebabecafebabecafebabe", balance: "15,200,000", percentage: 1.52 },
  { rank: 9, address: "0x0123456789abcdef0123456789abcdef01234567", balance: "14,100,000", percentage: 1.41 },
  { rank: 10, address: "0xfedcba9876543210fedcba9876543210fedcba98", balance: "13,500,000", percentage: 1.35 },
  { rank: 11, address: "0x2468ace02468ace02468ace02468ace02468ace0", balance: "12,800,000", percentage: 1.28 },
  { rank: 12, address: "0x1357bdf91357bdf91357bdf91357bdf91357bdf9", balance: "11,900,000", percentage: 1.19 },
  { rank: 13, address: "0x8888999900001111222233334444555566667777", balance: "11,200,000", percentage: 1.12 },
  { rank: 14, address: "0x7777666655554444333322221111000099998888", balance: "10,500,000", percentage: 1.05 },
  { rank: 15, address: "0x6666555544443333222211110000999988887777", balance: "9,800,000", percentage: 0.98 },
  { rank: 16, address: "0x5555444433332222111100009999888877776666", balance: "9,200,000", percentage: 0.92 },
  { rank: 17, address: "0x4444333322221111000099998888777766665555", balance: "8,750,000", percentage: 0.88 },
  { rank: 18, address: "0x3333222211110000999988887777666655554444", balance: "8,100,000", percentage: 0.81 },
  { rank: 19, address: "0x2222111100009999888877776666555544443333", balance: "7,650,000", percentage: 0.77 },
  { rank: 20, address: "0x1111000099998888777766665555444433332222", balance: "7,200,000", percentage: 0.72 },
  { rank: 21, address: "0x0000999988887777666655554444333322221111", balance: "6,800,000", percentage: 0.68 },
  { rank: 22, address: "0x9999888877776666555544443333222211110000", balance: "6,400,000", percentage: 0.64 },
  { rank: 23, address: "0x8888777766665555444433332222111100009999", balance: "6,000,000", percentage: 0.6 },
  { rank: 24, address: "0x7777666655554444333322221111000099998888", balance: "5,650,000", percentage: 0.57 },
  { rank: 25, address: "0x6666555544443333222211110000999988887777", balance: "5,300,000", percentage: 0.53 },
  { rank: 26, address: "0x5555444433332222111100009999888877776666", balance: "5,000,000", percentage: 0.5 },
  { rank: 27, address: "0x4444333322221111000099998888777766665555", balance: "4,750,000", percentage: 0.48 },
  { rank: 28, address: "0x3333222211110000999988887777666655554444", balance: "4,500,000", percentage: 0.45 },
  { rank: 29, address: "0x2222111100009999888877776666555544443333", balance: "4,250,000", percentage: 0.43 },
  { rank: 30, address: "0x1111000099998888777766665555444433332222", balance: "4,000,000", percentage: 0.4 },
]

interface HoldersTableProps {
  tokenTicker: string
}

export function HoldersTable({ tokenTicker }: HoldersTableProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />
    if (rank === 2) return <Trophy className="h-4 w-4 text-gray-400" />
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
  }

  const formatBalance = (balance: string) => {
    return Number(balance.replace(/,/g, "")).toLocaleString()
  }

  return (
    <motion.div variants={cardHover} initial="initial" whileHover="hover" transition={{ duration: 0.2 }}>
      <Card className="border-border">
        <motion.div variants={slideUp} initial="hidden" animate="visible">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Top Holders</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              >
                <Badge variant="secondary" className="text-xs">
                  Top 30
                </Badge>
              </motion.div>
            </CardTitle>
          </CardHeader>
        </motion.div>

        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px] space-y-2">
              {/* Header */}
              <motion.div
                className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                <div className="col-span-1">Rank</div>
                <div className="col-span-6">Wallet Address</div>
                <div className="col-span-3 text-right">Balance</div>
                <div className="col-span-2 text-right">Share</div>
              </motion.div>

              {/* Holders List */}
              <motion.div
                className="space-y-1 max-h-96 overflow-y-auto"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {sampleHolders.map((holder, index) => (
                    <motion.div
                      key={holder.rank}
                      className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-card/50 transition-colors group"
                      variants={staggerItem}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.02 }}
                      whileHover={{
                        backgroundColor: "rgba(var(--card), 0.8)",
                        scale: 1.01,
                        transition: { duration: 0.2 },
                      }}
                    >
                      {/* Rank */}
                      <div className="col-span-1 flex items-center">
                        <motion.div whileHover={{ scale: 1.2, rotate: 5 }} transition={{ duration: 0.2 }}>
                          {getRankIcon(holder.rank)}
                        </motion.div>
                      </div>

                      {/* Address */}
                      <div className="col-span-6 flex items-center space-x-2 min-w-0">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="font-mono text-sm text-foreground truncate">
                            {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                          </span>
                          <motion.div variants={buttonPress} whileHover="hover" whileTap="tap">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => copyToClipboard(holder.address)}
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        </div>
                        <div className="flex space-x-1 flex-shrink-0">
                          {holder.isCreator && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3 + index * 0.02, type: "spring" }}
                            >
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0 bg-primary/10 text-primary border-primary/20"
                              >
                                Creator
                              </Badge>
                            </motion.div>
                          )}
                          {holder.isWhale && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.4 + index * 0.02, type: "spring" }}
                            >
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0 bg-blue-500/10 text-blue-400 border-blue-500/20"
                              >
                                Whale
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Balance */}
                      <div className="col-span-3 text-right">
                        <span className="text-sm font-medium text-foreground">{formatBalance(holder.balance)}</span>
                        <div className="text-xs text-muted-foreground">{tokenTicker}</div>
                      </div>

                      {/* Percentage */}
                      <div className="col-span-2 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-sm font-medium text-foreground">{holder.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1 mt-1">
                          <motion.div
                            className="bg-gradient-to-r from-primary to-secondary h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(holder.percentage * 10, 100)}%` }}
                            transition={{ delay: 0.5 + index * 0.02, duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Summary */}
              <motion.div
                className="mt-4 p-3 bg-card/50 rounded-lg border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Top 30 holders control:</span>
                  <motion.span
                    className="font-medium text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    {sampleHolders.reduce((sum, holder) => sum + holder.percentage, 0).toFixed(2)}% of supply
                  </motion.span>
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
