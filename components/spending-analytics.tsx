import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { storage } from "@/lib/storage"
import { formatCurrency } from "@/lib/currency"
import { Label } from "./ui/label"

interface SpendingAnalyticsProps {
  className?: string
}

interface CycleDate {
  start: Date
  end: Date
  label: string
}

export function SpendingAnalytics({ className }: SpendingAnalyticsProps) {
  const [selectedCard, setSelectedCard] = useState<string>("all")
  const [selectedCycle, setSelectedCycle] = useState<string>("")
  const [totalSpending, setTotalSpending] = useState<number>(0)
  const [cards, setCards] = useState<Array<{ id: string; name: string; statementDay: number }>>([])
  const [cycles, setCycles] = useState<CycleDate[]>([])

  // Load initial cards data
  useEffect(() => {
    const loadCards = async () => {
      const allCards = await storage.getCards();
      setCards(allCards);
    };

    loadCards();
    window.addEventListener('storage-changed', loadCards);
    return () => window.removeEventListener('storage-changed', loadCards);
  }, [])

  // Generate cycles based on statement day
  const generateCycles = (statementDay: number) => {
    const cycles: CycleDate[] = []
    const today = new Date()
    
    // First, add the current cycle
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Find the last statement day
    const lastStatementDay = new Date(currentYear, currentMonth, statementDay)
    if (currentDate > lastStatementDay) {
      // We're past the statement day, so current cycle is this month to next month
      const cycleStart = new Date(currentYear, currentMonth, statementDay + 1)
      const cycleEnd = new Date(currentYear, currentMonth + 1, statementDay)
      
      cycleStart.setHours(0, 0, 0, 0)
      cycleEnd.setHours(23, 59, 59, 999)
      
      cycles.push({
        start: cycleStart,
        end: cycleEnd,
        label: `Current Cycle: ${cycleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${cycleEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      })
    } else {
      // We haven't reached statement day, so current cycle is last month to this month
      const cycleStart = new Date(currentYear, currentMonth - 1, statementDay + 1)
      const cycleEnd = new Date(currentYear, currentMonth, statementDay)
      
      cycleStart.setHours(0, 0, 0, 0)
      cycleEnd.setHours(23, 59, 59, 999)
      
      cycles.push({
        start: cycleStart,
        end: cycleEnd,
        label: `Current Cycle: ${cycleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${cycleEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      })
    }
    
    // Then add past cycles
    for (let i = 0; i < 24; i++) {
      const cycleEnd = new Date(today.getFullYear(), today.getMonth() - i, statementDay)
      const cycleStart = new Date(cycleEnd.getFullYear(), cycleEnd.getMonth() - 1, statementDay + 1)
      
      // Skip if this is exactly the same as the current cycle
      if (cycles.length > 0) {
        const currentCycle = cycles[0]
        if (cycleStart.getTime() === currentCycle.start.getTime() && 
            cycleEnd.getTime() === currentCycle.end.getTime()) {
          continue
        }
      }
      
      // Ensure dates are at the start/end of the day
      cycleStart.setHours(0, 0, 0, 0)
      cycleEnd.setHours(23, 59, 59, 999)
      
      cycles.push({
        start: cycleStart,
        end: cycleEnd,
        label: `${cycleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${cycleEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      })
    }
    
    return cycles
  }

  // Update cycles when cards load or selected card changes
  useEffect(() => {
    if (cards.length === 0) return

    let statementDay: number
    if (selectedCard === "all") {
      // For "All Cards", use the first card's statement day
      statementDay = cards[0].statementDay
    } else {
      const selectedCardData = cards.find(card => card.id === selectedCard)
      statementDay = selectedCardData ? selectedCardData.statementDay : cards[0].statementDay
    }

    const newCycles = generateCycles(statementDay)
    setCycles(newCycles)

    // Set the current cycle as selected by default
    if (!selectedCycle && newCycles.length > 0) {
      setSelectedCycle(JSON.stringify({
        start: newCycles[0].start.toISOString(),
        end: newCycles[0].end.toISOString(),
        label: newCycles[0].label
      }))
    }
  }, [selectedCard, cards, selectedCycle])

  // Calculate total spending
  useEffect(() => {
    const calculateTotal = async () => {
      if (!selectedCycle) return;
      try {
        const transactions = await storage.getTransactions();
        const cycleData = JSON.parse(selectedCycle);
        const startDate = new Date(cycleData.start);
        const endDate = new Date(cycleData.end);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        const filteredTransactions = transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          transactionDate.setHours(0, 0, 0, 0);
          const isInDateRange = transactionDate >= startDate && transactionDate <= endDate;
          const matchesCard = selectedCard === "all" || transaction.cardId === selectedCard;
          return isInDateRange && matchesCard;
        });
        const total = filteredTransactions.reduce((sum, t) => {
          const amount = typeof t.vndAmount === 'number' ? t.vndAmount : 0;
          return sum + amount;
        }, 0);
        setTotalSpending(total);
      } catch (error) {
        console.error('Error calculating total spending:', error);
        setTotalSpending(0);
      }
    };
    calculateTotal();
    window.addEventListener('storage-changed', calculateTotal);
    return () => window.removeEventListener('storage-changed', calculateTotal);
  }, [selectedCard, selectedCycle]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Statement Cycle Deep Dive</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Label>Filter by Card</Label>
            <Select value={selectedCard} onValueChange={setSelectedCard}>
              <SelectTrigger id="card-filter">
                <SelectValue placeholder="All Cards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cards</SelectItem>
                {cards.map(card => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Filter by Statement Cycle</Label>
            <Select value={selectedCycle} onValueChange={setSelectedCycle}>
              <SelectTrigger id="cycle-filter">
                <SelectValue placeholder="Select a cycle" />
              </SelectTrigger>
              <SelectContent>
                {cycles.map((cycle, index) => (
                  <SelectItem 
                    key={index} 
                    value={JSON.stringify({
                      start: cycle.start.toISOString(),
                      end: cycle.end.toISOString(),
                      label: cycle.label
                    })}
                    className={cycle.label.startsWith('Current Cycle') ? 'font-medium text-pink-600' : ''}
                  >
                    {cycle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 space-y-4">
            <div className="text-sm text-muted-foreground">
              {selectedCycle && (
                <p>
                  Showing transactions for{' '}
                  {selectedCard === 'all' ? 'all cards' : cards.find(c => c.id === selectedCard)?.name}{' '}
                  from {new Date(JSON.parse(selectedCycle).start).toLocaleDateString()} to{' '}
                  {new Date(JSON.parse(selectedCycle).end).toLocaleDateString()}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Spending</h3>
              <p className="text-3xl font-bold text-pink-400">
                {formatCurrency(totalSpending || 0, "VND")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 