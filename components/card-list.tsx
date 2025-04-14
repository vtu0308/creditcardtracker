"use client"

import { useEffect, useState } from "react"
import { Card } from "@/lib/storage"
import { storage } from "@/lib/storage"
import { AddCardDialog } from "@/components/add-card-dialog"
import { CardItem } from "@/components/card-item"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function CardList() {
  const [cards, setCards] = useState<Card[]>([])
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)

  useEffect(() => {
    const loadCards = () => {
      setCards(storage.getCards())
    }

    loadCards()
    // Subscribe to storage changes
    window.addEventListener('storage-changed', loadCards)
    return () => window.removeEventListener('storage-changed', loadCards)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Cards</h2>
        <Button onClick={() => setIsAddCardOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>
      <div className="grid gap-4">
        {cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
      <AddCardDialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen} />
    </div>
  )
}
