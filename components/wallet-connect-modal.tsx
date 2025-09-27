"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Smartphone, Globe, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  modalBackdrop,
  modalContent,
  staggerContainer,
  staggerItem,
  buttonPress,
  spinnerRotate,
} from "@/lib/animations"

interface WalletOption {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  popular?: boolean
  installed?: boolean
}

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (walletId: string) => Promise<void>
}

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const walletOptions: WalletOption[] = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: <Wallet className="h-6 w-6" />,
      description: "Connect using browser extension",
      popular: true,
      installed: true,
    },
    {
      id: "binance",
      name: "Binance Wallet",
      icon: <Wallet className="h-6 w-6" />,
      description: "Connect using Binance Wallet",
      popular: true,
      installed: false,
    },
    {
      id: "trustwallet",
      name: "Trust Wallet",
      icon: <Smartphone className="h-6 w-6" />,
      description: "Connect using Trust Wallet mobile app",
      installed: false,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: <Globe className="h-6 w-6" />,
      description: "Connect using WalletConnect protocol",
    },
  ]

  const handleConnect = async (walletId: string) => {
    setIsConnecting(walletId)
    try {
      await onConnect(walletId)
      onClose()
    } catch (error) {
      console.error("Failed to connect:", error)
    } finally {
      setIsConnecting(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Wallet className="h-5 w-5 text-primary" />
                  </motion.div>
                  <span>Connect Wallet</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Choose your preferred wallet to connect to MoonEx</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                  {walletOptions.map((wallet, index) => (
                    <motion.div key={wallet.id} variants={staggerItem} transition={{ delay: index * 0.1 }}>
                      <motion.div variants={buttonPress} whileHover="hover" whileTap="tap">
                        <Button
                          variant="outline"
                          className="w-full h-auto p-4 border-border bg-transparent hover:bg-card hover:border-primary"
                          onClick={() => handleConnect(wallet.id)}
                          disabled={isConnecting !== null}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <motion.div
                              className="text-primary"
                              animate={isConnecting === wallet.id ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                            >
                              {wallet.icon}
                            </motion.div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-foreground">{wallet.name}</span>
                                {wallet.popular && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                  >
                                    <Badge className="bg-primary text-primary-foreground text-xs">Popular</Badge>
                                  </motion.div>
                                )}
                                {wallet.installed && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                  >
                                    <Badge variant="secondary" className="text-xs">
                                      Installed
                                    </Badge>
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{wallet.description}</p>
                            </div>
                            <AnimatePresence>
                              {isConnecting === wallet.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                  variants={spinnerRotate}
                                  className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Animated security notice */}
                <motion.div
                  className="bg-card rounded-lg p-3 border border-border mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-start space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Shield className="h-4 w-4 text-primary mt-0.5" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Secure Connection</p>
                      <p className="text-xs text-muted-foreground">
                        MoonEx will never ask for your private keys or seed phrase. Always verify the URL before
                        connecting.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Animated cancel button */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  <motion.div variants={buttonPress} whileHover="hover" whileTap="tap">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="w-full border-border bg-transparent"
                      disabled={isConnecting !== null}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
