"use client"

import { useState, useMemo } from "react" // Removed useEffect, added useMemo
import { useQuery } from '@tanstack/react-query' // Added useQuery
import { Card as CardType, Transaction } from "@/lib/storage" // Import Transaction type
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditCardDialog } from "./edit-card-dialog"
import { Pencil } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { storage } from "@/lib/storage" // Keep storage import for queryFn

interface CardItemProps {
  card: CardType
  onDelete?: () => void // Keep onDelete if EditCardDialog needs it
}

export function CardItem({ card, onDelete }: CardItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  // REMOVED: useState for balance

  // --- Fetch ALL Transactions using useQuery ---
  // This component now also listens to the shared transaction data
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions, // We might show a loading state for balance
    // isError: isErrorTransactions, // Optionally handle transaction fetch errors
  } = useQuery<Transaction[]>({
    queryKey: ['transactions'], // Use the same key as other components
    queryFn: storage.getTransactions,
  });

  // REMOVED: useEffect for balance fetching and event listener

  // --- Calculate Balance using useMemo ---
  // This recalculates efficiently only when transactions or card.id change
  const balance = useMemo(() => {
    console.log(`[CardItem ${card.name}] Recalculating balance...`); // Debug log
    // Filter transactions for THIS specific card
    const cardTransactions = transactions.filter(t => t.cardId === card.id);
    // Sum the vndAmount for these transactions
    const calculatedBalance = cardTransactions.reduce((sum, t) => {
        return sum + (typeof t.vndAmount === 'number' && !isNaN(t.vndAmount) ? t.vndAmount : 0);
    }, 0);
    return calculatedBalance;
  }, [transactions, card.id]); // Dependencies: all transactions and the specific card ID


  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm group transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{card.name}</CardTitle>
          <CardDescription>
            Statement: Day {card.statementDay} • Due: Day {card.dueDay}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-4 pt-0"> {/* Adjusted padding */}
          {/* Removed redundant card details as they are in header */}
          <div className="flex-grow"></div> {/* Pushes balance/edit to the right */}
          <div className="flex items-center gap-2"> {/* Use items-center for vertical alignment */}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Current Balance</p> {/* Use muted-foreground */}
              <p className="font-semibold text-lg text-foreground"> {/* Use foreground color */}
                {/* Show '...' while transactions are loading */}
                {isLoadingTransactions ? '...' : formatCurrency(balance, "VND")}
              </p>
            </div>
            {/* Edit Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" // Adjust size, ensure visibility on hover
              onClick={() => setIsEditOpen(true)}
              aria-label={`Edit ${card.name}`} // Accessibility
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog remains the same, controlled by local state */}
      <EditCardDialog
        card={card}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onDelete={onDelete} // Pass onDelete through if needed by EditCardDialog
      />
    </>
  )
}