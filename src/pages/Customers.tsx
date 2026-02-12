import { useEffect, useState } from 'react';
import { Search, Plus, Phone, ArrowLeft } from 'lucide-react';
import { useCustomerStore } from '../store/customerStore';
import type { Customer } from '../types';
import AddCustomerDialog from '../components/AddCustomerDialog';

export default function Customers({ onBack }: { onBack: () => void }) {
  const { customers, fetchCustomers } = useCustomerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">客户管理</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索客户..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">
              {searchQuery ? '未找到匹配的客户' : '暂无客户，请先添加'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{customer.name}</h3>
                    {customer.phone && (
                      <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    )}
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">信用额度</span>
                        <span className="font-medium">¥{customer.creditLimit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">固定账期</span>
                        <span className="font-medium">{customer.paymentTerm} 天</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setIsAddDialogOpen(true)}
        className="fixed bottom-20 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AddCustomerDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={() => {
          setIsAddDialogOpen(false);
          fetchCustomers();
        }}
      />
    </div>
  );
}
