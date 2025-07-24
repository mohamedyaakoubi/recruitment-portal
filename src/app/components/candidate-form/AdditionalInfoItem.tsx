"use client";

import React from 'react';

interface AdditionalInfoItemProps {
  info: { type: 'link' | 'file' | 'text'; content: string; file?: File };
  index: number;
  updateAdditionalInfo: (index: number, content: string, file?: File) => void;
  removeAdditionalInfo: (index: number) => void;
  isLoading: boolean;
  canRemove: boolean; // New prop to control remove button visibility
}

const AdditionalInfoItem: React.FC<AdditionalInfoItemProps> = ({
  info,
  index,
  updateAdditionalInfo,
  removeAdditionalInfo,
  isLoading,
  canRemove,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <select
        value={info.type}
        onChange={(e) => {
          updateAdditionalInfo(index, '', undefined); // Clear content and file on type change
          // The parent component will handle updating the type in its state
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
      
      {canRemove && (
        <button type="button" onClick={() => removeAdditionalInfo(index)}
          className="p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/80 focus:outline-none focus:ring-2 focus:ring-red-500 self-center sm:self-auto"
          disabled={isLoading}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      )}
    </div>
  );
};

export default AdditionalInfoItem;
