"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, MapPin, DollarSign, Award, Calendar, ShieldCheck } from "lucide-react";

interface Consultant {
  id: number;
  name: string;
  specialization: string | null;
  rating: number;
  reviews: number;
  experience: string;
  price: number;
  location: string;
  certifications: string[];
  avatar: string | null;
  availability: string;
  availableColor: string;
  bio: string;
}

interface BookConsultantClientProps {
  initialConsultants: Consultant[];
  specializations: string[];
}

interface CustomSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

function CustomSelect({ label, options, value, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-left focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-xs"
      >
        <span className="truncate">{value}</span>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700 transition-all duration-200">
          <ul className="py-1">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    value === opt
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                      : "text-gray-750 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function BookConsultantClient({ initialConsultants, specializations }: BookConsultantClientProps) {
  const searchParams = useSearchParams();

  const [selectedSpec, setSelectedSpec] = useState(() => searchParams.get('specialization') || "All Specializations");
  const [selectedPrice, setSelectedPrice] = useState(() => searchParams.get('price') || "Any Price");
  const [selectedAvailability, setSelectedAvailability] = useState(() => searchParams.get('availability') || "Any Time");
  const [selectedRating, setSelectedRating] = useState(() => searchParams.get('rating') || "Any Rating");

  const handleFilterChange = (key: string, value: string, setter: (val: string) => void) => {
    setter(value);
    // Use native history API to update URL without triggering any server request or re-render
    const params = new URLSearchParams(window.location.search);
    const defaults = ["All Specializations", "Any Price", "Any Time", "Any Rating"];
    if (value && !defaults.includes(value)) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  };

  const filteredConsultants = useMemo(() => {
    let list = [...initialConsultants];

    // 1. Filter Specialization
    if (selectedSpec !== "All Specializations") {
      list = list.filter(c => c.specialization?.includes(selectedSpec));
    }

    // 2. Filter Availability
    if (selectedAvailability !== "Any Time") {
      if (selectedAvailability === "Available Today") {
        list = list.filter(c => c.availability === "Available Today");
      } else {
        list = list.filter(c => c.availability !== "Available Today");
      }
    }

    // 3. Filter Rating — only apply to consultants with actual reviews
    if (selectedRating !== "Any Rating") {
      const minRating = parseFloat(selectedRating);
      if (!isNaN(minRating)) {
        // Exclude consultants with no reviews — their rating is a default value, not real
        list = list.filter(c => c.reviews > 0 && c.rating >= minRating);
      }
    }

    // 4. Filter Price Range
    if (selectedPrice !== "Any Price") {
      if (selectedPrice === "$100 - $150") {
        list = list.filter(c => c.price >= 100 && c.price <= 150);
      } else if (selectedPrice === "$150 - $200") {
        list = list.filter(c => c.price > 150 && c.price <= 200);
      } else if (selectedPrice === "$200+") {
        list = list.filter(c => c.price > 200);
      }
    }

    return list;
  }, [initialConsultants, selectedSpec, selectedPrice, selectedAvailability, selectedRating]);

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Book a Consultant</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">Connect with expert financial consultants for personalized guidance</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <CustomSelect
            label="Specialization"
            options={["All Specializations", ...specializations]}
            value={selectedSpec}
            onChange={(val) => handleFilterChange('specialization', val, setSelectedSpec)}
          />
          <CustomSelect
            label="Price Range"
            options={["Any Price", "$100 - $150", "$150 - $200", "$200+"]}
            value={selectedPrice}
            onChange={(val) => handleFilterChange('price', val, setSelectedPrice)}
          />
          <CustomSelect
            label="Availability"
            options={["Any Time", "Available Today", "This Week", "This Month"]}
            value={selectedAvailability}
            onChange={(val) => handleFilterChange('availability', val, setSelectedAvailability)}
          />
          <CustomSelect
            label="Rating"
            options={["Any Rating", "4.5+ Stars", "4.8+ Stars", "5 Stars"]}
            value={selectedRating}
            onChange={(val) => handleFilterChange('rating', val, setSelectedRating)}
          />
        </div>
      </div>

      {/* Consultants Grid */}
      {filteredConsultants.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-lg">
          No consultants found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredConsultants.map((consultant) => (
            <div
              key={consultant.id}
              className="bg-white dark:bg-slate-900 rounded-[28px] shadow-sm border border-slate-200 dark:border-slate-800/80 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group"
            >
              {/* Centered Top Header Segment */}
              <div className="p-6 flex flex-col items-center text-center border-b border-slate-100 dark:border-slate-800/50">
                {/* Circular Avatar with verification badge */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full p-[2px] bg-linear-to-tr from-teal-500/40 to-emerald-500/40 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {consultant.avatar ? (
                      <img 
                        src={consultant.avatar} 
                        alt={consultant.name} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-teal-500 to-emerald-600 text-white font-black text-xl rounded-full flex items-center justify-center">
                        {consultant.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Modern Verified Badge */}
                  <div className="absolute -top-1 -right-1 bg-teal-500 text-white p-1 rounded-full shadow-md border-2 border-white dark:border-slate-900">
                    <ShieldCheck className="w-3.5 h-3.5 fill-white text-teal-600 dark:text-emerald-500 stroke-[2.5]" />
                  </div>
                </div>

                {/* Stacked Name & Specialization */}
                <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight mb-1">{consultant.name}</h3>
                
                {/* Clean Reviews Rating layout */}
                {consultant.reviews > 0 ? (
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{consultant.rating.toFixed(1)}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">({consultant.reviews} reviews)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500">
                    <Star className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    <span className="text-xs font-medium">No reviews yet</span>
                  </div>
                )}
              </div>

              {/* Info details & Stats */}
              <div className="p-6 flex-1 flex flex-col">
                {/* Availability pill */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {consultant.availability}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Specialization</span>
                  <p className="text-slate-900 dark:text-white font-bold text-base leading-snug">
                    {consultant.specialization}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Years Experience info with soft layout */}
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>{consultant.experience} experience</span>
                  </div>
                  {/* Location info */}
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{consultant.location}</span>
                  </div>
                  {/* Pricing info */}
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <DollarSign className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-bold text-slate-900 dark:text-white">${consultant.price}</span>
                      <span className="text-[10px] uppercase text-slate-400">/session</span>
                    </div>
                  </div>
                </div>

                {/* Certifications tags */}
                {consultant.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    {consultant.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-0.5 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-md text-[9px] font-bold uppercase tracking-wider border border-slate-100 dark:border-slate-800"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-2.5 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  <Link
                    href={`/consultant/${consultant.id}/book`}
                    className="flex-1 px-4 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 active:scale-95 duration-200"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Session
                  </Link>
                  <Link
                    href={`/consultant/${consultant.id}`}
                    className="px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-sm text-center active:scale-95 duration-200"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 bg-linear-to-br from-teal-50 to-blue-50 dark:from-slate-900/50 dark:to-slate-900 rounded-[32px] p-8 sm:p-12 text-center border border-teal-100 dark:border-slate-800 shadow-xl shadow-teal-500/5">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Not sure which consultant to choose?</h2>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
          Our AI advisor can help match you with the perfect consultant based on your specific needs and goals.
        </p>
        <Link
          href="/ai-chatbot"
          className="inline-block px-10 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-xl shadow-teal-500/25 font-black active:scale-95"
        >
          Get AI Recommendation
        </Link>
      </div>
    </div>
  );
}
