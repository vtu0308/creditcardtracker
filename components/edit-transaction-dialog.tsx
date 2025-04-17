import { useState, useEffect } from "react"
import { storage, SupportedCurrency, isSupportedCurrency, Transaction } from "@/lib/storage"
import { convertToVND } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

interface EditTransactionDialogProps {
  transaction: Transaction | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onDelete?: () => void
}

export function EditTransactionDialog({ transaction, open, onOpenChange, onDelete }: EditTransactionDialogProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<SupportedCurrency>("VND")
  const [cardId, setCardId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  // Load transaction data when dialog opens
  useEffect(() => {
    if (transaction && open) {
      setDescription(transaction.description)
      setAmount(transaction.amount.toString())
      setCurrency(transaction.currency as SupportedCurrency)
      setCardId(transaction.cardId)
      setCategoryId(transaction.categoryId)
      setDate(transaction.date.split('T')[0])
    }
  }, [transaction, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (description && amount && cardId && categoryId && date && !isSubmitting && transaction) {
      setIsSubmitting(true)
      try {
        const cards = storage.getCards()
        const categories = storage.getCategories()
        const card = cards.find(c => c.id === cardId)
        const category = categories.find(c => c.id === categoryId)
        
        if (card && category) {
          const numericAmount = parseFloat(amount)
          const vndAmount = await convertToVND(numericAmount, currency)
          
          storage.updateTransaction(transaction.id, {
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
          
          onOpenChange?.(false)
        }
      } catch (error) {
        console.error('Error updating transaction:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleDelete = () => {
    if (transaction) {
      storage.deleteTransaction(transaction.id)
      // Dispatch storage-changed event
      window.dispatchEvent(new Event('storage-changed'))
      setShowDeleteAlert(false)
      onOpenChange?.(false)
      onDelete?.()
    }
  }

  if (!transaction) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Edit the details of your transaction.
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
                    {storage.getCards().map((card) => (
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
                    {storage.getCategories().map((category) => (
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
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 