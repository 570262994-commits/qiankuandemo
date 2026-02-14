import { create } from 'zustand';
import type { Transaction } from '../types';
import { supabaseApi } from '../lib/supabaseApi';

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<number>;
  updateTransaction: (id: number, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const transactions = await supabaseApi.getTransactions();
      set({ transactions, loading: false });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      set({ loading: false });
    }
  },

  addTransaction: async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const id = await supabaseApi.addTransaction(transaction);
      await get().fetchTransactions();
      return id;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  },

  updateTransaction: async (id: number, transaction: Partial<Transaction>) => {
    try {
      await supabaseApi.updateTransaction(id, transaction);
      await get().fetchTransactions();
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  },

  deleteTransaction: async (id: number) => {
    try {
      await supabaseApi.deleteTransaction(id);
      await get().fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  },
}));
