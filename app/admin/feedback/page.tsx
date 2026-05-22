'use client';

import { useState, useEffect } from 'react';
import { Star, MessageCircle, Calendar, User as UserIcon, Shield, Quote, Loader2, ChevronRight } from 'lucide-react';
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
      <div className="p-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-80 bg-slate-100 dark:bg-slate-900 rounded-lg" />
          </div>
          <div className="h-20 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 h-64 shadow-sm">
              <div className="flex justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-3 w-48 bg-slate-100 dark:bg-slate-900 rounded-md" />
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-4 h-4 bg-slate-100 dark:bg-slate-800 rounded-full" />)}
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between">
                <div className="flex gap-2">
                  <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                  <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                </div>
                <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg mt-2" />
              </div>
            </div>
          ))}
        </div>
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

  const demoFeedback: FeedbackItem[] = [
    {
      id: 1,
      rating: 5,
      comment: "The platform experience is absolutely stunning! The new mobile responsiveness and the premium dashboard have significantly improved our workflow. Highly recommended for any serious startup founder.",
      category: "UI/UX",
      status: "REVIEWED",
      createdAt: new Date().toISOString(),
      user: {
        name: "Mostafa Fathi",
        email: "mostafa.fathi@example.com",
        image: null,
        type: "FOUNDER"
      }
    }
  ];

  const displayFeedbacks = feedbacks.length > 0 ? feedbacks : (loading ? [] : demoFeedback);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-linear-to-br from-teal-500 to-teal-600 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Feedback Hub</h1>
              <p className="text-xs md:text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Admin Oversight</p>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md ml-1">Real-time analysis of user satisfaction and performance signals.</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center gap-10 md:gap-14 shadow-2xl shadow-slate-900/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 blur-3xl" />
          
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Total Signals</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{displayFeedbacks.length}</span>
              <span className="text-xs font-bold text-slate-400">entries</span>
            </div>
          </div>

          <div className="h-12 w-px bg-slate-100 dark:bg-slate-800" />

          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Avg. Rating</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-500/10 rounded-full">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
              </div>
              <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                {displayFeedbacks.length > 0 
                  ? (displayFeedbacks.reduce((acc, f) => acc + f.rating, 0) / displayFeedbacks.length).toFixed(1) 
                  : '0.0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {displayFeedbacks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-20 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Quote className="w-10 h-10 text-slate-300 dark:text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No feedback yet</h3>
          <p className="text-slate-500 dark:text-slate-400">Waiting for the first user to share their experience.</p>
        </div>
      ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {displayFeedbacks.map((f) => (
              <div 
                key={f.id} 
                className="group bg-white dark:bg-slate-900 rounded-[28px] md:rounded-[32px] border border-slate-100 dark:border-slate-800 p-5 md:p-8 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm shrink-0">
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
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors uppercase tracking-tight truncate">{f.user.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md uppercase tracking-wider">{f.user.type}</span>
                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-[10px] md:text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate max-w-[150px]">{f.user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-0.5 sm:mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-4 h-4 md:w-5 md:h-5 ${s <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="relative px-4 md:px-10 py-6 my-2 flex items-center justify-center">
                  <Quote className="absolute top-0 left-0 w-10 h-10 md:w-12 md:h-12 text-teal-500/10 dark:text-teal-500/20 rotate-180 -translate-x-2 -translate-y-2" />
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-bold leading-relaxed relative z-10 italic text-center">
                    {f.comment}
                  </p>
                  <Quote className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 text-teal-500/10 dark:text-teal-500/20 translate-x-2 translate-y-2" />
                </div>

                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative group/select">
                      <select
                        value={f.status}
                        onChange={(e) => handleUpdate(f.id, 'status', e.target.value)}
                        className={`appearance-none text-[10px] font-black uppercase tracking-widest pl-3 pr-8 py-2 rounded-xl border outline-none cursor-pointer transition-all shadow-sm ${
                          f.status === 'REVIEWED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                          f.status === 'ACTION_TAKEN' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20' :
                          'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="ACTION_TAKEN">Action Taken</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-teal-500 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-teal-500/50" />
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-tighter">
                      {new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
