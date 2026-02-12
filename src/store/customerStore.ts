import { create } from 'zustand';
import type { Customer } from '../types';
import { supabaseApi } from '../lib/supabaseApi';

interface CustomerStore {
  customers: Customer[];
  loading: boolean;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Customer) => Promise<number>;
  updateCustomer: (id: number, customer: Partial<Customer>) => Promise<void>;
  getCustomerByName: (name: string) => Promise<Customer | undefined>;
  searchCustomers: (query: string) => Promise<Customer[]>;
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  loading: false,

  fetchCustomers: async () => {
    set({ loading: true });
    try {
      const customers = await supabaseApi.getCustomers();
      set({ customers, loading: false });
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      set({ loading: false });
    }
  },

  addCustomer: async (customer: Customer) => {
    try {
      const id = await supabaseApi.addCustomer(customer);
      await get().fetchCustomers();
      return id;
    } catch (error) {
      console.error('Failed to add customer:', error);
      throw error;
    }
  },

  updateCustomer: async (id: number, customer: Partial<Customer>) => {
    try {
      await supabaseApi.updateCustomer(id, customer);
      await get().fetchCustomers();
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  },

  getCustomerByName: async (name: string) => {
    try {
      return await supabaseApi.getCustomerByName(name);
    } catch (error) {
      console.error('Failed to get customer by name:', error);
      return undefined;
    }
  },

  searchCustomers: async (query: string) => {
    try {
      return await supabaseApi.searchCustomers(query);
    } catch (error) {
      console.error('Failed to search customers:', error);
      return [];
    }
  },
}));
