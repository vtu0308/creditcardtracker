"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from '@tanstack/react-query' // Import hook
import { storage, Card as CardType } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

interface EditCardDialogProps {
  card: CardType | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onDelete?: () => void // Optional callback
}

export function EditCardDialog({ card, open, onOpenChange, onDelete }: EditCardDialogProps) {
  const queryClient = useQueryClient(); // Get query client instance
  const [name, setName] = useState("")
  const [statementDay, setStatementDay] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false); // State for save operation
  const [isDeleting, setIsDeleting] = useState(false); // State for delete operation
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null); // State for errors

  // Load card data when dialog opens or card changes
  useEffect(() => {
    if (card && open) {
      setName(card.name || "")
      setStatementDay(card.statementDay?.toString() || "")
      setDueDay(card.dueDay?.toString() || "")
      setSubmitError(null); // Clear errors on open/change
      setIsSubmitting(false);
      setIsDeleting(false);
    }
  }, [card, open]);

  const handleSubmit = async (e: React.FormEvent) => { // Make async
    e.preventDefault();
    const statementDayNum = parseInt(statementDay);
    const dueDayNum = parseInt(dueDay);

    if (!name || isNaN(statementDayNum) || isNaN(dueDayNum) || statementDayNum < 1 || statementDayNum > 31 || dueDayNum < 1 || dueDayNum > 31 || !card) {
        setSubmitError("Please fill in all fields correctly (Days must be between 1 and 31).");
        return;
    }
    if (isSubmitting || isDeleting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('[EditCardDialog] Calling storage.updateCard...');
      await storage.updateCard(card.id, { // Await the async operation
        name,
        statementDay: statementDayNum,
        dueDay: dueDayNum
      });
      console.log('[EditCardDialog] storage.updateCard succeeded.');

      // --- Invalidate the 'cards' query ---
      console.log('[EditCardDialog] Invalidating cards query...');
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      console.log('[EditCardDialog] Query invalidated.');

      // REMOVED: window.dispatchEvent(new Event('storage-changed'))
      onOpenChange?.(false); // Close dialog on success

    } catch (error) {
        console.error('Error updating card:', error);
        setSubmitError(error instanceof Error ? error.message : 'Failed to save changes.');
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleDelete = async () => { // Make async
    if (!card || isDeleting || isSubmitting) return;

    setIsDeleting(true);
    setSubmitError(null);

    try {
        console.log('[EditCardDialog] Calling storage.deleteCard...');
        await storage.deleteCard(card.id); // Await the async operation
        console.log('[EditCardDialog] storage.deleteCard succeeded.');

        // --- Invalidate the 'cards' query ---
        console.log('[EditCardDialog] Invalidating cards query after delete...');
        queryClient.invalidateQueries({ queryKey: ['cards'] });
        // --- ALSO Invalidate 'transactions' as they might be affected ---
        // (Consider if deleting a card also deletes its transactions in your backend)
        // If so, invalidating transactions is crucial. If not, it might be optional.
        console.log('[EditCardDialog] Invalidating transactions query after card delete...');
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        console.log('[EditCardDialog] Queries invalidated after delete.');


        // REMOVED: window.dispatchEvent(new Event('storage-changed'))

        setShowDeleteAlert(false); // Close confirmation
        onOpenChange?.(false); // Close main dialog
        onDelete?.(); // Optional callback

    } catch(error) {
        console.error('Error deleting card:', error);
        setSubmitError(error instanceof Error ? error.message : 'Failed to delete card.');
        setShowDeleteAlert(false); // Close alert even on error to show message
    } finally {
        setIsDeleting(false);
    }
  }

  if (!card) return null; // Don't render if no card is provided

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
         if (!isOpen) { // Reset error on close
            setSubmitError(null);
         }
         onOpenChange?.(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Edit your credit card details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
             {/* Disable form fields during async operations */}
            <fieldset disabled={isSubmitting || isDeleting}>
                <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="edit-card-name">Card Name</Label>
                    <Input
                    id="edit-card-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Visa Platinum"
                    required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit-card-statementDay">Statement Day</Label>
                    <Input
                    id="edit-card-statementDay"
                    type="number"
                    min="1"
                    max="31"
                    value={statementDay}
                    onChange={(e) => setStatementDay(e.target.value)}
                    placeholder="e.g. 15"
                    required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit-card-dueDay">Due Day</Label>
                    <Input
                    id="edit-card-dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    placeholder="e.g. 5"
                    required
                    />
                </div>
                </div>
            </fieldset>
             {/* Display Error */}
             {submitError && (
                <p className="text-sm text-red-600 mb-4 px-1">{submitError}</p>
             )}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
                disabled={isSubmitting || isDeleting} // Disable if saving/deleting
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {/* Updated description to be more general */}
              This will permanently delete this card. This action cannot be undone. Please ensure associated transactions are handled appropriately if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting} // Disable while deleting
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