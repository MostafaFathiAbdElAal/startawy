import { ShieldCheck, Briefcase, Calendar, Edit } from 'lucide-react';
import { UserWithRelations } from '@/lib/types/user';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';

interface ProfileHeaderProps {
  user: UserWithRelations;
  isEditing: boolean;
}

export default function ProfileHeader({ user, isEditing }: ProfileHeaderProps) {
  const isFullyVerified = user.isEmailVerified && user.isPhoneVerified;

  return (
    <div className="relative mb-10">
      <div className="group bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        {/* Banner Section */}
        <div className="relative h-40 bg-linear-to-r from-teal-500 via-teal-600 to-emerald-500">
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.4),transparent)]"></div>
           <div className="absolute inset-0 bg-black/5"></div>
        </div>

        <div className="px-8 pb-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8 -mt-12 relative z-10">
            {/* Reusable UserAvatar */}
            <div className="relative">
              <UserAvatar 
                name={user.name || 'User'} 
                image={user.image}
                size="xl" 
                isVerified={isFullyVerified} 
              />
            </div>

            {/* Profile Meta */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {user.name}
                </h2>
                {isFullyVerified && (
                  <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-teal-200 dark:border-teal-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> Fully Verified
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-5 text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <Briefcase className="w-4 h-4 text-teal-500" />
                  <span className="text-xs">{user.type?.toLowerCase() || 'Member'} Account</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-xs">Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!isEditing ? (
              <Link 
                href="/profile?edit=true"
                className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all font-bold flex items-center gap-2.5 shadow-xl shadow-slate-900/10 dark:shadow-none"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </Link>
            ) : (
              <Link 
                href="/profile"
                className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold flex items-center gap-2.5 shadow-sm"
              >
                View Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
