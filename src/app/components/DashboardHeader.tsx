// src/app/components/DashboardHeader.tsx
import React from 'react';

interface DashboardHeaderProps {
  userEmail: string;
  onManageJobsClick: () => void;
  onSignOut: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userEmail,
  onManageJobsClick,
  onSignOut
}) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <button 
          onClick={onManageJobsClick}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm"
        >
          Manage Jobs
        </button>
        <span className="text-sm text-gray-600">Welcome, {userEmail}</span>
        <button 
          onClick={onSignOut} 
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;

