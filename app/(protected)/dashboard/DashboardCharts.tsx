'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ChartsProps {
  revenueData: Array<{ month: string; revenue: number; expenses: number }>;
  growthData: Array<{ month: string; value: number }>;
}

export function DashboardCharts({ revenueData, growthData }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Revenue vs Expenses */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue vs Expenses</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
                itemStyle={{ color: '#f9fafb' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#14b8a6"
                strokeWidth={3}
                name="Revenue"
                dot={{ fill: '#14b8a6', r: 4 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#f97316"
                strokeWidth={3}
                name="Expenses"
                dot={{ fill: '#f97316', r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Trend */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Growth Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
                itemStyle={{ color: '#f9fafb' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#14b8a6"
                fill="#14b8a6"
                fillOpacity={0.2}
                strokeWidth={3}
                name="Growth"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
