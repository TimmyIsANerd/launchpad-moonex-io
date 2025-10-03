"use client"

import { cookieStorage, createConfig, http } from "wagmi"
import { injected, walletConnect } from "@wagmi/connectors"
import { defineChain } from "viem"

const BNB_TESTNET_CHAIN_ID = 97
const BNB_TESTNET_RPC_URL = process.env.BSC_TESTNET_RPC_URL as string
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string

// Set defaults for development
const DEFAULT_RPC_URL = "https://bsc-testnet-rpc.publicnode.com"
const DEFAULT_PROJECT_ID = "demo-project-id" // This won't work in production but allows dev

if (!BNB_TESTNET_RPC_URL) {
  console.warn("BSC_TESTNET_RPC_URL is missing, using default:", DEFAULT_RPC_URL)
}
if (!WC_PROJECT_ID) {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing, WalletConnect will not work")
}

export const bnbTestnet = defineChain({
  id: BNB_TESTNET_CHAIN_ID,
  name: "BNB Smart Chain Testnet",
  network: "bsc-testnet",
  nativeCurrency: { name: "BNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: {
    default: { http: [BNB_TESTNET_RPC_URL || DEFAULT_RPC_URL] },
    public: { http: [BNB_TESTNET_RPC_URL || DEFAULT_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "BscScan", url: "https://testnet.bscscan.com/" },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [bnbTestnet],
  transports: {
    [bnbTestnet.id]: http(BNB_TESTNET_RPC_URL || DEFAULT_RPC_URL),
  },
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId: WC_PROJECT_ID || "",
      showQrModal: true, // use WalletConnect QR modal
      metadata: {
        name: "MoonEx",
        description: "MoonEx Launchpad",
        url: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3001",
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
      },
    }),
  ],
  ssr: true,
  storage: cookieStorage as any,
})