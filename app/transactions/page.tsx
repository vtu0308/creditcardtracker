"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { storage, Transaction } from "@/lib/storage"
import { TransactionItem } from "@/components/transaction-item"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [cards, setCards] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [selectedCard, setSelectedCard] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // Add Transaction dialog state
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await storage.getTransactions()
        setTransactions(data)
        setFilteredTransactions(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions')
      }
    }
    const loadCards = async () => {
      try {
        const data = await storage.getCards()
        setCards(data)
      } catch {}
    }
    const loadCategories = async () => {
      try {
        const data = await storage.getCategories()
        setCategories(data)
      } catch {}
    }
    loadTransactions()
    loadCards()
    loadCategories()
    window.addEventListener('storage-changed', loadTransactions)
    return () => window.removeEventListener('storage-changed', loadTransactions)
  }, [])

  // Filter transactions when filters or search query changes
  useEffect(() => {
    let filtered = transactions
    if (selectedCard) {
      filtered = filtered.filter(t => t.cardId === selectedCard)
    }
    if (selectedCategory) {
      filtered = filtered.filter(t => t.categoryId === selectedCategory)
    }
    if (dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(dateFrom))
    }
    if (dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(dateTo))
    }
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchLower) ||
        (transaction.cardName || '').toLowerCase().includes(searchLower) ||
        (transaction.categoryName || '').toLowerCase().includes(searchLower)
      )
    }
    setFilteredTransactions(filtered)
  }, [searchQuery, transactions, selectedCard, selectedCategory, dateFrom, dateTo])

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your credit card transactions
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold tracking-tight mb-4">Transaction History</h2>
          <p className="text-sm text-muted-foreground mb-4">Search and filter your transaction history</p>

          <div className="flex justify-end mb-4">
            <AddTransactionDialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} />
            <Button
              onClick={() => setIsAddTransactionOpen(true)}
              className="bg-[#C779A9] hover:bg-[#b96b9a] text-white rounded-lg px-6 py-2 flex items-center gap-2 shadow-none"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Transaction
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1">Date From</label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="min-w-[120px]" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Date To</label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="min-w-[120px]" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Card</label>
              <select value={selectedCard} onChange={e => setSelectedCard(e.target.value)} className="border rounded px-2 py-1 min-w-[120px]">
                <option value="">All</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>{card.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="border rounded px-2 py-1 min-w-[120px]">
                <option value="">All</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mb-6"
          />

          <div className="space-y-4">
            {filteredTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
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
