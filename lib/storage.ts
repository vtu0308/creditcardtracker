// Types for our data models

// Types for date filtering
export type DatePeriod = 'today' | 'current-week' | 'current-month' | 'last-month' | 'last-3-months';

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
  async getTransactions(period?: DatePeriod): Promise<Transaction[]> {
    let query = supabase.from('transactions').select('*');
    
    if (period) {
      const now = new Date();
      switch (period) {
        case 'today': {
          const today = now.toISOString().split('T')[0];
          query = query.eq('date', today);
          break;
        }
        case 'current-week': {
          // Get Monday of current week
          const monday = new Date(now);
          monday.setDate(now.getDate() - now.getDay() + 1);
          // Get Sunday
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          
          query = query
            .gte('date', monday.toISOString().split('T')[0])
            .lte('date', sunday.toISOString().split('T')[0]);
          break;
        }
        case 'current-month': {
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          
          query = query
            .gte('date', firstDay.toISOString().split('T')[0])
            .lte('date', lastDay.toISOString().split('T')[0]);
          break;
        }
        case 'last-month': {
          const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
          
          query = query
            .gte('date', firstDay.toISOString().split('T')[0])
            .lte('date', lastDay.toISOString().split('T')[0]);
          break;
        }
      }
    }
    
    const { data, error } = await query.order('date', { ascending: false });
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

  async getCardBalance(cardId: string): Promise<number> {
    const { data, error } = await supabase.from('transactions').select('vndAmount').eq('cardId', cardId);
    if (error) throw error;
    return (data || []).reduce((sum: number, t: { vndAmount: number }) => sum + (t.vndAmount || 0), 0);
  },

  getDateRangeFromPeriod(period: DatePeriod, nowInstance: Date = new Date()): { from: string, to: string } {
    // Helper functions for date manipulation
    const setStartOfDay = (date: Date): Date => {
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const setEndOfDay = (date: Date): Date => {
      date.setHours(23, 59, 59, 999);
      return date;
    };

    const formatDate = (date: Date): string => {
      // Ensure we're working with the local date
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };
    const now = new Date(nowInstance); // Use a copy to avoid modifying the original if passed
    let fromDate, toDate;

    switch (period) {
      case 'today':
        fromDate = setStartOfDay(new Date(now));
        toDate = setEndOfDay(new Date(now));
        break;
      case 'current-week':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        setStartOfDay(fromDate);
        toDate = new Date(fromDate);
        toDate.setDate(fromDate.getDate() + 6);
        setEndOfDay(toDate);
        break;
      case 'current-month':
        fromDate = setStartOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        toDate = setEndOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        break;
      case 'last-month':
        fromDate = setStartOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        toDate = setEndOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
        break;
      case 'last-3-months':
        fromDate = setStartOfDay(new Date(now.getFullYear(), now.getMonth() - 3, 1));
        toDate = setEndOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
        break;
      default:
        // Should not happen with DatePeriod type, but as a fallback:
        throw new Error(`Invalid period: ${period}`);
    }

    // formatDate is now defined at the top of the function
    return {
      from: formatDate(fromDate),
      to: formatDate(toDate),
    };
  }
};


export default storage;
