import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { WalletProvider } from "@/components/wallet-provider"
import { PageTransition } from "@/components/page-transition"
import { PageLoading } from "@/components/page-loading"
import "./globals.css"

export const metadata: Metadata = {
  title: "MoonEx - The Future of Meme Launchpads",
  description: "The Fair Launch Meme Platform. Pump to the Moon on BNB Chain.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <WalletProvider>
          <Suspense fallback={<PageLoading />}>
            <PageTransition>{children}</PageTransition>
          </Suspense>
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
