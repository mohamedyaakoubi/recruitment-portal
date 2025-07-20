import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, jobId, jobCategory } = await request.json();

    if (!email || !jobId || !jobCategory) {
      return NextResponse.json(
        { error: 'Email, jobId, and jobCategory are required' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    const candidatesRef = db.collection('candidates');
    
    // Check for applications to the same specific job in the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const duplicateQuery = candidatesRef
      .where('email', '==', email.toLowerCase().trim())
      .where('jobTitle', '==', jobId)
      .where('submittedAt', '>=', sixMonthsAgo);
    
    const duplicateSnapshot = await duplicateQuery.get();
    
    if (!duplicateSnapshot.empty) {
      const lastApplication = duplicateSnapshot.docs[0].data();
      const lastSubmissionDate = lastApplication.submittedAt?.toDate();
      
      return NextResponse.json({
        isDuplicate: true,
        message: `You have already applied for this position on ${lastSubmissionDate?.toLocaleDateString()}. You can apply again after 6 months.`,
        lastApplicationDate: lastSubmissionDate?.toISOString()
      });
    }
    
    // Check for category limit (max 3 applications per category per month)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const categoryQuery = candidatesRef
      .where('email', '==', email.toLowerCase().trim())
      .where('jobCategory', '==', jobCategory)
      .where('submittedAt', '>=', thirtyDaysAgo);
    
    const categorySnapshot = await categoryQuery.get();
    
    if (categorySnapshot.size >= 3) {
      return NextResponse.json({
        isDuplicate: true,
        message: `You have reached the maximum number of applications (3) for the "${jobCategory}" category this month.`,
        lastApplicationDate: null
      });
    }
    
    return NextResponse.json({
      isDuplicate: false,
      message: 'No duplicate applications found',
      lastApplicationDate: null
    });

  } catch (error) {
    console.error('Check duplicate error:', error);
    return NextResponse.json(
      { error: 'Internal server error while checking duplicates' },
      { status: 500 }
    );
  }
}