// src/app/api/export-candidates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exportCandidates } from '@/services/candidate';
import { format } from 'date-fns';

function generateCSV(candidates: any[]): string {
  if (candidates.length === 0) {
    return 'No candidates found';
  }

  const headers = [
    'Full Name',
    'Email',
    'Gender',
    'Phone Number',
    'Date of Birth',
    'City',
    'Country',
    'Nationality',
    'Second Nationality',
    'Job Title',
    'Websites',
    'Status',
    'AI Score',
    'Score Analysis',
    'Submitted At',
    'Interview Date',
    'CV URL',
    'Passport URL',
    'Photo URL'
  ];

  const csvRows = [
    headers.join(','),
    ...candidates.map(candidate => [
      escapeCSV(candidate.fullName),
      escapeCSV(candidate.email),
      escapeCSV(candidate.gender),
      escapeCSV(candidate.phoneNumber),
      escapeCSV(candidate.dateOfBirth),
      escapeCSV(candidate.city),
      escapeCSV(candidate.country),
      escapeCSV(candidate.nationality),
      escapeCSV(candidate.doubleNationality),
      escapeCSV(candidate.jobTitle),
      escapeCSV(candidate.websites),
      escapeCSV(candidate.status),
      candidate.score || '',
      escapeCSV(candidate.scoreAnalysis),
      escapeCSV(candidate.submittedAt),
      escapeCSV(candidate.interviewDate),
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exportFormat = searchParams.get('format') || 'json';
    const filterStatus = searchParams.get('status') || 'all';
    const filterName = searchParams.get('name') || '';
    const filterNationality = searchParams.get('nationality') || '';

    const candidates = await exportCandidates(filterStatus, filterName, filterNationality);

    switch (exportFormat) {
      case 'csv':
        const csvContent = generateCSV(candidates);
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="candidates_${format(new Date(), 'yyyy-MM-dd')}.csv"`
          }
        });

      case 'xlsx':
        return NextResponse.json({ 
          data: candidates,
          format: 'xlsx',
          filename: `candidates_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
        });

      case 'json':
      default:
        return new NextResponse(JSON.stringify(candidates, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="candidates_${format(new Date(), 'yyyy-MM-dd')}.json"`
          }
        });
    }

  } catch (error) {
    console.error("Error exporting candidates:", error);
    return NextResponse.json({ error: 'Failed to export candidates' }, { status: 500 });
  }
}