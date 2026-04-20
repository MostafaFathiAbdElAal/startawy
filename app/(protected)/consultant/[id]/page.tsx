import { Calendar, MapPin, Star, Award, TrendingUp, CheckCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserAvatar from "@/components/ui/UserAvatar";
import { getPublicConsultantProfile } from "@/app/actions/consultant";
import { authorizeUser } from "@/lib/auth-utils";
import { ConsultantService } from "@/lib/services/consultantService";

export default async function ConsultantProfilePage({ params }: { params: Promise<{ id: string }> }) {
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

  // Check for upcoming session using the Service (ABI)
  const upcomingSession = auth.id 
    ? await ConsultantService.getUserSessionWithConsultant(auth.id, consultantId)
    : null;

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/book-consultant"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6 transition-colors"
      >
        ← Back to Consultants
      </Link>

      {/* Upcoming Session Banner (If exists) */}
      {upcomingSession && (
        <div className="mb-8 bg-linear-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Session Scheduled</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You have an appointment on {new Date(upcomingSession.date).toLocaleDateString('en-US', { 
                  weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
          <Link href="/my-sessions">
            <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold flex items-center gap-2">
              View My Sessions
            </button>
          </Link>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar & Quick Info */}
          <div className="shrink-0">
            <div className="relative">
              <UserAvatar
                name={consultant.user.name}
                image={consultant.user.image}
                size="xl"
                isVerified={true}
              />
            </div>
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{(consultant.rating || 5.0).toFixed(1)}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{consultant.reviewCount} reviews</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{consultant.user.name}</h1>
            <p className="text-xl text-teal-600 dark:text-teal-400 font-medium mb-4">{consultant.specialization}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{consultant.yearsOfExp} years experience</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>Global Consultant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="font-bold text-gray-900 dark:text-white">${consultant.sessionRate}</span>
                <span>/session</span>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">{consultant.bio}</p>

            {/* Certifications */}
            {consultant.certifications.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {consultant.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-lg text-sm font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Button */}
            <Link href={`/consultant/${consultant.id}/book`}>
              <button className="w-full sm:w-auto px-8 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 mb-3">
                <Calendar className="w-5 h-5" />
                {upcomingSession ? "Book Another Session" : "Book Session Now"}
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Areas of Expertise */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Areas of Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {consultant.expertise.length > 0 ? (
                consultant.expertise.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span className="text-gray-700 dark:text-gray-300">{skill}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No specific expertise listed.</p>
              )}
            </div>
          </div>

          {/* Availability Logic / Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Availability Summary</h2>
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-100 dark:border-teal-800/30">
               <p className="text-gray-800 dark:text-gray-200">
                {consultant.availability || "Availability details coming soon."}
               </p>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Consultation Overview</h2>
            
            {/* Session Price */}
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Session Price</span>
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">${consultant.sessionRate}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">60 minutes per session</p>
            </div>

            <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sessions Managed</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{consultant.sessionsCompleted}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">Under 24h</span>
               </div>
            </div>

            <Link href={`/consultant/${consultant.id}/book`} className="block w-full">
               <button className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-bold">
                  Book A Session
               </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
