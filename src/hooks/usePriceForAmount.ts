import { useReadContract } from "wagmi"
import { BondingCurveLaunchABI } from "@/abis"
import { formatEther, parseEther } from "viem"

export function usePriceForAmount(curveAddress?: string, amount?: string) {
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
  
  const { data: priceWei, isLoading, error } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "getPriceForAmount",
    args: amountToWei ? [amountToWei] : undefined,
    query: {
      enabled: !!curveAddress && !!cleanAmount && isValidAmount(cleanAmount || ''),
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  const priceInBNB = priceWei ? Number(formatEther(priceWei as bigint)) : null

  return {
    priceWei,
    priceInBNB,
    isLoading,
    error,
  }
}
