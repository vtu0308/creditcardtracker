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
  vndAmount: number  // Amount in VND after conversion
  createdAt: string
  updatedAt: string
  cardId: string
  cardName: string
  categoryId: string
  categoryName: string
}

// Currency conversion configuration
const SUPPORTED_CURRENCIES = ['VND', 'USD', 'EUR', 'JPY', 'SGD'] as const
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]

export const isSupportedCurrency = (currency: string): currency is SupportedCurrency => {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)
}

import { supabase } from './supabaseClient';

export const storage = {
  // Cards
  async getCards(): Promise<Card[]> {
    const { data, error } = await supabase.from('cards').select('*').order('createdAt', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async setCards(cards: Card[]): Promise<void> {
    const { error } = await supabase.from('cards').upsert(cards, { onConflict: 'id' });
    if (error) throw error;
  },
  async addCard(card: Omit<Card, "id" | "createdAt" | "updatedAt">): Promise<Card> {
    const now = new Date().toISOString();
    const insert = { ...card, createdAt: now, updatedAt: now };
    const { data, error } = await supabase.from('cards').insert([insert]).select().single();
    if (error) throw error;
    return data;
  },
  async updateCard(id: string, data: Partial<Omit<Card, "id" | "createdAt" | "updatedAt">>): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase.from('cards').update({ ...data, updatedAt: now }).eq('id', id);
    if (error) throw error;
  },
  async deleteCard(id: string): Promise<void> {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) throw error;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*').order('createdAt', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async setCategories(categories: Category[]): Promise<void> {
    const { error } = await supabase.from('categories').upsert(categories, { onConflict: 'id' });
    if (error) throw error;
  },
  async addCategory(name: string): Promise<Category> {
    const now = new Date().toISOString();
    const insert = { name, createdAt: now, updatedAt: now };
    const { data, error } = await supabase.from('categories').insert([insert]).select().single();
    if (error) throw error;
    return data;
  },
  async updateCategory(id: string, name: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase.from('categories').update({ name, updatedAt: now }).eq('id', id);
    if (error) throw error;
  },
  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async setTransactions(transactions: Transaction[]): Promise<void> {
    const { error } = await supabase.from('transactions').upsert(transactions, { onConflict: 'id' });
    if (error) throw error;
  },
  async addTransaction(transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> {
    const now = new Date().toISOString();
    const insert = { ...transaction, createdAt: now, updatedAt: now };
    const { data, error } = await supabase.from('transactions').insert([insert]).select().single();
    if (error) throw error;
    return data;
  },
  async updateTransaction(id: string, data: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase.from('transactions').update({ ...data, updatedAt: now }).eq('id', id);
    if (error) throw error;
  },
  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },

  // Helpers
  getDateRangeFromPeriod(period: string): { from: Date, to: Date } {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (period) {
      case 'today':
        return { from: startOfDay, to: endOfDay };
      case 'current-week': {
        const firstDay = new Date(now);
        firstDay.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        firstDay.setHours(0, 0, 0, 0);
        const lastDay = new Date(now);
        lastDay.setDate(now.getDate() + (6 - now.getDay())); // End of week (Saturday)
        lastDay.setHours(23, 59, 59, 999);
        return { from: firstDay, to: lastDay };
      }
      case 'current-month': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return { from: firstDay, to: lastDay };
      }
      case 'last-month': {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return { from: firstDay, to: lastDay };
      }
      default:
        return { from: startOfDay, to: endOfDay };
    }
  },

  async getCardBalance(cardId: string): Promise<number> {
    const { data, error } = await supabase.from('transactions').select('vndAmount').eq('cardId', cardId);
    if (error) throw error;
    return (data || []).reduce((sum: number, t: { vndAmount: number }) => sum + (t.vndAmount || 0), 0);
  }
};


export default storage;
