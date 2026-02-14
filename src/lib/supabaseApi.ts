import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';
import type { Customer, Transaction } from '../types';
import { TransactionType } from '../types';

const getUserId = (): string => {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) throw new Error('用户未登录');
  return userId;
};

export const supabaseApi = {
  async getCustomers(): Promise<Customer[]> {
    if (!supabase) return [];
    
    const userId = getUserId();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapCustomerFromSupabase) || [];
  },

  async addCustomer(customer: Customer): Promise<number> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const userId = getUserId();
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        ...this.mapCustomerToSupabase(customer),
        user_id: userId,
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const userId = getUserId();
    const { error } = await supabase
      .from('customers')
      .update(this.mapCustomerToSupabase(customer))
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getCustomerByName(name: string): Promise<Customer | undefined> {
    if (!supabase) return undefined;
    
    const userId = getUserId();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data ? this.mapCustomerFromSupabase(data) : undefined;
  },

  async getTransactions(): Promise<Transaction[]> {
    if (!supabase) return [];
    
    const userId = getUserId();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapTransactionFromSupabase) || [];
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<number> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const userId = getUserId();
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...this.mapTransactionToSupabase(transaction),
        user_id: userId,
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const userId = getUserId();
    const { error } = await supabase
      .from('transactions')
      .update(this.mapTransactionToSupabase(transaction))
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async deleteTransaction(id: number): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const userId = getUserId();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  mapCustomerToSupabase(customer: Partial<Customer>) {
    const mapped: Record<string, unknown> = {};

    if (customer.name !== undefined) mapped.name = customer.name;
    if (customer.phone !== undefined) mapped.phone = customer.phone || null;
    if (customer.creditLimit !== undefined) mapped.credit_limit = customer.creditLimit;
    if (customer.paymentTerm !== undefined) mapped.payment_term = customer.paymentTerm;

    return mapped;
  },

  mapCustomerFromSupabase(data: Record<string, unknown>): Customer {
    return {
      id: data.id as number,
      name: data.name as string,
      phone: data.phone as string | undefined,
      creditLimit: data.credit_limit as number,
      paymentTerm: data.payment_term as number,
      createdAt: data.created_at ? new Date(data.created_at as string) : undefined,
    };
  },

  mapTransactionToSupabase(transaction: Partial<Transaction>) {
    const mapped: Record<string, unknown> = {};

    if (transaction.customerId !== undefined) mapped.customer_id = transaction.customerId;
    if (transaction.type !== undefined) mapped.type = transaction.type;
    if (transaction.amount !== undefined) mapped.amount = transaction.amount;
    if (transaction.occurredAt !== undefined) {
      mapped.occurred_at = transaction.occurredAt instanceof Date
        ? transaction.occurredAt.toISOString()
        : transaction.occurredAt;
    }
    if (transaction.dueDate !== undefined) {
      mapped.due_date = transaction.dueDate instanceof Date
        ? transaction.dueDate.toISOString()
        : transaction.dueDate;
    }
    if (transaction.note !== undefined) mapped.note = transaction.note || null;

    return mapped;
  },

  mapTransactionFromSupabase(data: Record<string, unknown>): Transaction {
    return {
      id: data.id as number,
      customerId: data.customer_id as number,
      type: data.type as TransactionType,
      amount: data.amount as number,
      occurredAt: new Date(data.occurred_at as string),
      dueDate: new Date(data.due_date as string),
      note: data.note as string | undefined,
      createdAt: data.created_at ? new Date(data.created_at as string) : undefined,
    };
  },
};
