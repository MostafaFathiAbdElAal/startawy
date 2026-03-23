"use client";

import { useState } from "react";
import { Plus, UploadCloud, CheckCircle } from "lucide-react";

export default function AdminReportsPage() {
  const [formData, setFormData] = useState({
    title: "",
    industry: "Fintech",
    description: "",
    pages: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: "" }), // Mock image handled by API
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload report");

      setSuccess(true);
      setFormData({ title: "", industry: "Fintech", description: "", pages: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Library Reports Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Upload new market reports to the Startawy Library for Founders.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-slate-800">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Global Report</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the primary metadata array details.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm border border-green-200 dark:border-green-900/50 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Report uploaded successfully and is now active in the Library!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Title</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Q1 SaaS Trends 2026"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-teal-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry Category</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-teal-500 transition-all outline-none"
              >
                <option value="Fintech">Fintech</option>
                <option value="SaaS">SaaS</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Healthcare">Healthcare</option>
                <option value="EdTech">EdTech</option>
                <option value="GreenTech">GreenTech</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Insights Summary</label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide a compelling summary of the report..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-teal-500 transition-all outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Count</label>
            <input
              required
              name="pages"
              value={formData.pages}
              onChange={handleChange}
              type="number"
              placeholder="e.g. 45"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-teal-500 transition-all outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-md font-semibold disabled:opacity-75"
            >
              <Plus className="w-5 h-5" />
              {isSubmitting ? "Uploading..." : "Publish Report to Library"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
