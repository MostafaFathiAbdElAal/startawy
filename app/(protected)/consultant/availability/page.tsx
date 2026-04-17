import { getProfileData } from '@/app/actions/user';
import { redirect } from 'next/navigation';
import { Clock } from 'lucide-react';
import AvailabilityForm from './AvailabilityForm';

export default async function ConsultantAvailabilityPage() {
  const data = await getProfileData();
  
  if (!data || data.user.type !== 'CONSULTANT' || !data.user.consultant) {
    redirect('/dashboard');
  }

  const { consultant } = data.user;

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Availability Schedule</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your weekly schedule for consulting sessions.</p>
      </div>

      <div className="max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-500/10 rounded-xl">
            <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Set Your Hours</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">These hours will be visible to founders when booking.</p>
          </div>
        </div>

        <AvailabilityForm current={consultant.availability || ''} />
      </div>

      {/* Preview Section */}
      <div className="mt-8 max-w-2xl bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-2xl p-6">
        <h3 className="font-bold text-teal-800 dark:text-teal-300 mb-2">How this helps?</h3>
        <p className="text-sm text-teal-700/80 dark:text-teal-400/80 leading-relaxed">
          Your availability schedule helps startup founders understand when you&apos;re most likely to be free. 
          While bookings are confirmed manually or via specific slots, having a clear schedule reduces back-and-forth communication.
        </p>
      </div>
    </div>
  );
}
