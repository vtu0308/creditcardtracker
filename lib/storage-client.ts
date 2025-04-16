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
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  }

  // Cards
  async getCards(): Promise<Card[]> {
    const response = await fetch(`${this.baseUrl}/api/cards`)
    if (!response.ok) throw new Error('Failed to fetch cards')
    return response.json()
  }

  async addCard(card: Omit<Card, 'id'>): Promise<Card> {
    const response = await fetch(`${this.baseUrl}/api/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    })
    if (!response.ok) throw new Error('Failed to add card')
    return response.json()
  }

  async deleteCard(id: string): Promise<Card> {
    const response = await fetch(`${this.baseUrl}/api/cards?id=${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete card')
    return response.json()
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/api/categories`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    })
    if (!response.ok) throw new Error('Failed to add category')
    return response.json()
  }

  async deleteCategory(id: string): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/api/categories?id=${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete category')
    return response.json()
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${this.baseUrl}/api/transactions`)
    if (!response.ok) throw new Error('Failed to fetch transactions')
    return response.json()
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'card' | 'category'>): Promise<Transaction> {
    const response = await fetch(`${this.baseUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    })
    if (!response.ok) throw new Error('Failed to add transaction')
    return response.json()
  }

  async deleteTransaction(id: string): Promise<Transaction> {
    const response = await fetch(`${this.baseUrl}/api/transactions?id=${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete transaction')
    return response.json()
  }
}

export const storage = new StorageClient()
export default storage 