"use client"

import { useState, useEffect } from "react" // Keep useEffect for loading transaction data
import { useQuery, useQueryClient } from '@tanstack/react-query' // Added useQuery
import { storage, SupportedCurrency, isSupportedCurrency, Transaction, Card, Category } from "@/lib/storage" // Ensure all types are imported
import { convertToVND } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast";

interface EditTransactionDialogProps {
  transaction: Transaction | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onDelete?: () => void // Optional callback after successful delete
}

export function EditTransactionDialog({ transaction, open, onOpenChange, onDelete }: EditTransactionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- State for form fields (initialized by useEffect below) ---
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<SupportedCurrency>("VND")
  const [cardId, setCardId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false); // Separate state for delete operation
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null); // State for user-facing errors

  // --- Fetch Cards using useQuery ---
  const {
    data: cards = [],
    isLoading: isLoadingCards,
  } = useQuery<Card[]>({
    queryKey: ['cards'],
    queryFn: storage.getCards,
  });

  // --- Fetch Categories using useQuery ---
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: storage.getCategories,
  });

  // REMOVED: The old useState and useEffect for fetching cards and categories

  // --- Load transaction data into form state when dialog opens or transaction changes ---
  useEffect(() => {
    console.log("EditDialog useEffect: transaction changed or opened", transaction, open)
    if (transaction && open) {
      setDescription(transaction.description || ""); // Handle potential null/undefined
      setAmount(transaction.amount?.toString() || "");
      setCurrency(isSupportedCurrency(transaction.currency) ? transaction.currency : "VND"); // Validate currency
      setCardId(transaction.cardId || "");
      setCategoryId(transaction.categoryId || "");
      setDate(transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split("T")[0]);
      setSubmitError(null); // Clear any previous errors when opening/changing transaction
      setIsSubmitting(false); // Ensure submitting state is reset
      setIsDeleting(false); // Ensure deleting state is reset
    } else if (!open) {
      // Optional: Reset form when dialog closes if desired
      // setDescription(""); setAmount(""); ... etc.
    }
  }, [transaction, open]); // Re-run when the transaction prop changes or dialog opens

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!description || !amount || !cardId || !categoryId || !date || isSubmitting || !transaction) {
      setSubmitError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Use card/category data fetched by useQuery
      const card = cards.find(c => c.id === cardId);
      const category = categories.find(c => c.id === categoryId);

      if (card && category && transaction) {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
          throw new Error("Invalid amount entered.");
        }
        const vndAmount = await convertToVND(numericAmount, currency);

        console.log('[EditTransactionDialog] Calling storage.updateTransaction...');
        await storage.updateTransaction(transaction.id, {
          description,
          amount: vndAmount,
          currency: "VND",
          cardId,
          categoryId,
          date,
        });
        console.log('[EditTransactionDialog] storage.updateTransaction succeeded.');

        // --- Invalidate transactions query (Correct) ---
        console.log('[EditTransactionDialog] Invalidating transactions query...');
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        console.log('[EditTransactionDialog] Query invalidated.');

        toast({
          title: "Transaction Updated",
          description: `Transaction \"${description}\" updated successfully.`,
        });
        if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      onOpenChange?.(false); // Close dialog on success

      } else {
        throw new Error("Selected card or category could not be found. Data might be loading or missing.");
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save changes.');
      toast({
        variant: "destructive",
        title: "Error Updating Transaction",
        description: error instanceof Error ? error.message : 'Failed to save changes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction || isDeleting) return; // Prevent multiple delete clicks

    setIsDeleting(true);
    setSubmitError(null); // Clear other errors

    try {
      console.log('[EditTransactionDialog] Calling storage.deleteTransaction...');
      await storage.deleteTransaction(transaction.id);
      console.log('[EditTransactionDialog] storage.deleteTransaction succeeded.');

      // --- Invalidate transactions query (Correct) ---
      console.log('[EditTransactionDialog] Invalidating transactions query after delete...');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      console.log('[EditTransactionDialog] Query invalidated after delete.');

      setShowDeleteAlert(false); // Close the alert
      onOpenChange?.(false); // Close the main dialog
      onDelete?.(); // Call optional callback

    } catch (error) {
      console.error('Error deleting transaction:', error);
      // Show error within the alert dialog might be tricky, maybe show in main dialog after alert closes?
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred while deleting.');
      setShowDeleteAlert(false); // Close the alert even on error to show the message
    } finally {
      setIsDeleting(false);
    }
  };

  // Don't render anything if there's no transaction data (e.g., initially)
  if (!transaction) return null;

  // Disable form interactions while loading essential data
  const dataLoading = isLoadingCards || isLoadingCategories;

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
         if (!isOpen) { // Reset error when closing dialog
            setSubmitError(null);
         }
        onOpenChange?.(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Edit the details of your transaction.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting || isDeleting || dataLoading}> {/* Disable form while submitting/deleting/loading selects */}
              <div className="grid gap-4 py-4">
                {/* Description */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Grocery Shopping"
                    required
                  />
                </div>
                {/* Amount & Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-amount">Amount</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 100000"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-currency">Currency</Label>
                    <Select value={currency} onValueChange={(value) => {
                      if (isSupportedCurrency(value)) {
                        setCurrency(value)
                      }
                    }}>
                      <SelectTrigger id="edit-currency">
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
                {/* Card Select */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-card">Card</Label>
                  <Select value={cardId} onValueChange={setCardId} required disabled={isLoadingCards}>
                    <SelectTrigger id="edit-card">
                      <SelectValue placeholder={isLoadingCards ? "Loading cards..." : "Select a card"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCards ? (
                         <SelectItem value="loading" disabled>Loading cards...</SelectItem>
                      ) : cards.length === 0 ? (
                         <SelectItem value="no-cards" disabled>No cards found</SelectItem>
                      ) : (
                        cards.map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            {card.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Category Select */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required disabled={isLoadingCategories}>
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                    </SelectTrigger>
                    <SelectContent>
                       {isLoadingCategories ? (
                         <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : categories.length === 0 ? (
                         <SelectItem value="no-categories" disabled>No categories found</SelectItem>
                      ) : (
                         categories.map((category) => (
                           <SelectItem key={category.id} value={category.id}>
                             {category.name}
                           </SelectItem>
                         ))
                       )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Date */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </fieldset>
             {/* Display Submit Error */}
             {submitError && (
                <p className="text-sm text-red-600 mb-4 px-1">{submitError}</p>
             )}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
                disabled={isSubmitting || isDeleting || dataLoading} // Disable if submitting save or loading data
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting || dataLoading}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting} // Disable while delete is in progress
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}