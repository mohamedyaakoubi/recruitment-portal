// src/app/components/InterviewSchedulingModal.tsx
import React, { useState } from 'react';
import { format, addDays } from 'date-fns';

import type { Candidate } from '@/types';

interface InterviewSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onSchedule: (candidateId: string, newStatus: string, interviewTimestampISO?: string) => Promise<void>;
  isLoading: boolean;
}

const InterviewSchedulingModal: React.FC<InterviewSchedulingModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onScheduleInterview,
  isScheduling
}) => {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [adminEmail, setAdminEmail] = useState('wassim@internationalskills.fi');
  const [notes, setNotes] = useState('');

  // Get tomorrow's date as minimum date
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidate || !interviewDate || !interviewTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await onScheduleInterview({
        candidateId: candidate.id,
        candidateEmail: candidate.email,
        candidateName: candidate.fullName,
        interviewDate,
        interviewTime,
        jobTitle: candidate.jobTitleText,
        adminEmail
      });
      
      // Reset form
      setInterviewDate('');
      setInterviewTime('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Failed to schedule interview:', error);
    }
  };

  const handleClose = () => {
    setInterviewDate('');
    setInterviewTime('');
    setNotes('');
    onClose();
  };

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Schedule Interview</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={isScheduling}
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Candidate:</strong> {candidate.fullName}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Email:</strong> {candidate.email}
          </p>
          {candidate.jobTitleText && (
            <p className="text-sm text-gray-700">
              <strong>Position:</strong> {candidate.jobTitleText}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="interviewDate" className="block text-sm font-medium text-gray-700 mb-1">
              Interview Date *
            </label>
            <input
              type="date"
              id="interviewDate"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              min={tomorrow}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isScheduling}
            />
          </div>

          <div>
            <label htmlFor="interviewTime" className="block text-sm font-medium text-gray-700 mb-1">
              Interview Time *
            </label>
            <select
              id="interviewTime"
              value={interviewTime}
              onChange={(e) => setInterviewTime(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isScheduling}
            >
              <option value="">Select time</option>
              <option value="09:00">09:00 AM</option>
              <option value="09:30">09:30 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="10:30">10:30 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="11:30">11:30 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="12:30">12:30 PM</option>
              <option value="13:00">01:00 PM</option>
              <option value="13:30">01:30 PM</option>
              <option value="14:00">02:00 PM</option>
              <option value="14:30">02:30 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="15:30">03:30 PM</option>
              <option value="16:00">04:00 PM</option>
              <option value="16:30">04:30 PM</option>
              <option value="17:00">05:00 PM</option>
            </select>
          </div>

          <div>
            <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email (for notifications)
            </label>
            <input
              type="email"
              id="adminEmail"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isScheduling}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any additional information for the interview..."
              disabled={isScheduling}
            />
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The candidate will receive an email invitation with Google Meet link and calendar event. The interview duration is set to 1 hour.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isScheduling}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isScheduling}
            >
              {isScheduling ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewSchedulingModal;

