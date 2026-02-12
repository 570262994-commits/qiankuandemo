import Dexie from 'dexie';
import type { Customer, Transaction } from '../types';

export class DebtTrackerDB extends Dexie {
  customers!: Dexie.Table<Customer>;
  transactions!: Dexie.Table<Transaction>;

  constructor() {
    super('DebtTrackerDB');
    this.version(1).stores({
      customers: '++id, name, createdAt',
      transactions: '++id, customerId, type, occurredAt, dueDate, createdAt',
    });
  }
}

export const db = new DebtTrackerDB();
