import { Metadata } from "next";
import { Star, MapPin, DollarSign, Award, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Book a Consultant",
};

import Link from "next/link";
import NextImage from "next/image";
import { ConsultationFilter } from "@/components/consultants/ConsultationFilter";
import { prisma } from "@/lib/prisma";

const dummyConsultants = [
  {
    id: 1,
    name: "Sarah Johnson",
    specialization: "Budget Optimization & Financial Planning",
    rating: 4.9,
    reviews: 127,
    experience: "12 years",
    price: 150,
    location: "New York, USA",
    certifications: ["CFA", "CFP"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    availability: "Available Today",
    availableColor: "green",
  },
  {
    id: 2,
    name: "Michael Chen",
    specialization: "Growth Strategy & Revenue Optimization",
    rating: 4.8,
    reviews: 98,
    experience: "10 years",
    price: 180,
    location: "San Francisco, USA",
    certifications: ["MBA", "CPA"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    availability: "Available Tomorrow",
    availableColor: "blue",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    specialization: "Startup Financial Management",
    rating: 5.0,
    reviews: 156,
    experience: "15 years",
    price: 200,
    location: "Austin, USA",
    certifications: ["CFA", "MBA"],
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    availability: "Available Today",
    availableColor: "green",
  },
  {
    id: 4,
    name: "David Thompson",
    specialization: "Risk Management & Compliance",
    rating: 4.7,
    reviews: 82,
    experience: "8 years",
    price: 140,
    location: "Boston, USA",
    certifications: ["CRM", "CFP"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    availability: "Available in 2 days",
    availableColor: "gray",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    specialization: "Investment Strategy & Portfolio Management",
    rating: 4.9,
    reviews: 143,
    experience: "14 years",
    price: 190,
    location: "Chicago, USA",
    certifications: ["CFA", "FRM"],
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
    availability: "Available Today",
    availableColor: "green",
  },
  {
    id: 6,
    name: "James Wilson",
    specialization: "M&A Advisory & Valuations",
    rating: 4.8,
    reviews: 91,
    experience: "11 years",
    price: 220,
    location: "Los Angeles, USA",
    certifications: ["CFA", "CVA"],
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    availability: "Available Tomorrow",
    availableColor: "blue",
  },
];

export default async function BookConsultantPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const specialization = resolvedParams.specialization as string;
  const priceRange = resolvedParams.price as string;
  const ratingFilter = resolvedParams.rating as string;
  const availability = resolvedParams.availability as string;

  const dbConsultants = await prisma.consultant.findMany({
    include: { user: true }
  });

  let consultants = dbConsultants.length > 0 ? dbConsultants.map(c => ({
    id: c.id,
    name: c.user.name,
    specialization: c.specialization,
    rating: 5.0, // Mock fallback as rating is not in Prisma model directly yet
    reviews: 0,
    experience: `${c.yearsOfExp} years`,
    price: 150, // Real version should query packages or consultant set price
    location: "Global",
    certifications: c.certificate ? [c.certificate] : [],
    avatar: c.user.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    availability: c.availability || "Available Today",
    availableColor: "green",
  })) : dummyConsultants;

  if (specialization && specialization !== "All Specializations") {
    consultants = consultants.filter(c => c.specialization?.includes(specialization));
  }
  
  if (availability && availability !== "Any Time") {
    if (availability === "Available Today") {
      consultants = consultants.filter(c => c.availability === "Available Today");
    } else {
      consultants = consultants.filter(c => c.availability !== "Available Today");
    }
  }

  if (ratingFilter && ratingFilter !== "Any Rating") {
    const minRating = parseFloat(ratingFilter);
    if (!isNaN(minRating)) {
      consultants = consultants.filter(c => c.rating >= minRating);
    }
  }

  if (priceRange && priceRange !== "Any Price") {
    if (priceRange === "$100 - $150") {
      consultants = consultants.filter(c => c.price >= 100 && c.price <= 150);
    } else if (priceRange === "$150 - $200") {
      consultants = consultants.filter(c => c.price > 150 && c.price <= 200);
    } else if (priceRange === "$200+") {
      consultants = consultants.filter(c => c.price > 200);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Book a Consultant</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect with expert financial consultants for personalized guidance</p>
      </div>

      {/* Filter Bar */}
      <ConsultationFilter />

      {/* Consultants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultants.map((consultant) => (
          <div
            key={consultant.id}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full"
          >
            {/* Consultant Header */}
            <div className="p-6 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20 shrink-0">
                  <NextImage
                    src={consultant.avatar}
                    alt={consultant.name}
                    fill
                    className="rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{consultant.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">{consultant.rating}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">({consultant.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Availability Badge */}
              <div className="flex items-center gap-2 mt-3">
                <div className={`w-2 h-2 rounded-full ${
                  consultant.availableColor === "green" ? "bg-green-500" :
                  consultant.availableColor === "blue" ? "bg-blue-500" : "bg-gray-400"
                }`}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{consultant.availability}</span>
              </div>
            </div>

            {/* Consultant Info */}
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-gray-900 dark:text-white font-medium mb-4 leading-snug">
                {consultant.specialization}
              </p>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <Award className="w-4 h-4" />
                  <span>{consultant.experience} experience</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{consultant.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold text-gray-900 dark:text-white">${consultant.price}</span>
                  <span>/session</span>
                </div>
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-2 mb-6">
                {consultant.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium"
                  >
                    {cert}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/consultant/${consultant.id}/book`}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-medium text-sm text-center flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book Session
                </Link>
                <Link
                  href={`/consultant/${consultant.id}`}
                  className="px-4 py-2.5 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-teal-500 hover:text-teal-600 dark:hover:border-teal-400 dark:hover:text-teal-400 transition-colors font-medium text-sm"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Not sure which consultant to choose?</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Our AI advisor can help match you with the perfect consultant based on your specific needs and goals.
        </p>
        <Link
          href="/ai-chatbot"
          className="inline-block px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold"
        >
          Get AI Recommendation
        </Link>
      </div>
    </div>
  );
}
