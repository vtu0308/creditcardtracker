"use client"

import { useState } from "react"
import { useQueryClient } from '@tanstack/react-query' // Import hook
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddCardDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddCardDialog({ open, onOpenChange }: AddCardDialogProps) {
  const queryClient = useQueryClient(); // Get query client instance
  const [name, setName] = useState("")
  const [statementDay, setStatementDay] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
  const [submitError, setSubmitError] = useState<string | null>(null); // Add error state

  const handleSubmit = async (e: React.FormEvent) => { // Make async
    e.preventDefault();
    // Basic validation
    const statementDayNum = parseInt(statementDay);
    const dueDayNum = parseInt(dueDay);

    if (!name || isNaN(statementDayNum) || isNaN(dueDayNum) || statementDayNum < 1 || statementDayNum > 31 || dueDayNum < 1 || dueDayNum > 31) {
       setSubmitError("Please fill in all fields correctly (Days must be between 1 and 31).");
       return;
    }
    if (isSubmitting) return; // Prevent double submit

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('[AddCardDialog] Calling storage.addCard...');
      await storage.addCard({ // Await the async operation
        name,
        statementDay: statementDayNum,
        dueDay: dueDayNum
      });
      console.log('[AddCardDialog] storage.addCard succeeded.');

      // --- Invalidate the 'cards' query ---
      console.log('[AddCardDialog] Invalidating cards query...');
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      console.log('[AddCardDialog] Query invalidated.');

      // REMOVED: window.dispatchEvent(new Event('storage-changed'))

      // Reset form and close dialog on success
      setName("");
      setStatementDay("");
      setDueDay("");
      onOpenChange?.(false);

    } catch (error) {
        console.error('Error adding card:', error);
        setSubmitError(error instanceof Error ? error.message : 'Failed to add card.');
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) { // Reset form/error on close
            setName("");
            setStatementDay("");
            setDueDay("");
            setSubmitError(null);
        }
        onOpenChange?.(isOpen);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Add a new credit card to track its expenses and statement cycle.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={isSubmitting}> {/* Disable form while submitting */}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-card-name">Card Name</Label>
                <Input
                  id="add-card-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Visa Platinum"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-card-statementDay">Statement Day</Label>
                <Input
                  id="add-card-statementDay"
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
                <Label htmlFor="add-card-dueDay">Due Day</Label>
                <Input
                  id="add-card-dueDay"
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
          {submitError && (
             <p className="text-sm text-red-600 mb-4 px-1">{submitError}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
               {isSubmitting ? "Adding..." : "Add Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}