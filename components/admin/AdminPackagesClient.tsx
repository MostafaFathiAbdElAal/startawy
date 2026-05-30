"use client";

import { useState, useRef, useEffect } from "react";
import { Package, ShieldCheck, Loader2, ChevronDown } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

interface ServicePackage {
  id: number;
  type: string;
  price: number;
  duration: string;
  description: string;
}

interface CustomDurationDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

function CustomDurationDropdown({ value, onChange }: CustomDurationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const options = [
    { label: "Per Month", value: "month" },
    { label: "Per Year", value: "year" },
    { label: "One-time", value: "once" }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative text-left w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Duration</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-gray-950 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 transition-all outline-none"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl transition-all duration-200">
          <ul className="py-1">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    value === opt.value
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AdminPackagesClient({ initialData }: { initialData: ServicePackage[] }) {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<ServicePackage[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPkgId, setCurrentPkgId] = useState<number | null>(null);
  const [newPkg, setNewPkg] = useState({ type: "", price: "", duration: "month", description: "" });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Load Error",
        message: "Failed to reload packages list."
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (pkg: ServicePackage) => {
    setNewPkg({
      type: pkg.type,
      price: pkg.price.toString(),
      duration: pkg.duration,
      description: pkg.description,
    });
    setCurrentPkgId(pkg.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPkg, id: currentPkgId }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewPkg({ type: "", price: "", duration: "month", description: "" });
        fetchPackages();
        showToast({
          type: "success",
          title: "Package Updated",
          message: "Package details have been updated."
        });
      }
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Operation Failed",
        message: "Could not save the package changes."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Service Packages</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Configure subscription plans and pricing for Founders</p>
        </div>
      </div>

      {loading && packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
          <p className="text-slate-500 font-medium">Loading packages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 md:p-8 flex flex-col relative group transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/5 hover:-translate-y-1 overflow-hidden"
            >
              {/* Animated background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                  <Package className="w-8 h-8" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pkg.type}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${pkg.price}</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium lowercase">/ {pkg.duration}</span>
              </div>

              <div className="space-y-4 flex-1 mb-8">
                {pkg.description.split(',').map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{feature.trim()}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => openEditModal(pkg)}
                className="w-full py-3 px-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold text-gray-700 dark:text-gray-300 transition-all"
              >
                Edit Details
              </button>
            </div>
          ))}

          {packages.length === 0 && !loading && (
            <div className="col-span-full py-20 bg-gray-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Packages Configured</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Your platform currently has no active subscription packages.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Basic Create Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 dark:text-white text-left">Edit Package</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Package Title (Read-only)</label>
                <input 
                  disabled
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/50 dark:text-gray-400 text-gray-500 cursor-not-allowed outline-none focus:ring-0"
                  value={newPkg.type}
                  onChange={e => setNewPkg({...newPkg, type: e.target.value})}
                  placeholder="Basic, Pro, Enterprise..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Price ($)</label>
                  <input 
                    required type="number"
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    value={newPkg.price}
                    onChange={e => setNewPkg({...newPkg, price: e.target.value})}
                    placeholder="29.99"
                  />
                </div>
                <CustomDurationDropdown
                  value={newPkg.duration}
                  onChange={(val) => setNewPkg({ ...newPkg, duration: val })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Features (Read-only)</label>
                <textarea 
                  disabled
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/50 dark:text-gray-400 text-gray-500 cursor-not-allowed outline-none focus:ring-0 h-32"
                  style={{ resize: 'none' }}
                  value={newPkg.description}
                  onChange={e => setNewPkg({...newPkg, description: e.target.value})}
                  placeholder="3 Consultants, 5 Market Reports, 24/7 Support..."
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-teal-500 text-white rounded-xl hover:bg-teal-600 font-semibold shadow-md disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Update Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
