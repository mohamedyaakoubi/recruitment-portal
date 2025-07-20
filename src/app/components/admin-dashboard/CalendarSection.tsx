// src/app/components/admin-dashboard/CalendarSection.tsx
import React from 'react';
import { Calendar, dateFnsLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { InterviewEvent } from '@/types';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface CalendarSectionProps {
  filteredInterviewEvents: InterviewEvent[];
  allInterviewEvents: InterviewEvent[];
  calendarFilter: 'all' | 'upcoming' | 'completed';
  setCalendarFilter: (filter: 'all' | 'upcoming' | 'completed') => void;
  openProfileModal: (candidate: any) => void;
}

const eventStyleGetter = (event: InterviewEvent) => {
  const style: React.CSSProperties = {
    borderRadius: '4px',
    opacity: 0.8,
    color: 'white',
    border: '0px',
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  if (event.isCompleted) {
    style.backgroundColor = '#10B981';
    style.borderLeft = '4px solid #047857';
    style.opacity = 0.9;
  } else {
    style.backgroundColor = '#3B82F6';
    style.borderLeft = '4px solid #1D4ED8';
  }

  return { style };
};

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  filteredInterviewEvents,
  allInterviewEvents,
  calendarFilter,
  setCalendarFilter,
  openProfileModal,
}) => {
  return (
    <section className="mt-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-gray-800">Interview Schedule</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 mr-2">Filter:</span>
            <button
              onClick={() => setCalendarFilter('all')}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                calendarFilter === 'all' 
                  ? 'bg-gray-600 text-white border-gray-600' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All ({allInterviewEvents.length})
            </button>
            <button
              onClick={() => setCalendarFilter('upcoming')}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                calendarFilter === 'upcoming' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
              }`}
            >
              Upcoming ({allInterviewEvents.filter(e => !e.isCompleted).length})
            </button>
            <button
              onClick={() => setCalendarFilter('completed')}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                calendarFilter === 'completed' 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
              }`}
            >
              Completed ({allInterviewEvents.filter(e => e.isCompleted).length})
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-6 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded border-l-4 border-blue-700"></div>
            <span className="text-sm text-gray-600">Upcoming Interviews</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded border-l-4 border-green-700"></div>
            <span className="text-sm text-gray-600">Completed Interviews</span>
          </div>
        </div>
        <div style={{ height: '500px' }}>
          <Calendar
            localizer={localizer}
            events={filteredInterviewEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            defaultView="month"
            popup
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => openProfileModal(event.resource)}
            tooltipAccessor={(event) => {
              const candidate = event.resource;
              const status = event.isCompleted ? 'Completed' : 'Scheduled';
              const time = format(event.start as Date, 'PPpp');
              return `${status}: ${candidate.fullName} - ${time}`;
            }}
          />
        </div>
        {filteredInterviewEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h2a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
            </svg>
            <p className="text-lg font-medium">No interviews {calendarFilter === 'all' ? '' : calendarFilter}</p>
            <p className="text-sm">
              {calendarFilter === 'all' && 'Schedule some interviews to see them here.'}
              {calendarFilter === 'upcoming' && 'No upcoming interviews scheduled.'}
              {calendarFilter === 'completed' && 'No completed interviews yet.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
