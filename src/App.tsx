import { useState } from 'react';
import { Users, Settings, AlertTriangle, Receipt } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import SettingsPage from './pages/Settings';
import { CustomModal } from './components/CustomModal';
import { ToastContainer } from './components/Toast';
import { useModalStore } from './store/modalStore';
import { useToastStore } from './store/toastStore';
import { useViewModeStore } from './store/viewModeStore';
import { useTransactionStore } from './store/transactionStore';
import { useCustomerStore } from './store/customerStore';
import { TransactionType } from './types';
import { differenceInDays, isToday } from 'date-fns';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'customers' | 'settings'>('dashboard');
  const { isOpen, type, title, message, buttons, hide } = useModalStore();
  const { toasts, remove } = useToastStore();
  const { viewMode, setViewMode } = useViewModeStore();
  const { transactions } = useTransactionStore();
  const { customers } = useCustomerStore();

  // 计算统计数据
  const stats = {
    alertCount: (() => {
      const now = new Date();
      let count = 0;
      
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
        const debtTransactions = customerTransactions.filter(t => t.type === TransactionType.DEBT);

        for (const transaction of debtTransactions) {
          const debtDate = new Date(transaction.occurredAt);
          const dueDate = new Date(debtDate);
          dueDate.setDate(dueDate.getDate() + paymentTerm);
          
          if (differenceInDays(dueDate, now) < 0) {
            count++;
            break;
          }
        }
      });
      
      return count;
    })(),
    todayCount: transactions.filter(t => isToday(new Date(t.occurredAt))).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'customers' && <Customers onBack={() => setCurrentView('dashboard')} />}
      {currentView === 'settings' && <SettingsPage />}

      {/* 顶部双看板切换 Tab - 仅在首页显示 */}
      {currentView === 'dashboard' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-50">
          <div className="max-w-2xl mx-auto flex p-2 gap-1">
            <button
              onClick={() => setViewMode('collection')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg transition-all relative ${
                viewMode === 'collection'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium text-sm">异常提醒</span>
              {stats.alertCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-600">
                  {stats.alertCount}
                </span>
              )}
              {viewMode === 'collection' && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-red-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setViewMode('journal')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg transition-all relative ${
                viewMode === 'journal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span className="font-medium text-sm">收支明细</span>
              {stats.todayCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
                  {stats.todayCount}
                </span>
              )}
              {viewMode === 'journal' && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              currentView === 'dashboard' 
                ? viewMode === 'collection' ? 'text-red-600' : 'text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">首页</span>
          </button>
          <button
            onClick={() => setCurrentView('customers')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              currentView === 'customers' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">客户</span>
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              currentView === 'settings' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">设置</span>
          </button>
        </div>
      </nav>

      <CustomModal
        isOpen={isOpen}
        type={type}
        title={title}
        message={message}
        buttons={buttons}
        onClose={hide}
      />

      <ToastContainer toasts={toasts} removeToast={remove} />
    </div>
  );
}

export default App;
