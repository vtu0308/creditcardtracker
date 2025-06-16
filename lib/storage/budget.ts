// Supabase DAL for *one* personal-use budget row
import { supabase } from '@/lib/supabaseClient';
import type { Budget } from '@/lib/types/budget';

/* ---------------- read ------------------------------------------------- */
export async function getBudget(): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('budgets')
    // newest → oldest, so the latest row wins even if duplicates exist
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  // PGRST116 = "0 rows" - this is normal when no budget exists yet
  if (error?.code === 'PGRST116') return null;
  
  if (error) {
    console.error('[storage/budget] getBudget error', error);
    throw error;
  }

  return data
    ? {
        id: data.id,
        enabled: data.enabled,
        monthlyAmount: Number(data.monthly_amount),
        statementCardId: data.statement_card_id ?? '',
        lastUpdated: data.updated_at,
      }
    : null;
}

/* ---------------- write ------------------------------------------------ */
export async function setBudget(b: Budget): Promise<void> {
  const now = new Date().toISOString();
  const payload = {
    enabled: b.enabled,
    monthly_amount: b.monthlyAmount,
    statement_card_id: b.statementCardId || null,
    updated_at: now,
  };

  // Try to update existing budget first
  const current = await getBudget();
  if (current?.id) {
    const { error } = await supabase
      .from('budgets')
      .update(payload)
      .eq('id', current.id);

    if (error) {
      console.error('[storage/budget] setBudget update error', error);
      throw error;
    }
    return;
  }

  // If no budget exists, create a new one
  const { error } = await supabase
    .from('budgets')
    .insert({
      ...payload,
      created_at: now,
    })

  if (error) {
    console.error('[storage/budget] setBudget error', error);
    throw error;
  }
}

/* ---------------- clear (debug helper) --------------------------------- */
export async function clearBudget() {
  const { error } = await supabase.from('budgets').delete().not('id', 'is', null);
  if (error) console.error('[storage/budget] clearBudget error', error);
}
