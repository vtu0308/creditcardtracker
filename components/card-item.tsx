"use client"

import { Card as CardType } from "@/lib/storage"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface CardItemProps {
  card: CardType
}

export function CardItem({ card }: CardItemProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{card.name}</CardTitle>
        <CardDescription>
          Statement: Day {card.statementDay} • Due: Day {card.dueDay}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          }).format(storage.getCardBalance(card.id))}
        </div>
        <p className="text-xs text-muted-foreground">Current Balance</p>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="ghost" size="sm" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
} 