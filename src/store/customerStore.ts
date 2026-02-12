import { create } from 'zustand';
import type { Customer } from '../types';
import { db } from '../db/db';

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
      const customers = await db.customers.toArray();
      set({ customers, loading: false });
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      set({ loading: false });
    }
  },

  addCustomer: async (customer: Customer) => {
    try {
      const id = await db.customers.add({
        ...customer,
        createdAt: new Date(),
      });
      await get().fetchCustomers();
      return id;
    } catch (error) {
      console.error('Failed to add customer:', error);
      throw error;
    }
  },

  updateCustomer: async (id: number, customer: Partial<Customer>) => {
    try {
      await db.customers.update(id, customer);
      await get().fetchCustomers();
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  },

  getCustomerByName: async (name: string) => {
    try {
      const customers = await db.customers.where('name').equalsIgnoreCase(name).toArray();
      return customers[0];
    } catch (error) {
      console.error('Failed to get customer by name:', error);
      return undefined;
    }
  },

  searchCustomers: async (query: string) => {
    try {
      if (!query.trim()) {
        return await db.customers.toArray();
      }
      const customers = await db.customers
        .filter(customer => customer.name.toLowerCase().includes(query.toLowerCase()))
        .toArray();
      return customers;
    } catch (error) {
      console.error('Failed to search customers:', error);
      return [];
    }
  },
}));
