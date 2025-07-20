"use client";

import React from 'react';

interface ExportButtonsProps {
    isExporting: boolean;
    handleExport: (format: 'csv' | 'xlsx' | 'json') => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ isExporting, handleExport }) => {
    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
                onClick={() => handleExport('xlsx')}
                disabled={isExporting}
                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
                {isExporting ? 'Exporting...' : 'Export XLSX'}
            </button>
            <button
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="px-3 py-1.5 text-xs font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
            >
                {isExporting ? 'Exporting...' : 'Export JSON'}
            </button>
        </div>
    );
};

export default ExportButtons;
