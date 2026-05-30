"use client";

import { useState } from "react";
import { Plus, X, Loader2, User, Mail, Lock, Briefcase, Calendar, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";

export function AddConsultantModal() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    yearsOfExp: "",
  });

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score: 2, label: "Fair", color: "bg-yellow-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const isPasswordTooShort = formData.password.length > 0 && formData.password.length < 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/consultants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        showToast({
          type: "success",
          title: "Registration Success",
          message: "The new consultant has been successfully onboarded."
        });
        setIsOpen(false);
        setFormData({ name: "", email: "", password: "", specialization: "", yearsOfExp: "" });
        router.refresh(); 
      } else {
        showToast({
          type: "error",
          title: "Onboarding Failed",
          message: result.error || "Failed to register new consultant."
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to the server."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-xl shadow-teal-500/20 font-black text-sm uppercase tracking-widest active:scale-95 group"
      >
        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
          <Plus className="w-4 h-4" />
        </div>
        Add New Consultant
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">                 
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Consultant Onboarding</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Register a new financial expert into the system</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Initial Password"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white transition-colors ${
                        isPasswordTooShort
                          ? "border-red-400 dark:border-red-500"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= passwordStrength.score ? passwordStrength.color : "bg-slate-200 dark:bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-medium ${
                          passwordStrength.score === 1 ? "text-red-500" :
                          passwordStrength.score === 2 ? "text-yellow-500" : "text-emerald-500"
                        }`}>
                          {passwordStrength.label}
                        </p>
                        {isPasswordTooShort && (
                          <p className="text-xs text-red-500">At least 8 characters required</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Specialization (e.g. Valuation)"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      />
                    </div>
                     <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        required
                        placeholder="Years of Exp"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                        value={formData.yearsOfExp}
                        onChange={(e) => setFormData({ ...formData, yearsOfExp: e.target.value })}
                      />
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
