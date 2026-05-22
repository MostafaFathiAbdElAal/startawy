'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateInputProps {
  value: string; // Expected: yyyy-mm-dd
  onChange: (value: string) => void;
  error?: boolean;
  name?: string;
  placeholder?: string;
  disablePast?: boolean;
  disableFuture?: boolean;
}

export default function DateInput({ value, onChange, error, name, placeholder, disablePast, disableFuture }: DateInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPlacement, setPopoverPlacement] = useState<'top' | 'bottom'>('bottom');
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Internal state for calendar navigation
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for comparison
  
  const [viewDate, setViewDate] = useState(value ? new Date(value) : today);
  
  // Format the value for the input field (DD/MM/YYYY)
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return '';
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }, [value]);

  // Handle smart positioning
  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const popoverHeight = 420; // Estimated height
      setPopoverPlacement(spaceBelow < popoverHeight ? 'top' : 'bottom');
    }
    setIsOpen(!isOpen);
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const years = [];
  const currYear = today.getFullYear();
  const startYear = currYear - 100;
  const endYear = currYear + 20;
  
  const minYear = disablePast ? currYear : startYear;
  const maxYear = disableFuture ? currYear : endYear;

  for (let i = maxYear; i >= minYear; i--) years.push(i);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    selectedDate.setHours(0, 0, 0, 0);

    if (disablePast && selectedDate < today) return;
    if (disableFuture && selectedDate > today) return;

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    newDate.setHours(0, 0, 0, 0);
    
    if (disablePast && newDate.getFullYear() < today.getFullYear()) return;
    if (disablePast && newDate.getFullYear() === today.getFullYear() && newDate.getMonth() < today.getMonth()) return;
    if (disableFuture && newDate.getFullYear() > today.getFullYear()) return;
    if (disableFuture && newDate.getFullYear() === today.getFullYear() && newDate.getMonth() > today.getMonth()) return;

    setViewDate(newDate);
  };

  const changeYear = (year: number) => {
    const newDate = new Date(year, viewDate.getMonth(), 1);
    newDate.setHours(0, 0, 0, 0);

    if (disablePast && newDate.getFullYear() < today.getFullYear()) {
      newDate.setFullYear(today.getFullYear());
      if (newDate.getMonth() < today.getMonth()) newDate.setMonth(today.getMonth());
    }
    if (disableFuture && newDate.getFullYear() > today.getFullYear()) {
      newDate.setFullYear(today.getFullYear());
      if (newDate.getMonth() > today.getMonth()) newDate.setMonth(today.getMonth());
    }

    setViewDate(newDate);
  };

  const days = [];
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`pad-${i}`} className="h-10 w-10 sm:h-11 sm:w-11" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
    dateObj.setHours(0, 0, 0, 0);

    const isPast = dateObj < today;
    const isFuture = dateObj > today;
    const isToday = today.getDate() === d && today.getMonth() === viewDate.getMonth() && today.getFullYear() === viewDate.getFullYear();
    
    // Fix selection logic to be timezone-safe
    let isSelected = false;
    if (value) {
      const [vY, vM, vD] = value.split('-').map(Number);
      isSelected = vY === dateObj.getFullYear() && (vM - 1) === dateObj.getMonth() && vD === dateObj.getDate();
    }
    
    const isDisabled = (disablePast && isPast) || (disableFuture && isFuture);

    days.push(
      <button
        key={d}
        type="button"
        disabled={isDisabled}
        onClick={() => handleDateSelect(d)}
        className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative group/day
          ${isSelected 
            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 active:scale-90 scale-110 z-10' 
            : isToday 
              ? 'text-teal-500 bg-teal-500/5 ring-1 ring-teal-500/20' 
              : isDisabled 
                ? 'text-slate-100 dark:text-slate-800 cursor-not-allowed opacity-20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-500 active:scale-90'}
        `}
      >
        {d}
        {isToday && !isSelected && (
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full" />
        )}
      </button>
    );
  }

  // Actually, today can never be in the past or future relative to itself (00:00:00)
  return (
    <div className="relative group" ref={containerRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Calendar className={`h-4 w-4 transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-teal-500'}`} />
        </div>
        <input
          type="text"
          readOnly
          value={displayValue}
          onClick={toggleOpen}
          placeholder={placeholder || 'Select Date'}
          className={`auth-input auth-input-icon pr-12 ${error ? 'auth-input-error' : ''} cursor-pointer caret-transparent text-sm h-12`}
        />
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 transition-colors z-20"
            title="Clear Date"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <input type="hidden" name={name} value={value} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: popoverPlacement === 'bottom' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: popoverPlacement === 'bottom' ? 5 : -5, scale: 0.98 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`absolute left-0 z-100 w-[280px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[24px] p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-slate-800/50
              ${popoverPlacement === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <button 
                type="button" 
                onClick={() => changeMonth(-1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-all active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const y = now.getFullYear();
                    const m = String(now.getMonth() + 1).padStart(2, '0');
                    const d = String(now.getDate()).padStart(2, '0');
                    onChange(`${y}-${m}-${d}`);
                    setViewDate(now);
                    setIsOpen(false);
                  }}
                  className="text-[9px] font-black text-teal-500 uppercase tracking-[0.2em] mb-0.5 hover:text-teal-400 transition-colors"
                >
                  {months[viewDate.getMonth()]}
                </button>
                <div className="flex items-center gap-1 group/yr cursor-pointer relative">
                  <select 
                    value={viewDate.getFullYear()} 
                    onChange={(e) => changeYear(parseInt(e.target.value))}
                    className="bg-transparent border-none p-0 text-base font-black text-slate-900 dark:text-white focus:ring-0 cursor-pointer hover:text-teal-500 transition-colors text-center appearance-none"
                    style={{ textAlignLast: 'center' }}
                  >
                    {years.map(y => <option key={y} value={y} className="bg-white dark:bg-slate-900 font-bold">{y}</option>)}
                  </select>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => changeMonth(1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-all active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={`${day}-${idx}`} className="h-8 w-8 flex items-center justify-center text-[9px] font-black text-slate-400/40 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
