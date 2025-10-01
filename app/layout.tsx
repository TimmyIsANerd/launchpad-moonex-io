import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { WalletProvider } from "@/components/wallet-provider"
import { Web3Provider } from "@/components/web3-provider"
import { PageTransition } from "@/components/page-transition"
import { PageLoading } from "@/components/page-loading"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "MoonEx - The Future of Meme Launchpads",
  description: "The Fair Launch Meme Platform. Pump to the Moon on BNB Chain.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Web3Provider>
          <WalletProvider>
            <Suspense fallback={<PageLoading />}>
              <PageTransition>{children}</PageTransition>
            </Suspense>
          </WalletProvider>
        </Web3Provider>
        <Analytics />
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            className:
              "border border-border bg-card text-foreground rounded-[var(--radius)] shadow-lg",
          }}
        />
      </body>
    </html>
  )
}
