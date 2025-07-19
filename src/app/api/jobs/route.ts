// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getJobs, createJob, updateJob, deleteJob } from '@/services/jobs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const { jobs, categories } = await getJobs(activeOnly);
    return NextResponse.json({ jobs, categories });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch jobs';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json();
    const { jobId } = await createJob(jobData);
    return NextResponse.json({ 
      success: true, 
      jobId,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error("Error creating job:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create job';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { jobId, ...jobData } = await request.json();
    await updateJob(jobId, jobData);
    return NextResponse.json({ 
      success: true, 
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error("Error updating job:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update job';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    if (jobId) {
      await deleteJob(jobId);
    }
    return NextResponse.json({ 
      success: true, 
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete job';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
