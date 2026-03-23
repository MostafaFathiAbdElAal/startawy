import { Calendar, MapPin, Star, Award, TrendingUp, MessageSquare, CheckCircle } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// Extended mock data to fill in gaps not yet present in Prisma
const mockExtendedData = {
  bio: "Experienced financial consultant with over 12 years of expertise in helping startups optimize their budgets and achieve sustainable growth. Specialized in financial planning, budget optimization, and strategic financial decision-making.",
  expertise: [
    "Budget Analysis & Optimization",
    "Financial Planning & Forecasting",
    "Cash Flow Management",
    "Cost Reduction Strategies",
    "Investment Planning",
    "Risk Assessment",
  ],
  availabilitySlots: [
    { day: "Monday", slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
    { day: "Tuesday", slots: ["9:00 AM", "11:00 AM", "3:00 PM"] },
    { day: "Wednesday", slots: ["10:00 AM", "1:00 PM", "5:00 PM"] },
  ],
  successStories: [
    "Helped 50+ startups reduce operational costs by 30%",
    "Managed $50M+ in startup budgets",
    "95% client satisfaction rate",
    "Average ROI increase of 45% within 6 months",
  ],
};

export default async function ConsultantProfilePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const consultantId = parseInt(id, 10);

  if (isNaN(consultantId)) {
    notFound();
  }

  // Fetch real data. If not found, show dummy for testing UI safely.
  const dbConsultant = await prisma.consultant.findUnique({
    where: { id: consultantId },
    include: { user: true }
  });

  const consultant = dbConsultant ? {
    id: dbConsultant.id,
    name: dbConsultant.user.name,
    specialization: dbConsultant.specialization,
    rating: 4.9,
    reviews: 127,
    experience: `${dbConsultant.yearsOfExp} years`,
    price: 150, // mock price as Package is separate
    location: "Global",
    certifications: dbConsultant.certificate ? [dbConsultant.certificate] : [],
    avatar: dbConsultant.user.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    ...mockExtendedData
  } : {
    id: consultantId,
    name: "Demo Consultant",
    specialization: "Budget Optimization & Financial Planning",
    rating: 4.9,
    reviews: 127,
    experience: "12 years",
    price: 150,
    location: "New York, USA",
    certifications: ["CFA", "CFP"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    ...mockExtendedData
  };

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/book-consultant"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6 transition-colors"
      >
        ← Back to Consultants
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar & Quick Info */}
          <div className="shrink-0">
            <div className="relative w-40 h-40">
              <NextImage
                src={consultant.avatar}
                alt={consultant.name}
                fill
                className="rounded-2xl object-cover border-4 border-teal-100 dark:border-teal-900/40 shadow-lg"
              />
            </div>
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{consultant.rating}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{consultant.reviews} reviews</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{consultant.name}</h1>
            <p className="text-xl text-teal-600 dark:text-teal-400 font-medium mb-4">{consultant.specialization}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{consultant.experience} experience</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{consultant.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="font-bold text-gray-900 dark:text-white">${consultant.price}</span>
                <span>/session</span>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{consultant.bio}</p>

            {/* Certifications */}
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

            {/* Quick Action Button */}
            <Link href={`/consultant/${consultant.id}/book`}>
              <button className="w-full sm:w-auto px-8 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 mb-3">
                <Calendar className="w-5 h-5" />
                Book Session Now
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
              {consultant.expertise.map((skill, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="text-gray-700 dark:text-gray-300">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Success Stories & Achievements</h2>
            <div className="space-y-4">
              {consultant.successStories.map((story, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 pt-1">{story}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Available Time Slots</h2>
            
            {/* Session Price */}
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Session Price</span>
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">${consultant.price}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">60 minutes per session</p>
            </div>

            {/* Availability Schedule */}
            <div className="space-y-4 mb-6">
              {consultant.availabilitySlots.map((day, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{day.day}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {day.slots.map((slot, slotIndex) => (
                      <button
                        key={slotIndex}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 transition-colors text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              <MessageSquare className="w-4 h-4 inline-block mr-1" />
              Instant confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
