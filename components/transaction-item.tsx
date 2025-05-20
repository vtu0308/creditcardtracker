"use client"

import { useState } from "react"
import { useQueryClient } from '@tanstack/react-query'
import { Transaction, SupportedCurrency } from "@/lib/storage"
import { formatCurrency } from "@/lib/currency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { Pencil, CreditCard as CardIcon } from "lucide-react"

import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "./category-icons"
import { useIsMobile } from "@/components/ui/use-mobile" // Responsive hook

interface TransactionItemProps {
  transaction: Transaction
  onDelete?: () => void
}

export function TransactionItem({
  transaction,
  onDelete,
}: TransactionItemProps) {
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  // Handler to invalidate cache after deletion
  const handleDelete = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    onDelete?.()
  }

  const [isEditOpen, setIsEditOpen] = useState(false)
  const showBothAmounts = transaction.currency !== "VND"
  const vndAmount = transaction.vndAmount ?? 0

  // Determine the icon to use based on category
  const categoryName = transaction.categoryName || ""
  const Icon = CATEGORY_ICONS[categoryName] || DEFAULT_CATEGORY_ICON

  return (
    <>
      <Card
        className={`transition-all group hover:shadow-lg hover:shadow-[#C58B9F]/20 ${
          isMobile ? 'w-full' : ''
        }`}
      >
        <CardContent
          className={`flex items-center justify-between ${
            isMobile ? 'p-2' : 'p-4'
          } gap-2`}
        >
          {/* Left side: category icon + description + meta */}
          <div className="flex items-center flex-1 gap-4 overflow-hidden">
            {/* Category circle icon */}
            <div
              className="rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                backgroundColor: '#F3E2E7',
                padding: isMobile ? 8 : 12,
                minWidth: isMobile ? 36 : 44,
                minHeight: isMobile ? 36 : 44,
              }}
            >
              <Icon
                className={isMobile ? 'h-5 w-5' : 'h-6 w-6'}
                style={{ color: '#C58B9F' }}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              {/* Description */}
              <p
                className={`font-medium ${
                  isMobile ? 'text-sm' : 'text-base'
                } text-black leading-tight`}
                title={transaction.description}
              >
                {transaction.description}
              </p>

              {/* Card name + category badge + date */}
              <div
                className={`flex items-center gap-3 ${
                  isMobile ? 'text-[10px]' : 'text-xs'
                } text-[#88848F]`}
              >
                {/* NEW: Card icon + card name, no truncation */}
                <div className="flex items-center gap-1">
                  <CardIcon
                    className={isMobile ? 'h-3 w-3' : 'h-4 w-4'}
                    style={{ color: 'inherit' }}
                  />
                  <span
                    className={`font-normal ${
                      isMobile ? 'text-[10px]' : 'text-xs'
                    } text-muted-foreground`}
                  >
                    {transaction.cardName}
                  </span>
                </div>

                {/* Category badge */}
                <span
                  className="rounded-full bg-[#F3E2E7] px-2 py-0.5 text-[#C58B9F] text-xs font-semibold"
                  style={{ lineHeight: '1.2' }}
                >
                  {transaction.categoryName}
                </span>

                {/* Date */}
                <span>
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: amounts + edit button */}
          <div className="flex items-start gap-2 flex-shrink-0">
            <div className="text-right">
              <p
                className={`font-medium text-[#6E4555] ${
                  isMobile ? 'text-sm' : ''
                }`}
              >
                {formatCurrency(
                  transaction.amount,
                  transaction.currency as SupportedCurrency
                )}
              </p>
              {showBothAmounts && (
                <p
                  className={`text-[#6E4555]/70 ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}
                >
                  ≈ {formatCurrency(vndAmount, 'VND')}
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
        onDelete={handleDelete}
      />
    </>
  )
}
