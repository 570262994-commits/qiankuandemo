export const TransactionType = {
  DEBT: 'DEBT',
  PAYBACK: 'PAYBACK',
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const CREDIT_LIMIT_UNLIMITED = -1;

export type CreditStatus = 'normal' | 'warning' | 'exhausted' | 'overdue';

export function getCreditStatus(creditLimit: number | null, currentDebt: number): CreditStatus {
  if (creditLimit === null || creditLimit === CREDIT_LIMIT_UNLIMITED) {
    return 'normal';
  }
  
  const remaining = creditLimit - currentDebt;
  
  if (remaining < 0) return 'overdue';
  if (remaining === 0) return 'exhausted';
  
  const percentage = (remaining / creditLimit) * 100;
  
  if (percentage > 30) return 'normal';
  if (percentage >= 10) return 'warning';
  return 'exhausted';
}

export function getCreditStatusColor(status: CreditStatus): { bg: string; text: string; progress: string } {
  switch (status) {
    case 'normal':
      return { bg: 'bg-emerald-500', text: 'text-emerald-600', progress: 'bg-emerald-500' };
    case 'warning':
      return { bg: 'bg-amber-500', text: 'text-amber-600', progress: 'bg-amber-500' };
    case 'exhausted':
    case 'overdue':
      return { bg: 'bg-rose-500', text: 'text-rose-600', progress: 'bg-rose-500' };
  }
}

export function getCreditSortPriority(status: CreditStatus): number {
  switch (status) {
    case 'overdue': return 1;
    case 'exhausted': return 2;
    case 'warning': return 3;
    case 'normal': return 4;
  }
}

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
