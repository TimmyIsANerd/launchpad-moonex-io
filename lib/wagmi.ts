"use client"

import { cookieStorage, createConfig, http } from "wagmi"
import { injected, walletConnect } from "@wagmi/connectors"
import { defineChain } from "viem"

const RISE_CHAIN_ID = 11155931
const RISE_RPC_URL = process.env.NEXT_PUBLIC_RISE_RPC_URL as string
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string

if (!WC_PROJECT_ID) {
  // In dev, fail early if project id is missing
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing")
}
if (!RISE_RPC_URL) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_RISE_RPC_URL is missing")
}

export const riseTestnet = defineChain({
  id: RISE_CHAIN_ID,
  name: "Rise Testnet",
  network: "rise-testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [RISE_RPC_URL || "https://testnet.riselabs.xyz"] },
    public: { http: [RISE_RPC_URL || "https://testnet.riselabs.xyz"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://explorer.testnet.riselabs.xyz/" },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [riseTestnet],
  transports: {
    [riseTestnet.id]: http(RISE_RPC_URL || "https://testnet.riselabs.xyz"),
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
  storage: cookieStorage,
})