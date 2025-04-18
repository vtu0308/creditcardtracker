"use client"

import { useState, useEffect } from "react"
import { storage, Card } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddCardDialog } from "@/components/add-card-dialog"
import { CardItem } from "@/components/card-item"

export default function CardsPage() {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    const loadCards = async () => {
      const cards = await storage.getCards();
      setCards(cards);
    };

    loadCards();
    // Subscribe to storage changes
    window.addEventListener('storage-changed', loadCards);
    return () => window.removeEventListener('storage-changed', loadCards);
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cards</h1>
          <p className="text-muted-foreground">
            View and manage your credit cards
          </p>
        </div>
        <Button onClick={() => setIsAddCardOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <CardItem 
            key={card.id} 
            card={card} 
            onDelete={async () => {
              const cards = await storage.getCards();
              setCards(cards);
            }}
          />
        ))}
      </div>

      <AddCardDialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen} />
    </div>
  )
}
