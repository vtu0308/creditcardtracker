"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Transaction } from "@/lib/storage"
import { TransactionItem } from "./transaction-item"
import { Button } from "./ui/button"

interface TransactionMonthSectionProps {
  monthLabel: string
  dayGroups: { label: string; transactions: Transaction[] }[]
}

export function TransactionMonthSection({ monthLabel, dayGroups }: TransactionMonthSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="space-y-4">
      {/* Month Header */}
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-2 bg-[#F5E8EB] hover:bg-[#F5E8EB]/90 text-black"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm font-semibold">{monthLabel}</span>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </Button>

      {/* Transaction Groups */}
      {isExpanded && (
        <div className="space-y-6">
          {dayGroups.map(({ label, transactions }) => (
            <div key={label} className="space-y-4">
              {/* Day Header - just bold text */}
              <h3 className="font-bold text-sm text-foreground px-2">
                {label}
              </h3>
              {/* Transactions */}
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
