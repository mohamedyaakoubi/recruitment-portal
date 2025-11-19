import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButtons from '../ExportButtons';
import '@testing-library/jest-dom';

describe('ExportButtons', () => {
  const handleExportMock = vi.fn();

  const defaultProps = {
    isExporting: false,
    handleExport: handleExportMock,
  };

  beforeEach(() => {
    handleExportMock.mockClear();
  });

  it('should render the three export buttons', () => {
    render(<ExportButtons {...defaultProps} />);
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export XLSX')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
  });

  it('should call handleExport with "csv" when the CSV button is clicked', () => {
    render(<ExportButtons {...defaultProps} />);
    fireEvent.click(screen.getByText('Export CSV'));
    expect(handleExportMock).toHaveBeenCalledWith('csv');
  });

  it('should call handleExport with "xlsx" when the XLSX button is clicked', () => {
    render(<ExportButtons {...defaultProps} />);
    fireEvent.click(screen.getByText('Export XLSX'));
    expect(handleExportMock).toHaveBeenCalledWith('xlsx');
  });

  it('should call handleExport with "json" when the JSON button is clicked', () => {
    render(<ExportButtons {...defaultProps} />);
    fireEvent.click(screen.getByText('Export JSON'));
    expect(handleExportMock).toHaveBeenCalledWith('json');
  });

  it('should disable the buttons and show "Exporting..." when isExporting is true', () => {
    render(<ExportButtons {...defaultProps} isExporting={true} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent('Exporting...');
    });
  });
});