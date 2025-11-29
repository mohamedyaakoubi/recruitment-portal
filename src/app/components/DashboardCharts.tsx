'use client';

// src/app/components/DashboardCharts.tsx
import React from 'react';
import { useTheme } from 'next-themes';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { DashboardChartsProps } from '@/types';

const STATUS_COLORS = ['#3B82F6', '#10B981', '#EF4444']; // Blue, Green, Red
const _SCORE_COLORS = ['#EF4444', '#F59E0B', '#FCD34D', '#A7F3D0', '#10B981']; // Red to Green gradient

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  statusChartData,
  scoreDistributionData,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const tickColor = isDarkMode ? '#9CA3AF' : '#64748b'; // gray-400 dark, gray-500 light
  const tooltipBackgroundColor = isDarkMode ? '#1F2937' : '#f8fafc'; // gray-800 dark, slate-50 light
  const tooltipBorderColor = isDarkMode ? '#374151' : '#e2e8f0'; // gray-700 dark, slate-200 light
  const legendColor = isDarkMode ? '#D1D5DB' : '#374151'; // gray-300 dark, gray-700 light
  return (
    <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Status Distribution Pie Chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Candidate Status Distribution
          </h3>
          <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/50">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {statusChartData.length > 0 ? (
          <div className="relative">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={{ fill: legendColor }}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: tooltipBackgroundColor,
                    border: `1px solid ${tooltipBorderColor}`,
                    borderRadius: '8px',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px', color: legendColor }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <svg className="mb-4 h-16 w-16 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-lg font-medium">No candidate data available</p>
            <p className="text-sm">
              Status distribution will appear here once candidates are added
            </p>
          </div>
        )}
      </div>

      {/* Score Distribution Bar Chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            AI Score Distribution
          </h3>
          <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/50">
            <svg
              className="h-5 w-5 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
        {scoreDistributionData.some((d) => d.count > 0) ? (
          <div className="relative">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={scoreDistributionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#f1f5f9'} />
                <XAxis
                  dataKey="name"
                  stroke={tickColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={tickColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: tooltipBackgroundColor,
                    border: `1px solid ${tooltipBorderColor}`,
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: legendColor }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <svg className="mb-4 h-16 w-16 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <p className="text-lg font-medium">No scoring data available</p>
            <p className="text-sm">
              Score distribution will appear here once candidates are scored
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(DashboardCharts);
