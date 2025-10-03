import { useReadContract } from "wagmi"
import { BondingCurveLaunchABI } from "@/abis"

/**
 * Get the trading fee percentage from the bonding curve contract
 */
export function useTradingFee(curveAddress?: string) {
  const { data: feeBps, isLoading, error } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "tradeFeeBps",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 30000, // Refetch every 30 seconds (fees change less frequently)
    },
  })

  // Convert basis points to percentage (e.g., 150 bps = 1.5%)
  const feePercentage = feeBps ? Number(feeBps) / 100 : null
  const feeRate = feeBps ? Number(feeBps) / 10000 : null

  return {
    feeBps: feeBps ? Number(feeBps) : null,
    feePercentage,
    feeRate,
    isLoading,
    error,
  }
}