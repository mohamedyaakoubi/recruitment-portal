import { format } from 'date-fns';

// 🔥 UPDATED: Generate CSV with complete candidate information
export function generateCSV(candidates: any[]): string {
  if (candidates.length === 0) {
    return 'No candidates found';
  }

  const headers = [
    'Application ID',
    'Full Name',
    'First Name',
    'Last Name',
    'Email',
    'Gender',
    'Phone Number',
    'Country Code',
    'Date of Birth',
    'Age',
    'City',
    'Country',
    'Nationality',
    'Second Nationality',
    'Job Category',
    'Job ID',
    'Job Title',
    'Specialty',
    'Websites',
    'Status',
    'AI Score',
    'Score Analysis',
    'Submitted At',
    'Interview Date',
    'Meet Link',
    'Calendar Event ID',
    'Meet Space ID',
    'Duration (minutes)',
    'Last Scored At',
    'Last Updated',
    'Application Source',
    'CV URL',
    'Passport URL',
    'Photo URL'
  ];

  const csvRows = [
    headers.join(','),
    ...candidates.map(candidate => [
      escapeCSV(candidate.id),
      escapeCSV(candidate.fullName),
      escapeCSV(candidate.firstName),
      escapeCSV(candidate.lastName),
      escapeCSV(candidate.email),
      escapeCSV(candidate.gender),
      escapeCSV(candidate.phoneNumber),
      escapeCSV(candidate.countryCode),
      escapeCSV(candidate.dateOfBirth),
      candidate.age || '',
      escapeCSV(candidate.city),
      escapeCSV(candidate.country),
      escapeCSV(candidate.nationality),
      escapeCSV(candidate.doubleNationality),
      escapeCSV(candidate.jobCategory),
      escapeCSV(candidate.jobTitle),
      escapeCSV(candidate.jobTitleText),
      escapeCSV(candidate.specialty),
      escapeCSV(candidate.websites),
      escapeCSV(candidate.status),
      candidate.score || '',
      escapeCSV(candidate.scoreAnalysis),
      escapeCSV(candidate.submittedAt),
      escapeCSV(candidate.interviewDate),
      escapeCSV(candidate.meetLink),
      escapeCSV(candidate.calendarEventId),
      escapeCSV(candidate.meetSpaceId),
      candidate.duration || '',
      escapeCSV(candidate.lastScoredAt),
      escapeCSV(candidate.lastUpdated),
      escapeCSV(candidate.applicationSource),
      escapeCSV(candidate.cvUrl),
      escapeCSV(candidate.passportUrl),
      escapeCSV(candidate.photoUrl)
    ].join(','))
  ];

  return csvRows.join('\n');
}

function escapeCSV(value: string): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}