import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarSection from '../CalendarSection';
import '@testing-library/jest-dom';
import type { InterviewEvent } from '@/types';

// Mock react-big-calendar
vi.mock('react-big-calendar', () => ({
  Calendar: ({
    events,
    onSelectEvent,
  }: {
    events: InterviewEvent[];
    onSelectEvent: (event: InterviewEvent) => void;
  }) => (
    <div data-testid="mock-calendar">
      {events.map((event) => (
        <div key={event.title} onClick={() => onSelectEvent(event)}>
          {event.title}
        </div>
      ))}
    </div>
  ),
  dateFnsLocalizer: vi.fn(),
}));

const mockOpenProfileModal = vi.fn();
const mockSetCalendarFilter = vi.fn();

const mockAllInterviewEvents: InterviewEvent[] = [
  {
    title: 'Interview with John Doe',
    start: new Date(2024, 6, 20, 10, 0, 0),
    end: new Date(2024, 6, 20, 11, 0, 0),
    resource: { fullName: 'John Doe' },
    isCompleted: false,
  },
  {
    title: 'Interview with Jane Smith',
    start: new Date(2024, 6, 21, 14, 0, 0),
    end: new Date(2024, 6, 21, 15, 0, 0),
    resource: { fullName: 'Jane Smith' },
    isCompleted: true,
  },
];

const defaultProps = {
  allInterviewEvents: mockAllInterviewEvents,
  filteredInterviewEvents: mockAllInterviewEvents,
  calendarFilter: 'all' as const,
  setCalendarFilter: mockSetCalendarFilter,
  openProfileModal: mockOpenProfileModal,
};

describe('CalendarSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the calendar with events', () => {
    render(<CalendarSection {...defaultProps} />);
    expect(screen.getByText('Interview Schedule')).toBeInTheDocument();
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
    expect(screen.getByText('Interview with John Doe')).toBeInTheDocument();
    expect(screen.getByText('Interview with Jane Smith')).toBeInTheDocument();
  });

  it('should call setCalendarFilter when filter buttons are clicked', () => {
    render(<CalendarSection {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Upcoming/ }));
    expect(mockSetCalendarFilter).toHaveBeenCalledWith('upcoming');
    fireEvent.click(screen.getByRole('button', { name: /Completed/ }));
    expect(mockSetCalendarFilter).toHaveBeenCalledWith('completed');
    fireEvent.click(screen.getByRole('button', { name: /All/ }));
    expect(mockSetCalendarFilter).toHaveBeenCalledWith('all');
  });

  it('should call openProfileModal when an event is clicked', () => {
    render(<CalendarSection {...defaultProps} />);
    fireEvent.click(screen.getByText('Interview with John Doe'));
    expect(mockOpenProfileModal).toHaveBeenCalledWith({ fullName: 'John Doe' });
  });

  it('should display no interviews message when there are no events', () => {
    render(<CalendarSection {...defaultProps} filteredInterviewEvents={[]} />);
    expect(screen.getByText(/No interviews/)).toBeInTheDocument();
  });
});
