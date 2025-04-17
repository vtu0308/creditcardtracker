import { useState, useEffect } from "react"
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
  onDelete?: () => void
}

export function EditCardDialog({ card, open, onOpenChange, onDelete }: EditCardDialogProps) {
  const [name, setName] = useState("")
  const [statementDay, setStatementDay] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  // Load card data when dialog opens
  useEffect(() => {
    if (card && open) {
      setName(card.name)
      setStatementDay(card.statementDay.toString())
      setDueDay(card.dueDay.toString())
    }
  }, [card, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && statementDay && dueDay && card) {
      storage.updateCard(card.id, {
        name,
        statementDay: parseInt(statementDay),
        dueDay: parseInt(dueDay)
      })
      // Dispatch storage-changed event
      window.dispatchEvent(new Event('storage-changed'))
      onOpenChange?.(false)
    }
  }

  const handleDelete = () => {
    if (card) {
      storage.deleteCard(card.id)
      // Dispatch storage-changed event
      window.dispatchEvent(new Event('storage-changed'))
      setShowDeleteAlert(false)
      onOpenChange?.(false)
      onDelete?.()
    }
  }

  if (!card) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Edit your credit card details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Card Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Visa Platinum"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statementDay">Statement Day</Label>
                <Input
                  id="statementDay"
                  type="number"
                  min="1"
                  max="31"
                  value={statementDay}
                  onChange={(e) => setStatementDay(e.target.value)}
                  placeholder="e.g. 15"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDay">Due Day</Label>
                <Input
                  id="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  placeholder="e.g. 5"
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
              <Button type="submit">
                Save Changes
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
              This will permanently delete this card and all its associated transactions. This action cannot be undone.
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