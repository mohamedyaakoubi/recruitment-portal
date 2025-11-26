'use client';

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
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <select
        value={info.type}
        onChange={(_e) => {
          updateAdditionalInfo(index, '', undefined); // Clear content and file on type change
          // The parent component will handle updating the type in its state
        }}
        className="min-w-[100px] rounded-lg border border-slate-300 bg-white px-3 py-3 shadow-sm focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        disabled={isLoading}
      >
        <option value="link">Link</option>
        <option value="file">File</option>
        <option value="text">Text</option>
      </select>

      <div className="w-full flex-1">
        {info.type === 'link' && (
          <input
            type="url"
            value={info.content}
            onChange={(e) => updateAdditionalInfo(index, e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="https://linkedin.com/in/yourprofile"
            disabled={isLoading}
          />
        )}
        {info.type === 'file' && (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                updateAdditionalInfo(index, file.name, file);
              }
            }}
            className="w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#003A70] hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-gray-600 dark:file:text-blue-300 dark:hover:file:bg-gray-500"
            disabled={isLoading}
          />
        )}
        {info.type === 'text' && (
          <textarea
            value={info.content}
            onChange={(e) => updateAdditionalInfo(index, e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm focus:border-[#003A70] focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter additional notes..."
            rows={2}
            disabled={isLoading}
          />
        )}
      </div>

      {canRemove && (
        <button
          type="button"
          onClick={() => removeAdditionalInfo(index)}
          className="self-center rounded-lg bg-red-100 p-3 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/80 sm:self-auto"
          disabled={isLoading}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AdditionalInfoItem;
