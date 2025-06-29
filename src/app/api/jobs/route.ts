// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { JOB_CATEGORIES } from '@/lib/job-categories';
import admin from 'firebase-admin';

export async function GET() {
  try {
    const db = getFirestoreAdmin();
    const jobsSnapshot = await db.collection("jobs").orderBy("category").orderBy("title").get();
    
    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ jobs, categories: JOB_CATEGORIES });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { title, description, category } = await request.json();

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing title, description, or category' }, { status: 400 });
    }

    if (!JOB_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const jobRef = await db.collection("jobs").add({
      title,
      description,
      category,
      createdAt: admin.firestore.Timestamp.now(),
      isActive: true
    });

    return NextResponse.json({ 
      success: true, 
      jobId: jobRef.id,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { jobId, title, description, category, isActive } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    if (category && !JOB_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const updateData: any = {
      updatedAt: admin.firestore.Timestamp.now()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.collection("jobs").doc(jobId).update(updateData);

    return NextResponse.json({ 
      success: true, 
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    await db.collection("jobs").doc(jobId).delete();

    return NextResponse.json({ 
      success: true, 
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}

