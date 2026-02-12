import { useState } from 'react';
import { Users, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import SettingsPage from './pages/Settings';
import { CustomModal } from './components/CustomModal';
import { useModalStore } from './store/modalStore';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'customers' | 'settings'>('dashboard');
  const { isOpen, type, title, message, buttons, hide } = useModalStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'customers' && <Customers onBack={() => setCurrentView('dashboard')} />}
      {currentView === 'settings' && <SettingsPage />}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-500'
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
    </div>
  );
}

export default App;
