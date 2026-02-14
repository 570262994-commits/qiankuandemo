export const TransactionType = {
  DEBT: 'DEBT',
  PAYBACK: 'PAYBACK',
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const CREDIT_LIMIT_UNLIMITED = -1;

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

export type CollectionStyle = 'polite' | 'professional' | 'gentle' | 'humorous';

export interface OverdueItem {
  amount: number;
  overdueDays: number;
  note?: string;
  occurredAt: Date;
}

export interface CollectionData {
  customerName: string;
  amount: number;
  overdueDays: number;
  overdueItems: OverdueItem[];
  style: CollectionStyle;
}
