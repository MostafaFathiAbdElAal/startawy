"use client";

import { useState } from "react";
import { Download, FileText, Calendar, BarChart2, Sparkles, X, Lock, Eye, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useToast } from "@/components/providers/ToastProvider";

type LibraryReport = {
  id: number;
  title: string;
  description: string;
  image: string;
  pages: number;
  downloads: number;
  category: string;
  tags: string[];
  date?: string;
  pdfUrl?: string;
};

type LibraryClientProps = {
  reports: LibraryReport[];
  featuredReport: LibraryReport;
  categories: string[];
  userPlan: string;
};

export function LibraryClient({ reports, featuredReport, categories, userPlan }: LibraryClientProps) {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All Reports");
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [previewReport, setPreviewReport] = useState<LibraryReport | null>(null);
  const [localReports, setLocalReports] = useState<LibraryReport[]>(reports);

  const isPremium = userPlan === "Premium";
  
  // Use the latest data from localReports for the featured section if it matches
  const currentFeatured = localReports.find(r => r.id === featuredReport.id) || featuredReport;

  const filteredReports = selectedCategory === "All Reports"
    ? localReports
    : localReports.filter((report) => report.category === selectedCategory);

  const handlePreview = async (report: LibraryReport) => {
    setPreviewReport(report);
    
    // Increment view via API
    try {
      const response = await fetch('/api/reports/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update local state so the view count reflects immediately
        setLocalReports(prev => prev.map(r => 
          r.id === report.id ? { ...r, downloads: data.views } : r
        ));
      }
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  };

  const handleDownload = async (id: number) => {
    if (!isPremium) {
      showToast({
        type: "error",
        title: "Premium Required",
        message: "Unlock Premium to download full reports."
      });
      return;
    }

    setIsDownloading(id);
    
    try {
      showToast({
        type: "success",
        title: "Preparing Download",
        message: "Fetching your report securely...",
      });

      // API now proxies the PDF directly — read as blob
      const response = await fetch(`/api/reports/download?type=library&id=${id}`);
      
      if (!response.ok) {
        // Error responses are JSON
        const errData = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error("Session expired. Please login again.");
        if (response.status === 403) throw new Error(errData.message || "Premium plan required.");
        throw new Error(errData.error || "Download failed. Please try again.");
      }

      // Success — response is the raw PDF binary
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header if available
      const disposition = response.headers.get('Content-Disposition');
      const nameMatch = disposition?.match(/filename="?([^"]+)"?/);
      const filename = nameMatch?.[1] || `startawy-report-${id}.pdf`;

      // Trigger silent download without leaving the page
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
      setIsDownloading(null);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred.";
      console.error("Download failed:", msg);
      showToast({
        type: "error",
        title: "Download Error",
        message: msg,
      });
      setIsDownloading(null);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">Startawy Reports Library</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Access industry insights, trends, and research reports.</p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
            isPremium 
            ? "bg-amber-100 text-amber-700 border border-amber-200" 
            : "bg-teal-50 text-teal-700 border border-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800"
        }`}>
            {isPremium ? <Sparkles className="w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
            {userPlan} Plan
        </div>
      </div>

      {/* Featured Report */}
      <div className="bg-linear-to-r from-teal-500 to-teal-600 rounded-2xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400 rounded-full opacity-20 -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-700 rounded-full opacity-20 -ml-24 -mb-24 transition-transform group-hover:scale-110 duration-700"></div>
        
        <div className="relative z-10">
          <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
            ★ Featured Report
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{currentFeatured.title}</h2>
          <p className="text-teal-100 mb-6 max-w-2xl leading-relaxed text-sm sm:text-base">
            {currentFeatured.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{currentFeatured.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>{currentFeatured.pages} pages</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <BarChart2 className="w-5 h-5" />
              <span>{currentFeatured?.downloads?.toLocaleString() || 0} views</span>
            </div>
          </div>
          <button 
            onClick={() => handleDownload(currentFeatured.id)}
            disabled={isDownloading === currentFeatured.id}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-teal-600 rounded-lg transition-all shadow-lg font-bold flex items-center justify-center gap-2 disabled:opacity-75 ${
              !isPremium ? "opacity-90" : "hover:bg-gray-50 active:scale-95"
            }`}
          >
            {isPremium ? <Download className={`w-5 h-5 ${isDownloading === featuredReport.id ? 'animate-bounce' : ''}`} /> : <Lock className="w-5 h-5" />}
            {isDownloading === featuredReport.id ? 'Downloading...' : (isPremium ? 'Download Report' : 'Premium Download')}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedCategory === category
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0">
              <Image
                src={report.image}
                alt={report.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-teal-600/90 backdrop-blur-sm text-white rounded-full text-xs font-bold shadow-sm">
                  {report.category}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
                {report.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                {report.description}
              </p>

              <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-teal-500" />
                  <span>{report.pages} pages</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart2 className="w-4 h-4 text-blue-500" />
                  <span>{report.downloads.toLocaleString()} downloads</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {report.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-0.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 rounded-lg text-[10px] uppercase tracking-wider font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <button 
                  onClick={() => handleDownload(report.id)}
                  disabled={isDownloading === report.id}
                  className={`flex-1 px-4 py-2 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg transition-all font-bold flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-75 ${
                      !isPremium ? "opacity-80" : "hover:from-teal-600 hover:to-teal-700 hover:shadow-md active:scale-95"
                  }`}
                >
                  {isPremium ? <Download className={`w-4 h-4 ${isDownloading === report.id ? 'animate-bounce' : ''}`} /> : <Lock className="w-4 h-4" />}
                  Download
                </button>
                <button 
                  onClick={() => handlePreview(report)}
                  className="px-4 py-2 border-2 border-gray-100 dark:border-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-bold text-sm active:scale-95"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
            No reports found for this category.
          </div>
        )}
      </div>

      {/* Premium Preview Modal */}
      <AnimatePresence>
        {previewReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewReport(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="relative w-full max-w-2xl bg-slate-900 rounded-2xl sm:rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden border border-white/5 max-h-[90vh] flex flex-col"
            >
              {/* Header Image Section - Cinema Style (No Cropping) */}
              <div className="relative h-60 md:h-64 w-full shrink-0 bg-slate-950 overflow-hidden">
                {/* Blurred Background Layer */}
                <div className="absolute inset-0 opacity-40 blur-2xl scale-110">
                  <Image
                    src={previewReport.image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Main Centered Image - Contain (Full Visibility) */}
                <div className="relative h-full w-full flex items-center justify-center p-4">
                  <div className="relative h-full w-full">
                    <Image
                      src={previewReport.image}
                      alt={previewReport.title}
                      fill
                      className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                      priority
                    />
                  </div>
                </div>
                
                {/* Gradients to blend */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />

                {/* Close Button */}
                <button 
                  onClick={() => setPreviewReport(null)}
                  className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-xl text-white rounded-full transition-all z-20 border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-linear-to-t from-slate-900 via-slate-900/60 to-transparent">
                  <span className="px-3 py-1 bg-teal-500/90 backdrop-blur-sm text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-2 inline-block w-fit">
                    {previewReport.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                    {previewReport.title}
                  </h2>
                </div>
              </div>
              
              {/* Content Body - Scrollable */}
              <div className="p-6 md:p-8 overflow-y-auto scrollbar-hide">
                {/* Stats Grid - Compact */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                   <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Pages</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                        <p className="text-base font-black text-white">{previewReport.pages}</p>
                      </div>
                   </div>
                   <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Published</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <p className="text-base font-black text-white">{previewReport.date}</p>
                      </div>
                   </div>
                   <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Views</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-purple-500" />
                        <p className="text-base font-black text-white">
                          {localReports.find(r => r.id === previewReport?.id)?.downloads?.toLocaleString() || 0}
                        </p>
                      </div>
                   </div>
                </div>

                {/* Summary Section */}
                <div className="space-y-3 mb-8">
                   <h4 className="font-black text-slate-500 text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-teal-500" />
                      Executive Summary
                   </h4>
                   <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-teal-500/30 pl-4">
                     &quot;This strategic analysis covers the <strong>{previewReport.category}</strong> sector for 2026. Includes emerging trends and scaling frameworks for digital startups. Standard users view this summary; Premium members access the full report.&quot;
                   </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={() => handleDownload(previewReport.id)}
                    className="flex-[2] py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-xl font-black hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isPremium ? <Download className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    <span className="text-sm uppercase tracking-tight">
                      {isPremium ? "Download PDF" : "Unlock Premium"}
                    </span>
                  </button>
                  <button 
                    onClick={() => setPreviewReport(null)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
