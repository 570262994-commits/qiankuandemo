import { useState } from 'react';
import { User, LogOut, Mail, Shield, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import ChangeEmail from '../components/ChangeEmail';
import ChangePassword from '../components/ChangePassword';

interface ProfileProps {
  onOpenLogin: () => void;
}

export default function Profile({ onOpenLogin }: ProfileProps) {
  const { user, signOut } = useAuthStore();
  const toast = useToastStore();
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('已退出登录');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">我的</h1>

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.email}</p>
                <p className="text-sm text-gray-500">已登录</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">退出</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">登录 / 注册</p>
                  <p className="text-sm text-gray-500">登录后可同步数据到云端</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* 数据说明 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">数据存储</h2>
          <div className="bg-blue-50 rounded-lg p-4">
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• 登录后数据自动同步到云端</li>
              <li>• 更换设备登录同一账号即可查看数据</li>
              <li>• 数据安全存储在阿里云 Supabase</li>
            </ul>
          </div>
        </div>

        {/* 功能列表 */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm">
            <button 
              onClick={() => setShowChangeEmail(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">修改邮箱</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button 
              onClick={() => setShowChangePassword(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">修改密码</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      <ChangeEmail isOpen={showChangeEmail} onClose={() => setShowChangeEmail(false)} />
      <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  );
}
