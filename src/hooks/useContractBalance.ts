import { useReadContract, useBalance } from "wagmi"
import { BondingCurveLaunchABI } from "@/abis"
import { formatEther } from "viem"

/**
 * Get contract balance and threshold information for liquidity creation progress
 */
export function useContractBalance(curveAddress?: string) {
  // Get contract BNB balance
  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address: curveAddress as `0x${string}`,
    query: {
      enabled: !!curveAddress,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  })

  // Get liquidity threshold
  const { data: thresholdWei, isLoading: thresholdLoading } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "lpThreshold",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 10000,
    },
  })

  // Get liquidity creation status
  const { data: liquidityCreated, isLoading: liquidityLoading } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "liquidityCreated",
    query: {
      enabled: !!curveAddress,
      refetchInterval: 10000,
    },
  })

  const isLoading = balanceLoading || thresholdLoading || liquidityLoading

  const currentBalance = balanceData ? Number(formatEther(balanceData.value)) : 0
  const threshold = thresholdWei ? Number(formatEther(thresholdWei as bigint)) : 0
  const progressPercentage = threshold > 0 ? Math.min((currentBalance / threshold) * 100, 100) : 0

  return {
    currentBalance,
    threshold,
    progressPercentage,
    liquidityCreated: liquidityCreated as boolean,
    isLoading,
  }
}