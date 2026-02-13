import { useEffect, useState, useMemo } from 'react';
import { Plus, Phone, Bell, AlertTriangle } from 'lucide-react';
import { useCustomerStore } from '../store/customerStore';
import { useTransactionStore } from '../store/transactionStore';
import { TransactionType, CREDIT_LIMIT_UNLIMITED } from '../types';
import type { Customer } from '../types';
import AddCustomerDialog from '../components/AddCustomerDialog';
import { differenceInDays } from 'date-fns';

interface CustomerWithCalculated extends Customer {
  totalDebt: number;
  totalPayment: number;
  balance: number;
  remainingCredit: number;
  daysUntilDue: number;
  isOverdue: boolean;
  hasDebt: boolean;
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
    const now = new Date();
    
    return customers.map(customer => {
      const customerTransactions = transactions.filter(t => t.customerId === customer.id);
      const totalDebt = customerTransactions
        .filter(t => t.type === TransactionType.DEBT)
        .reduce((sum, t) => sum + t.amount, 0);
      const totalPayment = customerTransactions
        .filter(t => t.type === TransactionType.PAYBACK)
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = totalDebt - totalPayment;
      const hasDebt = balance > 0;
      
      let remainingCredit = customer.creditLimit;
      if (customer.creditLimit !== CREDIT_LIMIT_UNLIMITED) {
        remainingCredit = customer.creditLimit - balance;
      }

      let daysUntilDue = 0;
      let isOverdue = false;
      
      if (hasDebt && customer.paymentTerm > 0) {
        // 获取所有欠款交易并检查是否有任何一条逾期
        const debtTransactions = customerTransactions
          .filter(t => t.type === TransactionType.DEBT);
        
        // 检查是否有任何一条欠款记录逾期
        for (const transaction of debtTransactions) {
          const debtDate = new Date(transaction.occurredAt);
          const dueDate = new Date(debtDate);
          dueDate.setDate(dueDate.getDate() + customer.paymentTerm);
          
          const transactionDaysUntilDue = differenceInDays(dueDate, now);
          if (transactionDaysUntilDue < 0) {
            isOverdue = true;
            break; // 只要有一条逾期就标记为逾期
          }
        }
        
        // 计算最近到期的欠款记录的剩余天数
        let minDaysUntilDue = Infinity;
        for (const transaction of debtTransactions) {
          const debtDate = new Date(transaction.occurredAt);
          const dueDate = new Date(debtDate);
          dueDate.setDate(dueDate.getDate() + customer.paymentTerm);
          
          const transactionDaysUntilDue = differenceInDays(dueDate, now);
          if (transactionDaysUntilDue < minDaysUntilDue) {
            minDaysUntilDue = transactionDaysUntilDue;
          }
        }
        
        daysUntilDue = minDaysUntilDue !== Infinity ? minDaysUntilDue : 0;
      }
      
      return {
        ...customer,
        totalDebt,
        totalPayment,
        balance,
        remainingCredit,
        daysUntilDue,
        isOverdue,
        hasDebt,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">客户档案</h1>
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

      <main className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">
              {searchQuery ? '未找到匹配的客户' : '暂无客户，请先添加'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => {
              return (
                <div
                  key={customer.id}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md active:scale-95 cursor-pointer transition-all"
                  onClick={() => handleEditCustomer(customer)}
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {customer.name}
                      </h3>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-gray-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-xs">{customer.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3 space-y-3 text-sm">
                      {customer.creditLimit === CREDIT_LIMIT_UNLIMITED ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">剩余额度</span>
                            <span className="font-bold text-blue-700">不限额度</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">信用额度</span>
                            <span className="font-bold text-blue-700">不限额度</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-baseline">
                            <span className="text-gray-400">剩余额度/信用额度</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-gray-900">
                                ¥{Math.max(0, customer.remainingCredit).toFixed(0)}
                              </span>
                              <span className="text-xs text-gray-400">
                                / ¥{customer.creditLimit.toFixed(0)}
                              </span>
                            </div>
                          </div>
                          {customer.creditLimit > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    (() => {
                                      const percentage = (customer.remainingCredit / customer.creditLimit) * 100;
                                      if (percentage > 30) return 'bg-emerald-500';
                                      if (percentage >= 10) return 'bg-amber-500';
                                      return 'bg-rose-500';
                                    })()
                                  }`}
                                  style={{ 
                                    width: `${Math.max(0, Math.min(100, (customer.remainingCredit / customer.creditLimit) * 100))}%` 
                                  }}
                                />
                              </div>
                              <span className={`text-xs font-medium w-10 text-right ${
                                (() => {
                                  const percentage = (customer.remainingCredit / customer.creditLimit) * 100;
                                  if (percentage > 30) return 'text-emerald-600';
                                  if (percentage >= 10) return 'text-amber-600';
                                  return 'text-rose-600';
                                })()
                              }`}>
                                {Math.max(0, Math.min(100, (customer.remainingCredit / customer.creditLimit) * 100)).toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">固定账期</span>
                        <div className="flex items-center gap-2">
                          {customer.paymentTerm <= 0 || customer.paymentTerm === null ? (
                            <span 
                              className="text-blue-500 cursor-pointer hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCustomer(customer);
                              }}
                            >
                              未设置
                            </span>
                          ) : (
                            <>
                              <span className="font-bold text-gray-900">{customer.paymentTerm} 天</span>
                              {customer.isOverdue ? (
                                <span className="flex items-center gap-1 text-red-600 font-bold">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  已逾期 {Math.abs(customer.daysUntilDue)} 天
                                </span>
                              ) : customer.daysUntilDue <= 3 && customer.hasDebt ? (
                                <span className="flex items-center gap-1 text-amber-500">
                                  <Bell className="w-3.5 h-3.5" />
                                  剩余 {customer.daysUntilDue} 天
                                </span>
                              ) : null}
                            </>
                          )}
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
