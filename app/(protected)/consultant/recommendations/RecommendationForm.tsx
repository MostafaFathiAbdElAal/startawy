'use client';

import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/components/providers/ToastProvider";

interface Client {
  id: number;
  name: string;
  businessName: string;
}

interface RecommendationFormProps {
  clients: Client[];
  onSuccess?: () => void;
}

/**
 * RecommendationForm - Specialized client component
 * Handles submission of strategic advice to founders via /api/consultant/recommendations
 */
export default function RecommendationForm({ clients, onSuccess }: RecommendationFormProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (title.length < 10) {
      showToast({
        type: "error",
        title: "Invalid Title",
        message: "Title must be at least 10 characters long."
      });
      setLoading(false);
      return;
    }

    if (content.length < 20) {
      showToast({
        type: "error",
        title: "Content Too Short",
        message: "Advice content must be at least 20 characters long."
      });
      setLoading(false);
      return;
    }

    const data = {
      founderId: formData.get("founderId"),
      title,
      content,
      category: formData.get("category"),
      priority: formData.get("priority"),
      impact: formData.get("impact"),
    };

    try {
      // POST request to the dedicated consultant API route
      const res = await fetch('/api/consultant/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (res.ok) {
        showToast({
          type: "success",
          title: "Recommendation Sent",
          message: "Recommendation sent successfully!"
        });
        if (event.currentTarget) event.currentTarget.reset();
        if (onSuccess) onSuccess(); // Signal parent component to refresh data
      } else {
        showToast({
          type: "error",
          title: "Submission Failed",
          message: result.error || 'Something went wrong'
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      showToast({
        type: "error",
        title: "Connection Error",
        message: "Failed to connect to the server"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Send New Recommendation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Client</label>
          <select 
            name="founderId" 
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-none"
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-none"
            >
              <option value="STRATEGY">Strategy</option>
              <option value="BUDGET">Budgeting</option>
              <option value="MARKETING">Marketing</option>
              <option value="OPERATIONS">Operations</option>
              <option value="LEGAL">Legal & Compliance</option>
              <option value="RISK">Risk Management</option>
              <option value="SALES">Sales Growth</option>
              <option value="SCALING">Scaling</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
            <select 
              name="priority"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
              <option value="URGENT">Urgent</option>
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
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Expected Impact (Optional)</label>
          <input 
            name="impact"
            type="text" 
            placeholder="e.g. 15% reduction in CAC"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Strategic Advice</label>
          <textarea 
            name="content"
            required
            rows={6}
            placeholder="Describe your strategic advice in detail..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-none resize-none"
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
