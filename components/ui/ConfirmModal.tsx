'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isProcessing = false,
  variant = 'danger'
}: ConfirmModalProps) {

  const variants = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      ring: 'focus:ring-red-500'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      ring: 'focus:ring-amber-500'
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      buttonBg: 'bg-teal-600 hover:bg-teal-700',
      ring: 'focus:ring-teal-500'
    }
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 ${config.iconBg} rounded-2xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                {!isProcessing && (
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                {title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {message}
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={onConfirm}
                  className={`flex-1 py-3 px-4 ${config.buttonBg} text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
