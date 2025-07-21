// src/app/components/ui/FileInput.tsx
import React from 'react';
import { FileInputProps } from '@/types';

const FileInput: React.FC<FileInputProps> = ({
  name,
  label,
  required = false,
  accept,
  onChange,
  disabled = false,
  helpText,
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="file"
        name={name}
        id={name}
        required={required}
        accept={accept}
        onChange={onChange}
        className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 dark:file:bg-gray-700 file:text-[#003A70] dark:file:text-blue-300 hover:file:bg-slate-200 dark:hover:file:bg-gray-600"
        disabled={disabled}
      />
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helpText}</p>
    </div>
  );
};

export default FileInput;
