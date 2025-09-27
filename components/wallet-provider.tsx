"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: {
    bnb: string
    usdt: string
  }
  connect: () => Promise<void>
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
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState({
    bnb: "0.00",
    usdt: "0.00",
  })
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true)

  // Simulate wallet connection
  const connect = async () => {
    try {
      // In a real app, this would use wagmi/RainbowKit or similar
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate successful connection
      const mockAddress = "0x1234567890abcdef1234567890abcdef12345678"
      setAddress(mockAddress)
      setIsConnected(true)

      // Simulate fetching balance
      setBalance({
        bnb: "2.45",
        usdt: "1,250.00",
      })

      // Store in localStorage for persistence
      localStorage.setItem("wallet_connected", "true")
      localStorage.setItem("wallet_address", mockAddress)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setBalance({
      bnb: "0.00",
      usdt: "0.00",
    })
    localStorage.removeItem("wallet_connected")
    localStorage.removeItem("wallet_address")
  }

  const switchNetwork = async () => {
    try {
      // Simulate network switch
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsCorrectNetwork(true)
    } catch (error) {
      console.error("Failed to switch network:", error)
      throw error
    }
  }

  // Check for existing connection on mount
  useEffect(() => {
    const wasConnected = localStorage.getItem("wallet_connected")
    const storedAddress = localStorage.getItem("wallet_address")

    if (wasConnected && storedAddress) {
      setIsConnected(true)
      setAddress(storedAddress)
      setBalance({
        bnb: "2.45",
        usdt: "1,250.00",
      })
    }
  }, [])

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    connect,
    disconnect,
    switchNetwork,
    isCorrectNetwork,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
