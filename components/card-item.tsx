"use client"

import { useState, useMemo } from "react"
import { useQuery } from '@tanstack/react-query'
import { Card as CardType, Transaction } from "@/lib/storage"
import { storage } from "@/lib/storage" // Keep storage import for queryFn
import { formatCurrency } from "@/lib/currency" // Keep your currency formatter
import { cn } from "@/lib/utils" // Import cn
import { Button } from "@/components/ui/button"
import { EditCardDialog } from "./edit-card-dialog"
import { Pencil, CreditCardIcon, Calendar } from "lucide-react" // Import new icons + Pencil

interface CardItemProps {
  card: CardType
  transactions?: Transaction[]
  onDelete?: () => void
  className?: string
}

export function CardItem({ card, transactions = [], onDelete, className }: CardItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Calculate balance from filtered transactions
  const balance = useMemo(() => {
    return transactions.reduce((sum, t) => {
      return sum + (typeof t.vndAmount === 'number' && !isNaN(t.vndAmount) ? t.vndAmount : 0);
    }, 0);
  }, [transactions]);

  // --- UI Derivations ---
  const variant = balance === 0 ? "zero" : "default";
  const formattedBalance = formatCurrency(balance, "VND");

  return (
    <>
      {/* --- New UI Structure (from desired CreditCard) --- */}
      {/* Add 'group' class for edit button hover effect */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md group", // Added group class
          variant === "default"
            ? "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20" // Using primary for default as in desired UI
            : "bg-gradient-to-br from-muted/30 to-muted/10 border-muted/30", // Adjusted zero variant slightly (using muted instead of primary/secondary)
            // Alternative zero variant: "bg-gradient-to-br from-primary/10 to-secondary/20 border-primary/10",
          className, // Pass through className prop
        )}
      >
        {/* Top Section: Name, Edit Button, Icon */}
        <div className="mb-4 flex items-start justify-between"> {/* items-start to align tops */}
          {/* Keep name and edit button together */}
           <div className="flex items-center gap-2">
             <h3 className="font-semibold">{card.name}</h3>
             {/* Edit Button (Preserved) - Place it near the title */}
             <Button
               variant="ghost"
               size="icon"
               className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" // Slightly smaller, uses group hover
               onClick={() => setIsEditOpen(true)}
               aria-label={`Edit ${card.name}`}
             >
               <Pencil className="h-4 w-4" />
             </Button>
           </div>
          {/* Icon (from desired UI) */}
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
            <CreditCardIcon className={cn("h-5 w-5", variant === "default" ? "text-primary" : "text-primary/80")} />
          </div>
        </div>

        {/* Middle Section: Statement/Due Dates (from desired UI) */}
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"> {/* Added flex-wrap and gap control */}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Statement: Day {card.statementDay}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Due: Day {card.dueDay}</span>
          </div>
        </div>

        {/* Bottom Section: Balance (from desired UI) */}
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Current Balance</span>
          {/* Use calculated & formatted balance, respect variant styling */}
          <span className={cn("text-2xl font-bold", variant === "zero" ? "text-muted-foreground" : "")}>
            {formattedBalance}
          </span>
        </div>

        {/* Decorative elements (from desired UI) */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5" />
        <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-primary/5" />
        <div className="absolute bottom-12 right-12 h-16 w-16 rounded-full bg-primary/10" />
      </div>

      {/* --- Existing Edit Dialog (Preserved) --- */}
      <EditCardDialog
        card={card}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onDelete={onDelete} // Pass onDelete through
      />
    </>
  )
}