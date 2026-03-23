"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, Trash2 } from "lucide-react";

interface Feedback {
  id: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminFeedbackClient() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("/api/admin/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await fetch(`/api/admin/feedback?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedbacks(feedbacks.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
        <p className="text-gray-500">Loading user feedback...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {feedbacks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-800">
          <p className="text-gray-500 dark:text-gray-400">No feedback has been submitted yet.</p>
        </div>
      ) : (
        feedbacks.map((f) => (
          <div key={f.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < f.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-slate-700"}`} />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {new Intl.DateTimeFormat('en-GB').format(new Date(f.createdAt))}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic mb-4 text-lg">&quot;{f.comment}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-lg">
                  {f.user.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{f.user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{f.user.email}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-row md:flex-col gap-2 justify-end self-start md:self-auto shrink-0">
              <button 
                onClick={() => handleDelete(f.id)}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
