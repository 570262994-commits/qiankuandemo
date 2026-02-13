import { useEffect, useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronUp, Search, X, Calendar, Filter, AlertTriangle, Bell } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { useCustomerStore } from '../store/customerStore';
import { useModalStore } from '../store/modalStore';
import { TransactionType } from '../types';
import type { Transaction } from '../types';
import { format, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import TransactionDrawer from '../components/TransactionDrawer';

type FilterType = 'all' | TransactionType;
type CustomerFilterType = 'all' | 'overdue' | 'due_soon' | 'long_term';

export default function Dashboard() {
  const { transactions, fetchTransactions, deleteTransaction } = useTransactionStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { confirm } = useModalStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [customerFilter, setCustomerFilter] = useState<CustomerFilterType>('all');

  useEffect(() => {
    fetchCustomers();
    fetchTransactions();
  }, [fetchCustomers, fetchTransactions]);

  const handleLongPressStart = (transactionId: number) => {
    setIsLongPress(false);
    const timer = setTimeout(() => {
      setIsLongPress(true);
      confirm('确定要删除这条记录吗？', () => {
        deleteTransaction(transactionId);
      }, '删除确认');
    }, 800);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    if (!isLongPress) {
      setEditingTransaction(transaction);
      setIsDrawerOpen(true);
    }
  };

  const handleClick = (transaction: Transaction) => {
    if (!isLongPress) {
      setEditingTransaction(transaction);
      setIsDrawerOpen(true);
    }
    setTimeout(() => {
      setIsLongPress(false);
    }, 100);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingTransaction(undefined);
  };

  const toggleNoteExpand = (transactionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || '未知客户';
  };

  const customerDueInfo = useMemo(() => {
    const now = new Date();
    const info: Record<number, { isOverdue: boolean; daysUntilDue: number; hasDebt: boolean }> = {};
    
    customers.forEach(customer => {
      const customerTransactions = transactions.filter(t => t.customerId === customer.id);
      const totalDebt = customerTransactions
        .filter(t => t.type === TransactionType.DEBT)
        .reduce((sum, t) => sum + t.amount, 0);
      const totalPayment = customerTransactions
        .filter(t => t.type === TransactionType.PAYBACK)
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = totalDebt - totalPayment;
      const hasDebt = balance > 0;
      
      let isOverdue = false;
      let daysUntilDue = 0;
      
      if (hasDebt && customer.paymentTerm > 0) {
        const latestDebtTransaction = customerTransactions
          .filter(t => t.type === TransactionType.DEBT)
          .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];
        
        if (latestDebtTransaction) {
          const debtDate = new Date(latestDebtTransaction.occurredAt);
          const dueDate = new Date(debtDate);
          dueDate.setDate(dueDate.getDate() + customer.paymentTerm);
          
          daysUntilDue = differenceInDays(dueDate, now);
          isOverdue = daysUntilDue < 0;
        }
      }
      
      info[customer.id!] = { isOverdue, daysUntilDue, hasDebt };
    });
    
    return info;
  }, [customers, transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const customerName = getCustomerName(transaction.customerId);
      const matchesSearch = searchText === '' || 
        customerName.toLowerCase().includes(searchText.toLowerCase());
      
      const transactionDate = format(new Date(transaction.occurredAt), 'yyyy-MM-dd');
      const matchesDate = filterDate === '' || transactionDate === filterDate;
      
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      // 客户筛选逻辑
      let matchesCustomerFilter = true;
      if (customerFilter !== 'all') {
        const dueInfo = customerDueInfo[transaction.customerId];
        if (!dueInfo) return false;
        
        switch (customerFilter) {
          case 'overdue':
            matchesCustomerFilter = dueInfo.isOverdue && dueInfo.hasDebt;
            break;
          case 'due_soon':
            matchesCustomerFilter = !dueInfo.isOverdue && dueInfo.daysUntilDue >= 0 && dueInfo.daysUntilDue <= 7 && dueInfo.hasDebt;
            break;
          case 'long_term':
            const customer = customers.find(c => c.id === transaction.customerId);
            matchesCustomerFilter = (customer?.paymentTerm || 0) > 30;
            break;
        }
      }
      
      return matchesSearch && matchesDate && matchesType && matchesCustomerFilter;
    });
  }, [transactions, searchText, filterDate, filterType, customers, customerFilter, customerDueInfo]);

  const clearFilters = () => {
    setSearchText('');
    setFilterDate('');
    setFilterType('all');
  };

  const hasActiveFilters = searchText !== '' || filterDate !== '' || filterType !== 'all';

  const customerStats = useMemo(() => {
    const now = new Date();
    let overdueCount = 0;
    let overdueAmount = 0;
    const dueSoonCustomers: { name: string; daysLeft: number; balance: number }[] = [];
    const longTermCustomers: { name: string; paymentTerm: number }[] = [];

    customers.forEach(customer => {
      const customerTransactions = transactions.filter(t => t.customerId === customer.id);
      const totalDebt = customerTransactions
        .filter(t => t.type === TransactionType.DEBT)
        .reduce((sum, t) => sum + t.amount, 0);
      const totalPayment = customerTransactions
        .filter(t => t.type === TransactionType.PAYBACK)
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = totalDebt - totalPayment;

      if (balance <= 0) return;

      const latestDebtTransaction = customerTransactions
        .filter(t => t.type === TransactionType.DEBT)
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];

      if (!latestDebtTransaction) return;

      const debtDate = new Date(latestDebtTransaction.occurredAt);
      const paymentTerm = customer.paymentTerm || 0;
      const dueDate = new Date(debtDate);
      dueDate.setDate(dueDate.getDate() + paymentTerm);

      const daysUntilDue = differenceInDays(dueDate, now);
      const overdueDays = differenceInDays(now, dueDate);

      if (paymentTerm > 30) {
        longTermCustomers.push({ name: customer.name, paymentTerm });
      }

      if (overdueDays > 0) {
        overdueCount++;
        overdueAmount += balance;
      } else if (daysUntilDue <= 7 && daysUntilDue >= 0) {
        dueSoonCustomers.push({ name: customer.name, daysLeft: daysUntilDue, balance });
      }
    });

    return {
      overdueCount,
      overdueAmount,
      dueSoonCount: dueSoonCustomers.length,
      longTermCount: longTermCustomers.length,
    };
  }, [customers, transactions]);



  const formatAmount = (amount: number, type: TransactionType) => {
    if (type === TransactionType.DEBT) {
      return `-¥${amount.toFixed(2)}`;
    }
    return `+¥${amount.toFixed(2)}`;
  };

  const getAmountColor = (type: TransactionType) => {
    return type === TransactionType.DEBT ? 'text-red-600' : 'text-emerald-600';
  };

  const getCardStyle = (type: TransactionType) => {
    if (type === TransactionType.DEBT) {
      return 'bg-red-50 border-l-4 border-red-400';
    }
    return 'bg-emerald-50 border-l-4 border-emerald-400';
  };

  const getTypeBadgeStyle = (type: TransactionType) => {
    if (type === TransactionType.DEBT) {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-emerald-100 text-emerald-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">客户欠款助手</h1>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索客户名称..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
          {showFilters && (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterType === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setFilterType(TransactionType.DEBT)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterType === TransactionType.DEBT
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  欠款
                </button>
                <button
                  onClick={() => setFilterType(TransactionType.PAYBACK)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterType === TransactionType.PAYBACK
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  还款
                </button>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  清除筛选
                </button>
              )}
            </div>
          )}
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCustomerFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                customerFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setCustomerFilter('overdue')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                customerFilter === 'overdue'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              已逾期
            </button>
            <button
              onClick={() => setCustomerFilter('due_soon')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                customerFilter === 'due_soon'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              7天内到期
            </button>
            <button
              onClick={() => setCustomerFilter('long_term')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                customerFilter === 'long_term'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              长期客户
            </button>
          </div>
        </div>
      </header>

      {customerStats.overdueCount > 0 && (
        <div className="max-w-2xl mx-auto px-4 mt-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm text-red-700">
                当前共有 <strong>{customerStats.overdueCount}</strong> 位客户已逾期，涉及金额 <strong>¥{customerStats.overdueAmount.toFixed(2)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">{hasActiveFilters ? '无匹配记录' : '暂无流水记录'}</p>
            <p className="text-sm mt-2">{hasActiveFilters ? '请调整搜索条件' : '点击下方 + 号开始记账'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`rounded-lg shadow-sm p-4 transition-all hover:shadow-md active:scale-95 cursor-pointer ${getCardStyle(transaction.type)}`}
                onMouseDown={() => handleLongPressStart(transaction.id!)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(transaction.id!)}
                onTouchEnd={() => {
                  handleLongPressEnd();
                  handleEditTransaction(transaction);
                }}
                onClick={() => handleClick(transaction)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{getCustomerName(transaction.customerId)}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeStyle(transaction.type)}`}>
                        {transaction.type === TransactionType.DEBT ? '欠款' : '还款'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(transaction.occurredAt), 'yyyy-MM-dd', { locale: zhCN })}
                    </p>
                    {transaction.note && (
                      <div 
                        className="mt-2 flex items-start gap-1.5 cursor-pointer hover:bg-white/30 p-1 rounded transition-colors"
                        onClick={(e) => toggleNoteExpand(transaction.id!, e)}
                      >
                        <span className="text-gray-400 text-xs mt-0.5 flex-shrink-0">备注:</span>
                        <div className="flex-1 min-w-0 flex items-start gap-1">
                          <p className={`text-xs text-gray-600 leading-relaxed flex-1 ${
                            expandedNotes.has(transaction.id!) ? '' : 'line-clamp-1'
                          }`}>
                            {transaction.note}
                          </p>
                          {transaction.note.length > 30 && (
                            <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                              {expandedNotes.has(transaction.id!) ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-xl font-bold ${getAmountColor(transaction.type)}`}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => {
          setEditingTransaction(undefined);
          setIsDrawerOpen(true);
        }}
        className="fixed bottom-20 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      <TransactionDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSubmit={() => {
          handleCloseDrawer();
          fetchTransactions();
        }}
        transaction={editingTransaction}
      />
    </div>
  );
}
