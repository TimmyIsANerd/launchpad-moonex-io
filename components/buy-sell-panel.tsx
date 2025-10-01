"use client"

import { useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SlippageSettings } from "@/components/slippage-settings"
import { TransactionConfirmation } from "@/components/transaction-confirmation"
import { ArrowUpDown, Wallet, RefreshCw, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { slideUp, staggerContainer, staggerItem, buttonPress, buttonGlow, spinnerRotate } from "@/lib/animations"
import { toast } from "sonner"
import { useWallet } from "@/components/wallet-provider"
import { usePublicClient, useWriteContract } from "wagmi"
import { parseEther, parseUnits, formatEther } from "viem"
import { BondingCurveLaunchABI } from "@/abis"
import { useQueryClient } from "@tanstack/react-query"

interface BuySellPanelProps {
  tokenName: string
  tokenTicker: string
  currentPrice: string
  isWalletConnected?: boolean
  curveAddress?: string
  tokenAddress: string
  tokenDecimals: number
  baseSymbol: string
  priceInBase?: number | null
}

export function BuySellPanel({ tokenName, tokenTicker, currentPrice, isWalletConnected = false, curveAddress, tokenAddress, tokenDecimals, baseSymbol, priceInBase }: BuySellPanelProps) {
  const [buyAmount, setBuyAmount] = useState("")
  const [buyError, setBuyError] = useState<string | null>(null)
  const [sellAmount, setSellAmount] = useState("")
  const [sellError, setSellError] = useState<string | null>(null)
  const [slippage, setSlippage] = useState(0.5)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"pending" | "confirming" | "success" | "error" | null>(
    null,
  )
  const [txHash, setTxHash] = useState<string | undefined>()
  const { balance: walletBalanceFromCtx, isCorrectNetwork, switchNetwork, address } = useWallet()
  const walletBalance = useMemo(() => ({
    bnb: walletBalanceFromCtx.bnb,
    token: "1,250.00",
  }), [walletBalanceFromCtx])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const [currentTransaction, setCurrentTransaction] = useState<any>(null)

  const buyPresets = ["0.1", "0.5", "1"]
  const sellPresets = [25, 50, 75, 100]

  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const queryClient = useQueryClient()

  const amountInputRef = useRef<HTMLInputElement>(null)

  const calculateMinimumReceived = (amount: string, type: "buy" | "sell") => {
    if (!amount) return "0"
    const numAmount = Number.parseFloat(amount)
    const p = priceInBase != null && Number.isFinite(priceInBase) ? Number(priceInBase) : undefined
    if (!p || p <= 0) return "—" // no estimate available

    if (type === "buy") {
      const tokens = numAmount / p
      const minTokens = tokens * (1 - slippage / 100)
      return minTokens.toFixed(6)
    } else {
      const baseOut = numAmount * p
      const minBase = baseOut * (1 - slippage / 100)
      return minBase.toFixed(6)
    }
  }

  // Normalize and validate decimal input (up to 18 decimals)
  const normalizeAmount = (raw: string) => raw.replace(",", ".").replace(/[^0-9.]/g, "")
  const countDecimals = (s: string) => (s.split(".")[1]?.length ?? 0)
  const isValidDecimal = (s: string) => {
    if (!s) return false
    if (!/^\d*(?:\.\d*)?$/.test(s)) return false
    const asNum = Number(s)
    if (!Number.isFinite(asNum) || asNum <= 0) return false
    if (countDecimals(s) > 18) return false
    return true
  }
  const parseAmountToWei = (s: string) => {
    try {
      return parseEther(s)
    } catch {
      return null
    }
  }

  // Format on-chain wei price to human-readable BNB
  const formatPricePerToken = (price: string) => {
    try {
      // Remove unit and common formatting
      const cleaned = price
        .replace(/BNB/i, "")
        .replace(/[,\s]/g, "")
        .trim()

      // If empty after cleaning, fallback
      if (!cleaned) return price

      // If it's a pure integer (no dot, no exp), assume wei
      if (/^\d+$/.test(cleaned)) {
        const eth = formatEther(BigInt(cleaned))
        const num = Number(eth)
        if (Number.isFinite(num)) return `${num.toLocaleString(undefined, { maximumFractionDigits: 6 })} BNB`
        return `${eth} BNB`
      }

      // Handle scientific notation or decimal numbers as already in base units
      const num = Number(cleaned)
      if (Number.isFinite(num)) return `${num.toLocaleString(undefined, { maximumFractionDigits: 6 })} BNB`

      // Fallback to original
      return price
    } catch {
      return price
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
      toast.error("Please connect your wallet first")
      return
    }
    if (!isCorrectNetwork) {
      toast.error("Wrong network. Please switch to the target network.")
      return
    }
    const normalized = normalizeAmount(buyAmount)
    if (!isValidDecimal(normalized)) {
      setBuyError("Enter a valid amount greater than 0 with up to 18 decimals")
      return
    }
    // Optional balance check
    const bal = Number(walletBalance.bnb || "0")
    if (Number(normalized) > bal) {
      setBuyError("Amount exceeds wallet balance")
      return
    }

    const transaction = {
      type: "buy" as const,
      tokenName,
      tokenTicker,
      amount: `${normalized} ${baseSymbol}`,
      price: currentPrice,
      slippage,
      estimatedGas: "—",
      minimumReceived: `${calculateMinimumReceived(normalized, "buy")} ${tokenTicker}`,
      priceImpact: calculatePriceImpact(normalized),
    }

    setCurrentTransaction(transaction)
    setShowConfirmation(true)
    setTransactionStatus(null)
  }

  const handleSell = async () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet first")
      return
    }
    if (!isCorrectNetwork) {
      toast.error("Wrong network. Please switch to the target network.")
      return
    }

    const normalized = normalizeAmount(sellAmount)
    const isValid = (() => {
      if (!normalized) return false
      if (!/^\d*(?:\.\d*)?$/.test(normalized)) return false
      const asNum = Number(normalized)
      if (!Number.isFinite(asNum) || asNum <= 0) return false
      const decs = (normalized.split(".")[1]?.length ?? 0)
      return decs <= tokenDecimals
    })()

    if (!isValid) {
      setSellError(`Enter a valid amount up to ${tokenDecimals} decimals`)
      return
    }

    // Optional: check wallet token balance
    try {
      if (address) {
        const bal: bigint = await publicClient!.readContract({
          address: tokenAddress as `0x${string}`,
          abi: [
            { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
          ] as const,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        })
        const want = parseUnits(normalized, tokenDecimals)
        if (bal < want) {
          setSellError("Amount exceeds wallet token balance")
          return
        }
      }
    } catch (e) {
      // if balance check fails, continue without blocking
    }

    const transaction = {
      type: "sell" as const,
      tokenName,
      tokenTicker,
      amount: `${normalized} ${tokenTicker}`,
      price: currentPrice,
      slippage,
      estimatedGas: "—",
      minimumReceived: `${calculateMinimumReceived(normalized, "sell")} ${baseSymbol}`,
      priceImpact: 0,
    }

    setCurrentTransaction(transaction)
    setShowConfirmation(true)
    setTransactionStatus(null)
  }

  const confirmTransaction = async () => {
    if (!curveAddress) {
      toast.error("Bonding curve address not available")
      return
    }

    try {
      setTransactionStatus("pending")

      if (currentTransaction?.type === "sell") {
        // SELL: ensure allowance, then call sell(amount)
        const normalized = normalizeAmount(sellAmount)
        const amountIn = parseUnits(normalized, tokenDecimals)

        // Check allowance
        let allowance: bigint = 0n
        if (address) {
          try {
            allowance = await publicClient!.readContract({
              address: tokenAddress as `0x${string}`,
              abi: [
                { name: "allowance", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
              ] as const,
              functionName: "allowance",
              args: [address as `0x${string}`, curveAddress as `0x${string}`],
            })
          } catch {}
        }

        if (allowance < amountIn) {
          // Approve max needed
          await writeContractAsync({
            address: tokenAddress as `0x${string}`,
            abi: [
              { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
            ] as const,
            functionName: "approve",
            args: [curveAddress as `0x${string}`, amountIn],
          })
        }

        const sellHash = await writeContractAsync({
          address: curveAddress as `0x${string}`,
          abi: BondingCurveLaunchABI.abi as any,
          functionName: "sell",
          args: [amountIn],
        })
        setTxHash(sellHash)
        setTransactionStatus("confirming")
        const receipt = await publicClient!.waitForTransactionReceipt({ hash: sellHash })
        if (receipt.status === "success") {
          setTransactionStatus("success")
          setSellAmount("")
          queryClient.invalidateQueries({ queryKey: ["tokenDetail"] })
          queryClient.invalidateQueries({ queryKey: ["tokenCandles"] })
          toast.success("Sell transaction confirmed")
        } else {
          setTransactionStatus("error")
          toast.error("Transaction failed")
        }
      } else {
        // BUY flow
        const normalized = normalizeAmount(buyAmount)
        const value = parseAmountToWei(normalized)
        if (!value) {
          toast.error("Invalid amount")
          setTransactionStatus(null)
          return
        }
        const buyHash = await writeContractAsync({
          address: curveAddress as `0x${string}`,
          abi: BondingCurveLaunchABI.abi as any,
          functionName: "buy",
          value,
        })
        setTxHash(buyHash)
        setTransactionStatus("confirming")
        const receipt = await publicClient!.waitForTransactionReceipt({ hash: buyHash })
        if (receipt.status === "success") {
          setTransactionStatus("success")
          setBuyAmount("")
          queryClient.invalidateQueries({ queryKey: ["tokenDetail"] })
          queryClient.invalidateQueries({ queryKey: ["tokenCandles"] })
          toast.success("Buy transaction confirmed")
        } else {
          setTransactionStatus("error")
          toast.error("Transaction failed")
        }
      }
    } catch (err: any) {
      setTransactionStatus("error")
      const msg = err?.shortMessage || err?.message || "Failed to submit transaction"
      toast.error(msg)
    }
  }

  const cancelTransaction = () => {
    setShowConfirmation(false)
    setTransactionStatus(null)
    setTxHash(undefined)
    setCurrentTransaction(null)
  }

  // Compute a dynamic MAX amount for buy, leaving estimated gas buffer
  const handleMaxBuy = async () => {
    try {
      if (!address || !publicClient) return
      const [balWei, gasPrice] = await Promise.all([
        publicClient.getBalance({ address: address as `0x${string}` }),
        publicClient.getGasPrice(),
      ])
      // Try to estimate gas for buy with tiny value; fallback to 250k if estimation fails
      let gasLimit = 250000n
      try {
        const est = await publicClient.estimateContractGas({
          address: curveAddress as `0x${string}`,
          abi: BondingCurveLaunchABI.abi as any,
          functionName: "buy",
          value: 1n, // minimal value just for estimation; may be ignored by contract
          account: address as `0x${string}`,
        })
        // add a little buffer
        gasLimit = est + 20000n
      } catch {}
      const bufferWei = gasPrice * gasLimit
      const maxWei = balWei > bufferWei ? balWei - bufferWei : 0n
      const max = Number(formatEther(maxWei))
      const clamped = max > 0 ? max.toFixed(6) : "0"
      setBuyAmount(clamped)
      setBuyError(null)
    } catch {
      // Fallback to previous simple logic with a small buffer
      const bal = Number(walletBalance.bnb || "0")
      const safe = bal > 0.0002 ? (bal - 0.0002).toFixed(6) : "0"
      setBuyAmount(safe)
      setBuyError(null)
    }
  }

  const setMaxAmount = (type: "buy" | "sell") => {
    if (type === "buy") {
      // keep a small buffer for gas
      const bal = Number(walletBalance.bnb || "0")
      const safe = bal > 0.001 ? (bal - 0.001).toFixed(6) : "0"
      setBuyAmount(safe)
      setBuyError(null)
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
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full"
                  >
                    Buy
                  </TabsTrigger>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger
                    value="sell"
                    className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground w-full"
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
                        <Label htmlFor="buy-amount">Amount ({baseSymbol})</Label>
                        <motion.div variants={buttonPress} whileHover="hover" whileTap="tap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await handleMaxBuy()
                            }}
                            className="h-auto p-1 text-xs text-primary hover:text-primary/80"
                          >
                            MAX
                          </Button>
                        </motion.div>
                      </div>
                      <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <Input
                          id="buy-amount"
                          ref={amountInputRef}
                          type="text"
                          inputMode="decimal"
                          step="any"
                          placeholder="0.1"
                          value={buyAmount}
                          onWheel={(e) => {
                            // prevent scroll changes
                            (e.target as HTMLInputElement).blur()
                          }}
                          onChange={(e) => {
                            const v = normalizeAmount(e.target.value)
                            setBuyAmount(v)
                            if (!v) return setBuyError(null)
                            if (!isValidDecimal(v)) setBuyError("Invalid amount")
                            else if (Number(v) <= 0) setBuyError("Amount must be greater than 0")
                            else if (Number(v) > Number(walletBalance.bnb || "0")) setBuyError("Exceeds balance")
                            else setBuyError(null)
                          }}
                          aria-invalid={!!buyError}
                        />
                      </motion.div>

                      <motion.div
                        className="grid grid-cols-3 gap-2"
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
                                variant="default"
                                size="sm"
                                onClick={() => handleBuyPreset(preset)}
                                className="w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                {preset} {baseSymbol}
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
                        <span>Balance: {walletBalance.bnb} {baseSymbol}</span>
                        <motion.span
                          key={buyAmount}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          ≈ {buyAmount ? calculateMinimumReceived(buyAmount, "buy") : "—"} {tokenTicker}
                        </motion.span>
                      </motion.div>
                      {buyError && (
                        <div className="text-xs text-red-400 mt-1">{buyError}</div>
                      )}
                      {!isCorrectNetwork && isWalletConnected && (
                        <div className="mt-2 flex items-center justify-between rounded-md border border-yellow-500/30 bg-yellow-500/10 p-2">
                          <div className="flex items-center gap-2 text-xs text-yellow-300">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Wrong network. Switch to the target network to trade.
                          </div>
                          <Button size="sm" variant="outline" className="border-border" onClick={switchNetwork}>
                            Switch
                          </Button>
                        </div>
                      )}
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
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <motion.div variants={buttonGlow} initial="initial" whileHover="hover" whileTap="tap">
                        <Button
                          onClick={handleBuy}
                          disabled={!buyAmount || !!buyError || !isWalletConnected || !isCorrectNetwork || !curveAddress}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          {isWalletConnected ? (isCorrectNetwork ? `Buy ${tokenTicker}` : "Wrong Network") : "Connect Wallet to Buy"}
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
                          type="text"
                          inputMode="decimal"
                          step="any"
                          placeholder="100"
                          value={sellAmount}
                          onChange={(e) => {
                            const v = normalizeAmount(e.target.value)
                            setSellAmount(v)
                            if (!v) return setSellError(null)
                            const decs = (v.split(".")[1]?.length ?? 0)
                            if (!/^\d*(?:\.\d*)?$/.test(v)) setSellError("Invalid amount")
                            else if (Number(v) <= 0) setSellError("Amount must be greater than 0")
                            else if (decs > tokenDecimals) setSellError(`Max ${tokenDecimals} decimals`)
                            else setSellError(null)
                          }}
                          aria-invalid={!!sellError}
                        />
                      </motion.div>

                      <motion.div
                        className="grid grid-cols-4 gap-2"
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
                                variant="default"
                                size="sm"
                                onClick={() => handleSellPreset(preset)}
                                className="w-full text-xs bg-accent hover:bg-accent/90 text-accent-foreground"
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
                          ≈ {sellAmount ? calculateMinimumReceived(sellAmount, "sell") : "—"} {baseSymbol}
                        </motion.span>
                      </motion.div>
                    </motion.div>

                    <motion.div className="space-y-2" variants={staggerItem}>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price per token:</span>
                        <span className="text-foreground">{formatPricePerToken(currentPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Slippage tolerance:</span>
                        <span className="text-foreground">{slippage}%</span>
                      </div>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <motion.div variants={buttonGlow} initial="initial" whileHover="hover" whileTap="tap">
                        <Button
                          onClick={handleSell}
                          disabled={!sellAmount || !!sellError || !isWalletConnected || !isCorrectNetwork || !curveAddress}
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          {isWalletConnected ? (isCorrectNetwork ? `Sell ${tokenTicker}` : "Wrong Network") : "Connect Wallet to Sell"}
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
