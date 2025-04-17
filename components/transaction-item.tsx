"use client"

import { useState } from "react"
import { Transaction, SupportedCurrency } from "@/lib/storage"
import { formatCurrency } from "@/lib/currency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { Pencil } from "lucide-react"

interface TransactionItemProps {
  transaction: Transaction
  onDelete?: () => void
}

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const showBothAmounts = transaction.currency !== "VND"
  const vndAmount = transaction.vndAmount || 0

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm group">
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
          <div className="flex items-start gap-4">
            <div className="text-right">
              <p className="font-medium text-[#6E4555]">
                {formatCurrency(transaction.amount, transaction.currency as SupportedCurrency)}
              </p>
              {showBothAmounts && (
                <p className="text-sm text-[#6E4555]/70">
                  ≈ {formatCurrency(vndAmount, "VND")}
                </p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditTransactionDialog
        transaction={transaction}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onDelete={onDelete}
      />
    </>
  )
} 