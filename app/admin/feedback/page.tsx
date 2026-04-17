'use client';

import { useState, useEffect } from 'react';
import { Star, MessageCircle, Calendar, User as UserIcon, Shield, Quote, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/providers/ToastProvider';

interface FeedbackItem {
  id: number;
  rating: number;
  comment: string;
  category: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    image: string | null;
    type: string;
  };
}

export default function AdminFeedbackPage() {
  const { showToast } = useToast();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch('/api/admin/feedback');
        const res = await response.json();
        
        if (res.success) {
          setFeedbacks(res.data);
        } else {
          setError(res.error || 'Failed to fetch feedbacks');
        }
      } catch {
        setError('Network error occurred while fetching feedbacks.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const handleUpdate = async (id: number, field: 'status' | 'category', value: string) => {
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      const res = await response.json();
      
      if (res.success) {
        setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, [field]: value } : f));
        showToast({
          type: "success",
          title: "Feedback Updated",
          message: `The ${field} has been successfully updated.`
        });
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: res.error || "Failed to update feedback entry."
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Could not connect to the server to update feedback."
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-[24px] text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2">Access Restricted</h2>
          <p className="text-red-600/80 dark:text-red-500/80 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-teal-600" />
            User Feedback Review
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring overall user satisfaction and detailed comments.</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-6 shadow-sm">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Signals</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{feedbacks.length}</p>
          </div>
          <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Rating</p>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {feedbacks.length > 0 
                  ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1) 
                  : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-20 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Quote className="w-10 h-10 text-slate-300 dark:text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No feedback yet</h3>
          <p className="text-slate-500 dark:text-slate-400">Waiting for the first user to share their experience.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {feedbacks.map((f) => (
            <div 
              key={f.id} 
              className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm">
                    {f.user.image ? (
                      <Image 
                        src={f.user.image} 
                        alt={f.user.name} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors uppercase tracking-tight">{f.user.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md uppercase tracking-wider">{f.user.type}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{f.user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-4 h-4 ${s <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="relative px-6 py-4 my-2">
                <Quote className="absolute top-0 -left-2 w-10 h-10 text-teal-500/10 dark:text-teal-500/20 rotate-180" />
                <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed relative z-10 italic px-3">
                  {f.comment}
                </p>
                <Quote className="absolute bottom-0 right-0 w-10 h-10 text-teal-500/10 dark:text-teal-500/20" />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <select
                    value={f.category}
                    onChange={(e) => handleUpdate(f.id, 'category', e.target.value)}
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${
                      f.category === 'POSITIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                      f.category === 'SUGGESTION' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    <option value="POSITIVE">Positive</option>
                    <option value="SUGGESTION">Suggestion</option>
                    <option value="COMPLAINT">Complaint</option>
                  </select>

                  <select
                    value={f.status}
                    onChange={(e) => handleUpdate(f.id, 'status', e.target.value)}
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${
                      f.status === 'REVIEWED' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                      f.status === 'ACTION_TAKEN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="ACTION_TAKEN">Action Taken</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                      {new Date(f.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-teal-600/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    #{f.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
