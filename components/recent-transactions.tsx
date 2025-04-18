"use client"

import { useEffect, useState } from "react"
import { Transaction, storage } from "@/lib/storage"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { TransactionItem } from "@/components/transaction-item"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

  useEffect(() => {
    const loadTransactions = async () => {
      const allTransactions = await storage.getTransactions();
      setTransactions(allTransactions.slice(0, 5)); // Show only 5 most recent transactions
    };

    loadTransactions();
    window.addEventListener('storage-changed', loadTransactions);
    return () => window.removeEventListener('storage-changed', loadTransactions);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Recent Transactions</h2>
        <Button onClick={() => setIsAddTransactionOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>
      <div className="grid gap-4">
        {transactions.map((transaction) => (
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
