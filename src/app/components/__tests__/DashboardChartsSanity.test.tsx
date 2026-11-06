import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: ({ children }: any) => <div data-testid="cell">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  Legend: ({ children }: any) => <div data-testid="legend">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: any) => <div data-testid="bar">{children}</div>,
  XAxis: ({ children }: any) => <div data-testid="x-axis">{children}</div>,
  YAxis: ({ children }: any) => <div data-testid="y-axis">{children}</div>,
  CartesianGrid: ({ children }: any) => <div data-testid="cartesian-grid">{children}</div>,
}));

describe('Sanity Check New File', () => {
  it('renders hello world', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
