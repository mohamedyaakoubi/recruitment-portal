/**
 * Dashboard Toast Hook
 * Manages toast notifications
 */

import { useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

export const useDashboardToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  return {
    toast,
    setToast,
    showToast,
  };
};
