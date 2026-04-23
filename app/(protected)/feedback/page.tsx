'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, MessageCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

export default function FeedbackPage() {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('POSITIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showToast({ type: 'warning', title: 'Rating Required', message: 'Please select a star rating.' });
      return;
    }

    if (!comment.trim()) {
      showToast({ type: 'warning', title: 'Message Required', message: 'Please tell us about your experience.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, category }),
      });
      const res = await response.json();
      
      setIsSubmitting(false);

      if (res.success) {
        showToast({ type: 'success', title: 'Thank You!', message: res.message });
        setRating(0);
        setComment('');
        setCategory('POSITIVE');
      } else {
        showToast({ type: 'error', title: 'Submission Failed', message: res.error || 'Failed to send feedback.' });
      }
    } catch (_error) {
      setIsSubmitting(false);
      showToast({ type: 'error', title: 'Submission Failed', message: 'An unexpected error occurred.' });
    }
  };


  return (
    <div className="min-h-[calc(100vh-85px)] p-6 md:p-10 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-[#BF953F]/30 relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-teal-500/10 dark:bg-teal-400/10 rounded-xl flex items-center justify-center mb-6">
            <MessageCircle className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Share Your Experience
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium leading-relaxed">
            Your feedback helps our system grow and provides you with a better experience. We value every detail!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating Section */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Select Your Rating</span>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="transition-all duration-300 hover:scale-110 group relative"
                >
                  <Star 
                    className={`w-10 h-10 transition-all duration-500 ${
                      (hover || rating) >= star 
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]' 
                        : 'text-slate-200 dark:text-slate-800'
                    }`}
                  />
                  <AnimatePresence>
                    {rating === star && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-amber-400/20 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>
          </div>


          {/* Comment Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Message</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                category === 'SUGGESTION' ? "What's your brilliant idea?" :
                category === 'COMPLAINT' ? "We're sorry to hear this. Tell us what happened..." :
                "Tell us what you loved or what we can improve..."
              }
              className="w-full min-h-[140px] p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all text-slate-900 dark:text-white font-medium resize-none shadow-inner"
            />
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-teal-600 dark:bg-teal-500 text-white rounded-lg font-black text-base flex items-center justify-center gap-3 hover:bg-teal-700 dark:hover:bg-teal-400 active:scale-[0.98] transition-all shadow-xl shadow-teal-500/10 disabled:opacity-50 disabled:cursor-not-allowed group border border-[#BF953F]/40"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Submit Feedback
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

