// src/app/components/candidate-form/AdditionalInfoSection.tsx
import React from 'react';
import { AdditionalInfoSectionProps } from '@/types';

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
        <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={info.type}
            onChange={(e) => {
              const newInfo = [...additionalInfo];
              newInfo[index] = {...newInfo[index], type: e.target.value as 'link' | 'file' | 'text', content: '', file: undefined};
              updateAdditionalInfo(index, '', undefined);
            }}
            className="px-3 py-3 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] bg-white dark:bg-gray-700 dark:text-white min-w-[100px]"
            disabled={isLoading}
          >
            <option value="link">Link</option>
            <option value="file">File</option>
            <option value="text">Text</option>
          </select>
          
          <div className="flex-1 w-full">
            {info.type === 'link' && (
              <input type="url" value={info.content} onChange={(e) => updateAdditionalInfo(index, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] dark:bg-gray-700 dark:text-white"
                placeholder="https://linkedin.com/in/yourprofile" disabled={isLoading} />
            )}
            {info.type === 'file' && (
              <input type="file" onChange={(e) => { const file = e.target.files?.[0]; if (file) { updateAdditionalInfo(index, file.name, file); } }}
                className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 dark:file:bg-gray-600 file:text-[#003A70] dark:file:text-blue-300 hover:file:bg-slate-200 dark:hover:file:bg-gray-500"
                disabled={isLoading} />
            )}
            {info.type === 'text' && (
              <textarea value={info.content} onChange={(e) => updateAdditionalInfo(index, e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] dark:bg-gray-700 dark:text-white"
                placeholder="Enter additional notes..." rows={2} disabled={isLoading} />
            )}
          </div>
          
          {additionalInfo.length > 1 && (
            <button type="button" onClick={() => removeAdditionalInfo(index)}
              className="p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/80 focus:outline-none focus:ring-2 focus:ring-red-500 self-center sm:self-auto"
              disabled={isLoading}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>
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
