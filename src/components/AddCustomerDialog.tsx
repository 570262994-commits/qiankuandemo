import { useEffect, useState, useMemo } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useCustomerStore } from '../store/customerStore';
import { useTransactionStore } from '../store/transactionStore';
import { useModalStore } from '../store/modalStore';
import { useToastStore } from '../store/toastStore';
import { CREDIT_LIMIT_UNLIMITED, TransactionType } from '../types';
import type { Customer } from '../types';

interface AddCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  customer?: Customer;
  onOpenLogin?: () => void;
}

export default function AddCustomerDialog({ isOpen, onClose, onSubmit, customer }: AddCustomerDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUnlimitedCredit, setIsUnlimitedCredit] = useState(true);
  const [creditLimit, setCreditLimit] = useState('0');
  const [paymentTerm, setPaymentTerm] = useState('30');
  const { addCustomer, updateCustomer, getCustomerByName } = useCustomerStore();
  const { transactions } = useTransactionStore();
  const { warning, confirm } = useModalStore();
  const toast = useToastStore();

  const isEditMode = !!customer;

  const resetForm = () => {
    setName('');
    setPhone('');
    setIsUnlimitedCredit(true);
    setCreditLimit('0');
    setPaymentTerm('30');
  };

  const currentDebt = useMemo(() => {
    if (!customer) return 0;
    const customerTransactions = transactions.filter(t => t.customerId === customer.id);
    const totalDebt = customerTransactions
      .filter(t => t.type === TransactionType.DEBT)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPayment = customerTransactions
      .filter(t => t.type === TransactionType.PAYBACK)
      .reduce((sum, t) => sum + t.amount, 0);
    return totalDebt - totalPayment;
  }, [customer, transactions]);

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setName(customer.name);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPhone(customer.phone || '');
        if (customer.creditLimit === CREDIT_LIMIT_UNLIMITED) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsUnlimitedCredit(true);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCreditLimit('0');
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsUnlimitedCredit(false);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCreditLimit(customer.creditLimit.toString());
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPaymentTerm(customer.paymentTerm.toString());
      } else {
        resetForm();
      }
    }
  }, [isOpen, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      warning('请输入客户姓名');
      return;
    }

    if (name.length < 1 || name.length > 20) {
      warning('客户姓名长度应在1-20个字符之间');
      return;
    }

    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      warning('请输入有效的手机号');
      return;
    }

    const finalCreditLimit = isUnlimitedCredit ? CREDIT_LIMIT_UNLIMITED : parseInt(creditLimit) || 0;

    if (!isUnlimitedCredit && parseInt(creditLimit) < 0) {
      warning('信用额度不能为负数');
      return;
    }

    if (parseInt(paymentTerm) <= 0) {
      warning('固定账期必须大于0');
      return;
    }

    if (isEditMode && customer && !isUnlimitedCredit && finalCreditLimit < currentDebt) {
      const overAmount = currentDebt - finalCreditLimit;
      confirm(
        `当前设置的额度 ¥${finalCreditLimit} 低于已有欠款 ¥${currentDebt.toFixed(0)}，该客户将进入"超额"状态（超出 ¥${overAmount.toFixed(0)}）并无法新增欠款，是否确认？`,
        async () => {
          await doSubmit(finalCreditLimit);
        },
        '额度设置确认'
      );
      return;
    }

    await doSubmit(finalCreditLimit);
  };

  const doSubmit = async (finalCreditLimit: number) => {
    try {
      if (isEditMode && customer) {
        if (name !== customer.name) {
          const existingCustomer = await getCustomerByName(name);
          if (existingCustomer && existingCustomer.id !== customer.id) {
            warning('客户姓名已存在');
            return;
          }
        }

        await updateCustomer(customer.id!, {
          name: name.trim(),
          phone: phone.trim() || undefined,
          creditLimit: finalCreditLimit,
          paymentTerm: parseInt(paymentTerm),
        });

        toast.success('客户信息更新成功！');
        onSubmit();
      } else {
        const existingCustomer = await getCustomerByName(name);
        if (existingCustomer) {
          warning('客户已存在，请直接录入账务');
          return;
        }

        await addCustomer({
          name: name.trim(),
          phone: phone.trim() || undefined,
          creditLimit: finalCreditLimit,
          paymentTerm: parseInt(paymentTerm),
        });

        toast.success('客户添加成功！');
        onSubmit();
      }
    } catch (err) {
      console.error('Failed to save customer:', err);
      toast.error(isEditMode ? '更新客户失败，请重试' : '添加客户失败，请重试');
    }
  };

  if (!isOpen) return null;

  const willExceedCredit = isEditMode && customer && !isUnlimitedCredit && parseInt(creditLimit) < currentDebt;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">{isEditMode ? '编辑客户' : '新增客户'}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                客户姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入客户姓名"
                maxLength={20}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入手机号（选填）"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  信用额度（元）
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-500">无限额度</span>
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      isUnlimitedCredit ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setIsUnlimitedCredit(!isUnlimitedCredit)}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                        isUnlimitedCredit ? 'left-6' : 'left-1'
                      }`}
                    />
                  </div>
                </label>
              </div>
              {!isUnlimitedCredit && (
                <>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    placeholder="0"
                    step="1"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      willExceedCredit ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
                    }`}
                  />
                  {isEditMode && customer && currentDebt > 0 && (
                    <div className="mt-2 px-3 py-2 bg-slate-50 rounded-lg text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span>当前欠款</span>
                        <span className="font-medium text-gray-700">¥{currentDebt.toFixed(0)}</span>
                      </div>
                      {willExceedCredit && (
                        <div className="flex items-center gap-1 mt-1.5 text-amber-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>设置后将超出额度 ¥{(currentDebt - parseInt(creditLimit)).toFixed(0)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {isUnlimitedCredit && (
                <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 font-medium">
                  无限制
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {isUnlimitedCredit ? '客户可无限欠款' : '0 表示不允许欠款'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                固定账期（天） <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentTerm(Math.max(1, parseInt(paymentTerm) - 1).toString())}
                  className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xl font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  value={paymentTerm}
                  onChange={(e) => setPaymentTerm(Math.max(1, parseInt(e.target.value) || 1).toString())}
                  min="1"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setPaymentTerm((parseInt(paymentTerm) + 1).toString())}
                  className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                {isEditMode ? '确认修改' : '确认添加'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
