"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { config, riseTestnet } from "@/lib/wagmi"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: {
    bnb: string // native balance; UI keeps "BNB" label for now as requested
    usdt: string // placeholder until USDT integration
  }
  connect: (walletId?: string) => Promise<void>
  disconnect: () => void
  switchNetwork: () => Promise<void>
  isCorrectNetwork: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { disconnectAsync } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const { connectors, connectAsync, status: connectStatus } = useConnect()
  const { data: nativeBal } = useBalance({
    chainId,
    address,
    query: { enabled: !!address && !!chainId },
  })

  const balance = useMemo(
    () => ({
      bnb: nativeBal ? parseFloat(nativeBal.formatted).toFixed(4) : "0.00",
      usdt: "0.00",
    }),
    [nativeBal]
  )

  const isCorrectNetwork = chainId === riseTestnet.id

  const connect = async (walletId?: string) => {
    const pickInjected = () => connectors.find((c) => c.type === "injected" || c.id === "injected")
    const pickWalletConnect = () => connectors.find((c) => c.id === "walletConnect" || c.name.includes("WalletConnect"))

    const target = ((): any => {
      const id = (walletId || "").toLowerCase()
      if (id === "walletconnect") return pickWalletConnect()
      if (id === "metamask" || id === "binance" || id === "trustwallet") return pickInjected() || pickWalletConnect()
      // fallback: try injected first, else walletconnect
      return pickInjected() || pickWalletConnect()
    })()

    if (!target) throw new Error("No suitable connector found")

    await connectAsync({ connector: target, chainId: riseTestnet.id })
  }

  const disconnect = () => {
    return disconnectAsync()
  }

  const switchNetwork = async () => {
    await switchChainAsync({ chainId: riseTestnet.id })
  }

  const value: WalletContextType = {
    isConnected: !!isConnected,
    address: address ?? null,
    balance,
    connect,
    disconnect,
    switchNetwork,
    isCorrectNetwork,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
