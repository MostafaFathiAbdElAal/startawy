'use client';

import { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Client {
  id: number;
  name: string;
  businessName: string;
}

export default function RecommendationForm({ clients }: { clients: Client[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(event.currentTarget);
    const data = {
      founderId: formData.get("founderId"),
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
      priority: formData.get("priority"),
      impact: formData.get("impact"),
    };

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      setLoading(false);
      if (res.ok) {
        setMessage({ type: 'success', text: 'Recommendation sent successfully!' });
        event.currentTarget.reset();
        router.refresh(); 
      } else {
        setMessage({ type: 'error', text: result.error || 'Something went wrong' });
      }
    } catch (error) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Failed to connect to the server' });
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Send New Recommendation</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-xl text-sm font-bold ${
          message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Client</label>
          <select 
            name="founderId" 
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-hidden"
          >
            <option value="">Select a founder...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name} ({client.businessName})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select 
              name="category"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-hidden"
            >
              <option value="STRATEGY">Strategy</option>
              <option value="BUDGET">Budgeting</option>
              <option value="MARKETING">Marketing</option>
              <option value="OPERATIONS">Operations</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
            <select 
              name="priority"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-hidden"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Recommendation Title</label>
          <input 
            name="title"
            type="text" 
            required
            placeholder="e.g. Q3 Budget Optimization Strategy"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Impact (Optional)</label>
          <input 
            name="impact"
            type="text" 
            placeholder="e.g. 15% reduction in CAC"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Content</label>
          <textarea 
            name="content"
            required
            rows={6}
            placeholder="Describe your strategic advice in detail..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-hidden resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3.5 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Send Recommendation
          </button>
        </div>
      </form>
    </div>
  );
}
