"use client"

import { useState } from "react"
import { AddCardDialog } from "@/components/add-card-dialog"
import { CardItem } from "@/components/card-item"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { storage } from "@/lib/storage"

export default function CardsPage() {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cards</h1>
          <p className="text-muted-foreground">
            Manage your credit cards and their statement cycles.
          </p>
        </div>
        <Button onClick={() => setIsAddCardOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>
      <div className="grid gap-4">
        {storage.getCards().map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
      <AddCardDialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen} />
    </div>
  )
}
