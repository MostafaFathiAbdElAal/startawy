import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/consultants/BookingForm";

export default async function BookSessionPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const consultantId = parseInt(id, 10);

  if (isNaN(consultantId)) {
    notFound();
  }

  // Fetch from DB or fallback
  const dbConsultant = await prisma.consultant.findUnique({
    where: { id: consultantId },
    include: { user: true }
  });

  const consultant = dbConsultant ? {
    id: dbConsultant.id,
    name: dbConsultant.user.name,
    title: "Senior Financial Consultant",
    specialization: dbConsultant.specialization,
    rating: 4.9,
    sessionsCompleted: 342,
    hourlyRate: 150,
    avatar: dbConsultant.user.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  } : {
    id: consultantId,
    name: "Demo Consultant",
    title: "Senior Financial Consultant",
    specialization: "Budget Optimization & Financial Planning",
    rating: 4.9,
    sessionsCompleted: 342,
    hourlyRate: 150,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
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
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 shrink-0">
              <NextImage
                src={consultant.avatar}
                alt={consultant.name}
                fill
                className="rounded-full object-cover border border-gray-200 dark:border-slate-700"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {consultant.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                {consultant.title}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>⭐ {consultant.rating} Rating</span>
                <span>•</span>
                <span>{consultant.sessionsCompleted} Sessions</span>
                <span>•</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  ${consultant.hourlyRate}/hour
                </span>
              </div>
            </div>
          </div>
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
            <p className="text-teal-900 dark:text-teal-100">
              <strong className="text-teal-950 dark:text-white">Specialization:</strong>{" "}
              {consultant.specialization}
            </p>
          </div>
        </div>

        {/* Booking Form Client Component */}
        <BookingForm consultant={consultant} />
      </div>
    </div>
  );
}
