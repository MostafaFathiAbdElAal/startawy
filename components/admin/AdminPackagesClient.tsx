"use client";

import { useState, useRef, useEffect } from "react";
import { Package, ShieldCheck, Loader2, ChevronDown, Plus, Trash2, Sparkles } from "lucide-react";
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

const getGradientByTitle = (title: string) => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash += title.charCodeAt(i);
  }
  const gradients = [
    {
      cardBorder: "hover:border-teal-500/40 hover:shadow-teal-500/10",
      bgGlow: "bg-teal-500/5",
      iconBg: "bg-teal-50 dark:bg-teal-900/20",
      iconColor: "text-teal-600 dark:text-teal-400",
      btnBorder: "hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:border-teal-500/30 text-teal-600 dark:text-teal-400",
      badge: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
      glowDot: "bg-teal-500"
    },
    {
      cardBorder: "hover:border-violet-500/40 hover:shadow-violet-500/10",
      bgGlow: "bg-violet-500/5",
      iconBg: "bg-violet-50 dark:bg-violet-900/20",
      iconColor: "text-violet-600 dark:text-violet-400",
      btnBorder: "hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:border-violet-500/30 text-violet-600 dark:text-violet-400",
      badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
      glowDot: "bg-violet-500"
    },
    {
      cardBorder: "hover:border-blue-500/40 hover:shadow-blue-500/10",
      bgGlow: "bg-blue-500/5",
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      btnBorder: "hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-500/30 text-blue-600 dark:text-blue-400",
      badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      glowDot: "bg-blue-500"
    },
    {
      cardBorder: "hover:border-rose-500/40 hover:shadow-rose-500/10",
      bgGlow: "bg-rose-500/5",
      iconBg: "bg-rose-50 dark:bg-rose-900/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      btnBorder: "hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-500/30 text-rose-600 dark:text-rose-400",
      badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
      glowDot: "bg-rose-500"
    },
    {
      cardBorder: "hover:border-amber-500/40 hover:shadow-amber-500/10",
      bgGlow: "bg-amber-500/5",
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      btnBorder: "hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-500/30 text-amber-600 dark:text-amber-400",
      badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      glowDot: "bg-amber-500"
    }
  ];
  return gradients[hash % gradients.length];
};

const isCorePackage = (title: string) => {
  return ["Free Trial", "Basic", "Premium"].includes(title);
};

function CustomDurationDropdown({ value, onChange }: CustomDurationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const options = [
    { label: "Per Month", value: "month" },
    { label: "Per Year", value: "year" },
    { label: "One-time", value: "once" },
    { label: "Forever", value: "forever" }
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPkgId, setCurrentPkgId] = useState<number | null>(null);
  const [newPkg, setNewPkg] = useState({ type: "", price: "", duration: "month", description: "" });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pkgToDelete, setPkgToDelete] = useState<ServicePackage | null>(null);

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

  const openAddModal = () => {
    setNewPkg({
      type: "",
      price: "",
      duration: "month",
      description: "",
    });
    setCurrentPkgId(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: ServicePackage) => {
    setNewPkg({
      type: pkg.type,
      price: pkg.price.toString(),
      duration: pkg.duration,
      description: pkg.description,
    });
    setCurrentPkgId(pkg.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = "/api/admin/packages";
      const method = isEditMode ? "PATCH" : "POST";
      const body = isEditMode 
        ? { ...newPkg, id: currentPkgId }
        : newPkg;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewPkg({ type: "", price: "", duration: "month", description: "" });
        fetchPackages();
        showToast({
          type: "success",
          title: isEditMode ? "Package Updated" : "Package Created",
          message: isEditMode 
            ? "Package details have been updated." 
            : "New package has been successfully created."
        });
      } else {
        const data = await res.json();
        showToast({
          type: "error",
          title: "Operation Failed",
          message: data.error || "Could not save the package changes."
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

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsDeleteModalOpen(false);
        setPkgToDelete(null);
        fetchPackages();
        showToast({
          type: "success",
          title: "Package Deleted",
          message: "The package has been removed."
        });
      } else {
        const data = await res.json();
        showToast({
          type: "error",
          title: "Delete Failed",
          message: data.error || "Could not delete the package."
        });
      }
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Delete Failed",
        message: "Could not delete the package."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Service Packages</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Configure subscription plans and pricing for Founders</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 py-3 px-6 bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-semibold rounded-2xl shadow-lg hover:shadow-teal-500/10 transition-all shrink-0 self-start sm:self-center"
        >
          <Plus className="w-5 h-5" />
          <span>Add Package</span>
        </button>
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
          {packages.map((pkg) => {
            const theme = getGradientByTitle(pkg.type);
            const isCore = isCorePackage(pkg.type);

            return (
              <div 
                key={pkg.id} 
                className={`bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 md:p-8 flex flex-col relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden ${theme.cardBorder}`}
              >
                {/* Animated background element */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bgGlow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`p-4 ${theme.iconBg} rounded-2xl ${theme.iconColor} group-hover:scale-110 transition-transform`}>
                    <Package className="w-8 h-8" />
                  </div>
                  {isCore ? (
                    <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full flex items-center gap-1.5 select-none border border-slate-200/50 dark:border-slate-700/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-550 animate-pulse" />
                      Core Plan
                    </span>
                  ) : (
                    <span className={`text-xs font-bold px-3 py-1.5 ${theme.badge} rounded-full flex items-center gap-1.5 select-none`}>
                      <Sparkles className="w-3 h-3 animate-spin duration-3000 shrink-0" />
                      Custom Plan
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pkg.type}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${pkg.price}</span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium lowercase">/ {pkg.duration}</span>
                </div>

                <div className="space-y-4 flex-1 mb-8">
                  {pkg.description.split(',').filter(f => f.trim() !== "").map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature.trim()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 w-full mt-auto">
                  <button 
                    onClick={() => openEditModal(pkg)}
                    className={`flex-1 py-3 px-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold text-gray-700 dark:text-gray-300 transition-all ${theme.btnBorder}`}
                  >
                    Edit Details
                  </button>
                  {!isCore && (
                    <button 
                      onClick={() => {
                        setPkgToDelete(pkg);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-3 border border-red-200 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 dark:text-red-400 transition-all cursor-pointer"
                      title="Delete Package"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

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

      {/* Package Form Modal (Add / Edit) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 dark:text-white text-left">
              {isEditMode ? "Edit Package" : "Create New Package"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  {isEditMode && isCorePackage(newPkg.type) 
                    ? "Package Title (Read-only for Core Plans)" 
                    : "Package Title"}
                </label>
                <input 
                  disabled={isEditMode && isCorePackage(newPkg.type)}
                  required
                  className={`w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none ${
                    isEditMode && isCorePackage(newPkg.type)
                      ? "bg-gray-100 dark:bg-slate-800/50 dark:text-gray-400 text-gray-500 cursor-not-allowed outline-none focus:ring-0" 
                      : ""
                  }`}
                  value={newPkg.type}
                  onChange={e => setNewPkg({...newPkg, type: e.target.value})}
                  placeholder="Basic, Premium, Enterprise..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Price ($)</label>
                  <input 
                    required 
                    type="number"
                    step="0.01"
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
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Features (Comma-separated)
                </label>
                <textarea 
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none h-32"
                  style={{ resize: 'none' }}
                  value={newPkg.description}
                  onChange={e => setNewPkg({...newPkg, description: e.target.value})}
                  placeholder="24/7 dedicated support, Custom dashboard, Marketing templates..."
                />
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed">
                  List features separated by a comma (e.g., Feature One, Feature Two, Feature Three)
                </p>
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
                  {loading ? "Saving..." : isEditMode ? "Update Package" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && pkgToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-full">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold dark:text-white">Delete Package?</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete the package <strong className="text-gray-900 dark:text-white">&quot;{pkgToDelete.type}&quot;</strong>? This action cannot be undone, and users will no longer be able to subscribe to this plan.
            </p>
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => handleDelete(pkgToDelete.id)}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Package"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
