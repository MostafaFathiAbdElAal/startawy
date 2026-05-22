'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Loader2, Search, Check, ChevronDown, X } from 'lucide-react';
import { useToast } from "@/components/providers/ToastProvider";
import UserAvatar from "@/components/ui/UserAvatar";

interface Client {
  id: number;
  name: string;
  businessName: string;
  image?: string | null;
}

interface RecommendationFormProps {
  clients: Client[];
  onSuccess?: () => void;
}

/**
 * SearchableSelect - Custom component for large datasets with Avatar support
 */
function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select a founder..." 
}: { 
  options: Client[], 
  value: string, 
  onChange: (id: string) => void,
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [displayCount, setDisplayCount] = useState(20);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.name.toLowerCase().includes(search.toLowerCase()) || 
      opt.businessName.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const visibleOptions = useMemo(() => {
    return filteredOptions.slice(0, displayCount);
  }, [filteredOptions, displayCount]);


  useEffect(() => {
    if (!isOpen) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && displayCount < filteredOptions.length) {
          setDisplayCount(prev => prev + 20);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isOpen, displayCount, filteredOptions.length]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.id) === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-[20px] border transition-all outline-none text-sm ${
          isOpen 
            ? "border-teal-500 ring-4 ring-teal-500/10 bg-white dark:bg-slate-900 shadow-xl" 
            : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          {selectedOption ? (
            <>
              <UserAvatar name={selectedOption.name} image={selectedOption.image} size="sm" isVerified={true} />
              <div className="text-left">
                <p className="font-black text-slate-900 dark:text-white leading-none mb-1">{selectedOption.name}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{selectedOption.businessName}</p>
              </div>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-bold">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search founders..."
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-teal-500/20 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white transition-all"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDisplayCount(20);
                }}
              />
              {search && (
                <button 
                  onClick={() => {
                    setSearch("");
                    setDisplayCount(20);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="max-h-72 overflow-y-auto p-2 space-y-1.5 custom-scrollbar"
          >
            {visibleOptions.length > 0 ? (
              <>
                {visibleOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(String(opt.id));
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-left transition-all group ${
                      String(opt.id) === value 
                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar name={opt.name} image={opt.image} size="sm" isVerified={true} />
                      <div className="flex flex-col">
                        <span className="font-black text-sm">{opt.name}</span>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-40">{opt.businessName}</span>
                      </div>
                    </div>
                    {String(opt.id) === value && <Check className="w-5 h-5" />}
                  </button>
                ))}
                <div ref={observerTarget} className="h-12 flex items-center justify-center">
                  {displayCount < filteredOptions.length && (
                    <Loader2 className="w-6 h-6 text-teal-500 animate-spin opacity-30" />
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <Search className="w-12 h-12 text-slate-100 dark:text-slate-800 mx-auto mb-3" />
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">No founders found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * RecommendationForm - Specialized client component
 */
export default function RecommendationForm({ clients, onSuccess }: RecommendationFormProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFounderId, setSelectedFounderId] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (!selectedFounderId) {
      showToast({
        type: "error",
        title: "Missing Field",
        message: "Please select a founder."
      });
      return;
    }

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
      founderId: selectedFounderId,
      title,
      content,
      category: formData.get("category"),
      priority: formData.get("priority"),
      impact: formData.get("impact"),
    };

    try {
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
        setSelectedFounderId("");
        if (onSuccess) onSuccess();
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2rem] p-8 shadow-sm">
      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight flex items-center gap-2">
        <Send className="w-6 h-6 text-teal-500" />
        Send New Recommendation
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Select Client</label>
          <SearchableSelect 
            options={clients} 
            value={selectedFounderId} 
            onChange={setSelectedFounderId} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Category</label>
            <select 
              name="category"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
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
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Priority Level</label>
            <select 
              name="priority"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
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
          <label className="block text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Recommendation Title</label>
          <input 
            name="title"
            type="text" 
            required
            placeholder="e.g. Q3 Budget Optimization Strategy"
            className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Expected Impact (Optional)</label>
          <input 
            name="impact"
            type="text" 
            placeholder="e.g. 15% reduction in CAC"
            className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Strategic Advice Details</label>
          <textarea 
            name="content"
            required
            rows={6}
            placeholder="Describe your strategic advice in detail..."
            className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Submit Recommendation
          </button>
        </div>
      </form>
    </div>
  );
}
