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
import { useIsMobile } from "@/components/ui/use-mobile"; // Responsive hook

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const isMobile = useIsMobile();
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
      <Card className={`bg-white/80 backdrop-blur-sm transition-shadow group hover:shadow-lg hover:shadow-[#C58B9F]/20 ${isMobile ? 'w-full' : ''}`}>
        <CardContent className={`flex items-center justify-between ${isMobile ? 'p-2' : 'p-4'} gap-2`}>
          {/* Icon at the start */}
          <div className="flex items-center min-w-0">
            <span
              className="rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#F9EFF3',
                padding: isMobile ? '8px' : '12px',
                marginRight: isMobile ? '8px' : '16px',
                minWidth: isMobile ? 36 : 44,
                minHeight: isMobile ? 36 : 44,
              }}
            >
              <Icon className={isMobile ? "h-5 w-5" : "h-6 w-6"} style={{ color: '#C58B9F' }} />
            </span>
            <div className="space-y-1 min-w-0">
              <p className={`font-medium ${isMobile ? 'text-sm' : 'text-lg'} text-black leading-tight mb-1 truncate max-w-[120px] sm:max-w-[200px]`} title={transaction.description}>{transaction.description}</p>
              <div className={`flex items-center gap-1 sm:gap-2 ${isMobile ? 'text-[10px]' : 'text-xs'} text-[#88848F] min-w-0`}>
                <span className="truncate max-w-[60px]">{transaction.cardName}</span>
                <span className="rounded-full bg-[#F9EFF3] px-2 py-0.5 text-[#C58B9F] text-xs font-semibold" style={{lineHeight: '1.2'}}>{transaction.categoryName}</span>
                <span className="truncate max-w-[60px]">{new Date(transaction.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <p className={`font-medium text-[#6E4555] ${isMobile ? 'text-sm' : ''}`}>
                {formatCurrency(transaction.amount, transaction.currency as SupportedCurrency)}
              </p>
              {showBothAmounts && (
                <p className={`text-[#6E4555]/70 ${isMobile ? 'text-xs' : 'text-sm'}`}>
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