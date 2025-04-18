"use client"

import { useState, useEffect } from "react"
import { Card as CardType, storage } from "@/lib/storage"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditCardDialog } from "./edit-card-dialog"
import { Pencil } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface CardItemProps {
  card: CardType
  onDelete?: () => void
}

export function CardItem({ card, onDelete }: CardItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const updateBalance = async () => {
      const bal = await storage.getCardBalance(card.id);
      setBalance(bal);
    };

    updateBalance();
    window.addEventListener('storage-changed', updateBalance);
    return () => window.removeEventListener('storage-changed', updateBalance);
  }, [card.id]);

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm group">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{card.name}</CardTitle>
          <CardDescription>
            Statement: Day {card.statementDay} • Due: Day {card.dueDay}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <p className="font-medium text-[#6E4555]">{card.name}</p>
            <div className="flex items-center text-sm text-[#6E4555]/70">
              <span>Statement Day: {card.statementDay}</span>
              <span className="mx-2">•</span>
              <span>Due Day: {card.dueDay}</span>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <p className="text-sm text-[#6E4555]/70">Current Balance</p>
              <p className="font-medium text-[#6E4555]">
                {formatCurrency(balance, "VND")}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditCardDialog
        card={card}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onDelete={onDelete}
      />
    </>
  )
} 