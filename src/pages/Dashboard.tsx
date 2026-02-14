import { useEffect, useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronUp, Search, X, Calendar, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { useCustomerStore } from '../store/customerStore';
import { useModalStore } from '../store/modalStore';
import { useViewModeStore } from '../store/viewModeStore';
import { useAuthStore } from '../store/authStore';
import { TransactionType } from '../types';
import type { Transaction } from '../types';
import { format, differenceInDays, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import TransactionDrawer from '../components/TransactionDrawer';

type FilterType = 'all' | TransactionType;
type CustomerFilterType = 'all' | 'overdue' | 'due_soon' | 'long_term';
type OverdueDepthType = 'all' | 'week' | 'month' | 'over_month';
type BillStatusType = 'all' | 'overdue' | 'due_soon';

interface OverdueTransaction {
  id: number;
  date: string;
  amount: number;
  overdueDays: number;
  note?: string;
}

interface CustomerCollectionData {
  customerId: number;
  customerName: string;
  balance: number;
  isOverdue: boolean;
  daysUntilDue: number;
  overdueDays: number;
  overdueAmount: number;
  overdueCount: number;
  overdueTransactions: OverdueTransaction[];
  paymentTerm: number;
}

interface DashboardProps {
  onOpenLogin?: () => void;
}

export default function Dashboard({ onOpenLogin }: DashboardProps) {
  const { transactions, fetchTransactions, deleteTransaction } = useTransactionStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { confirm } = useModalStore();
  const { viewMode, setViewMode } = useViewModeStore();
  const { user } = useAuthStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [expandedCustomers, setExpandedCustomers] = useState<Set<number>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [customerFilter, setCustomerFilter] = useState<CustomerFilterType>('all');
  const [overdueDepthFilter, setOverdueDepthFilter] = useState<OverdueDepthType>('all');
  const [billStatusFilter, setBillStatusFilter] = useState<BillStatusType>('all');

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // 手势切换视图模式
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    
    // 滑动距离超过50px才触发
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // 左滑 -> 切换到账目模式
        setViewMode('journal');
      } else {
        // 右滑 -> 切换到催收模式
        setViewMode('collection');
      }
    }
    
    setTouchStartX(null);
  };

  useEffect(() => {
    fetchCustomers();
    fetchTransactions();
  }, [fetchCustomers, fetchTransactions]);

  useEffect(() => {
    if ((customerFilter === 'overdue' || customerFilter === 'due_soon') && filterType === TransactionType.PAYBACK) {
      setFilterType(TransactionType.DEBT);
    }
  }, [customerFilter, filterType]);

  const handleFilterTypeChange = (type: FilterType) => {
    setFilterType(type);
    if (type === TransactionType.PAYBACK) {
      setBillStatusFilter('all');
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
        const debtTransactions = customerTransactions
          .filter(t => t.type === TransactionType.DEBT);
        
        for (const transaction of debtTransactions) {
          const debtDate = new Date(transaction.occurredAt);
          const dueDate = new Date(debtDate);
          dueDate.setDate(dueDate.getDate() + customer.paymentTerm);
          
          const transactionDaysUntilDue = differenceInDays(dueDate, now);
          if (transactionDaysUntilDue < 0) {
            isOverdue = true;
            break;
          }
        }
        
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

  // 催收模式数据：需要关注的客户列表
  const collectionData = useMemo(() => {
    const now = new Date();
    const data: CustomerCollectionData[] = [];

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

      let overdueAmount = 0;
      let isOverdue = false;
      let maxOverdueDays = 0;
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
          overdueAmount += debtRemaining;
          const overdueDays = Math.abs(transactionDaysUntilDue);
          if (overdueDays > maxOverdueDays) {
            maxOverdueDays = overdueDays;
          }
        } else if (transactionDaysUntilDue < minDaysUntilDue) {
          minDaysUntilDue = transactionDaysUntilDue;
        }
      }

      // 只显示已逾期的客户
      if (isOverdue) {
        // 收集所有逾期交易明细
        const overdueTransactionsList: OverdueTransaction[] = [];
        
        for (const debt of debtTransactions) {
          const debtRemaining = debtRemainingMap[debt.id!];
          if (debtRemaining <= 0) continue;
          
          const debtDate = new Date(debt.occurredAt);
          const dueDate = new Date(debtDate);
          dueDate.setDate(dueDate.getDate() + paymentTerm);
          
          const transactionDaysUntilDue = differenceInDays(dueDate, now);
          
          if (transactionDaysUntilDue < 0) {
            overdueTransactionsList.push({
              id: debt.id!,
              date: format(new Date(debt.occurredAt), 'yyyy-MM-dd'),
              amount: debtRemaining,
              overdueDays: Math.abs(transactionDaysUntilDue),
              note: debt.note,
            });
          }
        }
        
        data.push({
          customerId: customer.id!,
          customerName: customer.name,
          balance,
          isOverdue,
          daysUntilDue: -maxOverdueDays,
          overdueDays: maxOverdueDays,
          overdueAmount,
          overdueCount: overdueTransactionsList.length,
          overdueTransactions: overdueTransactionsList,
          paymentTerm,
        });
      }
    });

    // 按逾期天数排序
    return data.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [customers, transactions]);

  // 筛选催收模式数据
  const filteredCollectionData = useMemo(() => {
    return collectionData.filter(customer => {
      const matchesSearch = searchText === '' || 
        customer.customerName.toLowerCase().includes(searchText.toLowerCase());
      
      if (!matchesSearch) return false;

      switch (overdueDepthFilter) {
        case 'week':
          return customer.isOverdue && customer.overdueDays <= 7;
        case 'month':
          return customer.isOverdue && customer.overdueDays > 7 && customer.overdueDays <= 30;
        case 'over_month':
          return customer.isOverdue && customer.overdueDays > 30;
        default:
          return true;
      }
    });
  }, [collectionData, searchText, overdueDepthFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const customerName = getCustomerName(transaction.customerId);
      const matchesSearch = searchText === '' || 
        customerName.toLowerCase().includes(searchText.toLowerCase());
      
      const transactionDate = format(new Date(transaction.occurredAt), 'yyyy-MM-dd');
      const matchesDate = filterDate === '' || transactionDate === filterDate;
      
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      // 账单状态筛选
      let matchesBillStatus = true;
      if (billStatusFilter !== 'all') {
        // 账单状态筛选只适用于欠款类型
        if (transaction.type === TransactionType.PAYBACK) {
          matchesBillStatus = false;
        } else {
          const dueInfo = customerDueInfo[transaction.customerId];
          if (!dueInfo) return false;
          
          switch (billStatusFilter) {
            case 'overdue':
              matchesBillStatus = overdueTransactionIds.includes(transaction.id!);
              break;
            case 'due_soon':
              matchesBillStatus = !dueInfo.isOverdue && dueInfo.daysUntilDue >= 0 && dueInfo.daysUntilDue <= 3 && dueInfo.hasDebt;
              break;
          }
        }
      }
      
      let matchesCustomerFilter = true;
      if (customerFilter !== 'all') {
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
      
      return matchesSearch && matchesDate && matchesType && matchesBillStatus && matchesCustomerFilter;
    });
  }, [transactions, searchText, filterDate, filterType, customers, customerFilter, customerDueInfo, overdueTransactionIds, billStatusFilter]);

  const clearFilters = () => {
    setSearchText('');
    setFilterDate('');
    setFilterType('all');
    setCustomerFilter('all');
    setOverdueDepthFilter('all');
    setBillStatusFilter('all');
  };

  const hasActiveFilters = searchText !== '' || filterDate !== '' || filterType !== 'all' || customerFilter !== 'all' || overdueDepthFilter !== 'all' || billStatusFilter !== 'all';

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
    if (overdueDepthFilter !== 'all') {
      const depthMap: Record<OverdueDepthType, string> = {
        'all': '',
        'week': '1周内逾期',
        'month': '1个月内逾期',
        'over_month': '1个月以上逾期'
      };
      parts.push(depthMap[overdueDepthFilter]);
    }
    if (filterDate) {
      parts.push(filterDate);
    }
    return parts.length > 0 ? parts.join(' · ') : '筛选';
  };

  // 统计数据
  const stats = useMemo(() => {
    const now = new Date();
    let overdueCount = 0;
    let overdueAmount = 0;
    let totalReceivable = 0;
    let totalDebt = 0;
    let totalPayment = 0;
    let todayDebt = 0;
    let todayPayment = 0;

    customers.forEach(customer => {
      const customerTransactions = transactions.filter(t => t.customerId === customer.id);
      const customerDebt = customerTransactions
        .filter(t => t.type === TransactionType.DEBT)
        .reduce((sum, t) => sum + t.amount, 0);
      const customerPayment = customerTransactions
        .filter(t => t.type === TransactionType.PAYBACK)
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = customerDebt - customerPayment;

      totalDebt += customerDebt;
      totalPayment += customerPayment;

      if (balance > 0) {
        totalReceivable += balance;
      }

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

      let customerOverdueAmount = 0;
      let isOverdue = false;

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
        }
      }

      if (isOverdue) {
        overdueCount++;
        overdueAmount += customerOverdueAmount;
      }
    });

    // 今日统计
    transactions.forEach(t => {
      if (isToday(new Date(t.occurredAt))) {
        if (t.type === TransactionType.DEBT) {
          todayDebt += t.amount;
        } else {
          todayPayment += t.amount;
        }
      }
    });

    return {
      overdueCount,
      overdueAmount,
      totalReceivable,
      totalDebt,
      totalPayment,
      todayDebt,
      todayPayment,
      alertCount: overdueCount + collectionData.filter(c => !c.isOverdue).length,
    };
  }, [customers, transactions, collectionData]);

  const formatAmount = (amount: number, type: TransactionType) => {
    if (type === TransactionType.DEBT) {
      return `-¥${amount.toFixed(2)}`;
    }
    return `+¥${amount.toFixed(2)}`;
  };

  const getAmountColor = (type: TransactionType) => {
    return type === TransactionType.DEBT ? 'text-rose-600' : 'text-emerald-600';
  };

  const getCardStyle = () => {
    return 'bg-white shadow-sm';
  };

  const getTypeBadgeStyle = (type: TransactionType) => {
    if (type === TransactionType.DEBT) {
      return 'bg-rose-50 text-rose-600';
    }
    return 'bg-emerald-50 text-emerald-600';
  };

  // 催收模式渲染
  const renderCollectionView = () => (
    <>
      {/* 统计卡片 - 只保留逾期总额 */}
      <div className="max-w-2xl mx-auto px-4 py-3 mt-12">
        <div className={`bg-white rounded-xl p-4 shadow-sm ${stats.overdueAmount === 0 ? '' : ''}`}>
          <div className={`text-xs mb-1 flex items-center gap-1 ${stats.overdueAmount > 0 ? 'text-rose-500' : 'text-gray-400'}`}>
            <AlertTriangle className="w-3 h-3" />
            逾期总额
          </div>
          <p className="text-2xl font-bold font-mono">
            <span className="text-sm text-gray-400 mr-0.5">¥</span>
            <span className={stats.overdueAmount > 0 ? 'text-gray-900' : 'text-gray-400'}>
              {stats.overdueAmount.toFixed(0)}
            </span>
          </p>
        </div>
      </div>

      {/* 客户列表 - 极简样式 */}
      <main className="max-w-2xl mx-auto px-4 pb-6">
        {filteredCollectionData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-900 mb-1">太棒了，目前没有逾期账单</p>
            <p className="text-sm text-gray-400">所有客户都在按时还款，请继续保持</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCollectionData.map((customer) => {
              const isExpanded = expandedCustomers.has(customer.customerId);
              
              return (
                <div
                  key={customer.customerId}
                  className="bg-white rounded-xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform"
                >
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => {
                      setExpandedCustomers(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(customer.customerId)) {
                          newSet.delete(customer.customerId);
                        } else {
                          newSet.add(customer.customerId);
                        }
                        return newSet;
                      });
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{customer.customerName}</span>
                        <span className="text-xs text-red-600 font-medium">已逾期 {customer.overdueDays} 天</span>
                      </div>
                      {customer.overdueCount > 1 && (
                        <div className="text-xs text-gray-400 mt-1">
                          共 {customer.overdueCount} 笔逾期，点击查看明细
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right w-20 flex-shrink-0">
                        <p className="font-bold text-rose-600 font-mono text-lg">
                          <span className="text-xs text-gray-400">¥</span>{customer.overdueAmount.toFixed(0)}
                        </p>
                      </div>
                      {customer.overdueCount > 1 && (
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {/* 展开后的逾期明细列表 */}
                  {isExpanded && customer.overdueCount > 1 && (
                    <div className="border-t border-red-100 bg-white">
                      {customer.overdueTransactions.map((tx) => (
                        <div 
                          key={tx.id}
                          className="flex items-start justify-between px-3 py-2 border-b border-gray-100 last:border-b-0 gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500">
                              {tx.date}
                              <span className="mx-2">|</span>
                              <span className="text-red-600">逾期 {tx.overdueDays} 天</span>
                            </div>
                            {tx.note && (
                              <div 
                                className="mt-1 flex items-start gap-1 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedNotes(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(tx.id)) {
                                      newSet.delete(tx.id);
                                    } else {
                                      newSet.add(tx.id);
                                    }
                                    return newSet;
                                  });
                                }}
                              >
                                <span className="text-gray-400 text-xs flex-shrink-0">备注:</span>
                                <div className="flex-1 min-w-0 flex items-start gap-1">
                                  <span className={`text-xs text-gray-600 flex-1 ${expandedNotes.has(tx.id) ? '' : 'line-clamp-1'}`}>
                                    {tx.note}
                                  </span>
                                  {tx.note.length > 14 && (
                                    <span className="flex-shrink-0 text-gray-400">
                                      {expandedNotes.has(tx.id) ? (
                                        <ChevronUp className="w-3 h-3" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0 w-20">
                            <p className="font-semibold text-rose-600 font-mono text-sm">
                              <span className="text-xs text-gray-400">¥</span>{tx.amount.toFixed(0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );

  // 账目模式渲染
  const renderJournalView = () => (
    <>
      {/* 统计卡片 - 简洁样式 */}
      <div className="max-w-2xl mx-auto px-4 py-3 mt-12">
        {/* 第一行：累计数据 */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-gray-400 text-xs mb-1">总待收</div>
            <p className="text-base font-bold text-gray-900 font-mono">
              <span className="text-xs text-gray-400">¥</span>{stats.totalReceivable.toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-gray-400 text-xs mb-1">总欠款</div>
            <p className="text-base font-bold text-gray-900 font-mono">
              <span className="text-xs text-gray-400">¥</span>{stats.totalDebt.toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-gray-400 text-xs mb-1">总还款</div>
            <p className="text-base font-bold text-gray-900 font-mono">
              <span className="text-xs text-gray-400">¥</span>{stats.totalPayment.toFixed(0)}
            </p>
          </div>
        </div>
        
        {/* 第二行：今日数据 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-gray-400 text-xs mb-1">今日欠款</div>
            <p className="text-base font-bold text-gray-900 font-mono">
              <span className="text-xs text-gray-400">¥</span>{stats.todayDebt.toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-gray-400 text-xs mb-1">今日收款</div>
            <p className="text-base font-bold text-gray-900 font-mono">
              <span className="text-xs text-gray-400">¥</span>{stats.todayPayment.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pb-6">
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
                className={`rounded-xl shadow-sm p-4 transition-all active:scale-[0.98] cursor-pointer ${getCardStyle()}`}
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
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(transaction.occurredAt), 'yyyy-MM-dd', { locale: zhCN })}
                    </p>
                    {transaction.note && (
                      <div 
                        className="mt-2 flex items-start gap-1.5 cursor-pointer"
                        onClick={(e) => toggleNoteExpand(transaction.id!, e)}
                      >
                        <span className="text-gray-400 text-xs flex-shrink-0">备注:</span>
                        <div className="flex-1 min-w-0 flex items-start gap-1">
                          <p className={`text-xs text-gray-500 leading-relaxed flex-1 ${
                            expandedNotes.has(transaction.id!) ? '' : 'line-clamp-1'
                          }`}>
                            {transaction.note}
                          </p>
                          {transaction.note.length > 14 && (
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
                  <div className="flex-shrink-0 text-right w-28">
                    <p className={`text-xl font-bold whitespace-nowrap font-mono ${getAmountColor(transaction.type)}`}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );

  return (
    <div 
      className="min-h-screen pb-24 bg-slate-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className="bg-white shadow-sm sticky top-12 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={viewMode === 'collection' ? '搜索客户名称...' : '搜索客户名称...'}
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
                  ? viewMode === 'collection' 
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'bg-blue-50 border-blue-300 text-blue-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">
                {hasActiveFilters ? getFilterSummary() : '筛选'}
              </span>
              {hasActiveFilters && (
                <span className={`w-2 h-2 rounded-full ${viewMode === 'collection' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">筛选条件</h2>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {viewMode === 'collection' ? (
                <>
                  {/* 催收模式筛选 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">逾期深度</h3>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: '全部' },
                        { value: 'week', label: '1周内逾期' },
                        { value: 'month', label: '1个月内逾期' },
                        { value: 'over_month', label: '1个月以上逾期' },
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => setOverdueDepthFilter(option.value as OverdueDepthType)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                            overdueDepthFilter === option.value
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            overdueDepthFilter === option.value ? 'border-red-500' : 'border-gray-300'
                          }`}>
                            {overdueDepthFilter === option.value && <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
                          </div>
                          <span className="text-sm">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 账目模式筛选 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">交易类型</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFilterTypeChange('all')}
                        className={`flex-1 py-2 px-3 text-sm rounded-full border transition-colors ${
                          filterType === 'all'
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        全部
                      </button>
                      <button
                        onClick={() => handleFilterTypeChange(TransactionType.DEBT)}
                        className={`flex-1 py-2 px-3 text-sm rounded-full border transition-colors ${
                          filterType === TransactionType.DEBT
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        欠款
                      </button>
                      <button
                        onClick={() => handleFilterTypeChange(TransactionType.PAYBACK)}
                        className={`flex-1 py-2 px-3 text-sm rounded-full border transition-colors ${
                          filterType === TransactionType.PAYBACK
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        还款
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">交易日期</h3>
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

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">账单状态</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBillStatusFilter('all')}
                        disabled={filterType === TransactionType.PAYBACK}
                        className={`flex-1 py-2 px-3 text-sm rounded-full border transition-colors ${
                          filterType === TransactionType.PAYBACK
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : billStatusFilter === 'all'
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        全部
                      </button>
                      <button
                        onClick={() => setBillStatusFilter('overdue')}
                        disabled={filterType === TransactionType.PAYBACK}
                        className={`flex-1 py-2 px-3 text-sm rounded-full border transition-colors ${
                          filterType === TransactionType.PAYBACK
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : billStatusFilter === 'overdue'
                              ? 'bg-red-100 text-red-600 border-red-200'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        已逾期
                      </button>
                      <button
                        onClick={() => setBillStatusFilter('due_soon')}
                        disabled={filterType === TransactionType.PAYBACK}
                        className={`flex-1 py-2 px-3 text-sm rounded-full border transition-colors ${
                          filterType === TransactionType.PAYBACK
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : billStatusFilter === 'due_soon'
                              ? 'bg-orange-100 text-orange-600 border-orange-200'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        3天内到期
                      </button>
                    </div>
                    {filterType === TransactionType.PAYBACK && (
                      <p className="text-xs text-gray-400 mt-1.5">还款记录不支持按账单状态筛选</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
                className={`w-full py-2.5 text-white text-sm font-medium rounded-lg transition-colors ${
                  viewMode === 'collection' 
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                查看结果 ({viewMode === 'collection' ? filteredCollectionData.length : filteredTransactions.length}条)
              </button>
            </div>
          </div>
        </>
      )}

      {viewMode === 'collection' ? renderCollectionView() : renderJournalView()}

      <button
        onClick={() => {
          if (!user) {
            onOpenLogin?.();
            return;
          }
          setEditingTransaction(undefined);
          setIsDrawerOpen(true);
        }}
        className={`fixed bottom-20 right-6 w-16 h-16 text-white rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center z-50 ${
          viewMode === 'collection'
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
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
        onOpenLogin={onOpenLogin}
      />
    </div>
  );
}
