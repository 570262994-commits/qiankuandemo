import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export type ModalType = 'alert' | 'confirm' | 'success' | 'error' | 'warning';

export interface ModalButton {
  text: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

interface CustomModalProps {
  isOpen: boolean;
  type?: ModalType;
  title?: string;
  message: string;
  buttons?: ModalButton[];
  onClose: () => void;
}

const getIcon = (type: ModalType) => {
  const iconProps = { className: 'w-12 h-12' };
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="w-12 h-12 text-emerald-500" />;
    case 'error':
      return <XCircle {...iconProps} className="w-12 h-12 text-red-500" />;
    case 'warning':
      return <AlertCircle {...iconProps} className="w-12 h-12 text-amber-500" />;
    case 'confirm':
      return <Info {...iconProps} className="w-12 h-12 text-blue-500" />;
    default:
      return <Info {...iconProps} className="w-12 h-12 text-blue-500" />;
  }
};

const getButtonStyle = (style: 'primary' | 'secondary' | 'danger' = 'primary') => {
  switch (style) {
    case 'danger':
      return 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700';
    case 'secondary':
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300';
    default:
      return 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700';
  }
};

export function CustomModal({
  isOpen,
  type = 'alert',
  title,
  message,
  buttons,
  onClose,
}: CustomModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultButtons: ModalButton[] = type === 'confirm'
    ? [
        { text: '取消', onClick: onClose, style: 'secondary' },
        { text: '确定', onClick: onClose, style: 'primary' },
      ]
    : [{ text: '知道了', onClick: onClose, style: 'primary' }];

  const displayButtons = buttons || defaultButtons;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl mx-6 w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 transform animate-bounce-in">
              {getIcon(type)}
            </div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
            )}
            <p className="text-gray-600 text-base leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="flex border-t border-gray-100">
          {displayButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={`flex-1 py-4 text-base font-medium transition-colors ${
                index > 0 ? 'border-l border-gray-100' : ''
              } ${getButtonStyle(button.style)}`}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
