"use client";

import { useState, useMemo } from "react";
import { Download, FileText, Search, Calendar } from "lucide-react";
import Link from "next/link";

type FounderReport = {
  id: number;
  title: string;
  type: string;
  date: string;
  status: string;
};

type MyReportsClientProps = {
  initialReports: FounderReport[];
};

export function MyReportsClient({ initialReports }: MyReportsClientProps) {
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const filteredReports = useMemo(() => {
    if (!search.trim()) return initialReports;
    return initialReports.filter(r => 
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [initialReports, search]);

  const handleDownload = (id: number) => {
    setDownloadingId(id);
    try {
      window.location.href = `/api/reports/download?type=custom&id=${id}`;
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your custom generated reports.</p>
        </div>
        <Link href="/budget-analysis">
          <button className="px-6 py-2.5 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-semibold shadow-md inline-flex items-center gap-2">
            Generate New Report
          </button>
        </Link>
      </div>

      {/* Features Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by name or type..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                <th className="p-4 pl-6 border-b-0">Report Title</th>
                <th className="p-4 border-b-0">Type</th>
                <th className="p-4 border-b-0">Date Generated</th>
                <th className="p-4 border-b-0">Status</th>
                <th className="p-4 pr-6 text-right border-b-0">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{report.title}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                      {report.type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4" />
                       {report.date}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button 
                      onClick={() => handleDownload(report.id)}
                      disabled={downloadingId === report.id}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors inline-flex items-center justify-center p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 disabled:opacity-50" 
                      title="Download"
                    >
                      <Download className={`w-5 h-5 ${downloadingId === report.id ? 'animate-bounce' : ''}`} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500 dark:text-gray-400">
                    No custom reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
