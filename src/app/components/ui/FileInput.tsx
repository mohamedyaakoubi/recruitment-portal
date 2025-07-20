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
      <label htmlFor={name} className="block text-sm font-semibold text-slate-600 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="file"
        name={name}
        id={name}
        required={required}
        accept={accept}
        onChange={onChange}
        className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-[#003A70] hover:file:bg-slate-200"
        disabled={disabled}
      />
      <p className="mt-1 text-xs text-slate-500">{helpText}</p>
    </div>
  );
};

export default FileInput;
