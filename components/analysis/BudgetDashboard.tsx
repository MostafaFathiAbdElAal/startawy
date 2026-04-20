"use client";

import { useState, useRef } from "react";
import { TrendingUp, TrendingDown, DollarSign, Upload, Sparkles, BarChart3, FileDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/components/providers/ToastProvider";

const COLORS = ["#14b8a6", "#3b82f6", "#f97316", "#8b5cf6"];

type BudgetDashboardProps = {
  expenseData: { category: string; amount: number; percentage: number }[];
  monthlyData: { month: string; income: number; expenses: number }[];
  metrics: {
    income: number;
    expenses: number;
    profit: number;
    incomeGrowth: number;
    expenseGrowth: number;
  };
  recommendations: { title: string; description: string; type: "marketing" | "revenue" | "expense" | "health" }[];
  founderInfo: {
    name: string;
    industry: string;
  };
};

export function BudgetDashboard({ expenseData, monthlyData, metrics, recommendations, founderInfo }: BudgetDashboardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);

  const generatePDF = async () => {
    if (!metrics) return;
    setIsGenerating(true);
    
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");

      const pageWidth = doc.internal.pageSize.getWidth();
      
      const primaryColor = [46, 189, 166]; // #2ebda6
      const secondaryColor = [29, 100, 193]; // #1d64c1

      // Top Teal Bar
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("STARTAWY BUDGET REPORT", 12, 20);

      // Info Section
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Business:", 12, 45);
      doc.text("Industry:", 12, 51);

      doc.setFont("helvetica", "normal");
      doc.text(founderInfo.name, 35, 45);
      doc.text(founderInfo.industry, 35, 51);

      doc.setFont("helvetica", "normal");
      const formattedDate = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy
      doc.text(`Generated on: ${formattedDate}`, pageWidth - 12, 45, { align: "right" });

      // Table 1: Financial Summary
      let currentY = 80;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Financial Summary (Monthly)", 12, currentY);
      currentY += 6;

      const drawTableRow = (y: number, label: string, value: string, isHeader = false, customColor?: number[]) => {
        const rowHeight = 10;
        if (isHeader) {
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(12, y, pageWidth - 24, rowHeight, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setDrawColor(243, 244, 246);
          doc.line(12, y + rowHeight, pageWidth - 12, y + rowHeight);
          doc.setTextColor(80, 80, 80);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
        }
        
        if (customColor && !isHeader) doc.setTextColor(customColor[0], customColor[1], customColor[2]);
        
        doc.text(label, 16, y + 6.5);
        doc.text(value, pageWidth / 2 + 4, y + 6.5);
        return rowHeight;
      };

      currentY += drawTableRow(currentY, "Metric", "Value", true);
      const profitMargin = metrics.income > 0 ? ((metrics.profit / metrics.income) * 100).toFixed(1) : "0";
      
      currentY += drawTableRow(currentY, "Total Revenue", `$${metrics.income.toLocaleString()}`);
      currentY += drawTableRow(currentY, "Total Expenses", `$${metrics.expenses.toLocaleString()}`);
      currentY += drawTableRow(currentY, "Net Profit", `$${metrics.profit.toLocaleString()}`);
      currentY += drawTableRow(currentY, "Profit Margin", `${profitMargin}%`);
      currentY += drawTableRow(currentY, "Monthly Burn Rate", `$${metrics.expenses.toLocaleString()}`);

      // Table 2: Expense Breakdown
      currentY += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Expense Breakdown", 12, currentY);
      currentY += 6;

      const drawBreakdownRow = (y: number, label: string, value: string, isHeader = false) => {
        const rowHeight = 10;
        if (isHeader) {
          doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          doc.rect(12, y, pageWidth - 24, rowHeight, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setDrawColor(243, 244, 246);
          doc.line(12, y + rowHeight, pageWidth - 12, y + rowHeight);
          doc.setTextColor(80, 80, 80);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
        }
        doc.text(label, 16, y + 6.5);
        doc.text(value, pageWidth - 16, y + 6.5, { align: "right" });
        return rowHeight;
      };

      currentY += drawBreakdownRow(currentY, "Category", "Monthly Amount", true);
      expenseData.forEach((item) => {
        currentY += drawBreakdownRow(currentY, item.category, `$${item.amount.toLocaleString()}`);
      });

      // Total Expenses Row
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(12, currentY, pageWidth - 12, currentY);
      doc.setTextColor(29, 100, 193); // Blue
      doc.setFont("helvetica", "bold");
      doc.text("Total Expenses:", pageWidth - 60, currentY + 7, { align: "right" });
      doc.text(`$${metrics.expenses.toLocaleString()}`, pageWidth - 16, currentY + 7, { align: "right" });

      // Footer
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("CONFIDENTIAL - Startawy Internal Report", pageWidth / 2, 285, { align: "center" });
      doc.text("Page 1 of 1", pageWidth / 2, 290, { align: "center" });

      doc.save(`Startawy_Report_${founderInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast({ type: "success", title: "Report Generated", message: "PDF report has been created successfully." });
    } catch (err) {
      console.error(err);
      showToast({ type: "error", title: "Generation Failed", message: "Failed to produce the PDF report." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          const res = await fetch("/api/budget/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ csvText: text })
          });

          if (res.ok) {
            setUploadedFile(file.name);
            showToast({
              type: "success",
              title: "Analysis Complete",
              message: "Your financial data has been successfully analyzed by AI."
            });
            router.refresh();
            setIsUploading(false);
          } else {
            const data = await res.json();
            showToast({
              type: "error",
              title: "Analysis Failed",
              message: data.error || "Failed to analyze data via AI models."
            });
            setIsUploading(false);
          }
        } catch (error) {
          console.error(error);
          showToast({
            type: "error",
            title: "System Error",
            message: "A network error occurred during analysis."
          });
          setIsUploading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive financial insights and AI-powered recommendations</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Upload Financial Data</h2>
            <p className="text-teal-100 mb-6 max-w-lg">
              Upload your financial statements or spreadsheets to get AI-powered insights, categorizations, and growth recommendations instantly.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 rounded-xl hover:bg-teal-50 transition-all cursor-pointer font-bold shadow-lg hover:-translate-y-1">
                <Upload className={`w-5 h-5 ${isUploading ? 'animate-bounce' : ''}`} />
                {isUploading ? "Analyzing..." : uploadedFile ? `Updated: ${uploadedFile}` : "Choose File (.csv, .xlsx)"}
                <input type="file" className="hidden" accept=".csv,.xlsx,.pdf" onChange={handleFileUpload} disabled={isUploading} />
              </label>

              {metrics.income > 0 && (
                <button 
                  onClick={generatePDF}
                  disabled={isGenerating || isUploading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:from-slate-900 hover:to-black transition-all font-bold shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5 group-hover:bounce" />}
                  {isGenerating ? "Preparing Report..." : "Generate Detailed PDF"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            ${metrics.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Income (This Month)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            ${metrics.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Expenses (This Month)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            ${metrics.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Net Profit (This Month)</p>
        </div>
      </div>

      {metrics.income === 0 && metrics.expenses === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-dashed border-gray-300 dark:border-slate-800 text-center mb-8">
          <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to analyze your first file?</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
            Upload your financial statements to see real-time income vs expense trends, breakdown by categories,
            and customized AI recommendations.
          </p>
          <label className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all cursor-pointer font-bold shadow-xl shadow-teal-500/20">
            <Upload className="w-5 h-5" />
            Start Analysis Now
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div ref={chartRef1} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Income vs Expenses (6 Months)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${Math.round(val / 1000)}k`} />
                  <Tooltip
                    cursor={{ fill: 'rgba(20, 184, 166, 0.05)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md bg-opacity-95">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">{label}</p>
                            <div className="space-y-1">
                              {payload.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between gap-8">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                    <span className="text-slate-300 text-xs font-medium">{entry.name}:</span>
                                  </div>
                                  <span className="text-white text-sm font-black">
                                    ${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="income" fill="#14b8a6" name="Income" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expenses" fill="#f97316" name="Expenses" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div ref={chartRef2} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Expense Breakdown</h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="amount"
                    stroke="none"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{ outline: activeIndex === index ? 'none' : 'none', opacity: activeIndex === null || activeIndex === index ? 1 : 0.6 }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={() => null} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {activeIndex !== null && expenseData[activeIndex] ? (
                  <>
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">
                      {expenseData[activeIndex].category}
                    </span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      ${expenseData[activeIndex].amount.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Expenses</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${metrics.expenses.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Management Recommendations */}
      <div className="mt-12 bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-slate-800 bg-linear-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Strategic Recommendations</h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Data-driven actions optimized for your current fiscal month.</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {(recommendations.length > 0 ? recommendations : []).map((rec, idx) => {
            const themes = {
              marketing: { color: "teal", icon: <TrendingUp className="w-5 h-5" />, bg: "bg-teal-50/30", darkBg: "dark:bg-teal-900/10", border: "border-teal-100", darkBorder: "dark:border-teal-900/30", text: "text-teal-600" },
              revenue: { color: "blue", icon: <DollarSign className="w-5 h-5" />, bg: "bg-blue-50/30", darkBg: "dark:bg-blue-900/10", border: "border-blue-100", darkBorder: "dark:border-blue-900/30", text: "text-blue-600" },
              expense: { color: "orange", icon: <TrendingDown className="w-5 h-5" />, bg: "bg-orange-50/30", darkBg: "dark:bg-orange-900/10", border: "border-orange-100", darkBorder: "dark:border-orange-900/30", text: "text-orange-600" },
              health: { color: "emerald", icon: <Sparkles className="w-5 h-5" />, bg: "bg-emerald-50/30", darkBg: "dark:bg-emerald-900/10", border: "border-emerald-100", darkBorder: "dark:border-emerald-900/30", text: "text-emerald-600" }
            };
            const theme = themes[rec.type] || themes.marketing;

            return (
              <div 
                key={idx} 
                className={`p-6 rounded-2xl border ${theme.border} ${theme.darkBorder} ${theme.bg} ${theme.darkBg} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${theme.bg} ${theme.text} border ${theme.border} ${theme.darkBorder}`}>
                    {theme.icon}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  {rec.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
