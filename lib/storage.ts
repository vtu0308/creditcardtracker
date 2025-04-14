// Types for our data models
export interface Card {
  id: string
  name: string
  statementDay: number
  dueDay: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  currency: string
  vndAmount?: number
  createdAt: string
  updatedAt: string
  cardId: string
  cardName: string
  categoryId: string
  categoryName: string
}

// Helper function to safely parse JSON from localStorage
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue
  }

  const stored = localStorage.getItem(key)
  if (!stored) {
    return defaultValue
  }

  try {
    return JSON.parse(stored) as T
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Helper function to safely set JSON in localStorage
function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error)
  }
}

// Storage keys
const CARDS_KEY = "credit-tracker-cards"
const CATEGORIES_KEY = "credit-tracker-categories"
const TRANSACTIONS_KEY = "credit-tracker-transactions"

// Default data
const defaultCards: Card[] = [
  {
    id: "1",
    name: "Visa Platinum",
    statementDay: 15,
    dueDay: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Mastercard Gold",
    statementDay: 20,
    dueDay: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultCategories: Category[] = [
  { id: "1", name: "Food", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "2", name: "Food & Drink", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "3", name: "Shopping", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "4", name: "Transportation", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "5", name: "Entertainment", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "6", name: "Utilities", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const defaultTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date("2025-04-10").toISOString(),
    description: "Grocery Shopping",
    categoryId: "1",
    categoryName: "Food",
    amount: 850000,
    currency: "VND",
    cardId: "1",
    cardName: "Visa Platinum",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    date: new Date("2025-04-09").toISOString(),
    description: "Coffee Shop",
    categoryId: "2",
    categoryName: "Food & Drink",
    amount: 120000,
    currency: "VND",
    cardId: "2",
    cardName: "Mastercard Gold",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    date: new Date("2025-04-08").toISOString(),
    description: "Online Purchase",
    categoryId: "3",
    categoryName: "Shopping",
    amount: 1250000,
    currency: "VND",
    cardId: "1",
    cardName: "Visa Platinum",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Storage service
export const storage = {
  // Cards
  getCards: () => getStorageItem<Card[]>(CARDS_KEY, defaultCards),
  setCards: (cards: Card[]) => setStorageItem(CARDS_KEY, cards),
  addCard: (card: Omit<Card, "id" | "createdAt" | "updatedAt">) => {
    const cards = storage.getCards()
    const newCard: Card = {
      ...card,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    storage.setCards([...cards, newCard])
    return newCard
  },
  updateCard: (id: string, data: Partial<Omit<Card, "id" | "createdAt" | "updatedAt">>) => {
    const cards = storage.getCards()
    const updatedCards = cards.map((card) =>
      card.id === id ? { ...card, ...data, updatedAt: new Date().toISOString() } : card,
    )
    storage.setCards(updatedCards)
  },
  deleteCard: (id: string) => {
    const cards = storage.getCards()
    storage.setCards(cards.filter((card) => card.id !== id))
  },

  // Categories
  getCategories: () => getStorageItem<Category[]>(CATEGORIES_KEY, defaultCategories),
  setCategories: (categories: Category[]) => setStorageItem(CATEGORIES_KEY, categories),
  addCategory: (name: string) => {
    const categories = storage.getCategories()
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    storage.setCategories([...categories, newCategory])
    return newCategory
  },
  updateCategory: (id: string, name: string) => {
    const categories = storage.getCategories()
    const updatedCategories = categories.map((category) =>
      category.id === id ? { ...category, name, updatedAt: new Date().toISOString() } : category,
    )
    storage.setCategories(updatedCategories)

    // Update category name in transactions
    const transactions = storage.getTransactions()
    const updatedTransactions = transactions.map((transaction) =>
      transaction.categoryId === id
        ? { ...transaction, categoryName: name, updatedAt: new Date().toISOString() }
        : transaction,
    )
    storage.setTransactions(updatedTransactions)
  },
  deleteCategory: (id: string) => {
    const categories = storage.getCategories()
    storage.setCategories(categories.filter((category) => category.id !== id))

    // Update transactions with this category to "Uncategorized"
    const transactions = storage.getTransactions()
    const updatedTransactions = transactions.map((transaction) =>
      transaction.categoryId === id
        ? {
            ...transaction,
            categoryId: "uncategorized",
            categoryName: "Uncategorized",
            updatedAt: new Date().toISOString(),
          }
        : transaction,
    )
    storage.setTransactions(updatedTransactions)
  },

  // Transactions
  getTransactions: () => getStorageItem<Transaction[]>(TRANSACTIONS_KEY, defaultTransactions),
  setTransactions: (transactions: Transaction[]) => setStorageItem(TRANSACTIONS_KEY, transactions),
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
    const transactions = storage.getTransactions()
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    storage.setTransactions([newTransaction, ...transactions])
    return newTransaction
  },
  updateTransaction: (id: string, data: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>) => {
    const transactions = storage.getTransactions()
    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === id ? { ...transaction, ...data, updatedAt: new Date().toISOString() } : transaction,
    )
    storage.setTransactions(updatedTransactions)
  },
  deleteTransaction: (id: string) => {
    const transactions = storage.getTransactions()
    storage.setTransactions(transactions.filter((transaction) => transaction.id !== id))
  },

  // Helpers
  getCardBalance: (cardId: string) => {
    const transactions = storage.getTransactions()
    return transactions.filter((t) => t.cardId === cardId).reduce((sum, t) => sum + t.amount, 0)
  },

  // Initialize storage with default values if empty
  initialize: () => {
    if (typeof window === "undefined") {
      return
    }

    if (!localStorage.getItem(CARDS_KEY)) {
      storage.setCards(defaultCards)
    }

    if (!localStorage.getItem(CATEGORIES_KEY)) {
      storage.setCategories(defaultCategories)
    }

    if (!localStorage.getItem(TRANSACTIONS_KEY)) {
      storage.setTransactions(defaultTransactions)
    }
  },
}
