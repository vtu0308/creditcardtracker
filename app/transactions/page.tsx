"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { storage } from "@/lib/storage-client"
import { formatCurrency } from "@/lib/currency"
import type { Transaction } from "@/lib/storage-client"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await storage.getTransactions()
        setTransactions(data)
        setFilteredTransactions(data)
      } catch (error) {
        console.error('Error loading transactions:', error)
      }
    }

    loadTransactions()
    // Subscribe to storage changes
    window.addEventListener('storage-changed', loadTransactions)
    return () => window.removeEventListener('storage-changed', loadTransactions)
  }, [])

  // Filter transactions when search query changes
  useEffect(() => {
    const filtered = transactions.filter(transaction => {
      const searchLower = searchQuery.toLowerCase()
      return (
        transaction.description.toLowerCase().includes(searchLower) ||
        (transaction.card?.name || '').toLowerCase().includes(searchLower) ||
        (transaction.category?.name || '').toLowerCase().includes(searchLower) ||
        formatCurrency(transaction.vndAmount || transaction.amount, 'VND').toLowerCase().includes(searchLower)
      )
    })
    setFilteredTransactions(filtered)
  }, [searchQuery, transactions])

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your credit card transactions
          </p>
        </div>
        <AddTransactionDialog />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold tracking-tight mb-4">Transaction History</h2>
          <p className="text-sm text-muted-foreground mb-4">Search and filter your transaction history</p>
          
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mb-6"
          />

          <div className="space-y-4">
            {filteredTransactions.map(transaction => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-white/80 backdrop-blur-sm"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{transaction.description}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{transaction.card?.name}</span>
                    <span>•</span>
                    <span>{transaction.category?.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(transaction.vndAmount || transaction.amount, 'VND')}
                  </div>
                  {transaction.vndAmount && transaction.amount !== transaction.vndAmount && (
                    <div className="text-sm text-muted-foreground">
                      ≈ {formatCurrency(transaction.amount, 'EUR')}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                {searchQuery ? 'No transactions found matching your search' : 'No transactions yet'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
