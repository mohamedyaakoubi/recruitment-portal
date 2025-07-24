// src/app/components/candidate-form/AdditionalInfoSection.tsx
import React from 'react';
import { AdditionalInfoSectionProps } from '@/types';
import AdditionalInfoItem from './AdditionalInfoItem';

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  additionalInfo,
  addAdditionalInfo,
  removeAdditionalInfo,
  updateAdditionalInfo,
  isLoading,
}) => (
  <div className="bg-slate-50 dark:bg-gray-800/50 p-5 sm:p-6 rounded-lg">
    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-200 dark:border-gray-700 pb-3">Additional Information</h2>
    <div className="space-y-4">
      {additionalInfo.map((info, index) => (
        <AdditionalInfoItem
          key={index}
          info={info}
          index={index}
          updateAdditionalInfo={updateAdditionalInfo}
          removeAdditionalInfo={removeAdditionalInfo}
          isLoading={isLoading}
          canRemove={additionalInfo.length > 1}
        />
      ))}
      
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="button" onClick={() => addAdditionalInfo('link')} disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-900/80 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          <span>Add Link</span>
        </button>
        <button type="button" onClick={() => addAdditionalInfo('file')} disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          <span>Add File</span>
        </button>
        <button type="button" onClick={() => addAdditionalInfo('text')} disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/80 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
          <span>Add Text</span>
        </button>
      </div>
    </div>
  </div>
);

export default AdditionalInfoSection;
