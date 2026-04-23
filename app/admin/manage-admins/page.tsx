'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Search, User, Mail, Shield, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  admin?: {
    adminLevel: string;
    adminScope: string;
    isOwner?: boolean;
  };
}

export default function ManageAdminsPage() {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.admins);
      } else {
        setError(data.error || 'Failed to fetch admins');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
 
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
 
      if (res.ok) {
        showToast({
          type: 'success',
          title: 'Admin Created',
          message: 'The new administrator has been successfully added to the system.'
        });
        setFormData({ name: '', email: '', password: '' });
        fetchAdmins();
        setIsModalOpen(false);
      } else {
        showToast({
          type: 'error',
          title: 'Creation Failed',
          message: data.error || 'Failed to add administrator'
        });
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to the server. Please try again.'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Manage Administrators</h1>
            <p className="text-gray-500 text-sm mt-1">Add and oversee global system admins</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-600/20 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Add Administrator
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl outline-none focus:border-teal-500 transition-all shadow-sm"
          />
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 px-6 border border-gray-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <span className="text-gray-500 font-medium">Total Admins</span>
          <span className="text-2xl font-bold text-teal-600">{admins.length}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-5 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/50 rounded" />
                  </div>
                </div>
                <div className="flex-1 hidden md:block">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="flex-1 hidden md:block text-center">
                  <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800/50 rounded mx-auto" />
                </div>
                <div className="w-20 text-right">
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-500 font-bold">{error}</p>
            <button onClick={fetchAdmins} className="text-teal-600 hover:underline">Try Again</button>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-center opacity-40">
            <User className="w-16 h-16" />
            <p className="text-lg font-bold">No administrators found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-5 text-sm font-bold text-gray-700 dark:text-gray-300">ADMINISTRATOR</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-700 dark:text-gray-300">SCOPE & LEVEL</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-700 dark:text-gray-300">CREATED AT</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-700 dark:text-gray-300 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white capitalize">{admin.name}</p>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-teal-600 flex items-center gap-1 uppercase tracking-tighter">
                          <Shield size={12} /> {admin.admin?.isOwner ? 'Platform Owner' : 'System Administrator'}
                        </span>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.15em]">
                          {admin.admin?.adminScope === 'ALL' ? 'Full System Access' : admin.admin?.adminScope}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {new Intl.DateTimeFormat('en-GB').format(new Date(admin.createdAt))}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 text-[10px] font-bold rounded-full border border-green-100 dark:border-green-900/50 uppercase tracking-wider">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !formLoading && setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <UserPlus className="text-teal-600" /> Add New Administrator
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                disabled={formLoading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="p-8 space-y-6">

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-teal-500 rounded-2xl outline-none transition-all"
                      placeholder="e.g. Mostafa Ahmed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-teal-500 rounded-2xl outline-none transition-all"
                      placeholder="admin@startawy.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Password (Default)</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-teal-500 rounded-2xl outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed tracking-wider uppercase">
                   Admins created here will have full global access to founders, consultants, reports, and system analytics.
                </p>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-teal-600/30 disabled:opacity-50 active:scale-95"
              >
                {formLoading ? 'Creating User...' : 'Add Administrator'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
