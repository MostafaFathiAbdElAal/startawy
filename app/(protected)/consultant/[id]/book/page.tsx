import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/consultants/BookingForm";
import UserAvatar from "@/components/ui/UserAvatar";
import { getPublicConsultantProfile } from "@/app/actions/consultant";
import { authorizeUser } from "@/lib/auth-utils";
import { ConsultantService } from "@/lib/services/consultantService";

export default async function BookSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const consultantId = parseInt(id, 10);

  if (isNaN(consultantId)) {
    notFound();
  }

  // Auth check
  const auth = await authorizeUser();

  // Fetch real data using our new server action
  const consultant = await getPublicConsultantProfile(consultantId);

  if (!consultant) {
    notFound();
  }

  // Check for upcoming session using Service (ABI)
  const upcomingSession = auth.id
    ? await ConsultantService.getUserSessionWithConsultant(auth.id, consultantId)
    : null;

  // Simplify object for the client form if needed, but we can pass the whole thing
  // We just need to transform sessionsCompleted back to a number for the UI if necessary
  interface ConsultantUI {
    id: number;
    name: string;
    title: string;
    avatar: string;
    specialization: string;
    rating: number;
    sessionsCompleted: number;
    hourlyRate: number;
  }

  const uiConsultant: ConsultantUI = {
    id: consultant.id,
    name: consultant.user.name,
    avatar: consultant.user.image || "", // Provide fallback
    hourlyRate: consultant.sessionRate, // Chapter 3 requirement name mapping
    title: "Financial Consultant",
    specialization: consultant.specialization,
    rating: consultant.rating || 5,
    sessionsCompleted: consultant.sessionsCompleted
  };

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href={`/consultant/${consultant.id}`}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Consultant Profile
      </Link>

      <div className="max-w-4xl mx-auto">
        {/* Upcoming Session Check */}
        {upcomingSession && (
          <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 dark:text-amber-100">Notice: Existing Booking</h3>
              <p className="text-amber-800 dark:text-amber-200 text-sm mt-1">
                You already have an upcoming session with {consultant.user.name} on{" "}
                <span className="font-bold">
                  {new Date(upcomingSession.date).toLocaleDateString('en-GB', { 
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </span>.
                Do you still wish to schedule another session?
              </p>
              <Link href="/my-sessions" className="inline-block mt-3 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:underline">
                Manage my sessions →
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="shrink-0">
               <UserAvatar 
                  name={consultant.user.name} 
                  image={consultant.user.image} 
                  size="xl" 
                  isVerified={true} 
               />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {consultant.user.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                {consultant.specialization}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>⭐ {(consultant.rating || 5.0).toFixed(1)} Rating</span>
                <span>•</span>
                <span>{consultant.sessionsCompleted} Sessions</span>
                <span>•</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  ${consultant.sessionRate}/hour
                </span>
              </div>
            </div>
          </div>
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
            <p className="text-teal-900 dark:text-teal-100">
              <strong className="text-teal-950 dark:text-white">Professional Bio:</strong>{" "}
              {consultant.bio}
            </p>
          </div>
        </div>

        {/* Booking Form Client Component */}
        <BookingForm consultant={uiConsultant} />
      </div>
    </div>
  );
}
