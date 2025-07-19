// src/app/components/Tabs.tsx
import React from 'react';
import { TabProps, TabsProps } from '@/types';

const Tab: React.FC<TabProps> = ({ label, active, onClick }) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none ${
        active
          ? 'bg-white text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-800'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, tabs, children }) => {
  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              active={activeTab === tab.value}
              onClick={() => onTabChange(tab.value)}
            />
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
};

export default Tabs;
