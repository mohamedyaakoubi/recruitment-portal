// src/app/api/score-candidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin'; // Import the lazy init function
import admin from 'firebase-admin'; // Import admin for Timestamp
import { DocumentData } from "firebase-admin/firestore"; // Import DocumentData from admin SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Gemini API Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY environment variable not set. AI scoring will be disabled.");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null; // Using flash for speed/cost
// --------------------------------

// Define a type for the candidate data expected by the scoring function
interface CandidateDataForScoring {
    fullName: string;
    cvUrl: string;
    // Add other relevant fields explicitly if needed for scoring
}

// Define the expected structure of the AI response
interface GeminiScoringResponse {
    score: number;
    analysis: string;
}

// Function to extract text from CV file (simplified - in production you'd use proper PDF/DOC parsing)
async function extractCVText(cvUrl: string): Promise<string> {
    try {
        // For now, we'll return a placeholder since we can't directly parse PDF/DOC files
        // In a production environment, you would use libraries like pdf-parse, mammoth, etc.
        return `CV content from ${cvUrl} - This would contain the actual CV text in a production environment.`;
    } catch (error) {
        console.error("Error extracting CV text:", error);
        return "Unable to extract CV content";
    }
}

// --- Function to call Gemini API for Scoring and Analysis ---
async function getGeminiScoreAndAnalysis(jobDescription: string, candidateData: CandidateDataForScoring): Promise<GeminiScoringResponse | null> {
  if (!model) {
    console.error("Gemini model not initialized. Skipping scoring.");
    return null;
  }

  // Extract CV text (in production, this would parse the actual CV file)
  const cvText = await extractCVText(candidateData.cvUrl);

  // Updated prompt to use CV content instead of cover letter
  const prompt = `
    Analyze the following candidate information based on the provided job description.
    Provide a numerical score from 0 to 100 representing their suitability, and a brief analysis (2-3 sentences) highlighting key strengths or weaknesses relevant to the job description.
    Return the result ONLY in the following JSON format: {"score": <score_number>, "analysis": "<analysis_text>"}

    Job Description:
    --- START JOB DESCRIPTION ---
    ${jobDescription}
    --- END JOB DESCRIPTION ---

    Candidate Information:
    Full Name: ${candidateData.fullName}
    CV Content:
    --- START CV CONTENT ---
    ${cvText}
    --- END CV CONTENT ---

    JSON Response:
  `;

  try {
    console.log(`Requesting Gemini score and analysis for ${candidateData.fullName}...`);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text();
    console.log("Gemini Raw Response:", rawText);

    // Attempt to parse the JSON response
    try {
        // Clean potential markdown/code block formatting
        const cleanedText = rawText.replace(/```json\n?|```/g, "").trim(); 
        const parsedResponse: GeminiScoringResponse = JSON.parse(cleanedText);

        // Validate the parsed response
        if (typeof parsedResponse.score === 'number' && 
            parsedResponse.score >= 0 && parsedResponse.score <= 100 &&
            typeof parsedResponse.analysis === 'string' && parsedResponse.analysis.length > 0) {
            
            console.log(`Gemini Score: ${parsedResponse.score}, Analysis: ${parsedResponse.analysis.substring(0, 50)}...`);
            return parsedResponse;
        } else {
            console.error("Parsed Gemini response did not match expected format:", parsedResponse);
            return null;
        }
    } catch (parseError) {
        console.error("Could not parse JSON from Gemini response:", rawText, parseError);
        // Fallback: Try to extract score only if JSON parsing fails completely
        const scoreMatch = rawText.match(/\d+/);
        if (scoreMatch && scoreMatch[0]) {
            const score = parseInt(scoreMatch[0], 10);
            if (!isNaN(score) && score >= 0 && score <= 100) {
                console.warn("JSON parsing failed, returning score only as fallback.");
                return { score: score, analysis: "Analysis could not be extracted." };
            }
        }
        return null; // Return null if parsing and fallback fail
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
// ---------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { candidateId, jobDescription } = await request.json();

    if (!candidateId || !jobDescription) {
      return NextResponse.json({ error: 'Missing candidateId or jobDescription' }, { status: 400 });
    }

    if (!GEMINI_API_KEY || !model) {
        return NextResponse.json({ error: 'AI Scoring is not configured on the server.' }, { status: 503 });
    }

    const candidateRef = db.collection("candidates").doc(candidateId);
    const candidateSnap = await candidateRef.get();

    if (!candidateSnap.exists) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const candidateDocData = candidateSnap.data() as DocumentData;
    const candidateDataForScoring: CandidateDataForScoring = {
        fullName: candidateDocData.fullName || '',
        cvUrl: candidateDocData.cvUrl || '',
    };

    // Call Gemini for score and analysis
    const scoringResult = await getGeminiScoreAndAnalysis(jobDescription, candidateDataForScoring);

    if (scoringResult === null) {
        return NextResponse.json({ error: 'Failed to get AI score and analysis for candidate' }, { status: 500 });
    }

    // Update Firestore with score and analysis
    await candidateRef.update({
      score: scoringResult.score,
      scoreAnalysis: scoringResult.analysis, // Store the analysis text
      lastScoredAt: admin.firestore.Timestamp.now()
    });

    // Return both score and analysis in the API response
    return NextResponse.json({ 
        success: true, 
        score: scoringResult.score, 
        analysis: scoringResult.analysis 
    });

  } catch (error) {
    console.error("Error in /api/score-candidate:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes("Firebase Admin SDK environment variables are not fully set") || errorMessage.includes("Failed to initialize Firebase Admin SDK")) {
        return NextResponse.json({ error: 'Server configuration error', details: 'Failed to initialize backend services.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to score candidate', details: errorMessage }, { status: 500 });
  }
}

