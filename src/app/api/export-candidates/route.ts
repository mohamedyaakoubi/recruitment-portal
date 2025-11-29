import { NextRequest, NextResponse } from 'next/server';
import { exportCandidates } from '@/services/candidate';
import { generateCSV } from '@/lib/csvUtils';
import { format } from 'date-fns';
import logger from '@/lib/logger';
import { ApiErrors } from '@/lib/apiResponse';
import { requireAdminAuth } from '@/lib/auth';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';

export async function GET(request: NextRequest) {
  // Require admin authentication for sensitive data export
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

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

    logger.info('Export request with filters', {
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
      ageMax: filterAgeMax,
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

    logger.info('Exporting candidates', { count: candidates.length, format: exportFormat });

    // Log admin operation
    const context = extractSecurityContext(request);
    logSecurityEvent({
      type: SecurityEventType.ADMIN_DATA_EXPORTED,
      ...context,
      details: {
        format: exportFormat,
        count: candidates.length,
        filters: { status: filterStatus, name: filterName },
      },
    });

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const baseFilename = `candidates_${timestamp}`;

    switch (exportFormat) {
      case 'csv': {
        const csv = generateCSV(candidates as Parameters<typeof generateCSV>[0]);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${baseFilename}.csv"`,
            'Cache-Control': 'no-cache',
          },
        });
      }

      case 'xlsx':
        return NextResponse.json({
          data: candidates,
          format: 'xlsx',
          filename: `${baseFilename}.xlsx`,
          count: candidates.length,
          exportedAt: new Date().toISOString(),
        });

      case 'json':
      default: {
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
              ageRange:
                filterAgeMin || filterAgeMax
                  ? `${filterAgeMin || '0'}-${filterAgeMax || '∞'}`
                  : null,
            },
            format: 'json',
          },
        };

        return new NextResponse(JSON.stringify(jsonData, null, 2), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="${baseFilename}.json"`,
            'Cache-Control': 'no-cache',
          },
        });
      }
    }
  } catch (error) {
    logger.error('Export candidates error', error);
    return ApiErrors.internal('Failed to export candidates', error);
  }
}
