'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import type { ToastType } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToastOptions {
  type: ToastType;
  message: string;       // required \u2014 write in English
  title: string;         // required \u2014 write in English
  duration?: number;
}

interface ToastState extends ToastOptions {
  id: number;
  onDismiss: () => void;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  dismissToast: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      // Cancel any existing auto-dismiss timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Set the new toast directly — the key change (Date.now()) tells
      // AnimatePresence to exit the old one and enter the new one.
      const newToast: ToastState = {
        ...options,
        id: Date.now(),
        onDismiss: dismissToast,
      };
      setToast(newToast);

      // Auto-dismiss after duration
      timerRef.current = setTimeout(dismissToast, options.duration ?? 4000);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toast={toast} />
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be called inside <ToastProvider>');
  }
  return ctx;
}
