import { supabase } from './supabaseClient';

export type AssetType = 'cash' | 'savings' | 'etf' | 'stock' | 'custom';
export type LiabilityType = 'credit_card' | 'loan' | 'custom';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  customType?: string;
  amount: number;
  originalCurrency: string;
  vndAmount: number;
  bank?: string;
  interestRate?: number;
  termMonths?: number;
  symbol?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  customType?: string;
  amount: number;
  originalCurrency: string;
  vndAmount: number;
  bank?: string;
  interestRate?: number;
  includeCreditCard: boolean;
  creditCardId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetWorthSnapshot {
  id: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  createdAt: string;
}

export interface RecurringIncome {
  id: string;
  amount: number;
  originalCurrency: string;
  vndAmount: number;
  dayOfMonth: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const netWorthStorage = {
  // Assets
  async getAssets(): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('createdAt', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    const now = new Date().toISOString();
    const insert = { ...asset, createdAt: now, updatedAt: now };
    const { data, error } = await supabase
      .from('assets')
      .insert([insert])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAsset(
    id: string,
    data: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('assets')
      .update({ ...data, updatedAt: now })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) throw error;
  },

  // Liabilities
  async getLiabilities(): Promise<Liability[]> {
    const { data, error } = await supabase
      .from('liabilities')
      .select('*')
      .order('createdAt', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addLiability(liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>): Promise<Liability> {
    const now = new Date().toISOString();
    const insert = { ...liability, createdAt: now, updatedAt: now };
    const { data, error } = await supabase
      .from('liabilities')
      .insert([insert])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateLiability(
    id: string,
    data: Partial<Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('liabilities')
      .update({ ...data, updatedAt: now })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteLiability(id: string): Promise<void> {
    const { error } = await supabase.from('liabilities').delete().eq('id', id);
    if (error) throw error;
  },

  // Net Worth Snapshots
  async getNetWorthSnapshots(limit?: number): Promise<NetWorthSnapshot[]> {
    let query = supabase
      .from('net_worth_snapshots')
      .select('*')
      .order('date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async addNetWorthSnapshot(
    snapshot: Omit<NetWorthSnapshot, 'id' | 'createdAt' | 'netWorth'>
  ): Promise<NetWorthSnapshot> {
    const now = new Date().toISOString();
    const netWorth = snapshot.totalAssets - snapshot.totalLiabilities;
    const insert = { ...snapshot, netWorth, createdAt: now };

    const { data, error } = await supabase
      .from('net_worth_snapshots')
      .insert([insert])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateNetWorthSnapshot(
    snapshot: Omit<NetWorthSnapshot, 'createdAt'>
  ): Promise<NetWorthSnapshot> {
    const netWorth = snapshot.totalAssets - snapshot.totalLiabilities;
    const update = { ...snapshot, netWorth };

    const { data, error } = await supabase
      .from('net_worth_snapshots')
      .update(update)
      .eq('id', snapshot.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Recurring Income
  async getRecurringIncome(): Promise<RecurringIncome | null> {
    const { data, error } = await supabase
      .from('recurring_income')
      .select('*')
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  },

  async setRecurringIncome(
    income: Omit<RecurringIncome, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RecurringIncome> {
    const now = new Date().toISOString();
    // Delete any existing recurring income first (we only allow one per user)
    await supabase.from('recurring_income').delete().not('id', 'is', null);
    
    const insert = { ...income, createdAt: now, updatedAt: now };
    const { data, error } = await supabase
      .from('recurring_income')
      .insert([insert])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Helpers
  async calculateNetWorth(): Promise<{
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  }> {
    const [assets, liabilities] = await Promise.all([
      this.getAssets(),
      this.getLiabilities()
    ]);

    const totalAssets = assets.reduce((sum, asset) => sum + asset.vndAmount, 0);
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + liability.vndAmount,
      0
    );

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities
    };
  },

  async getAssetAllocation(): Promise<{ type: string; amount: number }[]> {
    const assets = await this.getAssets();
    const allocation = assets.reduce((acc, asset) => {
      const type = asset.customType || asset.type;
      acc[type] = (acc[type] || 0) + asset.vndAmount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(allocation).map(([type, amount]) => ({ type, amount }));
  }
};

export default netWorthStorage;
