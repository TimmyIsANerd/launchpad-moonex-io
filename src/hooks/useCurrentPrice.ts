import { useReadContract } from "wagmi"
import { BondingCurveLaunchABI } from "@/abis"
import { formatEther } from "viem"

export function useCurrentPrice(curveAddress?: string) {
  const { data: priceWei, isLoading, error } = useReadContract({
    address: curveAddress as `0x${string}`,
    abi: BondingCurveLaunchABI.abi,
    functionName: "getCurrentPrice",
    query: {
      enabled: !!curveAddress,
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
