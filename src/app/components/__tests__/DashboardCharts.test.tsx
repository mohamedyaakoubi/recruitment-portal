import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardCharts from '../DashboardCharts';
import { ScoreDistributionData, StatusChartData } from '@/types';

// Mock the recharts library
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ children }) => <div data-testid="pie">{children}</div>,
    Cell: ({ children }) => <div data-testid="cell">{children}</div>,
    Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
    Legend: ({ children }) => <div data-testid="legend">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ children }) => <div data-testid="bar">{children}</div>,
    XAxis: ({ children }) => <div data-testid="x-axis">{children}</div>,
    YAxis: ({ children }) => <div data-testid="y-axis">{children}</div>,
    CartesianGrid: ({ children }) => <div data-testid="cartesian-grid">{children}</div>,
  };
});

describe('DashboardCharts', () => {
  const mockStatusData: StatusChartData = [
    { name: 'Submitted', value: 10 },
    { name: 'Scheduled', value: 5 },
    { name: 'Rejected', value: 2 },
  ];

  const mockScoreData: ScoreDistributionData = [
    { name: '0-20', count: 1 },
    { name: '21-40', count: 2 },
    { name: '41-60', count: 5 },
    { name: '61-80', count: 8 },
    { name: '81-100', count: 4 },
  ];

  it('renders the chart titles', () => {
    render(<DashboardCharts statusChartData={mockStatusData} scoreDistributionData={mockScoreData} />);
    expect(screen.getByText('Candidate Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('AI Score Distribution')).toBeInTheDocument();
  });

  it('renders the charts when data is provided', () => {
    render(<DashboardCharts statusChartData={mockStatusData} scoreDistributionData={mockScoreData} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders the "no data" message for the status chart when no data is provided', () => {
    render(<DashboardCharts statusChartData={[]} scoreDistributionData={mockScoreData} />);
    expect(screen.getByText('No candidate data available')).toBeInTheDocument();
  });

  it('renders the "no data" message for the score chart when no data is provided', () => {
    const emptyScoreData = [
      { name: '0-20', count: 0 },
      { name: '21-40', count: 0 },
      { name: '41-60', count: 0 },
      { name: '61-80', count: 0 },
      { name: '81-100', count: 0 },
    ];
    render(<DashboardCharts statusChartData={mockStatusData} scoreDistributionData={emptyScoreData} />);
    expect(screen.getByText('No scoring data available')).toBeInTheDocument();
  });
});