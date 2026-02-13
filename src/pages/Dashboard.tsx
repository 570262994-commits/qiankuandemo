import { useEffect, useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronUp, Search, X, Calendar, Filter, AlertTriangle, Bell, SlidersHorizontal } from 'lucide-react';
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
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [customerFilter, setCustomerFilter] = useState<CustomerFilterType>('all');
  const [showOverdueAlert, setShowOverdueAlert] = useState(true);

  useEffect(() => {
    fetchCustomers();
    fetchTransactions();
  }, [fetchCustomers, fetchTransactions]);

  // 筛选逻辑联动：逾期/到期筛选只与欠款相关
  useEffect(() => {
    // 当选择逾期或即将到期时，自动切换到欠款类型
    if ((customerFilter === 'overdue' || customerFilter === 'due_soon') && filterType === TransactionType.PAYBACK) {
      setFilterType(TransactionType.DEBT);
    }
  }, [customerFilter, filterType]);

  // 当切换到还款类型时，重置客户账期筛选
  const handleFilterTypeChange = (type: FilterType) => {
    setFilterType(type);
    if (type === TransactionType.PAYBACK && (customerFilter === 'overdue' || customerFilter === 'due_soon')) {
      setCustomerFilter('all');
    }
  };

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
      
      info[customer.id!] = { isOverdue, daysUntilDue, hasDebt };
    });
    
    return info;
  }, [customers, transactions]);

  // 逾期交易ID列表需要在filteredTransactions之前计算
  const overdueTransactionIds = useMemo(() => {
    const now = new Date();
    const ids: number[] = [];

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

      const paymentTerm = customer.paymentTerm || 0;
      
      const debtTransactions = customerTransactions
        .filter(t => t.type === TransactionType.DEBT)
        .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
      
      const paymentTransactions = customerTransactions
        .filter(t => t.type === TransactionType.PAYBACK)
        .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

      const debtRemainingMap: Record<number, number> = {};
      
      debtTransactions.forEach(debt => {
        debtRemainingMap[debt.id!] = debt.amount;
      });

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

      for (const debt of debtTransactions) {
        const debtRemaining = debtRemainingMap[debt.id!];
        if (debtRemaining <= 0) continue;

        const debtDate = new Date(debt.occurredAt);
        const dueDate = new Date(debtDate);
        dueDate.setDate(dueDate.getDate() + paymentTerm);
        
        const transactionDaysUntilDue = differenceInDays(dueDate, now);
        
        if (transactionDaysUntilDue < 0) {
          ids.push(debt.id!);
        }
      }
    });

    return ids;
  }, [customers, transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const customerName = getCustomerName(transaction.customerId);
      const matchesSearch = searchText === '' || 
        customerName.toLowerCase().includes(searchText.toLowerCase());
      
      const transactionDate = format(new Date(transaction.occurredAt), 'yyyy-MM-dd');
      const matchesDate = filterDate === '' || transactionDate === filterDate;
      
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      // 客户筛选逻辑 - 只对欠款交易生效
      let matchesCustomerFilter = true;
      if (customerFilter !== 'all') {
        // 还款交易不受账期筛选影响
        if (transaction.type === TransactionType.PAYBACK) {
          matchesCustomerFilter = true;
        } else {
          const dueInfo = customerDueInfo[transaction.customerId];
          if (!dueInfo) return false;
          
          switch (customerFilter) {
            case 'overdue':
              matchesCustomerFilter = overdueTransactionIds.includes(transaction.id!);
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
      }
      
      return matchesSearch && matchesDate && matchesType && matchesCustomerFilter;
    });
  }, [transactions, searchText, filterDate, filterType, customers, customerFilter, customerDueInfo, overdueTransactionIds]);

  const clearFilters = () => {
    setSearchText('');
    setFilterDate('');
    setFilterType('all');
    setCustomerFilter('all');
  };

  const hasActiveFilters = searchText !== '' || filterDate !== '' || filterType !== 'all' || customerFilter !== 'all';

  // 获取筛选摘要文本
  const getFilterSummary = () => {
    const parts: string[] = [];
    if (filterType !== 'all') {
      parts.push(filterType === TransactionType.DEBT ? '欠款' : '还款');
    }
    if (customerFilter !== 'all') {
      const customerFilterMap: Record<CustomerFilterType, string> = {
        'all': '',
        'overdue': '已逾期',
        'due_soon': '7天内到期',
        'long_term': '长期客户'
      };
      parts.push(customerFilterMap[customerFilter]);
    }
    if (filterDate) {
      parts.push(filterDate);
    }
    return parts.length > 0 ? parts.join(' · ') : '筛选';
  };

  const customerStats = useMemo(() => {
    const now = new Date();
    let overdueCount = 0;
    let overdueAmount = 0;
    const dueSoonCustomers: { name: string; daysLeft: number; balance: number }[] = [];
    const longTermCustomers: { name: string; paymentTerm: number }[] = [];
    const overdueTransactionIds: number[] = [];

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

      const paymentTerm = customer.paymentTerm || 0;
      
      const debtTransactions = customerTransactions
        .filter(t => t.type === TransactionType.DEBT)
        .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
      
      const paymentTransactions = customerTransactions
        .filter(t => t.type === TransactionType.PAYBACK)
        .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

      let remainingDebtAmount = 0;
      const debtRemainingMap: Record<number, number> = {};
      
      debtTransactions.forEach(debt => {
        debtRemainingMap[debt.id!] = debt.amount;
        remainingDebtAmount += debt.amount;
      });

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

      let customerOverdueAmount = 0;
      let isOverdue = false;
      let minDaysUntilDue = Infinity;

      for (const debt of debtTransactions) {
        const debtRemaining = debtRemainingMap[debt.id!];
        if (debtRemaining <= 0) continue;

        const debtDate = new Date(debt.occurredAt);
        const dueDate = new Date(debtDate);
        dueDate.setDate(dueDate.getDate() + paymentTerm);
        
        const transactionDaysUntilDue = differenceInDays(dueDate, now);
        
        if (transactionDaysUntilDue < 0) {
          isOverdue = true;
          customerOverdueAmount += debtRemaining;
          overdueTransactionIds.push(debt.id!);
        } else if (transactionDaysUntilDue < minDaysUntilDue) {
          minDaysUntilDue = transactionDaysUntilDue;
        }
      }

      if (paymentTerm > 30) {
        longTermCustomers.push({ name: customer.name, paymentTerm });
      }

      if (isOverdue) {
        overdueCount++;
        overdueAmount += customerOverdueAmount;
      } else if (minDaysUntilDue !== Infinity && minDaysUntilDue <= 7 && minDaysUntilDue >= 0) {
        dueSoonCustomers.push({ name: customer.name, daysLeft: minDaysUntilDue, balance });
      }
    });

    return {
      overdueCount,
      overdueAmount,
      dueSoonCount: dueSoonCustomers.length,
      longTermCount: longTermCustomers.length,
      overdueTransactionIds,
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
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 mb-3">欠款管理</h1>
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
              onClick={() => setShowFilterPanel(true)}
              className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
                hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">
                {hasActiveFilters ? getFilterSummary() : '筛选'}
              </span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 侧边筛选面板 */}
      {showFilterPanel && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowFilterPanel(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
            {/* 面板头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">筛选条件</h2>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 筛选内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* 交易类型 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">交易类型</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterTypeChange('all')}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                      filterType === 'all'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => handleFilterTypeChange(TransactionType.DEBT)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                      filterType === TransactionType.DEBT
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    欠款
                  </button>
                  <button
                    onClick={() => handleFilterTypeChange(TransactionType.PAYBACK)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                      filterType === TransactionType.PAYBACK
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    还款
                  </button>
                </div>
              </div>

              {/* 日期筛选 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">交易日期</h3>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {filterDate && (
                    <button
                      onClick={() => setFilterDate('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* 客户筛选 - 只在欠款或全部时显示 */}
              {(filterType === 'all' || filterType === TransactionType.DEBT) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">客户账期</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setCustomerFilter('all')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                        customerFilter === 'all'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        customerFilter === 'all' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {customerFilter === 'all' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                      </div>
                      <span className="text-sm">全部客户</span>
                    </button>
                    <button
                      onClick={() => setCustomerFilter('overdue')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                        customerFilter === 'overdue'
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        customerFilter === 'overdue' ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        {customerFilter === 'overdue' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
                      </div>
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">已逾期</span>
                    </button>
                    <button
                      onClick={() => setCustomerFilter('due_soon')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                        customerFilter === 'due_soon'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        customerFilter === 'due_soon' ? 'border-amber-500' : 'border-gray-300'
                      }`}
                      >
                        {customerFilter === 'due_soon' && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />}
                      </div>
                      <Bell className="w-4 h-4" />
                      <span className="text-sm">7天内到期</span>
                    </button>
                    <button
                      onClick={() => setCustomerFilter('long_term')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                        customerFilter === 'long_term'
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        customerFilter === 'long_term' ? 'border-purple-500' : 'border-gray-300'
                      }`}>
                        {customerFilter === 'long_term' && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />}
                      </div>
                      <span className="text-sm">长期客户（账期&gt;30天）</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 还款时的提示 */}
              {filterType === TransactionType.PAYBACK && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
                  <p>还款记录不支持按账期筛选</p>
                </div>
              )}
            </div>

            {/* 面板底部 */}
            <div className="border-t border-gray-100 p-4 space-y-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  清除所有筛选
                </button>
              )}
              <button
                onClick={() => setShowFilterPanel(false)}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看结果 ({filteredTransactions.length}条)
              </button>
            </div>
          </div>
        </>
      )}

      {customerStats.overdueCount > 0 && showOverdueAlert && (
        <div className="max-w-2xl mx-auto px-4 mt-2">
          <div 
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => {
              setFilterType(TransactionType.DEBT);
              setCustomerFilter('overdue');
            }}
          >
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm text-red-700">
                当前共有 <strong>{customerStats.overdueCount}</strong> 位客户已逾期，涉及金额 <strong>¥{customerStats.overdueAmount.toFixed(2)}</strong>
              </span>
            </div>
            <button 
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowOverdueAlert(false);
              }}
            >
              <X className="w-4 h-4" />
            </button>
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
