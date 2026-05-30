"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, UploadCloud, CheckCircle, Image as ImageIcon, FileText, Loader2, Link, ChevronDown, Trash2, AlertCircle, Pencil, X } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

interface CustomReportDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

function CustomReportDropdown({ value, onChange }: CustomReportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const options = ["Fintech", "SaaS", "E-Commerce", "Healthcare", "EdTech", "GreenTech"];

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

  return (
    <div className="relative text-left w-full" ref={dropdownRef}>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Industry Sector</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-950 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 transition-all outline-none"
      >
        <span>{value}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl transition-all duration-200">
          <ul className="py-1">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    value === opt
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
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

export default function AdminReportsPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    industry: "Fintech",
    description: "",
    pages: "",
  });

  const [uploadedImage, setUploadedImage] = useState("");
  const [uploadedPdf, setUploadedPdf] = useState("");
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  interface ReportItem {
    id: number;
    title: string;
    description: string;
    image: string;
    pages: number;
    industry: string;
    uploadDate: string;
    pdfUrl: string;
  }

  // Existing uploaded reports states
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit report states
  const [editReport, setEditReport] = useState<ReportItem | null>(null);
  const [editFormData, setEditFormData] = useState({ title: "", industry: "Fintech", description: "", pages: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports || []);
      } else {
        showToast({
          type: "error",
          title: "Failed to Fetch",
          message: data.error || "Could not retrieve uploaded reports"
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to reports database"
      });
    } finally {
      setReportsLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/reports/${deleteConfirmId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        showToast({
          type: "success",
          title: "Report Deleted",
          message: "The report has been permanently removed from the library."
        });
        fetchReports();
      } else {
        showToast({
          type: "error",
          title: "Delete Failed",
          message: data.error || "Could not delete report"
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Could not connect to server to delete report"
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleEditReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReport) return;
    setIsEditing(true);

    try {
      const res = await fetch(`/api/admin/reports/${editReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editFormData.title,
          industry: editFormData.industry,
          description: editFormData.description,
          pages: parseInt(editFormData.pages) || editReport.pages,
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast({
          type: "success",
          title: "Report Updated",
          message: "The report metadata has been successfully updated."
        });
        fetchReports();
        setEditReport(null);
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: data.error || "Could not update report"
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Could not connect to server to update report"
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [type]: true }));
    setError("");

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/admin/reports/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      if (type === 'image') setUploadedImage(json.url);
      else {
        setUploadedPdf(json.url);
        if (json.pages) {
          setFormData(prev => ({ ...prev, pages: json.pages.toString() }));
        }
      }

    } catch (err: unknown) {
      const error = err as Error;
      showToast({
        type: "error",
        title: "Upload Failed",
        message: `Failed to upload ${type}: ${error.message}`
      });
      setError(`Failed to upload ${type}: ${error.message}`);
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedImage || !uploadedPdf) {
        setError("Please upload both a cover image and the report PDF first.");
        return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      // Logic: Save metadata and the PDF link (uploadedPdf) and Image (uploadedImage)
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...formData,
            image: uploadedImage,
            link: uploadedPdf // Using 'link' field from schema for PDF URL
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to publish report");

      setSuccess(true);
      showToast({
        type: "success",
        title: "Report Published",
        message: "The market research has been successfully published to the library."
      });
      setFormData({ title: "", industry: "Fintech", description: "", pages: "" });
      setUploadedImage("");
      setUploadedPdf("");
      fetchReports();
    } catch (err: unknown) {
      const error = err as Error;
      showToast({
        type: "error",
        title: "Publishing Failed",
        message: error.message || "Failed to publish report"
      });
      setError(error.message || "Failed to publish report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">Library Content Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Publish professional market research to the Startawy Cloud Library.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-6xl">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-slate-800">
              <div className="w-12 h-12 bg-linear-to-br from-teal-500 to-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Report</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Provide metadata and secure cloud assets.</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-900/30 rounded-xl text-teal-600 dark:text-teal-400 text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-500" />
                Report published successfully to the library!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Report Title</label>
                  <input
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. 2026 Fintech Growth Analysis"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-900 dark:text-white"
                  />
                </div>
                <CustomReportDropdown
                  value={formData.industry}
                  onChange={(val) => setFormData({ ...formData, industry: val })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Executive Summary</label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                  placeholder="Describe the key value propositions of this report. This summary will be visible to all users as a preview (Max 500 chars)..."
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-900 dark:text-white leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm min-h-[120px]"
                  style={{ resize: 'none' }}
                />
                <div className="flex justify-end mt-1 px-2">
                  <span className={`text-[10px] font-bold ${formData.description.length >= 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {formData.description.length}/500 Characters
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Total Pages</label>
                  <input
                    name="pages"
                    value={formData.pages}
                    onChange={handleChange}
                    type="number"
                    placeholder="Auto-detected or manual"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end pb-3 text-xs text-gray-500 italic">
                  Tip: Uploading a PDF will automatically detect the page count.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Cover Image</label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      uploadedImage ? 'border-teal-500 bg-teal-50/10' : 'border-gray-200 dark:border-slate-800'
                  }`}>
                    {uploadedImage ? (
                        <div className="flex flex-col items-center gap-2">
                             <ImageIcon className="w-8 h-8 text-teal-500" />
                             <span className="text-xs font-bold text-teal-600">Image Ready</span>
                             <button type="button" onClick={() => setUploadedImage("")} className="text-[10px] text-red-500 underline">Remove</button>
                        </div>
                    ) : (
                        <>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'image')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isUploading.image}
                            />
                            {isUploading.image ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                                    <span className="text-xs text-gray-500">Uploading to Cloud...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <UploadCloud className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Drop Cover Art</span>
                                </div>
                            )}
                        </>
                    )}
                  </div>
                </div>

                {/* PDF Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Full Report (PDF)</label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      uploadedPdf ? 'border-teal-500 bg-teal-50/10' : 'border-gray-200 dark:border-slate-800'
                  }`}>
                    {uploadedPdf ? (
                        <div className="flex flex-col items-center gap-2">
                             <FileText className="w-8 h-8 text-teal-500" />
                             <span className="text-xs font-bold text-teal-600">PDF Securely Hosted</span>
                             <button type="button" onClick={() => setUploadedPdf("")} className="text-[10px] text-red-500 underline">Remove</button>
                        </div>
                    ) : (
                        <>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handleFileUpload(e, 'pdf')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isUploading.pdf}
                            />
                            {isUploading.pdf ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                                    <span className="text-xs text-gray-500">Processing Document...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <UploadCloud className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload PDF Asset</span>
                                </div>
                            )}
                        </>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className={`w-4 h-4 ${uploadedImage && uploadedPdf ? 'text-teal-500' : 'text-gray-300'}`} />
                    All assets verified
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading.image || isUploading.pdf}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg font-bold disabled:opacity-75 active:scale-95 translate-y-0 hover:-translate-y-1 duration-200"
                >
                  <Plus className="w-5 h-5" />
                  {isSubmitting ? "Publishing..." : "Finalize & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Card */}
        <div className="space-y-6">
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Live Preview</h3>
           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden group border-b-4 border-b-teal-500">
                <div className="relative h-48 bg-gray-100 dark:bg-slate-800">
                    {uploadedImage ? (
                         <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                            <ImageIcon className="w-10 h-10 opacity-20" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Cover Art Hidden</span>
                        </div>
                    )}
                    <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-[10px] font-bold uppercase">
                            {formData.industry}
                        </span>
                    </div>
                </div>
                <div className="p-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{formData.title || "Report Title Placeholder"}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed mb-4">
                        {formData.description || "The executive summary will appear here once you start typing..."}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                             <FileText className="w-3 h-3" />
                             {formData.pages || "0"} Pages
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ${uploadedPdf ? 'text-teal-600 bg-teal-50' : 'text-gray-400 bg-gray-50'}`}>
                             <Link className="w-3 h-3" />
                             PDF {uploadedPdf ? 'HOSTED' : 'MISSING'}
                        </div>
                    </div>
                </div>
           </div>

           <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30">
                <h4 className="text-amber-800 dark:text-amber-400 font-bold text-sm mb-2 flex items-center gap-2">
                    <Link className="w-4 h-4" /> Cloud Storage Notice
                </h4>
                <p className="text-amber-700 dark:text-amber-500 text-[10px] leading-relaxed">
                    All reports and images are directly streamed to Cloudinary&apos;s secure servers. The database only stores the secure metadata and public links.
                </p>
           </div>
         </div>
      </div>

      {/* Uploaded Reports Section */}
      <div className="mt-12 pt-12 border-t border-gray-200 dark:border-slate-800">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Uploaded Library Reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and remove existing research published in the database.</p>
        </div>

        {reportsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 h-64 rounded-3xl border border-gray-200 dark:border-slate-800" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center bg-gray-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
            <FileText className="w-12 h-12 text-gray-400 opacity-40" />
            <p className="text-gray-500 dark:text-gray-400 font-bold">No uploaded reports found</p>
            <p className="text-xs text-gray-400">Use the form above to publish your first research paper.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-gray-300 dark:hover:border-slate-700 transition-all border-b-4 border-b-teal-500/50"
              >
                <div>
                  <div className="relative h-40 bg-slate-100 dark:bg-slate-800/50 overflow-hidden">
                    <img
                      src={report.image || "https://images.unsplash.com/photo-1618044733300-9472054094ee"}
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className="px-2.5 py-0.5 bg-teal-600/90 backdrop-blur-xs text-white rounded-full text-[9px] font-black uppercase tracking-wider">
                        {report.industry}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-teal-600 transition-colors">{report.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-3 leading-relaxed min-h-[54px]">{report.description}</p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-gray-50 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {report.pages} pgs
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-slate-800" />
                    <span>{new Intl.DateTimeFormat('en-GB').format(new Date(report.uploadDate))}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditReport(report);
                        setEditFormData({
                          title: report.title,
                          industry: report.industry,
                          description: report.description,
                          pages: String(report.pages)
                        });
                      }}
                      className="p-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-100 dark:border-teal-900/20 transition-all shrink-0 active:scale-95 group/btn"
                      title="Edit Report"
                    >
                      <Pencil className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(report.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-500 rounded-xl border border-red-100 dark:border-red-900/20 transition-all shrink-0 active:scale-95 group/btn"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => !isDeleting && setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Delete Library Report?</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">
                    Are you absolutely sure you want to delete this report from the library? This action is permanent and founders will instantly lose access to download it.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteReport}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {isDeleting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Report Modal */}
      <AnimatePresence>
        {editReport !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => !isEditing && setEditReport(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                    <Pencil className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Report</h3>
                    <p className="text-xs text-gray-400">Update report metadata</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditReport(null)}
                  disabled={isEditing}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleEditReport} className="p-6 space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Report Title</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-teal-500 rounded-2xl outline-none transition-all text-gray-900 dark:text-white text-sm"
                    placeholder="e.g. 2026 Fintech Growth Analysis"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Industry Sector</label>
                  <select
                    value={editFormData.industry}
                    onChange={e => setEditFormData({ ...editFormData, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-teal-500 rounded-2xl outline-none transition-all text-gray-900 dark:text-white text-sm"
                  >
                    {["Fintech", "SaaS", "E-Commerce", "Healthcare", "EdTech", "GreenTech"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Executive Summary</label>
                  <textarea
                    required
                    value={editFormData.description}
                    onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-teal-500 rounded-2xl outline-none transition-all text-gray-900 dark:text-white text-sm leading-relaxed placeholder:text-gray-400"
                    placeholder="Describe the key value propositions of this report..."
                    style={{ resize: 'none' }}
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-[10px] font-bold ${editFormData.description.length >= 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                      {editFormData.description.length}/500
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Total Pages</label>
                  <input
                    type="number"
                    value={editFormData.pages}
                    onChange={e => setEditFormData({ ...editFormData, pages: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-transparent focus:border-teal-500 rounded-2xl outline-none transition-all text-gray-900 dark:text-white text-sm"
                    placeholder="Number of pages"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditReport(null)}
                    disabled={isEditing}
                    className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing}
                    className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {isEditing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
