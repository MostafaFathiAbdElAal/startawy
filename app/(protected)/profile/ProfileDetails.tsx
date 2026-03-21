import { User, Mail, Smartphone, Briefcase } from 'lucide-react';

interface ProfileDetailsProps {
  user: {
    name: string;
    email: string;
    phone?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    type: string;
    founder?: {
        businessName?: string;
        businessSector?: string;
        description?: string;
    };
  };
}

export default function ProfileDetails({ user }: ProfileDetailsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full" />
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <User className="w-5 h-5 text-teal-500" />
            Account Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="flex items-center gap-4 h-14 pl-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl font-bold text-slate-900 dark:text-white">
                    <User className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-semibold">{user.name}</span>
                </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email Address</label>
                    {user.isEmailVerified ? (
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800 uppercase tracking-tighter">Verified</span>
                    ) : (
                        <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md border border-red-100 dark:border-red-800 uppercase tracking-tighter">Not Verified</span>
                    )}
                </div>
                <div className="flex items-center gap-4 h-14 pl-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl font-bold text-slate-900 dark:text-white">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-semibold">{user.email}</span>
                </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phone Number</label>
                    {user.isPhoneVerified ? (
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800 uppercase tracking-tighter">Verified</span>
                    ) : (
                        <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md border border-red-100 dark:border-red-800 uppercase tracking-tighter">Not Verified</span>
                    )}
                </div>
                <div className="flex items-center gap-4 h-14 pl-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl font-bold text-slate-900 dark:text-white">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-semibold">{user.phone || 'Not provided'}</span>
                </div>
            </div>

            {/* Dynamic Role Fields */}
            {user.type === 'FOUNDER' && (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Business Name</label>
                    <div className="flex items-center gap-4 h-14 pl-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl font-bold text-slate-900 dark:text-white">
                        <Briefcase className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-semibold">{user.founder?.businessName || 'Not set'}</span>
                    </div>
                </div>
            )}
        </div>

        {user.type === 'FOUNDER' && user.founder?.description && (
            <div className="mt-8 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Bio / Description</label>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 rounded-[24px] font-medium text-sm text-slate-600 dark:text-slate-400 italic">
                    {user.founder.description}
                </div>
            </div>
        )}
    </div>
  );
}
