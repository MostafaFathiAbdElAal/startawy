'use client';

import React, { useEffect, useState } from 'react';
import { Users, Briefcase, BarChart3, Calendar, Mail, Search } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/components/providers/ToastProvider";

interface Client {
  id: number;
  name: string;
  email: string;
  businessName: string;
  businessSector: string;
  totalSessions: number;
  lastBudgetAnalysis: {
    totalBudget: number;
    fixedCost: number;
    variableCost: number;
  } | null;
  joinedAt: string;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

const ClientSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-amber-100/50 dark:border-amber-900/20 rounded-3xl overflow-hidden animate-pulse shadow-sm shadow-amber-900/5">
    <div className="p-6 bg-linear-to-br from-teal-500/5 to-amber-500/5 flex items-center gap-4 border-b border-amber-50/50 dark:border-amber-900/10">
      <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
      <div className="space-y-2">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="h-3 w-40 bg-gray-100 dark:bg-gray-700/50 rounded-md"></div>
      </div>
    </div>
    <div className="p-6 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30"></div>
          <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
        </div>
      ))}
      <div className="mt-4 p-4 bg-amber-50/20 dark:bg-amber-900/5 rounded-2xl border border-amber-100/20 h-24"></div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ConsultantClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/consultant/clients');
      if (!res.ok) throw new Error('Failed to load clients');
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      showToast({
        type: "error",
        title: "Sync Error",
        message: "Could not load clients list."
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-4 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
          </div>
          <div className="h-12 w-full md:w-80 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <ClientSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">My Clients</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {clients.length > 0
              ? `Managing ${clients.length} founder${clients.length > 1 ? 's' : ''} currently under your guidance.`
              : 'Start growing your portfolio by accepting session bookings.'}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name or business..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClients.map(client => (
            <div
              key={client.id}
              className="group bg-white dark:bg-gray-800 border border-amber-100/50 dark:border-amber-900/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-2 ring-1 ring-amber-50/50 dark:ring-amber-900/10"
            >
              <div className="p-6 border-b border-amber-50/50 dark:border-amber-900/10 bg-gradient-to-br from-teal-500/[0.03] to-amber-500/[0.03] group-hover:from-teal-500/[0.07] transition-colors relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Users className="w-12 h-12 text-teal-600" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white dark:ring-gray-700 shadow-teal-500/20">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{client.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">{client.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg border border-teal-100/50 dark:border-teal-800/50">
                    <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  </div>
                  <span className="font-bold">{client.businessName}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="p-2 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg border border-amber-100/30 dark:border-amber-800/20">
                    <BarChart3 className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70 shrink-0" />
                  </div>
                  <span>{client.businessSector}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                  <span className="font-medium">{client.totalSessions} Session{client.totalSessions !== 1 ? 's' : ''} Completed</span>
                </div>

                {client.lastBudgetAnalysis && (
                  <div className="p-4 bg-linear-to-br from-teal-50/30 to-amber-50/30 dark:from-teal-900/5 dark:to-amber-900/5 rounded-2xl border border-amber-200/30 dark:border-amber-700/20 mt-4 relative overflow-hidden group/card shadow-inner shadow-amber-500/5">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <p className="text-[10px] font-black text-teal-700 dark:text-teal-400 uppercase tracking-widest">Analysis Snapshot</p>
                      <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-gray-800 text-amber-600 border border-amber-200/50 dark:border-amber-700/30 rounded-full font-bold shadow-xs">LATEST</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                      <div>
                        <p className="font-black text-gray-900 dark:text-white text-sm">${(client.lastBudgetAnalysis.totalBudget / 1000).toFixed(1)}k</p>
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Total</p>
                      </div>
                      <div className="border-x border-amber-100/50 dark:border-amber-800/30">
                        <p className="font-black text-gray-900 dark:text-white text-sm">${(client.lastBudgetAnalysis.fixedCost / 1000).toFixed(1)}k</p>
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Fixed</p>
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white text-sm">${(client.lastBudgetAnalysis.variableCost / 1000).toFixed(1)}k</p>
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Variable</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6">
                <a
                  href={`mailto:${client.email}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-600 dark:bg-teal-500 text-white dark:text-gray-950 text-sm font-black hover:bg-teal-700 dark:hover:bg-teal-400 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-teal-500/20"
                >
                  <Mail className="w-4 h-4" />
                  Contact Founder
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-amber-400/20 dark:border-amber-900/40 rounded-[3rem] p-24 text-center shadow-2xl shadow-amber-500/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50/20 to-transparent dark:from-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-linear-to-br from-teal-50 to-amber-50 dark:from-teal-900/20 dark:to-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-200/30 dark:border-amber-800/20 shadow-inner">
              <Users className="w-12 h-12 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Portfolio Empty</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium text-lg leading-relaxed mb-10">
              Start growing your professional portfolio by defining your consulting hours today.
            </p>
            
            <Link 
              href="/consultant/availability" 
              className="inline-flex items-center gap-3 px-10 py-4 bg-linear-to-br from-gray-900 to-slate-800 dark:from-teal-600 dark:to-teal-700 text-white dark:text-gray-950 rounded-2xl font-black text-sm transition-all hover:scale-[1.05] active:scale-95 shadow-2xl shadow-teal-500/20 border border-amber-400/30"
            >
              Update Availability Schedule
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        </div>
      )}
    </div>
  );
}
