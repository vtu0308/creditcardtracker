"use client"

import { useState } from "react"
import { useQueryClient } from '@tanstack/react-query'
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

import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "./category-icons";

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const queryClient = useQueryClient();

  // Handler to invalidate cache after deletion
  const handleDelete = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    if (onDelete) onDelete();
  }
  const [isEditOpen, setIsEditOpen] = useState(false)
  const showBothAmounts = transaction.currency !== "VND"
  const vndAmount = transaction.vndAmount || 0

  // Determine the icon to use based on the category name (fallback to default)
  const categoryName = transaction.categoryName || "";
  const Icon = CATEGORY_ICONS[categoryName] || DEFAULT_CATEGORY_ICON;

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm transition-shadow group hover:shadow-lg hover:shadow-[#C58B9F]/20">
        <CardContent className="flex items-center justify-between p-4">
          {/* Icon at the start */}
          <div className="flex items-center">
            <span className="rounded-full" style={{ backgroundColor: '#F9EFF3', padding: '12px', marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <Icon className="h-6 w-6" style={{ color: '#C58B9F' }} />
</span>
            <div className="space-y-1">
              <p className="font-medium text-lg text-black leading-tight mb-1">{transaction.description}</p>
              <div className="flex items-center gap-2 text-xs text-[#88848F]">
                <span>{transaction.cardName}</span>
                <span className="rounded-full bg-[#F9EFF3] px-2 py-0.5 text-[#C58B9F] text-xs font-semibold" style={{lineHeight: '1.2'}}>{transaction.categoryName}</span>
                <span>{new Date(transaction.date).toLocaleDateString()}</span>
              </div>
            </div>
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
            {/* Only show edit button on hover, remove its space otherwise */}
            <div className="hidden group-hover:block">
              <Button 
                variant="ghost" 
                size="icon" 
                className="transition-opacity"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="h-4 w-4 text-[#C58B9F]" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTransactionDialog
        transaction={transaction}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onDelete={handleDelete}
      />
    </>
  )
} 