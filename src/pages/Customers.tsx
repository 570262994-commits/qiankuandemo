import { useEffect, useState, useMemo } from 'react';
import { Plus, Phone } from 'lucide-react';
import { useCustomerStore } from '../store/customerStore';
import { useTransactionStore } from '../store/transactionStore';
import { TransactionType, CREDIT_LIMIT_UNLIMITED } from '../types';
import type { Customer } from '../types';
import AddCustomerDialog from '../components/AddCustomerDialog';

interface CustomerWithCalculated extends Customer {
  totalDebt: number;
  totalPayment: number;
  balance: number;
  remainingCredit: number;
}

export default function Customers({ onBack: _onBack }: { onBack: () => void }) {
  const { customers, fetchCustomers } = useCustomerStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

  useEffect(() => {
    fetchCustomers();
    fetchTransactions();
  }, [fetchCustomers, fetchTransactions]);

  const customersWithCalculated: CustomerWithCalculated[] = useMemo(() => {
    return customers.map(customer => {
      const customerTransactions = transactions.filter(t => t.customerId === customer.id);
      const totalDebt = customerTransactions
        .filter(t => t.type === TransactionType.DEBT)
        .reduce((sum, t) => sum + t.amount, 0);
      const totalPayment = customerTransactions
        .filter(t => t.type === TransactionType.PAYBACK)
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = totalDebt - totalPayment;
      
      let remainingCredit = customer.creditLimit;
      if (customer.creditLimit !== CREDIT_LIMIT_UNLIMITED) {
        remainingCredit = customer.creditLimit - balance;
      }
      
      return {
        ...customer,
        totalDebt,
        totalPayment,
        balance,
        remainingCredit,
      };
    });
  }, [customers, transactions]);

  const filteredCustomers = customersWithCalculated.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingCustomer(undefined);
  };

  const formatCreditLimit = (limit: number) => {
    if (limit === CREDIT_LIMIT_UNLIMITED) return '无限制';
    return `¥${limit.toFixed(2)}`;
  };

  const formatRemainingCredit = (remaining: number, totalLimit: number) => {
    if (totalLimit === CREDIT_LIMIT_UNLIMITED) return { text: '无限制', color: 'text-blue-600' };
    
    const percentage = totalLimit > 0 ? (remaining / totalLimit) * 100 : 0;
    
    if (remaining <= 0) {
      return { text: `¥${remaining.toFixed(2)}`, color: 'text-red-600' };
    } else if (percentage < 20) {
      return { text: `¥${remaining.toFixed(2)}`, color: 'text-yellow-600' };
    } else {
      return { text: `¥${remaining.toFixed(2)}`, color: 'text-emerald-600' };
    }
  };

  const getRemainingCreditBgColor = (remaining: number, totalLimit: number) => {
    if (totalLimit === CREDIT_LIMIT_UNLIMITED) return 'bg-blue-50';
    if (remaining <= 0) return 'bg-red-50';
    
    const percentage = totalLimit > 0 ? (remaining / totalLimit) * 100 : 0;
    if (percentage < 20) return 'bg-yellow-50';
    return 'bg-emerald-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">客户管理</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索客户..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">
              {searchQuery ? '未找到匹配的客户' : '暂无客户，请先添加'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => {
              const remainingInfo = formatRemainingCredit(customer.remainingCredit, customer.creditLimit);
              const bgColor = getRemainingCreditBgColor(customer.remainingCredit, customer.creditLimit);
              
              return (
                <div
                  key={customer.id}
                  onClick={() => handleEditCustomer(customer)}
                  className={`rounded-lg shadow-sm p-4 hover:shadow-md active:scale-95 cursor-pointer transition-all ${bgColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {customer.name}
                        </h3>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 mt-2 text-gray-500">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                      )}
                      <div className="mt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">信用额度</span>
                          <span className="font-medium">
                            {formatCreditLimit(customer.creditLimit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">剩余额度</span>
                          <span className={`font-medium ${remainingInfo.color}`}>
                            {remainingInfo.text}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">固定账期</span>
                          <span className="font-medium">{customer.paymentTerm} 天</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <button
        onClick={() => {
          setEditingCustomer(undefined);
          setIsAddDialogOpen(true);
        }}
        className="fixed bottom-20 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AddCustomerDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={() => {
          handleCloseDialog();
          fetchCustomers();
        }}
        customer={editingCustomer}
      />
    </div>
  );
}
