"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletConnectModal } from "@/components/wallet-connect-modal"
import { WalletDropdown } from "@/components/wallet-dropdown"
import { useWallet } from "@/components/wallet-provider"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn, staggerContainer, staggerItem, buttonGlow, buttonPress } from "@/lib/animations"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const { isConnected, connect } = useWallet()

  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "Leaderboard", href: "/ranking" },
    { name: "Explorer", href: "/advanced" },
  ]

  const handleConnectWallet = async (walletId: string) => {
    await connect()
  }

  return (
    <>
      <motion.nav
        className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                className="text-2xl font-bold gradient-cosmic"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                MoonEx
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <motion.div
              className="hidden md:flex items-center space-x-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {navItems.map((item, index) => (
                <motion.div key={item.name} variants={staggerItem}>
                  <Link
                    href={item.href}
                    className="text-foreground hover:text-primary transition-colors duration-200 relative"
                  >
                    <motion.span whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="relative">
                      {item.name}
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center space-x-4">
              {isConnected ? (
                <WalletDropdown />
              ) : (
                <motion.div variants={buttonGlow} initial="initial" whileHover="hover" whileTap="tap">
                  <Button
                    onClick={() => setShowWalletModal(true)}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    Connect Wallet
                  </Button>
                </motion.div>
              )}
              <Link href="/create-token">
                <motion.div variants={buttonPress} initial="initial" whileHover="hover" whileTap="tap">
                  <Button className="bg-primary hover:bg-primary/90 glow-cyan hover-glow-cyan">Create Token</Button>
                </motion.div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="md:hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <motion.div
                  className="px-2 pt-2 pb-3 space-y-1 sm:px-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {navItems.map((item) => (
                    <motion.div key={item.name} variants={staggerItem}>
                      <Link
                        href={item.href}
                        className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div className="flex flex-col space-y-2 px-3 pt-4" variants={staggerItem}>
                    {isConnected ? (
                      <div className="text-sm text-muted-foreground">Wallet Connected</div>
                    ) : (
                      <Button
                        onClick={() => {
                          setShowWalletModal(true)
                          setIsOpen(false)
                        }}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                      >
                        Connect Wallet
                      </Button>
                    )}
                    <Link href="/create-token">
                      <Button className="w-full bg-primary hover:bg-primary/90 glow-cyan">Create Token</Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleConnectWallet}
      />
    </>
  )
}
