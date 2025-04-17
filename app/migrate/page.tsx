'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { storage } from '@/lib/storage'
import { useRouter } from 'next/navigation'

export default function MigratePage() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])
  const router = useRouter()

  const addLog = (message: string) => {
    setLog(prev => [...prev, message])
    console.log(message)
  }

  const migrateData = async () => {
    setIsMigrating(true)
    setError(null)
    setLog([])
    
    try {
      // Get all data from localStorage
      const localCards = storage.getCards()
      const localCategories = storage.getCategories()
      const localTransactions = storage.getTransactions()

      addLog(`Found ${localCards.length} cards to migrate`)
      addLog(`Found ${localCategories.length} categories to migrate`)
      addLog(`Found ${localTransactions.length} transactions to migrate`)

      // Migrate categories first (they have no dependencies)
      for (const category of localCategories) {
        try {
          const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: category.name })
          })
          if (!response.ok) throw new Error(`Failed to create category ${category.name}`)
          addLog(`✓ Migrated category: ${category.name}`)
        } catch (err) {
          addLog(`✗ Failed to migrate category: ${category.name}`)
          throw err
        }
      }

      // Get newly created categories for ID mapping
      const newCategoriesResponse = await fetch('/api/categories')
      if (!newCategoriesResponse.ok) throw new Error('Failed to fetch new categories')
      const newCategories = await newCategoriesResponse.json()
      addLog(`Retrieved ${newCategories.length} migrated categories`)

      // Create category ID mapping
      const categoryIdMap = new Map(
        localCategories.map((oldCat, index) => [oldCat.id, newCategories[index].id])
      )

      // Migrate cards
      for (const card of localCards) {
        try {
          const response = await fetch('/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: card.name,
              statementDay: card.statementDay,
              dueDay: card.dueDay
            })
          })
          if (!response.ok) throw new Error(`Failed to create card ${card.name}`)
          addLog(`✓ Migrated card: ${card.name}`)
        } catch (err) {
          addLog(`✗ Failed to migrate card: ${card.name}`)
          throw err
        }
      }

      // Get newly created cards for ID mapping
      const newCardsResponse = await fetch('/api/cards')
      if (!newCardsResponse.ok) throw new Error('Failed to fetch new cards')
      const newCards = await newCardsResponse.json()
      addLog(`Retrieved ${newCards.length} migrated cards`)

      // Create card ID mapping
      const cardIdMap = new Map(
        localCards.map((oldCard, index) => [oldCard.id, newCards[index].id])
      )

      // Migrate transactions
      for (const transaction of localTransactions) {
        try {
          const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description: transaction.description,
              amount: transaction.amount,
              vndAmount: transaction.vndAmount,
              date: transaction.date,
              cardId: cardIdMap.get(transaction.cardId) || '',
              categoryId: categoryIdMap.get(transaction.categoryId) || ''
            })
          })
          if (!response.ok) throw new Error(`Failed to create transaction ${transaction.description}`)
          addLog(`✓ Migrated transaction: ${transaction.description}`)
        } catch (err) {
          addLog(`✗ Failed to migrate transaction: ${transaction.description}`)
          throw err
        }
      }

      addLog('Migration completed successfully!')
      localStorage.clear()
      
      // Wait a moment before redirecting to ensure user sees success message
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      console.error('Migration error:', err)
      setError(err instanceof Error ? err.message : 'Failed to migrate data')
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="container py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Data Migration</CardTitle>
          <CardDescription>
            Migrate your data from local storage to the database. This process will:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>Transfer all your cards, categories, and transactions to the database</li>
              <li>Maintain all relationships between your data</li>
              <li>Clear the local storage after successful migration</li>
              <li>Redirect you to the dashboard when complete</li>
            </ul>
            
            <div className="pt-4">
              <Button 
                onClick={migrateData} 
                disabled={isMigrating}
                className="w-full"
              >
                {isMigrating ? 'Migrating...' : 'Start Migration'}
              </Button>
            </div>

            {log.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-1">
                <div className="font-medium mb-2">Migration Log:</div>
                {log.map((message, i) => (
                  <div key={i} className="text-sm font-mono">
                    {message}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 