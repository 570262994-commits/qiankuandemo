import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { getDeviceId, setDeviceId, formatDeviceId } from '../lib/deviceId';
import { useCustomerStore } from '../store/customerStore';
import { useTransactionStore } from '../store/transactionStore';
import { useToastStore } from '../store/toastStore';

export default function Settings() {
  const deviceId = getDeviceId();
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { fetchCustomers } = useCustomerStore();
  const { fetchTransactions } = useTransactionStore();
  const toast = useToastStore();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatDeviceId(deviceId));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('备份码已复制到剪贴板');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('复制失败，请手动复制');
    }
  };

  const handleSync = async () => {
    if (!inputCode.trim()) {
      toast.error('请输入备份码');
      return;
    }

    const code = inputCode.trim().toLowerCase();
    
    if (code === deviceId) {
      toast.error('这是当前设备的备份码，无需同步');
      return;
    }

    try {
      setDeviceId(code);
      await fetchCustomers();
      await fetchTransactions();
      toast.success('数据同步成功！');
      setInputCode('');
    } catch (err) {
      console.error('Failed to sync:', err);
      toast.error('同步失败，请检查备份码是否正确');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">数据同步</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">数据备份</h2>
          <p className="text-gray-600 text-sm mb-4">
            您的数据已自动备份到云端。
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">备份码</p>
                <p className="font-mono text-sm font-semibold text-gray-900 truncate">
                  {formatDeviceId(deviceId)}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 使用说明</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 更换设备时，在新设备输入此备份码即可同步数据</li>
              <li>• 备份码是您数据的唯一标识，请勿泄露给他人</li>
              <li>• 数据会自动云端同步，无需手动操作</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">数据同步</h2>
          <p className="text-gray-600 text-sm mb-4">
            更换设备时，输入备份码同步数据。
          </p>
          
          <div className="space-y-4">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="请输入备份码"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            
            <button
              onClick={handleSync}
              disabled={!inputCode.trim()}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              同步数据
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
