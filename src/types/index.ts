export enum TransactionType {
  DEBT = 'DEBT',
  PAYBACK = 'PAYBACK',
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
