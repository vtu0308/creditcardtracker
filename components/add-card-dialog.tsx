"use client"

import { useState } from "react"
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
  const [name, setName] = useState("")
  const [statementDay, setStatementDay] = useState("")
  const [dueDay, setDueDay] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && statementDay && dueDay) {
      storage.addCard({
        name,
        statementDay: parseInt(statementDay),
        dueDay: parseInt(dueDay)
      })
      setName("")
      setStatementDay("")
      setDueDay("")
      onOpenChange?.(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Add a new credit card to track its expenses and statement cycle.
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
          <DialogFooter>
            <Button type="submit">Add Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
