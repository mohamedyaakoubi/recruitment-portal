import React from 'react';
import { Candidate, Stats, StatsCardsProps } from '@/types';

const StatsCards: React.FC<StatsCardsProps> = ({ stats, candidates }) => {
  const averageScore = candidates.length > 0 
    ? candidates.filter(c => c.score !== null).reduce((sum, c) => sum + (c.score || 0), 0) / candidates.filter(c => c.score !== null).length
    : 0;

  const highScorers = candidates.filter(c => (c.score || 0) >= 80).length;

  // 🔥 IMPROVED: Better conversion rate calculation
  const calculateConversionRate = () => {
    if (stats.submitted === 0) return '0.0';
    const conversionRate = (stats.scheduled / stats.submitted) * 100;
    if (conversionRate > 100) {
      console.warn('Warning: Scheduled count is higher than submitted count. This may indicate data inconsistency.');
      return '100.0';
    }
    return conversionRate.toFixed(1);
  };

  // 🔥 NEW: Calculate interview completion rate (scheduled vs approved)
  const interviewCompletionRate = stats.scheduled > 0 ? ((stats.approved / stats.scheduled) * 100).toFixed(1) : '0.0';

  return (
    <section className="mb-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Total Candidates</h3>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Submitted</h3>
              <p className="text-3xl font-bold">{stats.submitted}</p>
              <p className="text-xs opacity-75 mt-1">
                {stats.total > 0 ? `${((stats.submitted / stats.total) * 100).toFixed(1)}% of total` : '0.0% of total'}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Interview Scheduled</h3>
              <p className="text-3xl font-bold">{stats.scheduled}</p>
              <p className="text-xs opacity-75 mt-1">
                {stats.total > 0 ? `${((stats.scheduled / stats.total) * 100).toFixed(1)}% of total` : '0.0% of total'}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Rejected</h3>
              <p className="text-3xl font-bold">{stats.rejected}</p>
              <p className="text-xs opacity-75 mt-1">
                {stats.total > 0 ? `${((stats.rejected / stats.total) * 100).toFixed(1)}% of total` : '0.0% of total'}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 IMPROVED: More comprehensive secondary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600">Average AI Score</h4>
              <p className="text-2xl font-bold text-purple-600">
                {averageScore > 0 ? averageScore.toFixed(1) : '0.0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {candidates.filter(c => c.score !== null).length} candidates scored
              </p>
            </div>
            <div className="text-purple-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600">High Scorers (80+)</h4>
              <p className="text-2xl font-bold text-yellow-600">{highScorers}</p>
              <p className="text-xs text-gray-500 mt-1">
                Excellent candidates
              </p>
            </div>
            <div className="text-yellow-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600">Conversion Rate</h4>
              <p className="text-2xl font-bold text-teal-600">
                {calculateConversionRate()}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Submitted → Scheduled
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.scheduled} of {stats.submitted} submitted
              </p>
            </div>
            <div className="text-teal-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600">Interview Success</h4>
              <p className="text-2xl font-bold text-emerald-600">
                {interviewCompletionRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Scheduled → Approved
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.approved} of {stats.scheduled} interviewed
              </p>
            </div>
            <div className="text-emerald-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 REMOVED: Duplicate pipeline insights section completely */}
      {/* The information is already clearly shown in the cards above */}
    </section>
  );
};

export default StatsCards;