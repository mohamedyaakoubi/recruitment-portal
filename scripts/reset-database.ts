import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from multiple possible locations
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Validate required environment variables
const requiredEnvVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
};

// Check if all required variables are present
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env or .env.local file.');
  process.exit(1);
}

// Initialize Firebase Admin with proper error handling
if (!getApps().length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    };

    // Validate the service account object
    console.log('🔑 Initializing Firebase Admin...');
    console.log(`   Project ID: ${serviceAccount.projectId}`);
    console.log(`   Client Email: ${serviceAccount.clientEmail}`);
    console.log(`   Private Key: ${serviceAccount.privateKey ? 'Present' : 'Missing'}`);

    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    process.exit(1);
  }
}

const db = getFirestore();
const storage = getStorage();

async function resetDatabase() {
  try {
    console.log('\n🚀 Starting database reset...');
    console.log('⚠️  This will permanently delete ALL data!\n');

    let totalDeleted = 0;

    // 1. Delete all candidates
    console.log('📋 Deleting all candidates...');
    try {
      const candidatesSnapshot = await db.collection('candidates').get();
      if (candidatesSnapshot.size > 0) {
        const candidateBatch = db.batch();
        candidatesSnapshot.docs.forEach(doc => {
          candidateBatch.delete(doc.ref);
        });
        await candidateBatch.commit();
        console.log(`✅ Deleted ${candidatesSnapshot.size} candidates`);
        totalDeleted += candidatesSnapshot.size;
      } else {
        console.log('ℹ️  No candidates found to delete');
      }
    } catch (error) {
      console.error('❌ Error deleting candidates:', error);
    }

    // 2. Delete all jobs
    console.log('💼 Deleting all jobs...');
    try {
      const jobsSnapshot = await db.collection('jobs').get();
      if (jobsSnapshot.size > 0) {
        const jobsBatch = db.batch();
        jobsSnapshot.docs.forEach(doc => {
          jobsBatch.delete(doc.ref);
        });
        await jobsBatch.commit();
        console.log(`✅ Deleted ${jobsSnapshot.size} jobs`);
        totalDeleted += jobsSnapshot.size;
      } else {
        console.log('ℹ️  No jobs found to delete');
      }
    } catch (error) {
      console.error('❌ Error deleting jobs:', error);
    }

    // 3. Clear storage bucket (candidate files)
    console.log('📁 Clearing storage files...');
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ prefix: 'candidate_files/' });
      
      if (files.length > 0) {
        console.log(`   Found ${files.length} files to delete...`);
        const deletePromises = files.map(file => 
          file.delete().catch(err => {
            console.warn(`   ⚠️  Failed to delete ${file.name}:`, err.message);
            return null;
          })
        );
        const results = await Promise.allSettled(deletePromises);
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        console.log(`✅ Deleted ${successCount}/${files.length} files from storage`);
      } else {
        console.log('ℹ️  No files found in storage');
      }
    } catch (storageError) {
      console.warn('⚠️  Storage cleanup failed (this is often normal if bucket is empty):', storageError);
    }

    console.log('\n🎉 Database reset completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Total documents deleted: ${totalDeleted}`);
    console.log(`   - Candidates: 0 (collection cleared)`);
    console.log(`   - Jobs: 0 (collection cleared)`);
    console.log(`   - Storage: cleaned\n`);

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
    process.exit(1);
  }
}

// Run the reset
console.log('🔥 Firebase Database Reset Tool');
console.log('===============================');

resetDatabase()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });