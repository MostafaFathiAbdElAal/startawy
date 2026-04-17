'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastProps {
  id: number;
  type: ToastType;
  title: string;    // always required — write it in English
  message: string;  // always required — write it in English
  duration?: number;
  onDismiss: () => void;
}

// ─── Per-type config ──────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<
  ToastType,
  { gradient: string; glow: string; border: string; icon: React.ElementType; progressColor: string }
> = {
  success: {
    gradient: 'linear-gradient(135deg, #00BBA7 0%, #059669 100%)',
    glow: 'rgba(0, 187, 167, 0.22)',
    border: 'rgba(0, 187, 167, 0.35)',
    icon: CheckCircle2,
    progressColor: 'rgba(255,255,255,0.55)',
  },
  error: {
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #dc2626 100%)',
    glow: 'rgba(244, 63, 94, 0.22)',
    border: 'rgba(244, 63, 94, 0.35)',
    icon: XCircle,
    progressColor: 'rgba(255,255,255,0.55)',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    glow: 'rgba(245, 158, 11, 0.22)',
    border: 'rgba(245, 158, 11, 0.35)',
    icon: AlertTriangle,
    progressColor: 'rgba(255,255,255,0.55)',
  },
};

// ─── Toast component ──────────────────────────────────────────────────────────

export function Toast({ type, title, message, duration = 4000, onDismiss }: ToastProps) {
  // Peek state: nudge left when toast is about to expire.
  // Triggered via a single setTimeout — zero rAF, zero setProgress re-renders.
  const [peeking, setPeeking] = useState(false);
  const peekedRef = useRef(false);
  const config = TOAST_CONFIG[type];
  const Icon = config.icon;

  // Schedule peek at ~83% of the duration (17% remaining)
  useEffect(() => {
    const peekAt = duration * 0.83;
    const timer = setTimeout(() => {
      if (peekedRef.current) return;
      peekedRef.current = true;
      setPeeking(true);
      // Reset peeking so the element returns to x:0 cleanly
      setTimeout(() => setPeeking(false), 550);
    }, peekAt);
    return () => clearTimeout(timer);
  }, [duration]);

  // ── Animation targets ─────────────────────────────────────────────────────
  // easeInOut prevents spring overshoot on the peek (no double-bounce).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const peekTransition: any = { duration: 0.52, ease: 'easeInOut', times: [0, 0.45, 1] };
  const entryTransition = { type: 'spring' as const, stiffness: 300, damping: 26, mass: 0.9 };

  return (
    <motion.div
      initial={{ x: -90, opacity: 0, scale: 0.92 }}
      animate={
        peeking
          ? { x: [0, -24, 0] as number[], opacity: 1, scale: 1 }
          : { x: 0, opacity: 1, scale: 1 }
      }
      transition={peeking ? peekTransition : entryTransition}
      exit={{ x: -90, opacity: 0, scale: 0.88, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
      style={{
        background: config.gradient,
        boxShadow: `0 6px 28px ${config.glow}, 0 2px 6px rgba(0,0,0,0.10)`,
        border: `1px solid ${config.border}`,
        // Hint to the compositor: only transform and opacity will change
        willChange: 'transform, opacity',
      }}
      className="relative w-[330px] rounded-2xl overflow-hidden text-white select-none"
      role="alert"
      aria-live="polite"
    >
      {/* Glassy shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 55%, transparent 100%)',
        }}
      />

      {/* Main content */}
      <div className="relative flex items-start gap-3 px-4 pt-4 pb-5">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="w-5 h-5 drop-shadow-sm" strokeWidth={2.2} />
        </div>

        <div className="flex-1 min-w-0 pr-5">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-75 leading-none mb-1">
            {title}
          </p>
          <p className="text-[13px] font-semibold leading-snug">{message}</p>
        </div>

        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-white/20 transition-all"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar — pure CSS animation, ZERO JS state updates */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15">
        <div
          className="h-full rounded-full toast-progress"
          style={{
            background: config.progressColor,
            // CSS custom property drives the animation-duration in globals.css
            '--toast-duration': `${duration}ms`,
          } as React.CSSProperties}
        />
      </div>
    </motion.div>
  );
}

// ─── Container (used by ToastProvider) ────────────────────────────────────────

interface ToastContainerProps {
  toast: ToastProps | null;
}

export function ToastContainer({ toast }: ToastContainerProps) {
  return (
    <div aria-label="Notifications" className="fixed bottom-6 left-6 z-[9999]">
      <AnimatePresence mode="wait">
        {toast && <Toast key={toast.id} {...toast} />}
      </AnimatePresence>
    </div>
  );
}
