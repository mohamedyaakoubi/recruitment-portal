import { NextRequest, NextResponse } from 'next/server';
import { exportCandidates } from '@/services/candidate';
import { generateCSV } from '@/lib/csvUtils';
import { format } from 'date-fns';
import logger from '@/lib/logger';
import { ApiErrors } from '@/lib/apiResponse';
import { requireAdminAuth } from '@/lib/auth';
import { withCsrfProtection } from '@/lib/csrf-middleware';
import { logSecurityEvent, SecurityEventType, extractSecurityContext } from '@/lib/security-logger';
import { z } from 'zod';

// Mark as dynamic to prevent static optimization during build
export const dynamic = 'force-dynamic';

// Validation schema for export filters
const exportFiltersSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']).default('json'),
  status: z.string().max(50).default('all'),
  name: z.string().max(200).default(''),
  city: z.string().max(100).default(''),
  country: z.string().max(100).default(''),
  nationality: z.string().max(100).default(''),
  jobTitle: z.string().max(200).default(''),
  category: z.string().max(200).default(''),
  specialty: z.string().max(200).default(''),
  ageMin: z.string().max(3).default(''),
  ageMax: z.string().max(3).default(''),
});

// Changed from GET to POST to support CSRF protection
export const POST = withCsrfProtection(async (request: NextRequest) => {
  // Require admin authentication for sensitive data export
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    // Parse request body instead of search params
    const body = await request.json();

    // Validate export filters
    const validatedFilters = exportFiltersSchema.safeParse(body);

    if (!validatedFilters.success) {
      const context = extractSecurityContext(request);
      logSecurityEvent({
        type: SecurityEventType.INPUT_VALIDATION_FAILED,
        ...context,
        details: { endpoint: '/api/export-candidates', errors: validatedFilters.error.flatten() },
      });
      return ApiErrors.badRequest('Invalid export filters', validatedFilters.error.flatten());
    }
    const {
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
    } = validatedFilters.data;

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
});
