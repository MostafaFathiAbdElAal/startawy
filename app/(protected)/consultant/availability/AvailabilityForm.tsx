'use client';

import { useState, useTransition } from 'react';
import { updateConsultantAvailability } from '@/app/actions/consultant';
import { Clock, Save, CheckCircle } from 'lucide-react';

interface Props {
  current: string;
}

export default function AvailabilityForm({ current }: Props) {
  const [value, setValue] = useState(current);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    startTransition(async () => {
      const result = await updateConsultantAvailability(value);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>Availability updated successfully!</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-500" />
          Availability Schedule
        </label>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={5}
          placeholder="e.g. Mon-Fri: 9AM–5PM | Sat: 10AM–2PM | Not available Sundays"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Describe your typical weekly availability so founders can plan sessions.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
      >
        <Save className="w-4 h-4" />
        {isPending ? 'Saving...' : 'Save Availability'}
      </button>
    </form>
  );
}
