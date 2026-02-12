import { useEffect, useState } from 'react';
import { Plus, Search, Menu } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { useCustomerStore } from '../store/customerStore';
import { TransactionType } from '../types';
import type { Transaction } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import TransactionDrawer from '../components/TransactionDrawer';

export default function Dashboard() {
  const { transactions, fetchTransactions, deleteTransaction } = useTransactionStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchCustomers();
    fetchTransactions();
  }, [fetchCustomers, fetchTransactions]);

  const handleLongPressStart = (transactionId: number) => {
    const timer = setTimeout(() => {
      if (confirm('确定要删除这条记录吗？')) {
        deleteTransaction(transactionId);
      }
    }, 800);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || '未知客户';
  };

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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">客户欠款助手</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">暂无流水记录</p>
            <p className="text-sm mt-2">点击下方 + 号开始记账</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`rounded-lg shadow-sm p-4 transition-all hover:shadow-md active:scale-95 ${getCardStyle(transaction.type)}`}
                onMouseDown={() => handleLongPressStart(transaction.id!)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(transaction.id!)}
                onTouchEnd={handleLongPressEnd}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
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
                      <p className="text-xs text-gray-400 mt-1">{transaction.note}</p>
                    )}
                  </div>
                  <div className="text-right">
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
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-20 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      <TransactionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={() => {
          setIsDrawerOpen(false);
          fetchTransactions();
        }}
      />
    </div>
  );
}
