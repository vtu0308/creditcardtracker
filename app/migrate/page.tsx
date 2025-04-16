'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { storage } from '@/lib/storage-client'
import { useRouter } from 'next/navigation'

interface LocalStorageData {
  cards: any[]
  categories: any[]
  transactions: any[]
}

export default function MigratePage() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const migrateData = async () => {
    setIsMigrating(true)
    setError(null)
    
    try {
      // Get all data from localStorage
      const localData: LocalStorageData = {
        cards: JSON.parse(localStorage.getItem('cards') || '[]'),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]')
      }

      // Migrate categories first (they have no dependencies)
      for (const category of localData.categories) {
        await storage.addCategory({
          name: category.name
        })
      }

      // Migrate cards
      for (const card of localData.cards) {
        await storage.addCard({
          name: card.name,
          statementDay: card.statementDay,
          dueDay: card.dueDay
        })
      }

      // Get the newly created cards and categories to map IDs
      const newCards = await storage.getCards()
      const newCategories = await storage.getCategories()

      // Create ID mapping for cards and categories
      const cardIdMap = new Map(localData.cards.map((oldCard: any, index: number) => [oldCard.id, newCards[index].id]))
      const categoryIdMap = new Map(localData.categories.map((oldCat: any, index: number) => [oldCat.id, newCategories[index].id]))

      // Migrate transactions with the new IDs
      for (const transaction of localData.transactions) {
        await storage.addTransaction({
          description: transaction.description,
          amount: transaction.amount,
          vndAmount: transaction.vndAmount,
          date: transaction.date,
          cardId: cardIdMap.get(transaction.cardId) || '',
          categoryId: categoryIdMap.get(transaction.categoryId) || ''
        })
      }
      
      // Clear localStorage after successful migration
      localStorage.clear()
      
      // Redirect to home page
      router.push('/')
    } catch (err) {
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

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 