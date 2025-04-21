"use client"

import { useState } from "react" // Removed useEffect
import { useQuery, useQueryClient } from '@tanstack/react-query' // Added useQuery
import { storage, SupportedCurrency, isSupportedCurrency, Card, Category } from "@/lib/storage" // Ensured Card, Category types are imported
import { convertToVND } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";

interface AddTransactionDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<SupportedCurrency>("VND")
  const [cardId, setCardId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null); // Optional: state for user-facing errors

  // --- Fetch Cards using useQuery ---
  const {
    data: cards = [], // Default to empty array
    isLoading: isLoadingCards,
    // isError: isErrorCards // Optional: you could handle errors fetching cards
  } = useQuery<Card[]>({
    queryKey: ['cards'], // Unique key for caching cards data
    queryFn: storage.getCards, // Function to fetch cards
  });

  // --- Fetch Categories using useQuery ---
  const {
    data: categories = [], // Default to empty array
    isLoading: isLoadingCategories,
    // isError: isErrorCategories // Optional: you could handle errors fetching categories
  } = useQuery<Category[]>({
    queryKey: ['categories'], // Unique key for caching categories data
    queryFn: storage.getCategories, // Function to fetch categories
  });

  // REMOVED: The old useState and useEffect for cards and categories

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation check
    if (!description || !amount || !cardId || !categoryId || !date || isSubmitting) {
      setSubmitError("Please fill in all fields."); // Provide user feedback
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null); // Clear previous errors

    try {
      // --- Use card and category data directly from useQuery results ---
      // No need to re-fetch here anymore!
      const card = cards.find(c => c.id === cardId);
      const category = categories.find(c => c.id === categoryId);

      if (card && category) {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
           console.error('[AddTransactionDialog] Invalid numericAmount:', amount);
           setSubmitError("Invalid amount entered.");
           setIsSubmitting(false);
           return;
        }
        let vndAmount: number;
        // --- Log inputs RIGHT BEFORE conversion ---
        console.log('[AddTransactionDialog] Inputs before conversion:', { numericAmount, currency });
        if (currency === 'VND') {
            console.log('[AddTransactionDialog] Currency is VND, setting vndAmount directly.');
            vndAmount = numericAmount;
        } else {
            // --- Wrap the specific call ---
            console.log('[AddTransactionDialog] Attempting to call convertToVND...');
            try {
                vndAmount = await convertToVND(numericAmount, currency);
                // --- Log the result AFTER successful conversion ---
                console.log('[AddTransactionDialog] convertToVND call succeeded. Result:', vndAmount);
            } catch (conversionError) {
                console.error('[AddTransactionDialog] ERROR during convertToVND call:', conversionError);
                setSubmitError(`Currency conversion failed: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`);
                setIsSubmitting(false);
                return;
            }
        }
        // --- Log the final vndAmount to be saved ---
        console.log('[AddTransactionDialog] Final vndAmount to be saved:', vndAmount);
        // --- Proceed to add transaction ---
        console.log('[AddTransactionDialog] Calling storage.addTransaction...');
        await storage.addTransaction({
          description,
          amount: numericAmount,
          currency,
          vndAmount,
          cardId,
          cardName: card.name, // Use name from found card
          categoryId,
          categoryName: category.name, // Use name from found category
          date: new Date(date).toISOString(),
        });
        console.log('[AddTransactionDialog] storage.addTransaction succeeded.');

        // --- Invalidate transactions query (Correct - keep this) ---
        console.log('[AddTransactionDialog] Invalidating transactions query...');
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        console.log('[AddTransactionDialog] Query invalidated.');

        toast({
          title: "Transaction Added",
          description: `Transaction \"${description}\" added successfully.`,
        });

        // --- Reset form and close dialog on success ---
        setDescription("");
        setAmount("");
        setCurrency("VND");
        setCardId("");
        setCategoryId("");
        setDate(new Date().toISOString().split("T")[0]);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        onOpenChange?.(false); // Close the dialog

      } else {
         // Handle cases where card or category might not be found (though unlikely if selects are populated correctly)
         throw new Error("Selected card or category not found. Please refresh.")
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred.'); // Show error to user
      toast({
        variant: "destructive",
        title: "Error Adding Transaction",
        description: error instanceof Error ? error.message : 'Failed to add transaction.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) { // Reset error when closing dialog
        setSubmitError(null);
      }
      onOpenChange?.(isOpen);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Add a new transaction to track your credit card expenses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grocery Shopping"
                required // Add basic HTML validation
              />
            </div>
            {/* Amount & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="any" // Allow decimals
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 100000"
                  required
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
            {/* Card Select */}
            <div className="grid gap-2">
              <Label htmlFor="card">Card</Label>
              <Select value={cardId} onValueChange={setCardId} required disabled={isLoadingCards}>
                <SelectTrigger>
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
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required disabled={isLoadingCategories}>
                <SelectTrigger>
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
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          {/* Display Submit Error */}
          {submitError && (
            <p className="text-sm text-red-600 mb-4 px-1">{submitError}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || isLoadingCards || isLoadingCategories}>
              {isSubmitting ? "Adding..." : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}