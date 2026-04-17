"use client";

import { useState } from "react";
import { Download, FileText, Calendar, BarChart2, Sparkles, X, Lock } from "lucide-react";
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
};

type LibraryClientProps = {
  reports: LibraryReport[];
  featuredReport: LibraryReport;
  categories: string[];
  userPlan: string;
  userIndustry: string;
};

export function LibraryClient({ reports, featuredReport, categories, userPlan, userIndustry }: LibraryClientProps) {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All Reports");
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [previewReport, setPreviewReport] = useState<LibraryReport | null>(null);

  const isPremium = userPlan === "Premium";

  const filteredReports = selectedCategory === "All Reports"
    ? reports
    : reports.filter((report) => report.category === selectedCategory);

  const handleDownload = async (id: number) => {
    if (!isPremium) {
      showToast({
        type: "error",
        title: "Access Denied",
        message: "Report downloads are exclusive to Premium Plan members. Please upgrade to access full reports.",
      });
      return;
    }

    setIsDownloading(id);
    try {
      window.location.href = `/api/reports/download?type=library&id=${id}`;
      showToast({
        type: "success",
        title: "Download Started",
        message: "Your report is being downloaded securely.",
      });
    } catch (error) {
        showToast({
            type: "error",
            title: "Download Failed",
            message: "An error occurred while starting your download.",
        });
    } finally {
      setTimeout(() => setIsDownloading(null), 1500);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">Startawy Reports Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Access industry insights, trends, and research reports.</p>
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
      <div className="bg-linear-to-r from-teal-500 to-teal-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400 rounded-full opacity-20 -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-700 rounded-full opacity-20 -ml-24 -mb-24 transition-transform group-hover:scale-110 duration-700"></div>
        
        <div className="relative z-10">
          <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
            ★ Featured Report
          </span>
          <h2 className="text-3xl font-bold mb-3">{featuredReport.title}</h2>
          <p className="text-teal-100 mb-6 max-w-2xl leading-relaxed">
            {featuredReport.description}
          </p>
          <div className="flex items-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{featuredReport.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>{featuredReport.pages} pages</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <BarChart2 className="w-5 h-5" />
              <span>{featuredReport.downloads.toLocaleString()} active readers</span>
            </div>
          </div>
          <button 
            onClick={() => handleDownload(featuredReport.id)}
            disabled={isDownloading === featuredReport.id}
            className={`px-8 py-3 bg-white text-teal-600 rounded-lg transition-all shadow-lg font-bold flex items-center gap-2 disabled:opacity-75 ${
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
            {/* Report Image */}
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

            {/* Report Content */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
                {report.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                {report.description}
              </p>

              {/* Metadata */}
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

              {/* Tags */}
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

              {/* Actions */}
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
                  onClick={() => setPreviewReport(report)}
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

      {/* AI Insights Section */}
      <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 border-l-4 border-l-purple-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Personalized Insights</h2>
            <p className="text-gray-600 dark:text-gray-400">Intelligence gathered for your {userIndustry} startup</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-teal-200 dark:border-teal-900/30 bg-teal-50/50 dark:bg-teal-900/10 rounded-2xl group cursor-default">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 transition-colors group-hover:text-teal-600">
              <span className="text-xl">📊</span> Trending in {userIndustry}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Standard market analysis reports for <span className="font-bold">{userIndustry}</span> have been viewed 2.6k+ times by similar businesses this month.
            </p>
          </div>

          <div className="p-6 border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl group cursor-default">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 transition-colors group-hover:text-blue-600">
              <span className="text-xl">🎯</span> Suggested for You
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Based on your growth stage, we recommend the <b>{userIndustry} Growth Strategy</b> pack to optimize your next funding round.
            </p>
          </div>

          <div className="p-6 border border-purple-200 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl group cursor-default">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 transition-colors group-hover:text-purple-600">
              <span className="text-xl">💡</span> Competitive Edge
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Our latest <span className="font-bold">{userIndustry}</span> regulatory report covers the new tax laws affecting your business directly.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="relative h-64 bg-gray-100 dark:bg-slate-800">
              <Image
                src={previewReport.image}
                alt={previewReport.title}
                fill
                className="object-cover"
              />
              <button 
                onClick={() => setPreviewReport(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end p-8">
                <div>
                   <span className="px-3 py-1 bg-teal-500 text-white rounded-full text-[10px] font-bold uppercase mb-2 inline-block">
                    {previewReport.category}
                   </span>
                   <h2 className="text-2xl font-bold text-white leading-tight">{previewReport.title}</h2>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                 <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Pages</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{previewReport.pages}</p>
                 </div>
                 <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
                 <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Release Date</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Q1 2026</p>
                 </div>
                 <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
                 <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Global Views</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{previewReport.downloads.toLocaleString()}+</p>
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                 <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-4 text-teal-500" />
                    Extended Preview Summary
                 </h4>
                 <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic">
                    "This report provides an exhaustive deep dive into the {previewReport.category} sector during early 2026. Key coverage includes emerging trends, market disruption vectors, and strategic scaling frameworks tailored for startups looking to dominate the digital landscape. Note: Standard users can only view this summary. Upgrade to Premium for the full 50+ page PDF analysis."
                 </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleDownload(previewReport.id)}
                  className="flex-1 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-bold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isPremium ? <Download className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  {isPremium ? "Confirm Full Download" : "Upgrade to Download Full PDF"}
                </button>
                <button 
                  onClick={() => setPreviewReport(null)}
                  className="px-8 py-4 border-2 border-gray-100 dark:border-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
