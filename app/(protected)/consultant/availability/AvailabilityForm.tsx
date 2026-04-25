'use client';

import React, { useState } from 'react';
import { Clock, Save, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/components/providers/ToastProvider";

interface AvailabilityFormProps {
  current: string;
  onSuccess?: () => void;
}

/**
 * AvailabilityForm - Specialized client component for managing consultant hours
 * Communicates with /api/consultant/availability to persist data using JSON
 */
export default function AvailabilityForm({ current, onSuccess }: AvailabilityFormProps) {
  const { showToast } = useToast();
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);

  const templates = [
    { label: "Standard (9-5)", value: "Mon-Fri: 09:00 AM - 05:00 PM (GMT+2)" },
    { label: "Morning Focus", value: "Mon-Thu: 08:00 AM - 12:00 PM (GMT+2) | High-impact strategic sessions." },
    { label: "Evening Hub", value: "Sun-Wed: 03:00 PM - 09:00 PM (GMT+2) | Late strategy reviews." },
  ];

  const applyTemplate = (tpl: string) => {
    setValue(tpl);
    showToast({
      type: "success",
      title: "Template Applied",
      message: "Schedule template loaded into editor."
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value.length < 5) {
      showToast({
        type: "error",
        title: "Schedule Too Short",
        message: "Please provide a valid availability schedule."
      });
      return;
    }
    setSaving(true);
    
    try {
      // Use PATCH method to update the consultant availability record
      const res = await fetch('/api/consultant/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: value }),
      });

      const result = await res.json();

      if (res.ok) {
        showToast({
          type: "success",
          title: "Schedule Synced",
          message: "Your consulting hours have been professionally updated.",
          duration: 5000
        });
        if (onSuccess) onSuccess(); 
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: result.error || 'Could not save availability'
        });
      }
    } catch (error) {
      console.error('Submission error [Availability]:', error);
      showToast({
        type: "error",
        title: "Network Error",
        message: "Connection error. Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="block text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Weekly Availability Schedule
          </label>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => applyTemplate(tpl.value)}
                className="text-[10px] font-black px-4 py-2 rounded-full border border-teal-500/20 bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all shadow-xs uppercase tracking-wider"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative group/field">
          {/* Light Gold Glow on hover/focus */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-teal-500 to-amber-400 rounded-2xl blur-md opacity-0 group-focus-within/field:opacity-20 transition-opacity duration-500" />
          
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={6}
            placeholder="e.g. Mon-Fri: 10:00 AM - 6:00 PM (GMT+2) | Weekend by appointment."
            className="relative w-full px-5 py-4 rounded-2xl border border-amber-400/30 dark:border-amber-900/40 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/60 transition-all outline-none resize-none font-medium leading-relaxed shadow-xs"
          />
        </div>
        
        <div className="p-4 bg-teal-50/30 dark:bg-teal-900/10 border border-teal-100/50 dark:border-teal-800/20 rounded-xl flex gap-3 items-start">
          <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-teal-700 dark:text-teal-400 font-bold leading-tight uppercase tracking-wider">
            Clear schedules reduce pre-booking inquiries. founders prefer specific time windows and time zone mentions.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-linear-to-br from-teal-500 to-teal-600 text-white rounded-2xl font-black text-sm transition-all hover:scale-[1.03] hover:from-teal-600 hover:to-teal-700 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-teal-500/10"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Syncing...' : 'Update Schedule'}
        </button>
      </div>
    </form>
  );
}
