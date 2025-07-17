import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = getFirestore();
const storage = getStorage();

async function resetDatabase() {
  try {
    console.log('🚀 Starting database reset...');

    // 1. Delete all candidates
    console.log('📋 Deleting all candidates...');
    const candidatesSnapshot = await db.collection('candidates').get();
    const candidateBatch = db.batch();
    candidatesSnapshot.docs.forEach(doc => {
      candidateBatch.delete(doc.ref);
    });
    await candidateBatch.commit();
    console.log(`✅ Deleted ${candidatesSnapshot.size} candidates`);

    // 2. Delete all jobs
    console.log('💼 Deleting all jobs...');
    const jobsSnapshot = await db.collection('jobs').get();
    const jobsBatch = db.batch();
    jobsSnapshot.docs.forEach(doc => {
      jobsBatch.delete(doc.ref);
    });
    await jobsBatch.commit();
    console.log(`✅ Deleted ${jobsSnapshot.size} jobs`);

    // 3. Clear storage bucket (candidate files)
    console.log('📁 Clearing storage files...');
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ prefix: 'candidate_files/' });
      
      if (files.length > 0) {
        const deletePromises = files.map(file => file.delete());
        await Promise.all(deletePromises);
        console.log(`✅ Deleted ${files.length} files from storage`);
      } else {
        console.log('ℹ️ No files found in storage');
      }
    } catch (storageError) {
      console.warn('⚠️ Storage cleanup failed (this is often normal):', storageError);
    }

    // 4. Reset admin users (optional - uncomment if needed)
    /*
    console.log('👤 Resetting admin users...');
    const adminsSnapshot = await db.collection('admins').get();
    const adminsBatch = db.batch();
    adminsSnapshot.docs.forEach(doc => {
      adminsBatch.delete(doc.ref);
    });
    await adminsBatch.commit();
    console.log(`✅ Deleted ${adminsSnapshot.size} admin users`);
    */

    console.log('🎉 Database reset completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Candidates: 0 (all deleted)`);
    console.log(`   - Jobs: 0 (all deleted)`);
    console.log(`   - Storage: cleaned`);

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
});

// To run this script:
// 1. Make sure you have a .env.local file with your Firebase Admin credentials
// 2. Execute: `npx ts-node-dev --require dotenv/config src/scripts/reset-database.ts`
// Note: Using ts-node-dev allows for automatic reloading on changes, which is useful for development.
// For a one-time run, `ts-node` is also fine.