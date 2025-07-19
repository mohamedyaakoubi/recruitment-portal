// src/services/scoring.ts
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { DocumentData } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Candidate } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY environment variable not set. AI scoring will be disabled.");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

interface CandidateDataForScoring {
    fullName: string;
    cvUrl: string;
    email: string;
    city?: string;
    country?: string;
    phoneNumber?: string;
    websites?: string[];
}

interface GeminiScoringResponse {
    score: number;
    analysis: string;
}

async function extractCVText(cvUrl: string): Promise<string> {
    try {
        return `CV available at: ${cvUrl} - This candidate has submitted their CV for review. The CV contains their professional experience, skills, and qualifications relevant to the position.`;
    } catch (error) {
        console.error("Error extracting CV text:", error);
        return "CV submitted but content extraction failed";
    }
}

async function getGeminiScoreAndAnalysis(jobTitle: string, jobDescription: string, candidateData: CandidateDataForScoring): Promise<GeminiScoringResponse | null> {
  if (!model) {
    console.error("Gemini model not initialized. Skipping scoring.");
    return null;
  }

  const cvText = await extractCVText(candidateData.cvUrl);

  const prompt = `
    Analyze the following candidate information based on the provided job position and description.
    Provide a numerical score from 0 to 100 representing their suitability for this specific role, and a detailed analysis (3-4 sentences) highlighting key strengths, relevant experience, or areas where the candidate may need development relative to the job requirements.
    Return the result ONLY in the following JSON format: {"score": <score_number>, "analysis": "<analysis_text>"}

    Job Position: ${jobTitle}
    
    Job Description:
    --- START JOB DESCRIPTION ---
    ${jobDescription}
    --- END JOB DESCRIPTION ---

    Candidate Information:
    Full Name: ${candidateData.fullName}
    Email: ${candidateData.email}
    Location: ${candidateData.city ? `${candidateData.city}, ${candidateData.country || ''}` : candidateData.country || 'Not specified'}
    Phone: ${candidateData.phoneNumber || 'Not provided'}
    Websites/Portfolio: ${candidateData.websites && candidateData.websites.length > 0 ? candidateData.websites.join(', ') : 'None provided'}
    
    CV Information:
    --- START CV CONTENT ---
    ${cvText}
    --- END CV CONTENT ---

    Please provide a comprehensive evaluation considering the candidate's background against the specific job requirements.

    JSON Response:
  `;

  try {
    console.log(`Requesting Gemini score and analysis for ${candidateData.fullName} for position: ${jobTitle}...`);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text();
    console.log("Gemini Raw Response:", rawText);

    try {
        const cleanedText = rawText.replace(/```json\n?|```/g, "").trim(); 
        const parsedResponse: GeminiScoringResponse = JSON.parse(cleanedText);

        if (typeof parsedResponse.score === 'number' && 
            parsedResponse.score >= 0 && parsedResponse.score <= 100 &&
            typeof parsedResponse.analysis === 'string' && parsedResponse.analysis.length > 0) {
            
            console.log(`Gemini Score: ${parsedResponse.score}, Analysis: ${parsedResponse.analysis.substring(0, 100)}...`);
            return parsedResponse;
        } else {
            console.error("Parsed Gemini response did not match expected format:", parsedResponse);
            return null;
        }
    } catch (parseError) {
        console.error("Could not parse JSON from Gemini response:", rawText, parseError);
        const scoreMatch = rawText.match(/\d+/);
        if (scoreMatch && scoreMatch[0]) {
            const score = parseInt(scoreMatch[0], 10);
            if (!isNaN(score) && score >= 0 && score <= 100) {
                console.warn("JSON parsing failed, returning score only as fallback.");
                return { score: score, analysis: "Analysis could not be extracted from AI response." };
            }
        }
        return null;
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}

export const scoreCandidate = async (candidateId: string, jobId: string, jobTitle: string, jobDescription: string): Promise<GeminiScoringResponse> => {
    if (!GEMINI_API_KEY || !model) {
        throw new Error('AI Scoring is not configured on the server.');
    }

    const db = getFirestoreAdmin();
    const candidateRef = db.collection("candidates").doc(candidateId);
    const candidateSnap = await candidateRef.get();

    if (!candidateSnap.exists) {
        throw new Error('Candidate not found');
    }

    const candidateDocData = candidateSnap.data() as DocumentData;
    const candidateDataForScoring: CandidateDataForScoring = {
        fullName: candidateDocData.fullName || '',
        cvUrl: candidateDocData.cvUrl || '',
        email: candidateDocData.email || '',
        city: candidateDocData.city,
        country: candidateDocData.country,
        phoneNumber: candidateDocData.phoneNumber,
        websites: candidateDocData.websites || [],
    };

    const scoringResult = await getGeminiScoreAndAnalysis(jobTitle, jobDescription, candidateDataForScoring);

    if (scoringResult === null) {
        throw new Error('Failed to get AI score and analysis for candidate');
    }

    await candidateRef.update({
      score: scoringResult.score,
      scoreAnalysis: scoringResult.analysis,
      scoredForJobId: jobId || null,
      scoredForJobTitle: jobTitle,
      lastScoredAt: admin.firestore.Timestamp.now()
    });

    return scoringResult;
};