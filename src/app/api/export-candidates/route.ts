// src/app/api/export-candidates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exportCandidates } from '@/services/candidate';
import { format } from 'date-fns';

// 🔥 UPDATED: Generate CSV with complete candidate information
function generateCSV(candidates: any[]): string {
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

// 🔥 UPDATED: Handle all filter parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exportFormat = searchParams.get('format') || 'json';
    const filterStatus = searchParams.get('status') || 'all';
    const filterName = searchParams.get('name') || '';
    const filterCity = searchParams.get('city') || '';
    const filterCountry = searchParams.get('country') || '';
    const filterNationality = searchParams.get('nationality') || '';
    const filterJobTitle = searchParams.get('jobTitle') || '';
    const filterCategory = searchParams.get('category') || '';
    const filterSpecialty = searchParams.get('specialty') || ''; // 🔥 ADD: Handle specialty filter
    const filterAgeMin = searchParams.get('ageMin') || '';
    const filterAgeMax = searchParams.get('ageMax') || '';

    console.log('🔍 Export request with filters:', {
      format: exportFormat,
      status: filterStatus,
      name: filterName,
      city: filterCity,
      country: filterCountry,
      nationality: filterNationality,
      jobTitle: filterJobTitle,
      category: filterCategory,
      specialty: filterSpecialty, // 🔥 ADD: Log specialty filter
      ageMin: filterAgeMin,
      ageMax: filterAgeMax
    });

    // 🔥 UPDATE: Pass specialty filter to exportCandidates function
    const candidates = await exportCandidates(
      filterStatus,
      filterName,
      filterNationality,
      filterCity,
      filterCountry,
      filterJobTitle,
      filterCategory,
      filterSpecialty, // 🔥 ADD: Pass specialty filter
      filterAgeMin,
      filterAgeMax
    );

    console.log(`✅ Exporting ${candidates.length} candidates in ${exportFormat} format`);

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const baseFilename = `candidates_${timestamp}`;

    switch (exportFormat) {
      case 'csv':
        const csvContent = generateCSV(candidates);
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${baseFilename}.csv"`,
            'Cache-Control': 'no-cache'
          }
        });

      case 'xlsx':
        return NextResponse.json({ 
          data: candidates,
          format: 'xlsx',
          filename: `${baseFilename}.xlsx`,
          count: candidates.length,
          exportedAt: new Date().toISOString()
        });

      case 'json':
      default:
        const jsonData = {
          candidates,
          metadata: {
            exportedAt: new Date().toISOString(),
            totalCount: candidates.length,
            filters: {
              status: filterStatus,
              name: filterName,
              city: filterCity,
              country: filterCountry,
              nationality: filterNationality,
              jobTitle: filterJobTitle,
              category: filterCategory,
              specialty: filterSpecialty, // 🔥 ADD: Include specialty in metadata
              ageRange: filterAgeMin || filterAgeMax ? `${filterAgeMin || '0'}-${filterAgeMax || '∞'}` : null
            },
            format: 'json'
          }
        };

        return new NextResponse(JSON.stringify(jsonData, null, 2), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="${baseFilename}.json"`,
            'Cache-Control': 'no-cache'
          }
        });
    }

  } catch (error) {
    console.error('❌ Export candidates error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export candidates',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}