import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import logger from '@/lib/logger';

import type { InterviewSchedulingModalProps } from '@/types';

const InterviewSchedulingModal: React.FC<InterviewSchedulingModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSchedule,
  isLoading,
}) => {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [duration, setDuration] = useState(30); // Default 30 minutes
  const [adminEmail, setAdminEmail] = useState('wassim@internationalskills.fi');
  const [notes, setNotes] = useState('');

  // Get tomorrow's date as minimum date
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  // Generate time slots with better AM/PM display
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour12 === 0 ? 12 : hour12;
        const time12 = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
        slots.push({
          value: time24,
          label: `${time12} (${time24})`,
          period: ampm,
          sortTime: hour * 60 + minute,
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Group time slots by AM/PM for better UX
  const morningSlots = timeSlots.filter((slot) => slot.period === 'AM');
  const afternoonSlots = timeSlots.filter((slot) => slot.period === 'PM');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidate || !interviewDate || !interviewTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await onSchedule(
        candidate.id,
        interviewDate,
        interviewTime,
        duration,
        adminEmail || 'wassim@internationalskills.fi',
        notes
      );

      // Reset form on success
      setInterviewDate('');
      setInterviewTime('');
      setDuration(30);
      setNotes('');
    } catch (error) {
      // Error handling is done in the parent component
      logger.error('Error in interview scheduling modal', error);
    }
  };

  const handleClose = () => {
    setInterviewDate('');
    setInterviewTime('');
    setDuration(30);
    setNotes('');
    onClose();
  };

  if (!isOpen || !candidate) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-modal-title"
    >
      <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3
            id="interview-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-200"
          >
            📅 Schedule Google Meet Interview
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none dark:hover:text-gray-300"
            disabled={isLoading}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3 dark:border-blue-500 dark:bg-blue-900/20">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>👤 Candidate:</strong> {candidate.fullName}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>📧 Email:</strong> {candidate.email}
          </p>
          {candidate.jobTitleText && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>💼 Position:</strong> {candidate.jobTitleText}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="interviewDate"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              📅 Interview Date *
            </label>
            <input
              type="date"
              id="interviewDate"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              min={tomorrow}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="interviewTime"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              ⏰ Interview Time * (Finland Time)
            </label>
            <select
              id="interviewTime"
              value={interviewTime}
              onChange={(e) => setInterviewTime(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              disabled={isLoading}
            >
              <option value="">Select time</option>
              <optgroup label="🌅 Morning (AM)">
                {morningSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌆 Afternoon/Evening (PM)">
                {afternoonSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label
              htmlFor="duration"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              ⏱️ Duration *
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              disabled={isLoading}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes (recommended)</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="adminEmail"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              👨‍💼 Interviewer Email
            </label>
            <input
              type="email"
              id="adminEmail"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              disabled={isLoading}
              placeholder="wassim@internationalskills.fi"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              📝 Additional Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Any additional information for the interview..."
              disabled={isLoading}
            />
          </div>

          <div className="rounded-lg border-l-4 border-green-400 bg-green-50 p-4 dark:border-green-500 dark:bg-green-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-lg text-green-400" aria-hidden="true">
                  ✅
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>What happens next:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300/80">
                  <li>• Google Calendar event will be created automatically</li>
                  <li>• Google Meet link will be generated</li>
                  <li>• Both candidate and interviewer receive email invitations</li>
                  <li>• Calendar reminders are set (24h and 1h before)</li>
                  <li>• Interview duration: {duration} minutes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Show cancellation info if interview is already scheduled */}
          {candidate.status === 'interview_scheduled' && (
            <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4 dark:border-yellow-500 dark:bg-yellow-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-lg text-yellow-400" aria-hidden="true">
                    ⚠️
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Note:</strong> This candidate already has an interview scheduled.
                    Submitting a new time will update the existing Google Calendar event and notify
                    all attendees.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Scheduling...
                </>
              ) : (
                <>🎥 Schedule Google Meet Interview</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewSchedulingModal;
