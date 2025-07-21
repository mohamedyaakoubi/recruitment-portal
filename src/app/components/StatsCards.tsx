import React from 'react';
import { Candidate, Stats, StatsCardsProps } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<{ className?: string }>;
  color: string;
  children?: React.ReactNode;
  cardType?: 'primary' | 'secondary';
}

// A new, reusable StatCard component for a consistent look.
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, children, cardType = 'primary' }) => {
  const colorClasses = {
    primary: {
      iconBg: `bg-${color}-100 dark:bg-${color}-900/50`,
      iconText: `text-${color}-600 dark:text-${color}-400`,
      valueText: `text-gray-800 dark:text-gray-100`,
    },
    secondary: {
      iconBg: `bg-transparent`,
      iconText: `text-${color}-500 dark:text-${color}-400`,
      valueText: `text-${color}-600 dark:text-${color}-400`,
    }
  };

  const styles = colorClasses[cardType];

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-md transition-shadow hover:shadow-lg border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className={`text-2xl sm:text-3xl font-bold mt-1 ${styles.valueText}`}>{value}</p>
          {children && <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{children}</div>}
        </div>
        <div className={`p-3 rounded-full ${styles.iconBg}`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${styles.iconText}` })}
        </div>
      </div>
    </div>
  );
};


const StatsCards: React.FC<StatsCardsProps> = ({ stats, candidates }) => {
  const averageScore = candidates.length > 0 
    ? candidates.filter(c => c.score !== null).reduce((sum, c) => sum + (c.score || 0), 0) / candidates.filter(c => c.score !== null).length
    : 0;

  const highScorers = candidates.filter(c => (c.score || 0) >= 80).length;

  const calculateConversionRate = () => {
    if (stats.submitted === 0) return '0.0';
    const conversionRate = (stats.scheduled / stats.submitted) * 100;
    if (conversionRate > 100) {
      console.warn('Warning: Scheduled count is higher than submitted count. This may indicate data inconsistency.');
      return '100.0';
    }
    return conversionRate.toFixed(1);
  };

  const interviewCompletionRate = stats.scheduled > 0 ? ((stats.approved / stats.scheduled) * 100).toFixed(1) : '0.0';

  const mainStats = [
    { title: 'Total Candidates', value: stats.total, icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, color: 'indigo' },
    { title: 'Submitted', value: stats.submitted, icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'blue', children: <>{stats.total > 0 ? `${((stats.submitted / stats.total) * 100).toFixed(1)}% of total` : '0.0% of total'}</> },
    { title: 'Interview Scheduled', value: stats.scheduled, icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, color: 'green', children: <>{stats.total > 0 ? `${((stats.scheduled / stats.total) * 100).toFixed(1)}% of total` : '0.0% of total'}</> },
    { title: 'Rejected', value: stats.rejected, icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>, color: 'red', children: <>{stats.total > 0 ? `${((stats.rejected / stats.total) * 100).toFixed(1)}% of total` : '0.0% of total'}</> },
  ];

  const secondaryStats = [
    { title: 'Average AI Score', value: averageScore > 0 ? averageScore.toFixed(1) : '0.0', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>, color: 'purple', children: <>{candidates.filter(c => c.score !== null).length} candidates scored</> },
    { title: 'High Scorers (80+)', value: highScorers, icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, color: 'yellow', children: <>Excellent candidates</> },
    { title: 'Conversion Rate', value: `${calculateConversionRate()}%`, icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>, color: 'teal', children: <>Submitted → Scheduled</> },
    { title: 'Interview Success', value: `${interviewCompletionRate}%`, icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'emerald', children: <>Scheduled → Approved</> },
  ];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {mainStats.map(stat => <StatCard key={stat.title} {...stat} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {secondaryStats.map(stat => <StatCard key={stat.title} {...stat} cardType="secondary" />)}
      </div>
    </section>
  );
};

export default StatsCards;
