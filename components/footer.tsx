"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations"

export function Footer() {
  const partners = ["Binance Wallet", "TrustWallet", "PancakeSwap", "CoinMarketCap"]

  const socialLinks = [
    { name: "Discord", href: "#" },
    { name: "Telegram", href: "#" },
    { name: "Twitter/X", href: "#" },
  ]

  return (
    <motion.footer
      className="border-t border-border bg-card"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Partners Section */}
        <motion.div
          className="mb-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h3 className="text-lg font-semibold mb-4 text-center" variants={staggerItem}>
            Partners
          </motion.h3>
          <motion.div className="flex flex-wrap justify-center items-center gap-8" variants={staggerContainer}>
            {partners.map((partner) => (
              <motion.div
                key={partner}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                variants={staggerItem}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {partner}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          className="flex justify-center space-x-6 mb-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {socialLinks.map((link) => (
            <motion.div key={link.name} variants={staggerItem}>
              <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors relative">
                <motion.span whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="relative">
                  {link.name}
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

        {/* Disclaimer */}
        <motion.div
          className="text-center text-sm text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="mb-2">
            <strong>DISCLAIMER:</strong> Do Your Own Research (DYOR). Cryptocurrency investments carry significant risk.
            Past performance does not guarantee future results.
          </p>
          <p>MoonEx is a decentralized platform. Users are responsible for their own investment decisions.</p>
        </motion.div>

        {/* Copyright */}
        <motion.div
          className="text-center text-xs text-muted-foreground mt-8 pt-8 border-t border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p>&copy; 2025 MoonEx. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  )
}
