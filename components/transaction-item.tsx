"use client"

import { Transaction, SupportedCurrency } from "@/lib/storage"
import { formatCurrency } from "@/lib/currency"
import { Card, CardContent } from "@/components/ui/card"

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const showBothAmounts = transaction.currency !== "VND" && transaction.amount !== transaction.vndAmount

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="font-medium text-[#6E4555]">{transaction.description}</p>
          <div className="flex items-center text-sm text-[#6E4555]/70">
            <span>{transaction.cardName}</span>
            <span className="mx-2">•</span>
            <span>{transaction.categoryName}</span>
          </div>
          <p className="text-xs text-[#6E4555]/70">
            {new Date(transaction.date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-[#6E4555]">
            {formatCurrency(transaction.amount, transaction.currency as SupportedCurrency)}
          </p>
          {showBothAmounts && (
            <p className="text-sm text-[#6E4555]/70">
              ≈ {formatCurrency(transaction.vndAmount, "VND")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 