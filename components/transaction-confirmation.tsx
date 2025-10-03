"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  modalBackdrop,
  modalContent,
  staggerContainer,
  staggerItem,
  buttonPress,
  spinnerRotate,
} from "@/lib/animations"

interface TransactionDetails {
  type: "buy" | "sell"
  tokenName: string
  tokenTicker: string
  amount: string
  price: string
  slippage: number
  estimatedGas: string
  minimumReceived: string
  priceImpact: number
}

interface TransactionConfirmationProps {
  transaction: TransactionDetails
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  status: "pending" | "confirming" | "success" | "error" | null
  txHash?: string
}

export function TransactionConfirmation({
  transaction,
  isOpen,
  onConfirm,
  onCancel,
  status,
  txHash,
}: TransactionConfirmationProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return (
          <motion.div variants={spinnerRotate}>
            <Clock className="h-5 w-5 text-yellow-500" />
          </motion.div>
        )
      case "confirming":
        return (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}>
            <Clock className="h-5 w-5 text-blue-500" />
          </motion.div>
        )
      case "success":
        return (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </motion.div>
        )
      case "error":
        return (
          <motion.div initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </motion.div>
        )
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Transaction Pending..."
      case "confirming":
        return "Confirming Transaction..."
      case "success":
        return "Transaction Successful!"
      case "error":
        return "Transaction Failed"
      default:
        return "Confirm Transaction"
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
          onClick={onCancel}
        >
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <motion.span
                    key={status}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {getStatusText()}
                  </motion.span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Transaction Details */}
                <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
                  <motion.div className="flex justify-between items-center" variants={staggerItem}>
                    <span className="text-muted-foreground">Action:</span>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                      <Badge className={transaction.type === "buy" ? "bg-green-500" : "bg-red-500"}>
                        {transaction.type === "buy" ? "Buy" : "Sell"} {transaction.tokenTicker}
                      </Badge>
                    </motion.div>
                  </motion.div>

                  <motion.div className="flex justify-between items-center" variants={staggerItem}>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium text-foreground">{transaction.amount}</span>
                  </motion.div>


                  <motion.div className="flex justify-between items-center" variants={staggerItem}>
                    <span className="text-muted-foreground">Slippage:</span>
                    <span className="font-medium text-foreground">{transaction.slippage}%</span>
                  </motion.div>

                  <motion.div className="flex justify-between items-center" variants={staggerItem}>
                    <span className="text-muted-foreground">Minimum Received:</span>
                    <span className="font-medium text-foreground">{transaction.minimumReceived}</span>
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <Separator />
                  </motion.div>

                  <motion.div className="flex justify-between items-center" variants={staggerItem}>
                    <span className="text-muted-foreground">Price Impact:</span>
                    <motion.span
                      className={`font-medium ${
                        transaction.priceImpact > 5
                          ? "text-red-400"
                          : transaction.priceImpact > 2
                            ? "text-yellow-400"
                            : "text-green-400"
                      }`}
                      animate={transaction.priceImpact > 5 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      {transaction.priceImpact.toFixed(3)}%
                    </motion.span>
                  </motion.div>

                  <motion.div className="flex justify-between items-center" variants={staggerItem}>
                    <span className="text-muted-foreground">Estimated Gas:</span>
                    <span className="font-medium text-foreground">{transaction.estimatedGas}</span>
                  </motion.div>
                </motion.div>

                {/* Price Impact Warning */}
                <AnimatePresence>
                  {transaction.priceImpact > 5 && (
                    <motion.div
                      className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start space-x-2">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-medium text-red-400">High Price Impact</p>
                          <p className="text-xs text-red-300">
                            This trade will significantly impact the token price. Consider reducing your trade size.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Transaction Hash */}
                <AnimatePresence>
                  {txHash && (
                    <motion.div
                      className="bg-card rounded-lg p-3 border border-border"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Transaction Hash:</span>
                        <motion.div variants={buttonPress} whileHover="hover" whileTap="tap" className="h-auto p-1">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </div>
                      <motion.p
                        className="text-xs font-mono text-primary break-all"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {txHash}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <motion.div
                  className="flex space-x-2 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <AnimatePresence mode="wait">
                    {status === null && (
                      <motion.div
                        className="flex space-x-2 w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.div variants={buttonPress} whileHover="hover" whileTap="tap" className="flex-1">
                          <Button variant="outline" onClick={onCancel} className="w-full border-border bg-transparent">
                            Cancel
                          </Button>
                        </motion.div>
                        <motion.div variants={buttonPress} whileHover="hover" whileTap="tap" className="flex-1">
                          <Button onClick={onConfirm} className="w-full bg-primary hover:bg-primary/90">
                            Confirm {transaction.type === "buy" ? "Buy" : "Sell"}
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}

                    {status === "success" && (
                      <motion.div
                        className="w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <motion.div variants={buttonPress} whileHover="hover" whileTap="tap">
                          <Button onClick={onCancel} className="w-full bg-green-500 hover:bg-green-600">
                            Close
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}

                    {status === "error" && (
                      <motion.div
                        className="w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <motion.div variants={buttonPress} whileHover="hover" whileTap="tap">
                          <Button onClick={onCancel} className="w-full bg-red-500 hover:bg-red-600">
                            Close
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}

                    {(status === "pending" || status === "confirming") && (
                      <motion.div
                        className="w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <Button disabled className="w-full">
                          Processing...
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
