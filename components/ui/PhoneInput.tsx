'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface Country {
  name: string;
  code: string;
  flag: string;
  iso: string;
}

const countries: Country[] = [
  { name: 'Egypt', code: '20', flag: '🇪🇬', iso: 'EG' },
  { name: 'Saudi Arabia', code: '966', flag: '🇸🇦', iso: 'SA' },
  { name: 'United Arab Emirates', code: '971', flag: '🇦🇪', iso: 'AE' },
  { name: 'Kuwait', code: '965', flag: '🇰🇼', iso: 'KW' },
  { name: 'Qatar', code: '974', flag: '🇶🇦', iso: 'QA' },
  { name: 'Oman', code: '968', flag: '🇴🇲', iso: 'OM' },
  { name: 'Bahrain', code: '973', flag: '🇧🇭', iso: 'BH' },
  { name: 'Jordan', code: '962', flag: '🇯🇴', iso: 'JO' },
  { name: 'Lebanon', code: '961', flag: '🇱🇧', iso: 'LB' },
  { name: 'Palestine', code: '970', flag: '🇵🇸', iso: 'PS' },
  { name: 'USA', code: '1', flag: '🇺🇸', iso: 'US' },
  { name: 'UK', code: '44', flag: '🇬🇧', iso: 'GB' },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  error?: boolean;
  placeholder?: string;
  className?: string;
}

export default function PhoneInput({ value, onChange, error, placeholder, className }: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (typeof window !== 'undefined' && value) {
      const country = countries.find(c => value.startsWith(c.code));
      return country || countries[0];
    }
    return countries[0];
  });

  const [localNumber, setLocalNumber] = useState(() => {
    if (typeof window !== 'undefined' && value) {
      const country = countries.find(c => value.startsWith(c.code));
      return country ? value.slice(country.code.length) : value;
    }
    return '';
  });

  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onChange(`${country.code}${localNumber}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only digits
    const cleaned = val.startsWith('0') ? val.slice(1) : val;
    setLocalNumber(cleaned);
    onChange(`${selectedCountry.code}${cleaned}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.includes(search)
  );

  return (
    <div className={`relative flex gap-2 ${className}`}>
      {/* Country Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 h-[52px] bg-gray-100 dark:bg-gray-800 border-1.5 rounded-xl transition-all ${
            isOpen ? 'border-teal-500 ring-2 ring-teal-500/10' : error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
          }`}
        >
          <span className="text-xl">{selectedCountry.flag}</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">+{selectedCountry.code}</span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 left-0 mt-1 w-64 max-h-72 overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl"
            >
              <div className="p-2 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border-none rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-56 p-1">
                {filteredCountries.map((country) => (
                  <button
                    key={country.iso}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        {country.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 group-hover:text-teal-500">
                      +{country.code}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Number Input */}
      <div className="flex-1">
        <input
          type="text"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={placeholder || "1012345678"}
          className={`auth-input w-full h-[52px] ${error ? 'auth-input-error' : ''}`}
        />
      </div>
    </div>
  );
}
