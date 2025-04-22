export interface Card {
  id: string
  name: string
  statementDay: number
  dueDay: number
}

export interface Category {
  id: string
  name: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  vndAmount?: number
  date: string
  cardId: string
  categoryId: string
  card?: Card
  category?: Category
}

class StorageClient {
  private baseUrl: string

  constructor() {
    // For local development, use empty string as base URL
    this.baseUrl = ''
  }

  // Cards
  async getCards(): Promise<Card[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cards`)
      if (!response.ok) throw new Error('Failed to fetch cards')
      const data = await response.json()
      console.log('Fetched cards:', data)
      return data
    } catch (error) {
      console.error('Error fetching cards:', error)
      throw error
    }
  }

  async addCard(card: Omit<Card, 'id'>): Promise<Card> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card)
      })
      if (!response.ok) throw new Error('Failed to add card')
      return response.json()
    } catch (error) {
      console.error('Error adding card:', error)
      throw error
    }
  }

  async deleteCard(id: string): Promise<Card> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cards?id=${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete card')
      return response.json()
    } catch (error) {
      console.error('Error deleting card:', error)
      throw error
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories`)
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      console.log('Fetched categories:', data)
      return data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      })
      if (!response.ok) throw new Error('Failed to add category')
      return response.json()
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  async deleteCategory(id: string): Promise<Category> {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories?id=${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete category')
      return response.json()
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/transactions`)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data = await response.json()
      console.log('Fetched transactions:', data)
      return data
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'card' | 'category'>): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      })
      if (!response.ok) throw new Error('Failed to add transaction')
      return response.json()
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  async deleteTransaction(id: string): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/api/transactions?id=${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete transaction')
      return response.json()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }
}

export const storage = new StorageClient()
export default storage 