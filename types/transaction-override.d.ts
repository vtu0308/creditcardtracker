// This file overrides the Transaction type to use string for date fields for frontend type safety.

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  vndAmount: number | null;
  date: string; // ISO string
  cardId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  name: string;
  // ...add other fields as needed
}

export interface Category {
  id: string;
  name: string;
  // ...add other fields as needed
}
