"use client"

import { useState } from "react"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { TransactionItem } from "@/components/transaction-item"
import { Input } from "@/components/ui/input"

export default function TransactionsPage() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your credit card transactions
          </p>
        </div>
        <Button onClick={() => setIsAddTransactionOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <div className="rounded-lg border bg-white/80 backdrop-blur-sm">
        <div className="p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Transaction History</h2>
          <p className="text-sm text-muted-foreground">
            Search and filter your transaction history
          </p>
          <div className="mt-4">
            <Input placeholder="Search transactions..." className="max-w-sm" />
          </div>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {storage.getTransactions().map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
      </div>

      <AddTransactionDialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} />
    </div>
  )
}
