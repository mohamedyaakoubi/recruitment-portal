// src/app/components/ui/SearchableDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { SearchableDropdownProps } from '@/types';

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
}) => {
  const [search, setSearch] = useState(value);
  const [showList, setShowList] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <input
        id={id}
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange('');
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003A70]/50 focus:border-[#003A70] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {showList && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onChange(option);
                setSearch(option);
                setShowList(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-gray-600 focus:bg-slate-100 dark:focus:bg-gray-600 focus:outline-none text-gray-900 dark:text-gray-200"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
