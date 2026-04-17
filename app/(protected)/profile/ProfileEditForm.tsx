'use client';

import { useState } from 'react';
import { User, Mail, Smartphone, Briefcase, Save, Loader2, UserCheck } from 'lucide-react';
import { updateProfile } from '@/app/actions/user';
import { UserWithRelations } from '@/lib/types/user';
import { useRouter } from 'next/navigation';
import DateInput from '@/components/ui/DateInput';
import { useToast } from '@/components/providers/ToastProvider';

interface ProfileEditFormProps {
  user: UserWithRelations;
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();
  const [foundingDate, setFoundingDate] = useState(user.founder?.foundingDate ? new Date(user.founder.foundingDate).toISOString().split('T')[0] : '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    // Explicitly add foundingDate to FormData since DateInput uses a hidden field but we might need to sync it
    if (user.type === 'FOUNDER') {
      formData.set('foundingDate', foundingDate);
    }
    const data = Object.fromEntries(formData.entries()) as unknown as Parameters<typeof updateProfile>[0];

    const res = await updateProfile(data);
    if (res.success) {
      // Show Toast with the backend's descriptive success message
      showToast({ type: 'success', title: 'Profile Updated', message: res.message || 'Profile updated successfully' });
      router.push('/profile');
      router.refresh();
      // Reset loading after a delay to prevent getting stuck if navigation is slow
      setTimeout(() => setLoading(false), 2000);
    } else {
      // Show inline error inside the form AND a Toast — both use the backend's English error
      setError(res.error || 'Failed to update profile');
      showToast({ type: 'error', title: 'Update Failed', message: res.error || 'An unexpected error occurred' });
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-teal-500/30 dark:border-teal-500/20 shadow-xl shadow-teal-500/5 relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full" />

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
        <User className="w-5 h-5 text-teal-500" />
        Edit Your Profile
      </h3>

      {/* Inline error — displayed from the backend's English error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              </div>
              <input
                name="name"
                type="text"
                defaultValue={user.name}
                required
                className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all font-semibold text-sm text-slate-900 dark:text-white outline-hidden focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Email (Read Only) */}
          <div className="space-y-2 opacity-60">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address (Locked)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full h-14 pl-12 pr-4 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-2xl font-semibold text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Smartphone className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              </div>
              <input
                name="phone"
                type="text"
                defaultValue={user.phone ?? ''}
                className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all font-semibold text-sm text-slate-900 dark:text-white outline-hidden focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Dynamic Role Fields */}
          {user.type === 'FOUNDER' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Business Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <input
                    name="businessName"
                    type="text"
                    defaultValue={user.founder?.businessName ?? ''}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all font-semibold text-sm text-slate-900 dark:text-white outline-hidden focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Founding Date</label>
                <DateInput 
                  name="foundingDate"
                  value={foundingDate}
                  onChange={(val) => setFoundingDate(val)}
                  disableFuture={true}
                />
              </div>
            </>
          )}

          {user.type === 'CONSULTANT' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Years of Experience</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <input
                    name="yearsOfExp"
                    type="number"
                    defaultValue={user.consultant?.yearsOfExp ?? 0}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all font-semibold text-sm text-slate-900 dark:text-white outline-hidden focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Specialization</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserCheck className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <input
                    name="specialization"
                    type="text"
                    defaultValue={user.consultant?.specialization ?? ''}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all font-semibold text-sm text-slate-900 dark:text-white outline-hidden focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {user.type === 'FOUNDER' && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Bio / Description</label>
            <textarea
              name="bio"
              rows={4}
              defaultValue={user.founder?.description ?? ''}
              className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-[24px] transition-all font-medium text-sm text-slate-900 dark:text-white outline-hidden resize-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
              placeholder="Share a bit about your journey..."
            />
          </div>
        )}

        {user.type === 'CONSULTANT' && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Professional Bio</label>
            <textarea
              name="bio"
              rows={4}
              defaultValue={user.consultant?.availability ?? ''} // Reusing bio field for general description/availability
              className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-[24px] transition-all font-medium text-sm text-slate-900 dark:text-white outline-hidden resize-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
              placeholder="Describe your expertise and consulting style..."
            />
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="px-8 py-3.5 text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3.5 bg-linear-to-r from-teal-500 to-emerald-600 text-white rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-teal-500/20 font-bold flex items-center gap-2.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
