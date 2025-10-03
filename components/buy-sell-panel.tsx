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
import { usePublicClient, useWriteContract, useBalance } from "wagmi"
import { parseEther, parseUnits, formatEther } from "viem"
import { BondingCurveLaunchABI } from "@/abis"
import { useQueryClient } from "@tanstack/react-query"
import { usePriceForAmount } from "@/src/hooks/usePriceForAmount"
import { usePriceImpact } from "@/src/hooks/usePriceImpact"
import { useTokensForBNB } from "@/src/hooks/useTokensForBNB"
import { useThresholdValidation, validatePurchaseAmount } from "@/src/hooks/useThresholdValidation"

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
  isOnPancakeSwap?: boolean
}

export function BuySellPanel({ tokenName, tokenTicker, currentPrice, isWalletConnected = false, curveAddress, tokenAddress, tokenDecimals, baseSymbol, priceInBase, isOnPancakeSwap = false }: BuySellPanelProps) {
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
  
  // Fetch token balance using the token address
  const { data: tokenBalance } = useBalance({
    address: address as `0x${string}`,
    token: tokenAddress as `0x${string}`,
    query: {
      enabled: !!address && !!tokenAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })
  
  const walletBalance = useMemo(() => ({
    bnb: walletBalanceFromCtx.bnb,
    token: tokenBalance ? parseFloat(tokenBalance.formatted).toFixed(6) : "0.000000",
  }), [walletBalanceFromCtx, tokenBalance])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const [currentTransaction, setCurrentTransaction] = useState<any>(null)

  const buyPresets = ["0.1", "0.5", "1"]

  // Threshold validation function
  const handleThresholdValidation = async (purchaseAmount: string) => {
    if (!effectiveCurveAddress || !publicClient) {
      setBuyError("Contract not available for validation")
      return
    }

    try {
      // Get current contract balance
      const currentBalanceWei = await publicClient.getBalance({
        address: effectiveCurveAddress as `0x${string}`
      })
      const currentBalanceBNB = Number(formatEther(currentBalanceWei))

      // Get threshold
      const thresholdWei = await publicClient.readContract({
        address: effectiveCurveAddress as `0x${string}`,
        abi: BondingCurveLaunchABI.abi,
        functionName: "lpThreshold",
      })
      const thresholdBNB = Number(formatEther(thresholdWei as bigint))

      // Get liquidity creation status
      const liquidityCreated = await publicClient.readContract({
        address: effectiveCurveAddress as `0x${string}`,
        abi: BondingCurveLaunchABI.abi,
        functionName: "liquidityCreated",
      })

      const purchaseAmountBNB = Number(purchaseAmount)
      
      const validation = validatePurchaseAmount(
        purchaseAmountBNB,
        currentBalanceBNB,
        thresholdBNB,
        liquidityCreated as boolean
      )

      if (!validation.isValid) {
        setBuyError(validation.errorMessage || "Purchase validation failed")
        return
      }

      // If validation passes, continue with transaction setup
      proceedWithTransaction(purchaseAmount)

    } catch (error) {
      console.error("Threshold validation error:", error)
      setBuyError("Failed to validate purchase against threshold")
    }
  }
  const sellPresets = [25, 50, 75, 100]

  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const queryClient = useQueryClient()

  const amountInputRef = useRef<HTMLInputElement>(null)

  // Fallback to test curve address if GraphQL doesn't provide it
  const effectiveCurveAddress = curveAddress || "0x8834f5fC7c4e97a88c2548E403e49312adE47b16"
  
  // Threshold validation hook
  const { threshold, isLoading: thresholdLoading } = useThresholdValidation(effectiveCurveAddress, buyAmount)
  
  // Get accurate price for the current buy amount
  const { priceInBNB: sellPriceInBNB } = usePriceForAmount(effectiveCurveAddress, sellAmount)
  
  // Get accurate tokens received for BNB amount when buying
  const { tokensReceived: tokensReceivedForBuy, feeAmount: buyFeeAmount } = useTokensForBNB(effectiveCurveAddress, buyAmount)
  
  // Get accurate price impact
  const { priceImpact: buyPriceImpact } = usePriceImpact(effectiveCurveAddress, buyAmount, "buy")
  const { priceImpact: sellPriceImpact } = usePriceImpact(effectiveCurveAddress, sellAmount, "sell")

  const calculateMinimumReceived = (amount: string, type: "buy" | "sell") => {
    if (!amount) return "0"
    const numAmount = Number.parseFloat(amount)
    
    if (type === "buy") {
      // For buying: amount is in BNB, calculate tokens received using bonding curve math
      if (!tokensReceivedForBuy || tokensReceivedForBuy <= 0) return "—"
      
      const minTokens = tokensReceivedForBuy * (1 - slippage / 100)
      return minTokens.toLocaleString(undefined, { maximumFractionDigits: 6 })
    } else {
      // For selling: amount is in tokens, calculate BNB received
      const totalValue = sellPriceInBNB
      if (!totalValue || totalValue <= 0) return "—"
      
      // totalValue is the total BNB value for the token amount
      const bnbReceived = totalValue
      const minBnb = bnbReceived * (1 - slippage / 100)
      return minBnb.toLocaleString(undefined, { maximumFractionDigits: 6 })
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

  const getPriceImpact = (type: "buy" | "sell") => {
    if (type === "buy") {
      return buyPriceImpact
    } else {
      return sellPriceImpact
    }
  }

  const proceedWithTransaction = (normalized: string) => {
    const transaction = {
      type: "buy" as const,
      tokenName,
      tokenTicker,
      amount: `${normalized} ${baseSymbol}`,
      price: currentPrice,
      slippage,
      estimatedGas: "—",
      minimumReceived: `${calculateMinimumReceived(normalized, "buy")} ${tokenTicker}`,
      priceImpact: getPriceImpact("buy"),
    }

    setCurrentTransaction(transaction)
    setShowConfirmation(true)
    setTransactionStatus(null)
  }

  const handleBuy = () => {
    if (isOnPancakeSwap) {
      toast.info("🎉 Trading Complete!", {
        description: `${tokenTicker} is now live on PancakeSwap! Continue trading on the DEX for the best liquidity and price discovery.`,
        duration: 5000,
      })
      return
    }
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
      setBuyError("Enter a valid amount greater than 0 with up to: 18 decimals")
      return
    }
    // Optional balance check
    const bal = Number(walletBalance.bnb || "0")
    if (Number(normalized) > bal) {
      setBuyError("Amount exceeds wallet balance")
      return
    }

    // Threshold validation
    handleThresholdValidation(normalized)
  }

  const handleSell = async () => {
    if (isOnPancakeSwap) {
      toast.info("🎉 Trading Complete!", {
        description: `${tokenTicker} is now live on PancakeSwap! Continue trading on the DEX for the best liquidity and price discovery.`,
        duration: 5000,
      })
      return
    }
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
      priceImpact: getPriceImpact("sell"),
    }

    setCurrentTransaction(transaction)
    setShowConfirmation(true)
    setTransactionStatus(null)
  }

  const confirmTransaction = async () => {
    if (!effectiveCurveAddress) {
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
        let allowance: bigint = BigInt(0)
        if (address) {
          try {
            allowance = await publicClient!.readContract({
              address: tokenAddress as `0x${string}`,
              abi: [
                { name: "allowance", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
              ] as const,
              functionName: "allowance",
              args: [address as `0x${string}`, effectiveCurveAddress as `0x${string}`],
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
            args: [effectiveCurveAddress as `0x${string}`, amountIn],
          })
        }

        const sellHash = await writeContractAsync({
          address: effectiveCurveAddress as `0x${string}`,
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
          // Invalidate all relevant queries to refresh UI data silently
          queryClient.invalidateQueries({ queryKey: ["tokenDetail"] })
          queryClient.invalidateQueries({ queryKey: ["tokenCandles"] })
          queryClient.invalidateQueries({ queryKey: ["currentPrice"] })
          queryClient.invalidateQueries({ queryKey: ["priceForAmount"] })
          queryClient.invalidateQueries({ queryKey: ["priceImpact"] })
          queryClient.invalidateQueries({ queryKey: ["tokensForLanding"] })
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
          address: effectiveCurveAddress as `0x${string}`,
          abi: BondingCurveLaunchABI.abi as any,
          functionName: "buy",
          args: [],
          value,
        })
        setTxHash(buyHash)
        setTransactionStatus("confirming")
        const receipt = await publicClient!.waitForTransactionReceipt({ hash: buyHash })
        if (receipt.status === "success") {
          setTransactionStatus("success")
          setBuyAmount("")
          // Invalidate all relevant queries to refresh UI data silently
          queryClient.invalidateQueries({ queryKey: ["tokenDetail"] })
          queryClient.invalidateQueries({ queryKey: ["tokenCandles"] })
          queryClient.invalidateQueries({ queryKey: ["currentPrice"] })
          queryClient.invalidateQueries({ queryKey: ["priceForAmount"] })
          queryClient.invalidateQueries({ queryKey: ["priceImpact"] })
          queryClient.invalidateQueries({ queryKey: ["tokensForLanding"] })
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
      let gasLimit = BigInt(250000)
      try {
        const est = await publicClient.estimateContractGas({
          address: effectiveCurveAddress as `0x${string}`,
          abi: BondingCurveLaunchABI.abi as any,
          functionName: "buy",
          args: [],
          value: BigInt(1), // minimal value just for estimation; may be ignored by contract
          account: address as `0x${string}`,
        })
        // add a little buffer
        gasLimit = est + BigInt(20000)
      } catch {}
      const bufferWei = gasPrice * gasLimit
      const maxWei = balWei > bufferWei ? balWei - bufferWei : BigInt(0)
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

                      {/* Threshold Information */}
                      {threshold > 0 && !thresholdLoading && (
                        <motion.div
                          className="rounded-lg bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-700 p-3 border-2"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-blue-900 dark:text-blue-100 font-semibold">
                              Liquidity Threshold
                            </span>
                          </div>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mt-2 font-medium">
                            Once {threshold.toFixed(4)} {baseSymbol} is raised, liquidity will be created on PancakeSwap and trading becomes unrestricted.
                          </p>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                              <span>Current Progress</span>
                              <span className="font-semibold">
                                {/* This will be populated with real balance data in the full implementation */}
                                0.0% Complete
                              </span>
                            </div>
                            <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-2">
                              <div 
                                className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: '0%' }} // This would be calculated from actual balance/threshold
                              ></div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                              <span>Threshold: {threshold.toFixed(4)} {baseSymbol}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

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
                        <motion.div 
                          className="text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-red-800 dark:text-red-200 font-medium">
                              {buyError}
                            </span>
                          </div>
                        </motion.div>
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
                        <span className="text-muted-foreground">Slippage tolerance:</span>
                        <span className="text-foreground">{slippage}%</span>
                      </div>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <motion.div variants={buttonGlow} initial="initial" whileHover="hover" whileTap="tap">
                        <Button
                          onClick={handleBuy}
                          disabled={!isOnPancakeSwap && (!buyAmount || !!buyError || !isWalletConnected || !isCorrectNetwork || !effectiveCurveAddress)}
                          className="w-full bg-green-500 hover:bg-green-600 text-white disabled:bg-muted disabled:text-muted-foreground"
                        >
                          {isOnPancakeSwap
                            ? "Trade on PancakeSwap"
                            : !isWalletConnected 
                            ? "Connect Wallet to Buy"
                            : !isCorrectNetwork 
                            ? "Wrong Network" 
                            : !effectiveCurveAddress
                            ? "Loading..."
                            : !buyAmount
                            ? "Enter Amount"
                            : !!buyError
                            ? "Fix Error"
                            : `Buy ${tokenTicker}`}
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
                        <span className="text-muted-foreground">Slippage tolerance:</span>
                        <span className="text-foreground">{slippage}%</span>
                      </div>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <motion.div variants={buttonGlow} initial="initial" whileHover="hover" whileTap="tap">
                        <Button
                          onClick={handleSell}
                          disabled={!isOnPancakeSwap && (!sellAmount || !!sellError || !isWalletConnected || !isCorrectNetwork || !effectiveCurveAddress)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white disabled:bg-muted disabled:text-muted-foreground"
                        >
                          {isOnPancakeSwap
                            ? "Trade on PancakeSwap"
                            : !isWalletConnected 
                            ? "Connect Wallet to Sell"
                            : !isCorrectNetwork 
                            ? "Wrong Network" 
                            : !effectiveCurveAddress
                            ? "Loading..."
                            : !sellAmount
                            ? "Enter Amount"
                            : !!sellError
                            ? "Fix Error"
                            : `Sell ${tokenTicker}`}
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
