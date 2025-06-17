"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from '@tanstack/react-query'
import { storage, Card as CardType } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast";

interface EditCardDialogProps {
  card: CardType | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onDelete?: () => void // Optional callback
}

export function EditCardDialog({ card, open, onOpenChange, onDelete }: EditCardDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Get query client instance
  const [name, setName] = useState("")
  const [statementDay, setStatementDay] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false); // State for save operation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null); // State for errors

  // Load card data when dialog opens or card changes
  useEffect(() => {
    if (card && open) {
      setName(card.name || "")
      setStatementDay(card.statementDay?.toString() || "")
      setDueDay(card.dueDay?.toString() || "")
      setSubmitError(null); // Clear errors on open/change
      setIsSubmitting(false);
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
    if (isSubmitting) return;

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

      toast({
        title: "Card Updated",
        description: `Card \"${name}\" updated successfully.`,
      });
      if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onOpenChange?.(false); // Close dialog on success

    } catch (error) {
        console.error('Error updating card:', error);
        setSubmitError(error instanceof Error ? error.message : 'Failed to save changes.');
        toast({
          variant: "destructive",
          title: "Error Updating Card",
          description: error instanceof Error ? error.message : 'Failed to save changes.',
        });
    } finally {
        setIsSubmitting(false);
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
            <fieldset disabled={isSubmitting}> {/* Disable form while submitting/deleting */}
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
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting} // Disable if saving/deleting
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

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Card"
        description="This will permanently delete this card. This action cannot be undone. Please ensure associated transactions are handled appropriately if needed."
        onConfirm={async () => {
          if (!card) return;
          await storage.deleteCard(card.id);
          await queryClient.invalidateQueries({ queryKey: ['cards'] });
          // Also invalidate transactions as they might be affected
          await queryClient.invalidateQueries({ queryKey: ['transactions'] });
          toast({
            title: "Card Deleted",
            description: `Card "${name}" has been deleted.`,
          });
          onOpenChange?.(false);
          onDelete?.();
        }}
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </>
  )
}