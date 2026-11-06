'use client';

import React from 'react';
import { Calendar, dateFnsLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Candidate, InterviewEvent } from '@/types';
import GoogleAuthManager from './GoogleAuthManager'; // 👈 Import the new component

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface CalendarSectionProps {
  allInterviewEvents: InterviewEvent[];
  filteredInterviewEvents: InterviewEvent[];
  calendarFilter: 'all' | 'upcoming' | 'completed';
  setCalendarFilter: (filter: 'all' | 'upcoming' | 'completed') => void;
  openProfileModal: (candidate: Candidate) => void;
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
    style.backgroundColor = '#10B981'; // Green
    style.borderLeft = '4px solid #047857'; // Darker green border
    style.opacity = 0.9;
  } else {
    style.backgroundColor = '#3B82F6'; // Blue
    style.borderLeft = '4px solid #1D4ED8'; // Darker blue border
  }

  return { style };
};

const CalendarSection: React.FC<CalendarSectionProps> = ({
  allInterviewEvents,
  filteredInterviewEvents,
  calendarFilter,
  setCalendarFilter,
  openProfileModal,
}) => {
  return (
    <section className="mt-8">
      <GoogleAuthManager /> {/* 👈 Include the GoogleAuthManager component here */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Interview Schedule</h3>

          <div className="flex items-center space-x-2">
            <span className="mr-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Filter:
            </span>
            <button
              onClick={() => setCalendarFilter('all')}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                calendarFilter === 'all'
                  ? 'border-gray-600 bg-gray-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All ({allInterviewEvents.length})
            </button>
            <button
              onClick={() => setCalendarFilter('upcoming')}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                calendarFilter === 'upcoming'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:bg-gray-700 dark:text-blue-300 dark:hover:bg-blue-900/50'
              }`}
            >
              Upcoming ({allInterviewEvents.filter((e) => !e.isCompleted).length})
            </button>
            <button
              onClick={() => setCalendarFilter('completed')}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                calendarFilter === 'completed'
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-green-300 bg-white text-green-600 hover:bg-green-50 dark:border-green-600 dark:bg-gray-700 dark:text-green-300 dark:hover:bg-green-900/50'
              }`}
            >
              Completed ({allInterviewEvents.filter((e) => e.isCompleted).length})
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center space-x-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded border-l-4 border-blue-700 bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Upcoming Interviews</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded border-l-4 border-green-700 bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Completed Interviews</span>
          </div>
        </div>

        <div style={{ height: '500px' }} className="dark-calendar-theme">
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
            tooltipAccessor={(event: CalendarEvent) => {
              const interviewEvent = event as InterviewEvent;
              const candidate = interviewEvent.resource;
              const status = interviewEvent.isCompleted ? 'Completed' : 'Scheduled';
              const time = format(interviewEvent.start as Date, 'PPpp');
              return `${status}: ${candidate.fullName} - ${time}`;
            }}
          />
        </div>

        {filteredInterviewEvents.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h2a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z"
              />
            </svg>
            <p className="text-lg font-medium">
              No interviews {calendarFilter === 'all' ? '' : calendarFilter}
            </p>
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

export default CalendarSection;
