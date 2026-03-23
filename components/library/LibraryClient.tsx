"use client";

import { useState } from "react";
import { Download, FileText, Calendar, BarChart2, Sparkles } from "lucide-react";
import Image from "next/image";

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
};

export function LibraryClient({ reports, featuredReport, categories }: LibraryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Reports");
  const [isDownloading, setIsDownloading] = useState<number | null>(null);

  const filteredReports = selectedCategory === "All Reports"
    ? reports
    : reports.filter((report) => report.category === selectedCategory);

  const handleDownload = async (id: number) => {
    setIsDownloading(id);
    try {
      // Trigger download purely via API
      window.location.href = `/api/reports/download?type=library&id=${id}`;
    } finally {
      setTimeout(() => setIsDownloading(null), 1000);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Startawy Reports Library</h1>
        <p className="text-gray-600 dark:text-gray-400">Access industry insights, trends, and research reports.</p>
      </div>

      {/* Featured Report */}
      <div className="bg-linear-to-r from-teal-500 to-teal-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400 rounded-full opacity-20 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-700 rounded-full opacity-20 -ml-24 -mb-24"></div>
        
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
          </div>
          <button 
            onClick={() => handleDownload(featuredReport.id)}
            disabled={isDownloading === featuredReport.id}
            className="px-8 py-3 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition-all shadow-lg font-semibold flex items-center gap-2 disabled:opacity-75"
          >
            <Download className={`w-5 h-5 ${isDownloading === featuredReport.id ? 'animate-bounce' : ''}`} />
            {isDownloading === featuredReport.id ? 'Downloading...' : 'Download Report'}
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
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
          >
            {/* Report Image */}
            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0">
              <Image
                src={report.image}
                alt={report.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-medium shadow-sm">
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
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{report.pages} pages</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart2 className="w-4 h-4" />
                  <span>{report.downloads.toLocaleString()}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {report.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full text-xs"
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
                  className="flex-1 px-4 py-2 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-75"
                >
                  <Download className={`w-4 h-4 ${isDownloading === report.id ? 'animate-bounce' : ''}`} />
                  Download
                </button>
                <button className="px-4 py-2 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm">
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
      <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personalized Recommendations</h2>
            <p className="text-gray-600 dark:text-gray-400">Based on your business profile and industry</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-teal-200 dark:border-teal-900/30 bg-teal-50 dark:bg-teal-900/10 rounded-2xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-xl">📊</span> Trending in Your Industry
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              The Fintech Market Analysis report has been viewed 2.6k+ times by similar businesses.
            </p>
          </div>

          <div className="p-6 border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-xl">🎯</span> Suggested for You
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              SaaS Industry Trends matches your business stage and growth objectives based on your metrics.
            </p>
          </div>

          <div className="p-6 border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 rounded-2xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span> New This Week
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              Sustainability & Green Tech report just published with latest ESG insights and local regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
