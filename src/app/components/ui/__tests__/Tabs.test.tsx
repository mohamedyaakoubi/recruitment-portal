
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Tabs from '../Tabs';
import '@testing-library/jest-dom';

describe('Tabs', () => {
  const onTabChangeMock = jest.fn();
  const tabs = [
    { label: 'Tab 1', value: 'tab1' },
    { label: 'Tab 2', value: 'tab2' },
  ];

  const defaultProps = {
    activeTab: 'tab1',
    onTabChange: onTabChangeMock,
    tabs,
  };

  beforeEach(() => {
    onTabChangeMock.mockClear();
  });

  it('should render the tabs correctly', () => {
    render(<Tabs {...defaultProps}>Content</Tabs>);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('should call onTabChange when a tab is clicked', () => {
    render(<Tabs {...defaultProps}>Content</Tabs>);
    fireEvent.click(screen.getByText('Tab 2'));
    expect(onTabChangeMock).toHaveBeenCalledWith('tab2');
  });

  it('should display the correct active tab', () => {
    render(<Tabs {...defaultProps}>Content</Tabs>);
    const tab1 = screen.getByText('Tab 1');
    expect(tab1).toHaveClass('bg-white');
  });

  it('should render the children content', () => {
    render(<Tabs {...defaultProps}>Content</Tabs>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
