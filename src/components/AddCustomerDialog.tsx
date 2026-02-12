import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useCustomerStore } from '../store/customerStore';
import { useModalStore } from '../store/modalStore';
import type { Customer } from '../types';

interface AddCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  customer?: Customer;
}

export default function AddCustomerDialog({ isOpen, onClose, onSubmit, customer }: AddCustomerDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [creditLimit, setCreditLimit] = useState('0');
  const [paymentTerm, setPaymentTerm] = useState('30');
  const { addCustomer, updateCustomer, getCustomerByName } = useCustomerStore();
  const { warning, error, success } = useModalStore();

  const isEditMode = !!customer;

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setName(customer.name);
        setPhone(customer.phone || '');
        setCreditLimit(customer.creditLimit.toString());
        setPaymentTerm(customer.paymentTerm.toString());
      } else {
        resetForm();
      }
    }
  }, [isOpen, customer]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setCreditLimit('0');
    setPaymentTerm('30');
  };

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

    if (parseFloat(creditLimit) < 0) {
      warning('信用额度不能为负数');
      return;
    }

    if (parseInt(paymentTerm) <= 0) {
      warning('固定账期必须大于0');
      return;
    }

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
          creditLimit: parseFloat(creditLimit),
          paymentTerm: parseInt(paymentTerm),
        });

        success('客户信息更新成功！');
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
          creditLimit: parseFloat(creditLimit),
          paymentTerm: parseInt(paymentTerm),
        });

        success('客户添加成功！');
        onSubmit();
      }
    } catch (err) {
      console.error('Failed to save customer:', err);
      error(isEditMode ? '更新客户失败，请重试' : '添加客户失败，请重试');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{isEditMode ? '编辑客户' : '新增客户'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客户姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入客户姓名"
                maxLength={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                信用额度（元） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-bold"
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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
