import { useReadContract } from "wagmi"
import { BondingCurveLaunchABI } from "@/abis"
import { formatEther, parseEther } from "viem"

export function usePriceImpact(curveAddress?: string, amount?: string, type: "buy" | "sell" = "buy") {
  // Get current price
  const { data: currentPriceWei } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "getCurrentPrice",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 10000,
    },
  })

  // Clean the amount string by removing commas and ensuring it's a valid decimal
  const cleanAmount = amount ? amount.replace(/,/g, '') : undefined
  
  // Validate that the amount is a proper decimal number
  const isValidAmount = (amount: string): boolean => {
    try {
      const parsed = parseFloat(amount)
      return !isNaN(parsed) && parsed >= 0 && amount.match(/^\d*\.?\d*$/) !== null
    } catch {
      return false
    }
  }
  
  // Only proceed if amount is valid
  const amountToWei = cleanAmount && isValidAmount(cleanAmount) ? parseEther(cleanAmount) : null
  
  // Get price for the amount being traded
  const { data: tradePriceWei } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "getPriceForAmount",
    args: amountToWei ? [amountToWei] : undefined,
    query: {
      enabled: !!curveAddress && !!cleanAmount && isValidAmount(cleanAmount || ''),
      refetchInterval: 10000,
    },
  })

  // Get curve parameters for more accurate calculation
  const { data: p0 } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "p0",
    query: {
      enabled: !!curveAddress,
    },
  })

  const { data: k } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "k",
    query: {
      enabled: !!curveAddress,
    },
  })

  const { data: sold } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "sold",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 10000,
    },
  })

  const calculatePriceImpact = () => {
    if (!currentPriceWei || !tradePriceWei || !amount) return 0

    const currentPrice = Number(formatEther(currentPriceWei as bigint))
    const tradePrice = Number(formatEther(tradePriceWei as bigint))
    
    if (currentPrice <= 0) return 0

    if (type === "buy") {
      // For buying: price impact is the difference between current price and average price paid
      // The tradePrice represents the total cost for the amount, so we need to calculate average price
      const numAmount = Number.parseFloat(amount)
      const averagePrice = tradePrice / numAmount
      const priceImpact = ((averagePrice - currentPrice) / currentPrice) * 100
      return Math.max(0, priceImpact)
    } else {
      // For selling: price impact is based on how much the price will drop
      const numAmount = Number.parseFloat(amount)
      const averagePrice = tradePrice / numAmount
      const priceImpact = ((currentPrice - averagePrice) / currentPrice) * 100
      return Math.max(0, priceImpact)
    }
  }

  const priceImpact = calculatePriceImpact()

  return {
    priceImpact,
    currentPrice: currentPriceWei ? Number(formatEther(currentPriceWei as bigint)) : null,
    tradePrice: tradePriceWei ? Number(formatEther(tradePriceWei as bigint)) : null,
    isLoading: !currentPriceWei || !tradePriceWei,
  }
}
