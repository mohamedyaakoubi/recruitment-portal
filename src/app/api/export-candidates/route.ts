import { NextRequest, NextResponse } from 'next/server';
import { exportCandidates } from '@/services/candidate';
import { generateCSV } from '@/lib/csvUtils';
import { format } from 'date-fns';

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
    const filterSpecialty = searchParams.get('specialty') || '';
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
      specialty: filterSpecialty,
      ageMin: filterAgeMin,
      ageMax: filterAgeMax
    });

    const candidates = await exportCandidates(
      filterStatus,
      filterName,
      filterNationality,
      filterCity,
      filterCountry,
      filterJobTitle,
      filterCategory,
      filterSpecialty,
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
              specialty: filterSpecialty,
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
