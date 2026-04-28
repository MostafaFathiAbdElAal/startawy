'use client';

import { useState } from 'react';
import { 
  Search, Users, Mail, Calendar, 
  ChevronRight, Building2, Layers, 
  MessageSquare, 
  FileText, LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Client {
  id: number;
  name: string;
  email: string;
  businessName: string;
  businessSector: string;
  totalSessions: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastBudgetAnalysis: any;
  image: string | null;
  joinedAt: Date;
}

export default function ClientsClient({ initialClients }: { initialClients: Client[] }) {
  const [clients] = useState(initialClients);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            My Clients
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Keep track of the startup founders you&apos;re consulting with and access their business insights.
          </p>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-teal-500/10 text-teal-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-teal-500/10 text-teal-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or business..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500/50 text-slate-900 dark:text-white font-medium transition-all shadow-sm group-hover:shadow-md"
        />
      </div>

      {/* Clients View */}
      {filteredClients.length === 0 ? (
        <div className="p-20 text-center flex flex-col items-center gap-4 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">No clients found</p>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Your client list is currently empty or matches no results.</p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden"
              >
                {/* Card Header Background */}
                <div className="h-24 bg-linear-to-r from-teal-500/5 to-teal-600/10 group-hover:from-teal-500/10 group-hover:to-teal-600/20 transition-all border-b border-slate-50 dark:border-slate-800/50" />
                
                <div className="px-6 pb-6 -mt-12">
                  <div className="flex justify-between items-end mb-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center font-black text-2xl text-teal-600 dark:text-teal-400 border-2 border-white dark:border-slate-900 overflow-hidden">
                        {client.image ? (
                          <img src={client.image} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          client.name.charAt(0)
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessions</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{client.totalSessions}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1 group-hover:text-teal-600 transition-colors">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Building2 className="w-4 h-4 text-teal-500" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Business</span>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{client.businessName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Layers className="w-4 h-4 text-purple-500" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Sector</span>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{client.businessSector}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Joined {new Date(client.joinedAt).getFullYear()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {client.lastBudgetAnalysis && (
                        <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-teal-600 rounded-lg transition-colors border border-slate-100 dark:border-slate-800">
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      <Link 
                        href={`/consultant/sessions?search=${client.name}`}
                        className="p-2 bg-teal-600 text-white rounded-lg shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Business</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sector</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Sessions</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center font-black text-sm text-teal-600 border border-slate-100 dark:border-slate-800 overflow-hidden">
                           {client.image ? (
                             <img src={client.image} alt={client.name} className="w-full h-full object-cover" />
                           ) : (
                             client.name.charAt(0)
                           )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{client.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{client.businessName}</span>
                    </td>
                    <td className="px-6 py-6">
                       <span className="inline-flex items-center px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                        {client.businessSector}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500" style={{ width: `${Math.min(client.totalSessions * 10, 100)}%` }} />
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{client.totalSessions}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          <Link 
                            href={`/consultant/sessions?search=${client.name}`}
                            className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-teal-600 rounded-lg transition-all"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Link>
                          <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-teal-600 rounded-lg transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
