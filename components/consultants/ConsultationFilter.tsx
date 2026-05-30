"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

export function ConsultationFilter({ specializations = [] }: { specializations?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All Specializations" && value !== "Any Price" && value !== "Any Time" && value !== "Any Rating") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <CustomSelect
          label="Specialization"
          options={["All Specializations", ...specializations]}
          value={searchParams.get('specialization') || "All Specializations"}
          onChange={(val) => handleFilterChange('specialization', val)}
        />
        <CustomSelect
          label="Price Range"
          options={["Any Price", "$100 - $150", "$150 - $200", "$200+"]}
          value={searchParams.get('price') || "Any Price"}
          onChange={(val) => handleFilterChange('price', val)}
        />
        <CustomSelect
          label="Availability"
          options={["Any Time", "Available Today", "This Week", "This Month"]}
          value={searchParams.get('availability') || "Any Time"}
          onChange={(val) => handleFilterChange('availability', val)}
        />
        <CustomSelect
          label="Rating"
          options={["Any Rating", "4.5+ Stars", "4.8+ Stars", "5 Stars"]}
          value={searchParams.get('rating') || "Any Rating"}
          onChange={(val) => handleFilterChange('rating', val)}
        />
      </div>
    </div>
  );
}
