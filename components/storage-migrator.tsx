'use client'

import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { storage } from '@/lib/storage-client'

interface LocalStorageData {
  cards: any[]
  categories: any[]
  transactions: any[]
}

export function StorageMigrator() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const migrateData = async () => {
    setIsMigrating(true)
    setError(null)
    
    try {
      // Get all data from localStorage with proper initialization
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

      setIsComplete(true)
      
      // Clear localStorage after successful migration
      localStorage.clear()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to migrate data')
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg border">
      <h3 className="font-semibold mb-2">Data Migration</h3>
      {!isComplete ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Click below to migrate your data from local storage to the database
          </p>
          <Button 
            onClick={migrateData} 
            disabled={isMigrating}
          >
            {isMigrating ? 'Migrating...' : 'Start Migration'}
          </Button>
        </>
      ) : (
        <p className="text-sm text-green-600">Migration complete!</p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
} 