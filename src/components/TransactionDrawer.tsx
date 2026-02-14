import { useEffect, useState, useRef, useMemo } from 'react';
import { X, ChevronDown, User } from 'lucide-react';
import { useCustomerStore } from '../store/customerStore';
import { useTransactionStore } from '../store/transactionStore';
import { useModalStore } from '../store/modalStore';
import { useToastStore } from '../store/toastStore';
import { TransactionType, CREDIT_LIMIT_UNLIMITED } from '../types';
import type { Customer, Transaction } from '../types';
import { format, addDays } from 'date-fns';

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  transaction?: Transaction;
  onOpenLogin?: () => void;
}

export default function TransactionDrawer({ isOpen, onClose, onSubmit, transaction }: TransactionDrawerProps) {
  const [type, setType] = useState<TransactionType>(TransactionType.DEBT);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  
  const { customers, addCustomer, getCustomerByName } = useCustomerStore();
  const { transactions, addTransaction, updateTransaction } = useTransactionStore();
  const { warning } = useModalStore();
  const toast = useToastStore();
  const amountInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!transaction;

  const customerRemainingCredit = useMemo(() => {
    if (!selectedCustomer) return null;
    
    if (selectedCustomer.creditLimit === CREDIT_LIMIT_UNLIMITED) return null;
    
    const customerTransactions = transactions.filter(t => t.customerId === selectedCustomer.id);
    const totalDebt = customerTransactions
      .filter(t => t.type === TransactionType.DEBT)
      .filter(t => !isEditMode || t.id !== transaction?.id)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPayment = customerTransactions
      .filter(t => t.type === TransactionType.PAYBACK)
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalDebt - totalPayment;
    
    return selectedCustomer.creditLimit - balance;
  }, [selectedCustomer, transactions, isEditMode, transaction?.id]);

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setDate(format(new Date(transaction.occurredAt), 'yyyy-MM-dd'));
        setNote(transaction.note || '');
        const customer = customers.find(c => c.id === transaction.customerId);
        if (customer) {
          setSelectedCustomer(customer);
        }
      } else {
        resetForm();
      }
      if (amountInputRef.current) {
        setTimeout(() => amountInputRef.current?.focus(), 300);
      }
    }
  }, [isOpen, transaction, customers]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      warning('请选择客户');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      warning('请输入有效金额');
      return;
    }

    const inputAmount = parseFloat(amount);

    if (type === TransactionType.DEBT) {
      if (selectedCustomer.creditLimit === 0) {
        warning('该客户信用额度为0，不允许录入欠款');
        return;
      }
      
      if (customerRemainingCredit !== null && inputAmount > customerRemainingCredit) {
        warning(`该客户信用额度不足，剩余额度 ¥${customerRemainingCredit.toFixed(2)}`);
        return;
      }
    }

    try {
      const customer = await getCustomerByName(selectedCustomer.name);
      if (!customer) {
        toast.error('客户不存在');
        return;
      }

      const occurredAt = new Date(date);
      const dueDate = addDays(occurredAt, customer.paymentTerm);

      if (isEditMode && transaction) {
        await updateTransaction(transaction.id!, {
          customerId: customer.id!,
          type,
          amount: parseFloat(amount),
          occurredAt,
          dueDate,
          note: note || undefined,
        });

        toast.success('记录更新成功！');
        onSubmit();
        resetForm();
      } else {
        await addTransaction({
          customerId: customer.id!,
          type,
          amount: parseFloat(amount),
          occurredAt,
          dueDate,
          note: note || undefined,
        });

        toast.success('记录成功！');
        onSubmit();
        resetForm();
      }
    } catch (err) {
      console.error('Failed to save transaction:', err);
      toast.error(isEditMode ? '更新记录失败，请重试' : '记录失败，请重试');
    }
  };

  const resetForm = () => {
    setType(TransactionType.DEBT);
    setSelectedCustomer(null);
    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setNote('');
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const handleQuickAddCustomer = async () => {
    if (!customerSearch.trim()) {
      warning('请输入客户名称');
      return;
    }

    try {
      const existingCustomer = await getCustomerByName(customerSearch);
      if (existingCustomer) {
        warning('客户已存在');
        return;
      }

      const id = await addCustomer({
        name: customerSearch,
        phone: '',
        creditLimit: CREDIT_LIMIT_UNLIMITED,
        paymentTerm: 30,
      });

      const newCustomer = { id, name: customerSearch, phone: '', creditLimit: CREDIT_LIMIT_UNLIMITED, paymentTerm: 30 };
      setSelectedCustomer(newCustomer);
      setShowCustomerDropdown(false);
      setCustomerSearch('');
    } catch (err) {
      console.error('Failed to add customer:', err);
      toast.error('添加客户失败');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{isEditMode ? '编辑记录' : '记一笔'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setType(TransactionType.DEBT)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                type === TransactionType.DEBT
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              欠款
            </button>
            <button
              onClick={() => setType(TransactionType.PAYBACK)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                type === TransactionType.PAYBACK
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              还款
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择客户</label>
              <button
                onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className={selectedCustomer ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedCustomer ? selectedCustomer.name : '请选择客户'}
                  </span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>

              {showCustomerDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      placeholder="搜索客户..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerDropdown(false);
                          setCustomerSearch('');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-500 mb-2">未找到客户</p>
                      <button
                        onClick={handleQuickAddCustomer}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        快速新建 "{customerSearch}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">金额</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">¥</span>
                <input
                  ref={amountInputRef}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  step="1"
                  min="0"
                  className="w-full pl-12 pr-4 py-4 text-3xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">备注（选填）</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加备注..."
                rows={2}
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedCustomer || !amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:scale-98 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isEditMode ? '确认修改' : '确认提交'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
