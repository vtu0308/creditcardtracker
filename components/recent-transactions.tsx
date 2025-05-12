"use client"

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react';
import { Transaction, storage } from "@/lib/storage"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { TransactionItem } from "@/components/transaction-item"
import { Button } from "@/components/ui/button"
import { AddTransactionButton } from "@/components/add-transaction-button"
import { PlusCircle } from "lucide-react"

export function RecentTransactions() {
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: storage.getTransactions,
    initialData: [],
  });
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Recent Transactions</h2>
        <AddTransactionButton onClick={() => setIsAddTransactionOpen(true)} />
      </div>
      <div className="grid gap-4">
        {(transactions.slice(0, 5)).map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
      <AddTransactionDialog 
        open={isAddTransactionOpen} 
        onOpenChange={setIsAddTransactionOpen} 
      />
    </div>
  )
}
