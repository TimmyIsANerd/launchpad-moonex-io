"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn, slideUp, staggerContainer, staggerItem, cardHover, buttonPress, spinnerRotate } from "@/lib/animations"

interface Token {
  rank: number
  name: string
  ticker: string
  baseAsset: string
  marketCap: string
  volume24h: string
  price: string
  change24h: number
  contractAddress: string
  onPancakeSwap: boolean
  createdAt: string
  tradingVolume: number
  icon?: string
}

interface EnhancedTokenTableProps {
  tokens: Token[]
  title?: string
  showToggle?: boolean
}

const ITEMS_PER_PAGE = 10

export function EnhancedTokenTable({ tokens, title = "Token Explorer", showToggle = true }: EnhancedTokenTableProps) {
  const [activeTab, setActiveTab] = useState<"pancakeswap" | "unbonded">("pancakeswap")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState<"volume" | "created">("volume")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filter tokens based on active tab
  const tabFilteredTokens = useMemo(() => {
    return tokens.filter((token) => (activeTab === "pancakeswap" ? token.onPancakeSwap : !token.onPancakeSwap))
  }, [tokens, activeTab])

  // Apply search and filters
  const filteredTokens = useMemo(() => {
    let filtered = tabFilteredTokens

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (token) =>
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.ticker.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Base asset filter
    if (filterBy !== "all") {
      filtered = filtered.filter((token) => token.baseAsset === filterBy)
    }

    return filtered
  }, [tabFilteredTokens, searchQuery, filterBy])

  // Apply sorting
  const sortedTokens = useMemo(() => {
    const sorted = [...filteredTokens].sort((a, b) => {
      let comparison = 0

      if (sortBy === "volume") {
        comparison = a.tradingVolume - b.tradingVolume
      } else if (sortBy === "created") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return sorted
  }, [filteredTokens, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(sortedTokens.length / ITEMS_PER_PAGE)
  const paginatedTokens = sortedTokens.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const getSortIcon = () => {
    if (sortOrder === "asc") return <ArrowUp className="w-4 h-4" />
    if (sortOrder === "desc") return <ArrowDown className="w-4 h-4" />
    return <ArrowUpDown className="w-4 h-4" />
  }

  const getTokenIcon = (ticker: string) => {
    // Simple token icon mapping - in real app would use proper crypto icons
    const iconMap: { [key: string]: string } = {
      BNB: "🟡",
      USDT: "🟢",
      CAKE: "🥞",
      USD1: "💵",
      USDC: "🔵",
      ASTER: "⭐",
    }
    return iconMap[ticker] || "🚀"
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={fadeIn}>
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        variants={slideUp}
      >
        <h2 className="text-2xl md:text-3xl font-bold">
          <span className="gradient-cosmic">{title}</span>
        </h2>
        <motion.div variants={buttonPress} whileHover="hover" whileTap="tap">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            <motion.div animate={isRefreshing ? "animate" : ""} variants={spinnerRotate}>
              <RefreshCw className="w-4 h-4 mr-2" />
            </motion.div>
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      {/* Toggle Tabs */}
      {showToggle && (
        <motion.div variants={slideUp}>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "pancakeswap" | "unbonded")}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-card">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger
                  value="pancakeswap"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full"
                >
                  🥞 PancakeSwap Listed
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger
                  value="unbonded"
                  className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground w-full"
                >
                  🚀 Pre-Launch Tokens
                </TabsTrigger>
              </motion.div>
            </TabsList>
          </Tabs>
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Search */}
        <motion.div className="relative flex-1 max-w-sm" variants={staggerItem}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>

        {/* Filter by Base Asset */}
        <motion.div variants={staggerItem}>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              <SelectItem value="BNB">🟡 BNB</SelectItem>
              <SelectItem value="USDT">🟢 USDT</SelectItem>
              <SelectItem value="CAKE">🥞 CAKE</SelectItem>
              <SelectItem value="USD1">💵 USD1</SelectItem>
              <SelectItem value="USDC">🔵 USDC</SelectItem>
              <SelectItem value="ASTER">⭐ ASTER</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Sort Options */}
        <motion.div className="flex items-center gap-2" variants={staggerItem}>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "volume" | "created")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volume">Trading Volume</SelectItem>
              <SelectItem value="created">Creation Time</SelectItem>
            </SelectContent>
          </Select>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={toggleSort} className="px-3 bg-transparent">
              {getSortIcon()}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Results Count */}
      <motion.div
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Showing {paginatedTokens.length} of {sortedTokens.length} tokens
        {activeTab === "pancakeswap" ? " listed on PancakeSwap" : " in pre-launch phase"}
      </motion.div>

      {/* Token Table */}
      <div className="space-y-4">
        {/* Table Header */}
        <motion.div
          className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground border-b border-border bg-card/50 rounded-lg"
          variants={slideUp}
          initial="hidden"
          animate="visible"
        >
          <div className="col-span-1">#</div>
          <div className="col-span-3">Token</div>
          <div className="col-span-2">Base Asset</div>
          <div className="col-span-2">Market Cap</div>
          <div className="col-span-2">24H Volume</div>
          <div className="col-span-2">24H Change</div>
        </motion.div>

        {/* Token Rows */}
        {paginatedTokens.length > 0 ? (
          <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
            <AnimatePresence mode="popLayout">
              {paginatedTokens.map((token, index) => (
                <motion.div
                  key={token.contractAddress}
                  variants={staggerItem}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/token/${token.contractAddress}`}>
                    <motion.div
                      variants={cardHover}
                      initial="initial"
                      whileHover="hover"
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="hover-glow-cyan transition-all duration-300 cursor-pointer mb-3">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            {/* Rank */}
                            <div className="md:col-span-1 flex items-center">
                              <motion.div
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              >
                                {token.rank}
                              </motion.div>
                            </div>

                            {/* Token Info */}
                            <div className="md:col-span-3">
                              <div className="flex items-center space-x-3">
                                <motion.div
                                  className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl"
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  {getTokenIcon(token.ticker)}
                                </motion.div>
                                <div>
                                  <h3 className="font-semibold text-foreground text-lg">{token.name}</h3>
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm text-muted-foreground font-mono">{token.ticker}</p>
                                    {token.onPancakeSwap && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                                      >
                                        <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                                          Listed
                                        </Badge>
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Base Asset */}
                            <div className="md:col-span-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getTokenIcon(token.baseAsset)}</span>
                                <span className="font-medium text-foreground">{token.baseAsset}</span>
                              </div>
                            </div>

                            {/* Market Cap */}
                            <div className="md:col-span-2">
                              <span className="font-medium text-foreground text-lg">{token.marketCap}</span>
                            </div>

                            {/* 24H Volume */}
                            <div className="md:col-span-2">
                              <span className="font-medium text-foreground">{token.volume24h}</span>
                            </div>

                            {/* 24H Change */}
                            <div className="md:col-span-2">
                              <motion.span
                                className={`font-medium text-lg ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
                                initial={{ scale: 1 }}
                                animate={{
                                  scale: [1, 1.05, 1],
                                  transition: { duration: 0.3, delay: 0.5 },
                                }}
                              >
                                {token.change24h >= 0 ? "+" : ""}
                                {token.change24h.toFixed(2)}%
                              </motion.span>
                            </div>
                          </div>

                          {/* Mobile Layout Additional Info */}
                          <div className="md:hidden mt-6 pt-4 border-t border-border">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Market Cap:</span>
                                <div className="font-medium">{token.marketCap}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">24H Volume:</span>
                                <div className="font-medium">{token.volume24h}</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  >
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  </motion.div>
                  <p className="text-lg">No tokens found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div className="flex justify-center" variants={slideUp} initial="hidden" animate="visible">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(pageNum)
                      }}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      )}
    </motion.div>
  )
}
