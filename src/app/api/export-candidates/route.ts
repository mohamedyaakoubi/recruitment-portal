// src/app/api/export-candidates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exportFormat = searchParams.get('format') || 'json';
    const filterStatus = searchParams.get('status') || 'all';
    const filterName = searchParams.get('name') || '';

    const db = getFirestoreAdmin();
    let query: any = db.collection("candidates");

    // Apply filters
    if (filterStatus !== 'all') {
      query = query.where('status', '==', filterStatus);
    }

    const snapshot = await query.orderBy('submittedAt', 'desc').get();
    
    let candidates = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || '',
        email: data.email || '',
        gender: data.gender || '',
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: data.dateOfBirth || '',
        city: data.city || '',
        country: data.country || '',
        jobTitle: data.jobTitleText || '',
        websites: Array.isArray(data.websites) ? data.websites.join(', ') : '',
        status: data.status || '',
        score: data.score || null,
        scoreAnalysis: data.scoreAnalysis || '',
        submittedAt: data.submittedAt ? format(data.submittedAt.toDate(), 'yyyy-MM-dd HH:mm:ss') : '',
        interviewDate: data.interviewDate ? format(data.interviewDate.toDate(), 'yyyy-MM-dd HH:mm:ss') : '',
        cvUrl: data.cvUrl || '',
        passportUrl: data.passportUrl || ''
      };
    });

    // Apply name filter
    if (filterName) {
      candidates = candidates.filter((candidate: any) => 
        candidate.fullName.toLowerCase().includes(filterName.toLowerCase())
      );
    }

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
        // For XLSX, we'll return JSON with a special header to indicate client-side processing
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
    'Job Title',
    'Websites',
    'Status',
    'AI Score',
    'Score Analysis',
    'Submitted At',
    'Interview Date',
    'CV URL',
    'Passport URL'
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
      escapeCSV(candidate.jobTitle),
      escapeCSV(candidate.websites),
      escapeCSV(candidate.status),
      candidate.score || '',
      escapeCSV(candidate.scoreAnalysis),
      escapeCSV(candidate.submittedAt),
      escapeCSV(candidate.interviewDate),
      escapeCSV(candidate.cvUrl),
      escapeCSV(candidate.passportUrl)
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

