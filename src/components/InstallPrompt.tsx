import { useState, useEffect } from 'react';
import { X, Share, Plus } from 'lucide-react';

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = (window.navigator as NavigatorWithStandalone).standalone === true;
    const wasDismissed = localStorage.getItem('installPromptDismissed') === 'true';

    if (isIOS && !isStandalone && !wasDismissed) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center">
      <div className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">添加到主屏幕</h3>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          将「欠款助手」添加到主屏幕，即可像原生 App 一样全屏使用。
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">步骤 1:</span>
              <Share className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">点击分享图标</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">步骤 2:</span>
              <Plus className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">选择「添加到主屏幕」</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          我知道了
        </button>
      </div>
    </div>
  );
}
