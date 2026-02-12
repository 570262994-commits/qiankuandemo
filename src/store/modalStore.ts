import { create } from 'zustand';
import type { ModalType, ModalButton } from '../components/CustomModal';

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title?: string;
  message: string;
  buttons?: ModalButton[];
  onConfirm?: () => void;
  show: (config: {
    type?: ModalType;
    title?: string;
    message: string;
    buttons?: ModalButton[];
    onConfirm?: () => void;
  }) => void;
  hide: () => void;
  alert: (message: string, title?: string) => void;
  confirm: (message: string, onConfirm: () => void, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  type: 'alert',
  title: undefined,
  message: '',
  buttons: undefined,
  onConfirm: undefined,

  show: (config) => {
    set({
      isOpen: true,
      type: config.type || 'alert',
      title: config.title,
      message: config.message,
      buttons: config.buttons,
      onConfirm: config.onConfirm,
    });
  },

  hide: () => {
    set({
      isOpen: false,
      type: 'alert',
      title: undefined,
      message: '',
      buttons: undefined,
      onConfirm: undefined,
    });
  },

  alert: (message, title) => {
    get().show({
      type: 'alert',
      message,
      title,
      buttons: [
        { text: '知道了', onClick: get().hide, style: 'primary' },
      ],
    });
  },

  confirm: (message, onConfirm, title) => {
    get().show({
      type: 'confirm',
      message,
      title,
      onConfirm,
      buttons: [
        { text: '取消', onClick: get().hide, style: 'secondary' },
        {
          text: '确定',
          onClick: () => {
            onConfirm();
            get().hide();
          },
          style: 'primary',
        },
      ],
    });
  },

  success: (message, title) => {
    get().show({
      type: 'success',
      message,
      title,
      buttons: [
        { text: '知道了', onClick: get().hide, style: 'primary' },
      ],
    });
  },

  error: (message, title) => {
    get().show({
      type: 'error',
      message,
      title,
      buttons: [
        { text: '知道了', onClick: get().hide, style: 'primary' },
      ],
    });
  },

  warning: (message, title) => {
    get().show({
      type: 'warning',
      message,
      title,
      buttons: [
        { text: '知道了', onClick: get().hide, style: 'primary' },
      ],
    });
  },
}));
