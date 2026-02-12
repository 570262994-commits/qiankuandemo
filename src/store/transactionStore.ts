import { create } from 'zustand';
import { TransactionType } from '../types';
import type { Transaction } from '../types';
import { db } from '../db/db';

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<number>;
  deleteTransaction: (id: number) => Promise<void>;
  getRecentTransactions: (limit?: number) => Promise<Transaction[]>;
  getTransactionsByCustomerId: (customerId: number) => Promise<Transaction[]>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const transactions = await db.transactions.orderBy('occurredAt').reverse().toArray();
      set({ transactions, loading: false });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      set({ loading: false });
    }
  },

  addTransaction: async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const id = await db.transactions.add({
        ...transaction,
        createdAt: new Date(),
      });
      await get().fetchTransactions();
      return id;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  },

  deleteTransaction: async (id: number) => {
    try {
      await db.transactions.delete(id);
      await get().fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  },

  getRecentTransactions: async (limit = 50) => {
    try {
      const transactions = await db.transactions
        .orderBy('occurredAt')
        .reverse()
        .limit(limit)
        .toArray();
      return transactions;
    } catch (error) {
      console.error('Failed to get recent transactions:', error);
      return [];
    }
  },

  getTransactionsByCustomerId: async (customerId: number) => {
    try {
      const transactions = await db.transactions
        .where('customerId')
        .equals(customerId)
        .reverse()
        .toArray();
      return transactions;
    } catch (error) {
      console.error('Failed to get transactions by customer:', error);
      return [];
    }
  },
}));
