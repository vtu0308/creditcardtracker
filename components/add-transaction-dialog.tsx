"use client"

import { useState, useEffect } from "react"
import { storage, SupportedCurrency, isSupportedCurrency } from "@/lib/storage"
import type { Card, Category } from "@/lib/storage"
import { convertToVND } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddTransactionDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<SupportedCurrency>("VND")
  const [cardId, setCardId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // NEW: State for cards and categories
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // NEW: Fetch cards and categories on mount
  useEffect(() => {
    storage.getCards().then(setCards);
    storage.getCategories().then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (description && amount && cardId && categoryId && date && !isSubmitting) {
      setIsSubmitting(true)
      try {
        const cards = await storage.getCards()
        const categories = await storage.getCategories()
        const card = cards.find(c => c.id === cardId)
        const category = categories.find(c => c.id === categoryId)
        
        if (card && category) {
          const numericAmount = parseFloat(amount)
          const vndAmount = await convertToVND(numericAmount, currency)
          
          await storage.addTransaction({
            description,
            amount: numericAmount,
            currency,
            vndAmount,
            cardId,
            cardName: card.name,
            categoryId,
            categoryName: category.name,
            date: new Date(date).toISOString(),
          })
          
          // Dispatch storage-changed event
          window.dispatchEvent(new Event('storage-changed'))
          
          setDescription("")
          setAmount("")
          setCurrency("VND")
          setCardId("")
          setCategoryId("")
          setDate(new Date().toISOString().split("T")[0])
          onOpenChange?.(false)
        }
      } catch (error) {
        console.error('Error adding transaction:', error)
        // You might want to show an error message to the user here
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Add a new transaction to track your credit card expenses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grocery Shopping"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 100000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={(value) => {
                  if (isSupportedCurrency(value)) {
                    setCurrency(value)
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VND">VND</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="card">Card</Label>
              <Select value={cardId} onValueChange={setCardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a card" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
