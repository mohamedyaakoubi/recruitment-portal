// src/app/api/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { FieldValue } from 'firebase-admin/firestore'; // Import FieldValue

// --- Nodemailer Configuration ---
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM_EMAIL; // e.g., "Your Company <noreply@yourdomain.com>"

const smtpConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM;

if (!smtpConfigured) {
    console.warn("SMTP environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL) are not fully set. Email notifications will be disabled.");
}

const transporter = smtpConfigured ? nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
}) : null;
// -----------------------------

// --- Function to Send Email ---
async function sendNotificationEmail(to: string, status: string, candidateName: string, interviewDate?: Date) {
    if (!transporter) {
        console.log("SMTP not configured, skipping email notification.");
        return;
    }

    let subject = '';
    let htmlBody = '';
    const companyName = "Your Company Name"; // Replace or make this an env variable

    if (status === 'rejected') {
        subject = `Update on your application with ${companyName}`;
        htmlBody = `
            <p>Dear ${candidateName},</p>
            <p>Thank you for your interest in ${companyName} and for taking the time to apply.</p>
            <p>We received a large number of applications, and after careful consideration, we have decided not to move forward with your candidacy at this time.</p>
            <p>This was a difficult decision due to the high caliber of applicants. We wish you the best in your job search.</p>
            <p>Sincerely,</p>
            <p>The ${companyName} Hiring Team</p>
        `;
    } else if (status === 'interview_scheduled' && interviewDate) {
        subject = `Interview Invitation from ${companyName}`;
        const formattedDate = interviewDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = interviewDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
        htmlBody = `
            <p>Dear ${candidateName},</p>
            <p>Thank you for your application to ${companyName}. We were impressed with your background and would like to invite you for an interview.</p>
            <p>Your interview is scheduled for:</p>
            <p><b>Date:</b> ${formattedDate}</p>
            <p><b>Time:</b> ${formattedTime}</p>
            <p>[Optional: Add details about interview format, location/link, interviewer name, etc. here]</p>
            <p>Please confirm if this time works for you. If not, please let us know your availability.</p>
            <p>We look forward to speaking with you.</p>
            <p>Sincerely,</p>
            <p>The ${companyName} Hiring Team</p>
        `;
    } else {
        console.log(`No email template for status: ${status}`);
        return; // Don't send email for other statuses or if date is missing for schedule
    }

    const mailOptions = {
        from: SMTP_FROM,
        to: to,
        subject: subject,
        html: htmlBody,
    };

    try {
        console.log(`Sending ${status} email to ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
// ---------------------------

export async function POST(request: NextRequest) {
    try {
        const db = getFirestoreAdmin();
        const { 
            candidateId, 
            newStatus, 
            interviewTimestampISO,
            // ✅ Add Google Meet fields
            calendarEventId,
            meetLink,
            duration
        } = await request.json();

        if (!candidateId || !newStatus) {
            return NextResponse.json({ error: 'Missing candidateId or newStatus' }, { status: 400 });
        }

        const validStatuses = ['submitted', 'rejected', 'interview_scheduled', 'approved'];
        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
        }

        const candidateRef = db.collection("candidates").doc(candidateId);
        const candidateSnap = await candidateRef.get();

        if (!candidateSnap.exists) {
            return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
        }

        const candidateData = candidateSnap.data();
        if (!candidateData) {
             return NextResponse.json({ error: 'Candidate data not found' }, { status: 404 });
        }

        // Prepare data for update
        const updateData: { 
            status: string; 
            interviewDate?: admin.firestore.Timestamp | FieldValue;
            calendarEventId?: string | FieldValue;
            meetLink?: string | FieldValue;
            duration?: number | FieldValue;
        } = {
            status: newStatus,
        };

        let interviewDate: Date | undefined = undefined;
        if (newStatus === 'interview_scheduled') {
            if (!interviewTimestampISO) {
                return NextResponse.json({ error: 'Interview date and time are required for scheduling.' }, { status: 400 });
            }
            try {
                interviewDate = new Date(interviewTimestampISO);
                if (isNaN(interviewDate.getTime())) {
                    throw new Error('Invalid date format');
                }
                updateData.interviewDate = admin.firestore.Timestamp.fromDate(interviewDate);
                
                // ✅ Add Google Meet fields if provided
                if (calendarEventId) updateData.calendarEventId = calendarEventId;
                if (meetLink) updateData.meetLink = meetLink;
                if (duration) updateData.duration = duration;
                
            } catch (dateError) {
                console.error("Invalid interview date format received:", interviewTimestampISO, dateError);
                return NextResponse.json({ error: 'Invalid interview date format provided. Please use ISO format.' }, { status: 400 });
            }
        } else {
            // If changing status *away* from scheduled, clear the interview-related fields
            if (candidateData.status === 'interview_scheduled') {
                updateData.interviewDate = admin.firestore.FieldValue.delete();
                updateData.calendarEventId = admin.firestore.FieldValue.delete();
                updateData.meetLink = admin.firestore.FieldValue.delete();
                updateData.duration = admin.firestore.FieldValue.delete();
            }
        }

        // Update Firestore
        await candidateRef.update(updateData);

        // Send email notification if applicable
        if (candidateData.email && (newStatus === 'rejected' || (newStatus === 'interview_scheduled' && interviewDate))) {
            await sendNotificationEmail(candidateData.email, newStatus, candidateData.fullName || 'Candidate', interviewDate);
        }

        return NextResponse.json({ success: true, newStatus: newStatus });

    } catch (error) {
        console.error("Error in /api/update-status:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes("Firebase Admin SDK environment variables are not fully set") || errorMessage.includes("Failed to initialize Firebase Admin SDK")) {
            return NextResponse.json({ error: 'Server configuration error', details: 'Failed to initialize backend services.' }, { status: 503 });
        }
        return NextResponse.json({ error: 'Failed to update candidate status', details: errorMessage }, { status: 500 });
    }
}