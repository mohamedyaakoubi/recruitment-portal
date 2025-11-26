import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchableDropdown from '../SearchableDropdown';
import '@testing-library/jest-dom';

describe('SearchableDropdown', () => {
  const onChangeMock = vi.fn();
  const options = ['Apple', 'Banana', 'Cherry'];

  const defaultProps = {
    options,
    value: '',
    onChange: onChangeMock,
    placeholder: 'Select a fruit',
  };

  beforeEach(() => {
    onChangeMock.mockClear();
  });

  it('should render correctly with the provided placeholder', () => {
    render(<SearchableDropdown {...defaultProps} />);
    expect(screen.getByPlaceholderText('Select a fruit')).toBeInTheDocument();
  });

  it('should show the options when the input is focused', () => {
    render(<SearchableDropdown {...defaultProps} />);
    const input = screen.getByPlaceholderText('Select a fruit');
    fireEvent.focus(input);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('should filter the options based on the search input', () => {
    render(<SearchableDropdown {...defaultProps} />);
    const input = screen.getByPlaceholderText('Select a fruit');
    fireEvent.change(input, { target: { value: 'a' } });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
  });

  it('should call onChange with the selected option when an option is clicked', () => {
    render(<SearchableDropdown {...defaultProps} />);
    const input = screen.getByPlaceholderText('Select a fruit');
    fireEvent.focus(input);
    const appleOption = screen.getByText('Apple');
    fireEvent.click(appleOption);
    expect(onChangeMock).toHaveBeenCalledWith('Apple');
  });

  it('should hide the options when an option is clicked', () => {
    render(<SearchableDropdown {...defaultProps} />);
    const input = screen.getByPlaceholderText('Select a fruit');
    fireEvent.focus(input);
    const appleOption = screen.getByText('Apple');
    fireEvent.click(appleOption);
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('should hide the options when clicking outside the component', () => {
    render(
      <div>
        <SearchableDropdown {...defaultProps} />
        <button>Outside</button>
      </div>
    );
    const input = screen.getByPlaceholderText('Select a fruit');
    fireEvent.focus(input);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('Outside'));
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });
});
