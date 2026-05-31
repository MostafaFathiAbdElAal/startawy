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

  const toggleOpen = () => {
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
    days.push(<div key={`pad-${i}`} className="w-full aspect-square" />);
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
        className={`w-full aspect-square rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center relative group/day
          ${isSelected 
            ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/20 active:scale-95 scale-105 z-10' 
            : isToday 
              ? 'text-teal-500 bg-teal-500/5 ring-1 ring-teal-500/20' 
              : isDisabled 
                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-teal-500/10 hover:text-teal-500 dark:hover:bg-teal-500/20 active:scale-95'}
        `}
      >
        {d}
        {isToday && !isSelected && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full" />
        )}
      </button>
    );
  }

  // Actually, today can never be in the past or future relative to itself (00:00:00)
  return (
    <div className="relative group" ref={containerRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Calendar className={`h-4 w-4 transition-colors duration-300 ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-teal-500'}`} />
        </div>
        <input
          type="text"
          readOnly
          value={displayValue}
          onClick={toggleOpen}
          placeholder={placeholder || 'Select Date'}
          className={`auth-input auth-input-icon pr-12 ${error ? 'auth-input-error' : ''} ${isOpen ? 'ring-2 ring-teal-500/20 border-teal-500' : ''} cursor-pointer caret-transparent text-sm h-12 transition-all duration-300`}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-[300px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-200/50 dark:border-slate-800/50 z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <button 
                  type="button" 
                  onClick={() => changeMonth(-1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-teal-500/10 hover:text-teal-500 dark:hover:bg-teal-500/20 rounded-xl text-slate-500 dark:text-slate-400 transition-all active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.2em] mb-0.5">
                    {months[viewDate.getMonth()]}
                  </span>
                  <div className="flex items-center gap-1 group/yr cursor-pointer relative">
                    <select 
                      value={viewDate.getFullYear()} 
                      onChange={(e) => changeYear(parseInt(e.target.value))}
                      className="bg-transparent border-none p-0 text-base font-black text-slate-900 dark:text-white focus:ring-0 cursor-pointer hover:text-teal-500 transition-colors text-center appearance-none pr-1 focus:outline-none"
                      style={{ textAlignLast: 'center' }}
                    >
                      {years.map(y => <option key={y} value={y} className="bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white">{y}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => changeMonth(1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-teal-500/10 hover:text-teal-500 dark:hover:bg-teal-500/20 rounded-xl text-slate-500 dark:text-slate-400 transition-all active:scale-90"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={`${day}-${idx}`} className="w-full aspect-square flex items-center justify-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days}
              </div>

              {/* Today and Clear Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
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
                  className="text-[11px] font-bold text-teal-500 hover:text-teal-600 transition-colors flex items-center gap-1.5"
                >
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                  Go to Today
                </button>
                {value && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setIsOpen(false);
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
