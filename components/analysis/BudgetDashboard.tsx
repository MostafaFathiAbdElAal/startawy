"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Upload, Sparkles } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
};

export function BudgetDashboard({ expenseData, monthlyData, metrics }: BudgetDashboardProps) {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const res = await fetch("/api/budget/analyze", { method: "POST" });
        if (res.ok) {
          setUploadedFile(file.name);
          window.location.reload();
        } else {
          setUploadedFile(file.name + " (Simulated)");
          setIsUploading(false);
        }
      } catch (error) {
        console.error(error);
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive financial insights and AI-powered recommendations</p>
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
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 rounded-xl hover:bg-teal-50 transition-all cursor-pointer font-semibold shadow-lg hover:-translate-y-1">
              <Upload className={`w-5 h-5 ${isUploading ? 'animate-bounce' : ''}`} />
              {isUploading ? "Analyzing..." : uploadedFile ? `Updated: ${uploadedFile}` : "Choose File (.csv, .xlsx)"}
              <input type="file" className="hidden" accept=".csv,.xlsx,.pdf" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">+{metrics.incomeGrowth}%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">${metrics.income.toLocaleString()}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Income (This Month)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">+{metrics.expenseGrowth}%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">${metrics.expenses.toLocaleString()}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Expenses (This Month)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">Profit</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">${metrics.profit.toLocaleString()}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Net Profit (This Month)</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Income vs Expenses (6 Months)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(20, 184, 166, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" fill="#14b8a6" name="Income" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" fill="#f97316" name="Expenses" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
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
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: unknown) => `$${Number(value).toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text for Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Expenses</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">${metrics.expenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/10 dark:to-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI-Powered Recommendations</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Based on your recent financial data analysis and local market trends</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 p-6 rounded-2xl relative overflow-hidden group hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 rounded-l-2xl"></div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span> Optimize Marketing Spend
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Your marketing expenses are 30% of total costs. Consider reallocating 10% to digital 
              channels with higher ROI based on industry benchmarks. We&apos;ve seen a 2x increase in ROI on targeted social campaigns.
            </p>
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6 rounded-2xl relative overflow-hidden group hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl"></div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-xl">📊</span> Revenue Growth Opportunity
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Your revenue has grown {metrics.incomeGrowth}% this month. Maintain this momentum by investing in customer 
              retention programs, which typically cost 5x less than new acquisition.
            </p>
          </div>

          <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-6 rounded-2xl relative overflow-hidden group hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-2xl"></div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-xl">⚠️</span> Expense Trend Alert
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Operational expenses increased by {metrics.expenseGrowth}% last month. Review vendor contracts before the quarter ends and consider 
              negotiating better volume rates or exploring alternative local suppliers.
            </p>
          </div>

          <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-6 rounded-2xl relative overflow-hidden group hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-2xl"></div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-xl">✅</span> Cash Flow Health is Strong
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Your profit margin is healthy at {Math.round((metrics.profit / metrics.income) * 100)}%. Consider setting aside 20% of net profits for emergency runway reserves 
              and allocating 30% for strategic growth investments next quarter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
