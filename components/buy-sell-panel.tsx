"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SlippageSettings } from "@/components/slippage-settings"
import { TransactionConfirmation } from "@/components/transaction-confirmation"
import { ArrowUpDown, Wallet, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { slideUp, staggerContainer, staggerItem, buttonPress, buttonGlow, spinnerRotate } from "@/lib/animations"

interface BuySellPanelProps {
  tokenName: string
  tokenTicker: string
  currentPrice: string
  isWalletConnected?: boolean
}

export function BuySellPanel({ tokenName, tokenTicker, currentPrice, isWalletConnected = false }: BuySellPanelProps) {
  const [buyAmount, setBuyAmount] = useState("")
  const [sellAmount, setSellAmount] = useState("")
  const [slippage, setSlippage] = useState(0.5)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"pending" | "confirming" | "success" | "error" | null>(
    null,
  )
  const [txHash, setTxHash] = useState<string>()
  const [walletBalance] = useState({
    bnb: "2.45",
    token: "1,250.00",
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const [currentTransaction, setCurrentTransaction] = useState<any>(null)

  const buyPresets = ["0.1", "0.5", "1"]
  const sellPresets = [25, 50, 75, 100]

  const calculateMinimumReceived = (amount: string, type: "buy" | "sell") => {
    if (!amount) return "0"
    const numAmount = Number.parseFloat(amount)
    const price = 0.0045 // Current price

    if (type === "buy") {
      const tokens = numAmount / price
      const minTokens = tokens * (1 - slippage / 100)
      return minTokens.toFixed(0)
    } else {
      const bnb = numAmount * price
      const minBnb = bnb * (1 - slippage / 100)
      return minBnb.toFixed(4)
    }
  }

  const calculatePriceImpact = (amount: string) => {
    if (!amount) return 0
    const numAmount = Number.parseFloat(amount)
    // Simulate price impact based on trade size
    return Math.min(numAmount * 0.1, 15) // Max 15% impact
  }

  const handleBuy = () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first")
      return
    }

    const transaction = {
      type: "buy" as const,
      tokenName,
      tokenTicker,
      amount: `${buyAmount} BNB`,
      price: currentPrice,
      slippage,
      estimatedGas: "0.002 BNB",
      minimumReceived: `${calculateMinimumReceived(buyAmount, "buy")} ${tokenTicker}`,
      priceImpact: calculatePriceImpact(buyAmount),
    }

    setCurrentTransaction(transaction)
    setShowConfirmation(true)
    setTransactionStatus(null)
  }

  const handleSell = () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first")
      return
    }

    const transaction = {
      type: "sell" as const,
      tokenName,
      tokenTicker,
      amount: `${sellAmount} ${tokenTicker}`,
      price: currentPrice,
      slippage,
      estimatedGas: "0.002 BNB",
      minimumReceived: `${calculateMinimumReceived(sellAmount, "sell")} BNB`,
      priceImpact: calculatePriceImpact(sellAmount),
    }

    setCurrentTransaction(transaction)
    setShowConfirmation(true)
    setTransactionStatus(null)
  }

  const confirmTransaction = async () => {
    setTransactionStatus("pending")

    // Simulate transaction processing
    setTimeout(() => {
      setTransactionStatus("confirming")
      setTxHash("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")

      setTimeout(() => {
        setTransactionStatus("success")
        // Reset form
        if (currentTransaction.type === "buy") {
          setBuyAmount("")
        } else {
          setSellAmount("")
        }
      }, 3000)
    }, 2000)
  }

  const cancelTransaction = () => {
    setShowConfirmation(false)
    setTransactionStatus(null)
    setTxHash(undefined)
    setCurrentTransaction(null)
  }

  const setMaxAmount = (type: "buy" | "sell") => {
    if (type === "buy") {
      setBuyAmount(walletBalance.bnb)
    } else {
      setSellAmount(walletBalance.token)
    }
  }

  const handleBuyPreset = (amount: string) => {
    setBuyAmount(amount)
    setActivePreset(amount)
    setTimeout(() => setActivePreset(null), 200)
  }

  const handleSellPreset = (percentage: number) => {
    const tokenBalance = Number.parseFloat(walletBalance.token.replace(/,/g, ""))
    const amount = ((tokenBalance * percentage) / 100).toString()
    setSellAmount(amount)
    setActivePreset(percentage.toString())
    setTimeout(() => setActivePreset(null), 200)
  }

  const handleRefreshPrice = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <>
      <motion.div initial="hidden" animate="visible" variants={slideUp} transition={{ duration: 0.4 }}>
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <ArrowUpDown className="h-5 w-5 text-primary" />
                </motion.div>
                <span>Trade {tokenTicker}</span>
              </CardTitle>
              <SlippageSettings slippage={slippage} onSlippageChange={setSlippage} />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger
                    value="buy"
                    className="data-[state=active]:bg-green-500 data-[state=active]:text-white w-full"
                  >
                    Buy
                  </TabsTrigger>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger
                    value="sell"
                    className="data-[state=active]:bg-red-500 data-[state=active]:text-white w-full"
                  >
                    Sell
                  </TabsTrigger>
                </motion.div>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="buy" className="space-y-4">
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                    <motion.div className="space-y-2" variants={staggerItem}>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="buy-amount">Amount (BNB)</Label>
                        <motion.div variants={buttonPress} whileHover="hover" whileTap="tap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMaxAmount("buy")}
                            className="h-auto p-1 text-xs text-primary hover:text-primary/80"
                          >
                            MAX
                          </Button>
                        </motion.div>
                      </div>
                      <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <Input
                          id="buy-amount"
                          type="number"
                          step="0.01"
                          placeholder="0.1"
                          value={buyAmount}
                          onChange={(e) => setBuyAmount(e.target.value)}
                        />
                      </motion.div>

                      <motion.div
                        className="flex space-x-2"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {buyPresets.map((preset, index) => (
                          <motion.div key={preset} variants={staggerItem} transition={{ delay: index * 0.1 }}>
                            <motion.div
                              variants={buttonPress}
                              whileHover="hover"
                              whileTap="tap"
                              animate={activePreset === preset ? { scale: [1, 1.1, 1] } : {}}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBuyPreset(preset)}
                                className="flex-1 text-xs border-border hover:bg-primary/10 hover:border-primary/20"
                              >
                                {preset} BNB
                              </Button>
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.div
                        className="flex justify-between text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span>Balance: {walletBalance.bnb} BNB</span>
                        <motion.span
                          key={buyAmount}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          ≈ {buyAmount ? calculateMinimumReceived(buyAmount, "buy") : "0"} {tokenTicker}
                        </motion.span>
                      </motion.div>
                    </motion.div>

                    <motion.div className="space-y-2" variants={staggerItem}>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price per token:</span>
                        <span className="text-foreground">{currentPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Slippage tolerance:</span>
                        <span className="text-foreground">{slippage}%</span>
                      </div>
                      <AnimatePresence>
                        {buyAmount && (
                          <motion.div
                            className="flex justify-between text-sm"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-muted-foreground">Price impact:</span>
                            <motion.span
                              className={`${
                                calculatePriceImpact(buyAmount) > 5
                                  ? "text-red-400"
                                  : calculatePriceImpact(buyAmount) > 2
                                    ? "text-yellow-400"
                                    : "text-green-400"
                              }`}
                              animate={{
                                scale: calculatePriceImpact(buyAmount) > 5 ? [1, 1.1, 1] : 1,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              {calculatePriceImpact(buyAmount).toFixed(2)}%
                            </motion.span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <motion.div variants={buttonGlow} initial="initial" whileHover="hover" whileTap="tap">
                        <Button
                          onClick={handleBuy}
                          disabled={!buyAmount || !isWalletConnected}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          {isWalletConnected ? `Buy ${tokenTicker}` : "Connect Wallet to Buy"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="sell" className="space-y-4">
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                    <motion.div className="space-y-2" variants={staggerItem}>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sell-amount">Amount ({tokenTicker})</Label>
                        <motion.div variants={buttonPress} whileHover="hover" whileTap="tap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMaxAmount("sell")}
                            className="h-auto p-1 text-xs text-primary hover:text-primary/80"
                          >
                            MAX
                          </Button>
                        </motion.div>
                      </div>
                      <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <Input
                          id="sell-amount"
                          type="number"
                          step="1"
                          placeholder="100"
                          value={sellAmount}
                          onChange={(e) => setSellAmount(e.target.value)}
                        />
                      </motion.div>

                      <motion.div
                        className="flex space-x-2"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {sellPresets.map((preset, index) => (
                          <motion.div key={preset} variants={staggerItem} transition={{ delay: index * 0.1 }}>
                            <motion.div
                              variants={buttonPress}
                              whileHover="hover"
                              whileTap="tap"
                              animate={activePreset === preset.toString() ? { scale: [1, 1.1, 1] } : {}}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSellPreset(preset)}
                                className="flex-1 text-xs border-border hover:bg-primary/10 hover:border-primary/20"
                              >
                                {preset}%
                              </Button>
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.div
                        className="flex justify-between text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span>
                          Balance: {walletBalance.token} {tokenTicker}
                        </span>
                        <motion.span
                          key={sellAmount}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          ≈ {sellAmount ? calculateMinimumReceived(sellAmount, "sell") : "0"} BNB
                        </motion.span>
                      </motion.div>
                    </motion.div>

                    <motion.div className="space-y-2" variants={staggerItem}>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price per token:</span>
                        <span className="text-foreground">{currentPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Slippage tolerance:</span>
                        <span className="text-foreground">{slippage}%</span>
                      </div>
                      <AnimatePresence>
                        {sellAmount && (
                          <motion.div
                            className="flex justify-between text-sm"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-muted-foreground">Price impact:</span>
                            <motion.span
                              className={`${
                                calculatePriceImpact(sellAmount) > 5
                                  ? "text-red-400"
                                  : calculatePriceImpact(sellAmount) > 2
                                    ? "text-yellow-400"
                                    : "text-green-400"
                              }`}
                              animate={{
                                scale: calculatePriceImpact(sellAmount) > 5 ? [1, 1.1, 1] : 1,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              {calculatePriceImpact(sellAmount).toFixed(2)}%
                            </motion.span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <motion.div variants={buttonGlow} initial="initial" whileHover="hover" whileTap="tap">
                        <Button
                          onClick={handleSell}
                          disabled={!sellAmount || !isWalletConnected}
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          {isWalletConnected ? `Sell ${tokenTicker}` : "Connect Wallet to Sell"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>

            <motion.div
              className="mt-4 p-3 bg-card rounded-lg border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={
                    isWalletConnected
                      ? {
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Wallet className="h-4 w-4 text-primary" />
                </motion.div>
                <span className="text-sm text-muted-foreground">
                  {isWalletConnected ? "Wallet Connected" : "Connect wallet to start trading"}
                </span>
              </div>
            </motion.div>

            <motion.div
              className="mt-2 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div variants={buttonPress} whileHover="hover" whileTap="tap">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleRefreshPrice}
                  disabled={isRefreshing}
                >
                  <motion.div animate={isRefreshing ? "animate" : ""} variants={spinnerRotate}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                  </motion.div>
                  Refresh Price
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {currentTransaction && (
        <TransactionConfirmation
          transaction={currentTransaction}
          isOpen={showConfirmation}
          onConfirm={confirmTransaction}
          onCancel={cancelTransaction}
          status={transactionStatus}
          txHash={txHash}
        />
      )}
    </>
  )
}
