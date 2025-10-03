"use client"

import { cookieStorage, createConfig, http } from "wagmi"
import { injected, walletConnect } from "@wagmi/connectors"
import { defineChain } from "viem"

const BNB_TESTNET_CHAIN_ID = 97
const BNB_TESTNET_RPC_URL = process.env.BSC_TESTNET_RPC_URL as string
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string

if (!WC_PROJECT_ID) {
  // In dev, fail early if project id is missing
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing")
}
if (!BNB_TESTNET_RPC_URL) {
  // eslint-disable-next-line no-console
  console.warn("BSC_TESTNET_RPC_URL is missing")
}

export const bnbTestnet = defineChain({
  id: BNB_TESTNET_CHAIN_ID,
  name: "BNB Smart Chain Testnet",
  network: "bsc-testnet",
  nativeCurrency: { name: "BNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: {
    default: { http: [BNB_TESTNET_RPC_URL || "https://bsc-testnet-rpc.publicnode.com"] },
    public: { http: [BNB_TESTNET_RPC_URL || "https://bsc-testnet-rpc.publicnode.com"] },
  },
  blockExplorers: {
    default: { name: "BscScan", url: "https://testnet.bscscan.com/" },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [bnbTestnet],
  transports: {
    [bnbTestnet.id]: http(BNB_TESTNET_RPC_URL || "https://bsc-testnet-rpc.publicnode.com"),
  },
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId: WC_PROJECT_ID || "",
      showQrModal: true, // use WalletConnect QR modal
      metadata: {
        name: "MoonEx",
        description: "MoonEx Launchpad",
        url: "https://moonex.local", // replace when you have prod URL
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
      },
    }),
  ],
  ssr: true,
  storage: cookieStorage as any,
})