export const TransactionType = {
  DEBT: 'DEBT',
  PAYBACK: 'PAYBACK',
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  creditLimit: number;
  paymentTerm: number;
  createdAt?: Date;
}

export interface Transaction {
  id?: number;
  customerId: number;
  type: TransactionType;
  amount: number;
  occurredAt: Date;
  dueDate: Date;
  note?: string;
  createdAt?: Date;
}

export interface CustomerWithBalance extends Customer {
  balance: number;
}
