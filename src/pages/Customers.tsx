import { useEffect, useState, useMemo } from 'react';
import { Plus, Phone, Bell, AlertTriangle, Clock } from 'lucide-react';
import { useCustomerStore } from '../store/customerStore';
import { useTransactionStore } from '../store/transactionStore';
import { useAuthStore } from '../store/authStore';
import { TransactionType, CREDIT_LIMIT_UNLIMITED, getCreditStatus, getCreditStatusColor, getCreditSortPriority } from '../types';
import type { Customer, CreditStatus } from '../types';
import AddCustomerDialog from '../components/AddCustomerDialog';
import { differenceInDays } from 'date-fns';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-pink-500',
];

function getAvatarColor(name: string): string {
  const charCode = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
}

function getAvatarLetter(name: string): string {
  return name.charAt(0).toUpperCase();
}

interface CustomerWithCalculated extends Customer {
  totalDebt: number;
  totalPayment: number;
  balance: number;
  remainingCredit: number;
  daysUntilDue: number;
  isOverdue: boolean;
  hasDebt: boolean;
  creditStatus: CreditStatus;
  isCreditOverdue: boolean;
}

export default function Customers({ onOpenLogin }: { onBack: () => void; onOpenLogin?: () => void }) {
  const { customers, fetchCustomers } = useCustomerStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { user, initialized } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

  useEffect(() => {
    if (initialized && user) {
      fetchCustomers();
      fetchTransactions();
    }
  }, [initialized, user, fetchCustomers, fetchTransactions]);

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
      let creditStatus: CreditStatus = 'normal';
      let isCreditOverdue = false;
      
      if (customer.creditLimit !== CREDIT_LIMIT_UNLIMITED) {
        remainingCredit = customer.creditLimit - balance;
        creditStatus = getCreditStatus(customer.creditLimit, balance);
        isCreditOverdue = remainingCredit < 0;
      }

      let daysUntilDue = 0;
      let isOverdue = false;
      
      if (hasDebt && customer.paymentTerm > 0) {
        const debtTransactions = customerTransactions
          .filter(t => t.type === TransactionType.DEBT)
          .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
        const paymentTransactions = customerTransactions
          .filter(t => t.type === TransactionType.PAYBACK)
          .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

        // 计算每笔欠款的剩余金额
        const debtRemainingMap: Record<number, number> = {};
        debtTransactions.forEach(debt => {
          debtRemainingMap[debt.id!] = debt.amount;
        });

        // 用还款抵扣欠款
        paymentTransactions.forEach(payment => {
          let remainingPayment = payment.amount;
          for (const debt of debtTransactions) {
            if (remainingPayment <= 0) break;
            const debtRemaining = debtRemainingMap[debt.id!];
            if (debtRemaining > 0) {
              const deduction = Math.min(debtRemaining, remainingPayment);
              debtRemainingMap[debt.id!] -= deduction;
              remainingPayment -= deduction;
            }
          }
        });

        // 检查是否有逾期且未还清的欠款
        let minDaysUntilDue = Infinity;
        for (const debt of debtTransactions) {
          const debtRemaining = debtRemainingMap[debt.id!];
          if (debtRemaining <= 0) continue;

          const debtDate = new Date(debt.occurredAt);
          const dueDate = new Date(debtDate);
          dueDate.setDate(dueDate.getDate() + customer.paymentTerm);
          
          const transactionDaysUntilDue = differenceInDays(dueDate, now);
          if (transactionDaysUntilDue < 0) {
            isOverdue = true;
          }
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
        creditStatus,
        isCreditOverdue,
      };
    });
  }, [customers, transactions]);

  const sortedCustomers = useMemo(() => {
    return [...customersWithCalculated]
      .filter(customer => customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const aIsOverdue = a.isOverdue;
        const bIsOverdue = b.isOverdue;
        const aCreditPriority = getCreditSortPriority(a.creditStatus);
        const bCreditPriority = getCreditSortPriority(b.creditStatus);
        
        if (a.isCreditOverdue && !b.isCreditOverdue) return -1;
        if (!a.isCreditOverdue && b.isCreditOverdue) return 1;
        
        if (aIsOverdue && !bIsOverdue) return -1;
        if (!aIsOverdue && bIsOverdue) return 1;
        
        if (aCreditPriority !== bCreditPriority) {
          return aCreditPriority - bCreditPriority;
        }
        
        return a.name.localeCompare(b.name);
      });
  }, [customersWithCalculated, searchQuery]);

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
        {sortedCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">
              {searchQuery ? '未找到匹配的客户' : '暂无客户，请先添加'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCustomers.map((customer) => {
              const colors = customer.creditLimit !== CREDIT_LIMIT_UNLIMITED 
                ? getCreditStatusColor(customer.creditStatus)
                : null;
              
              return (
                <div
                  key={customer.id}
                  className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md active:scale-[0.98] cursor-pointer transition-all"
                  onClick={() => handleEditCustomer(customer)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${getAvatarColor(customer.name)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-sm">{getAvatarLetter(customer.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {customer.name}
                        </h3>
                        {customer.isCreditOverdue && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-medium rounded-full">
                            已超额
                          </span>
                        )}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-gray-400 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span className="text-xs">{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-3">
                    {customer.creditLimit === CREDIT_LIMIT_UNLIMITED ? (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">信用额度</span>
                        <span className="font-bold text-blue-600">不限额度</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-gray-500 text-sm">
                            {customer.isCreditOverdue ? '超出额度' : '剩余额度'}
                          </span>
                          <div className="flex items-baseline gap-1">
                            {customer.isCreditOverdue ? (
                              <span className="text-xl font-bold text-rose-600">
                                ¥{Math.abs(customer.remainingCredit).toFixed(0)}
                              </span>
                            ) : (
                              <span className={`text-xl font-bold ${colors?.text || 'text-gray-900'}`}>
                                ¥{customer.remainingCredit.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {customer.creditLimit > 0 && (
                          <div className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-400">信用额度 ¥{customer.creditLimit.toFixed(0)}</span>
                              <span className={`text-xs font-medium ${colors?.text || 'text-gray-400'}`}>
                                {customer.isCreditOverdue 
                                  ? '超额'
                                  : `${Math.max(0, Math.min(100, (customer.remainingCredit / customer.creditLimit) * 100)).toFixed(0)}%`
                                }
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${customer.isCreditOverdue ? 'bg-rose-500' : (colors?.progress || 'bg-gray-300')}`}
                                style={{ 
                                  width: customer.isCreditOverdue 
                                    ? '100%' 
                                    : `${Math.max(0, Math.min(100, (customer.remainingCredit / customer.creditLimit) * 100))}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>账期 {customer.paymentTerm || 0} 天</span>
                      </div>
                      {customer.isOverdue ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-medium rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          逾期 {Math.abs(customer.daysUntilDue)} 天
                        </span>
                      ) : customer.hasDebt && customer.daysUntilDue === 0 ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-full">
                          今日到期
                        </span>
                      ) : customer.hasDebt && customer.daysUntilDue <= 3 ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-full flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          剩余 {customer.daysUntilDue} 天
                        </span>
                      ) : null}
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
          if (!user) {
            onOpenLogin?.();
            return;
          }
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
        onOpenLogin={onOpenLogin}
      />
    </div>
  );
}
