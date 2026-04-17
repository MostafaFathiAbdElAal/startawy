"use client";

import { useState } from "react";
import { Package, Plus, ShieldCheck, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface ServicePackage {
  id: number;
  type: string;
  price: number;
  duration: string;
  description: string;
}

export default function AdminPackagesClient({ initialData }: { initialData: ServicePackage[] }) {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<ServicePackage[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pkgToDelete, setPkgToDelete] = useState<ServicePackage | null>(null);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPkg),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewPkg({ type: "", price: "", duration: "month", description: "" });
        fetchPackages();
        showToast({
          type: "success",
          title: "Package Created",
          message: "New subscription package has been added successfully."
        });
      }
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Creation Failed",
        message: "Could not save the new package."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pkgToDelete) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/packages?id=${pkgToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPackages(packages.filter(p => p.id !== pkgToDelete.id));
        showToast({
          type: "success",
          title: "Package Deleted",
          message: `${pkgToDelete.type} has been removed permanently.`
        });
      }
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Delete Error",
        message: "An error occurred while trying to delete the package."
      });
    } finally {
      setLoading(false);
      setPkgToDelete(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Service Packages</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure subscription plans and pricing for Founders</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-md font-semibold shrink-0"
        >
          <Plus className="w-5 h-5" />
          Create New Package
        </button>
      </div>

      {loading && packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading packages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 flex flex-col relative group transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-xl">
                  <Package className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" onClick={() => setPkgToDelete(pkg)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
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

              <button className="w-full py-3 px-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold text-gray-700 dark:text-gray-300 transition-all">
                Edit Details
              </button>
            </div>
          ))}

          {packages.length === 0 && !loading && (
            <div className="col-span-full py-20 bg-gray-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Packages Configured</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Your platform currently has no active subscription packages. Click &quot;Create New Package&quot; to start.
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
            <h2 className="text-2xl font-bold mb-6 dark:text-white text-left">Create New Package</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Package Title (e.g. Premium Plan)</label>
                <input 
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
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
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Duration</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    value={newPkg.duration}
                    onChange={e => setNewPkg({...newPkg, duration: e.target.value})}
                  >
                    <option value="month">Per Month</option>
                    <option value="year">Per Year</option>
                    <option value="once">One-time</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Features (Comma separated)</label>
                <textarea 
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none h-32"
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
                  {loading ? "Creating..." : "Save Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deletion */}
      <ConfirmModal 
        isOpen={!!pkgToDelete}
        onClose={() => setPkgToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Package?"
        message={`Are you sure you want to delete the ${pkgToDelete?.type} package? This action will prevent new signups for this plan.`}
        confirmLabel="Delete Permanently"
        cancelLabel="Keep Package"
        isProcessing={loading}
      />
    </div>
  );
}
