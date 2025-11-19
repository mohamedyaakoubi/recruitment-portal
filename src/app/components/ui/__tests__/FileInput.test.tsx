
import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileInput from '../FileInput';
import '@testing-library/jest-dom';

describe('FileInput', () => {
  const onChangeMock = vi.fn();

  const defaultProps = {
    name: 'test-file',
    label: 'Test File',
    accept: 'image/*',
    onChange: onChangeMock,
  };

  beforeEach(() => {
    onChangeMock.mockClear();
  });

  it('should render correctly with the provided label', () => {
    render(<FileInput {...defaultProps} />);
    expect(screen.getByLabelText('Test File')).toBeInTheDocument();
  });

  it('should call onChange when a file is selected', () => {
    render(<FileInput {...defaultProps} />);
    const input = screen.getByLabelText('Test File');
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when the disabled prop is true', () => {
    render(<FileInput {...defaultProps} disabled={true} />);
    const input = screen.getByLabelText('Test File');
    expect(input).toBeDisabled();
  });

  it('should show a * when the required prop is true', () => {
    render(<FileInput {...defaultProps} required={true} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
