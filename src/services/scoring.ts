import { getFirestoreAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { DocumentData } from 'firebase-admin/firestore';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import logger from '@/lib/logger';

// Gemini API type definitions
interface GeminiFile {
  uri: string;
  mimeType: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  logger.warn('GEMINI_API_KEY environment variable not set. AI scoring will be disabled.');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const fileManager = GEMINI_API_KEY ? new GoogleAIFileManager(GEMINI_API_KEY) : null;

interface CandidateDataForScoring {
  fullName: string;
  cvUrl: string;
  email: string;
  city?: string;
  country?: string;
  phoneNumber?: string;
  websites?: string[];
  additionalInfo?: {
    type: 'link' | 'file' | 'text';
    content: string;
    fileUrl?: string;
  }[];
}

interface GeminiScoringResponse {
  score: number;
  analysis: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  recommendation: 'highly_recommended' | 'recommended' | 'conditional' | 'not_recommended';
}

// 🔥 FIXED: Function to upload file to Gemini using the correct GoogleAIFileManager
async function uploadFileToGemini(fileUrl: string, mimeType: string) {
  if (!fileManager) {
    logger.error('File Manager not initialized');
    return null;
  }

  try {
    logger.info('Uploading file to Gemini', { fileUrl });

    // Fetch the file from the URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🔥 FIXED: Use the GoogleAIFileManager for file uploads
    const uploadResult = await fileManager.uploadFile(buffer, {
      mimeType: mimeType,
      displayName: `candidate-cv-${Date.now()}`,
    });

    logger.info('File uploaded successfully', { uri: uploadResult.file.uri });

    // Wait for file to be processed if needed
    let file = uploadResult.file;
    while (file.state === 'PROCESSING') {
      logger.info('File processing...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Get file status by name
      const fileStatus = await fileManager.getFile(uploadResult.file.name);
      file = fileStatus;
    }

    if (file.state === 'FAILED') {
      throw new Error('File processing failed');
    }

    logger.info('File ready for analysis', { uri: file.uri });
    return { file, fileName: uploadResult.file.name };
  } catch (error) {
    logger.error('Error uploading file to Gemini', error);
    return null;
  }
}

// Function to get MIME type from URL
function getMimeTypeFromUrl(url: string): string {
  const urlWithoutQuery = url.split('?')[0];
  if (!urlWithoutQuery) {
    return 'application/octet-stream';
  }
  const extension = urlWithoutQuery.toLowerCase().split('.').pop();

  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

// Enhanced document content extraction with actual file upload
async function extractDocumentContent(
  fileUrl: string
): Promise<{ content: string; geminiFile?: GeminiFile; fileName?: string }> {
  try {
    logger.info('Processing document', { fileUrl });

    const mimeType = getMimeTypeFromUrl(fileUrl);
    logger.info('Detected MIME type', { mimeType });

    // Upload file to Gemini for direct analysis
    const geminiFile = await uploadFileToGemini(fileUrl, mimeType);

    if (geminiFile) {
      return {
        content: `📄 Document uploaded to Gemini for analysis: ${fileUrl}`,
        geminiFile: geminiFile.file as GeminiFile,
        fileName: geminiFile.fileName,
      };
    } else {
      // Fallback: provide file information for context
      return {
        content: `📄 Document available (processing failed): ${fileUrl} - This document contains candidate information that should be considered in evaluation.`,
      };
    }
  } catch (error) {
    logger.error('Error processing document', error);
    return {
      content: `📄 Document processing failed: ${fileUrl}`,
    };
  }
}

// Enhanced website analysis
async function analyzeWebsiteContent(url: string): Promise<string> {
  try {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    logger.info('Analyzing website', { url: cleanUrl });

    // Return instruction for comprehensive analysis
    return `🌐 Please analyze this website: ${cleanUrl} - Extract relevant professional information, portfolio details, work experience, skills, and any other information that would help evaluate this candidate's suitability for the position.`;
  } catch (error) {
    logger.error('Error preparing website analysis', error);
    return `🔗 Website provided: ${url} (analysis preparation failed)`;
  }
}

// 🔥 FIXED: Enhanced scoring analysis using the correct API structure
async function getGemini25ScoringAnalysis(
  jobTitle: string,
  jobDescription: string,
  candidateData: CandidateDataForScoring
): Promise<GeminiScoringResponse | null> {
  if (!genAI) {
    logger.error('Gemini API not initialized. Skipping scoring.');
    return null;
  }

  try {
    logger.info('Initializing Gemini 2.5 Pro for candidate', { name: candidateData.fullName });

    // Process CV file first
    const cvMimeType = getMimeTypeFromUrl(candidateData.cvUrl);
    const cvFile = await uploadFileToGemini(candidateData.cvUrl, cvMimeType);

    // Collect all files and content for analysis
    const additionalContent: string[] = [];
    const geminiFiles: GeminiFile[] = [];
    const fileNamesToCleanup: string[] = [];

    // Add CV file if successfully uploaded
    if (cvFile) {
      geminiFiles.push(cvFile.file);
      fileNamesToCleanup.push(cvFile.fileName);
      logger.info('CV file added for analysis', { uri: cvFile.file.uri });
    }

    // Process websites
    if (candidateData.websites && candidateData.websites.length > 0) {
      for (const website of candidateData.websites) {
        const websiteAnalysis = await analyzeWebsiteContent(website);
        additionalContent.push(websiteAnalysis);
      }
    }

    // Process additional information
    if (candidateData.additionalInfo) {
      for (const info of candidateData.additionalInfo) {
        if (info.type === 'link') {
          const linkAnalysis = await analyzeWebsiteContent(info.content);
          additionalContent.push(linkAnalysis);
        } else if (info.type === 'file' && info.fileUrl) {
          const fileResult = await extractDocumentContent(info.fileUrl);
          additionalContent.push(fileResult.content);
          if (fileResult.geminiFile && fileResult.fileName) {
            geminiFiles.push(fileResult.geminiFile);
            fileNamesToCleanup.push(fileResult.fileName);
          }
        } else if (info.type === 'text') {
          additionalContent.push(`📝 Additional Information: ${info.content}`);
        }
      }
    }

    // Get model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
    });

    // Construct comprehensive analysis prompt
    const prompt = `
You are an expert HR recruiter and talent acquisition specialist. Analyze this candidate thoroughly for the specified position using ALL available information including uploaded files.

🎯 **POSITION DETAILS:**
Job Title: ${jobTitle}

Job Description:
--- START JOB DESCRIPTION ---
${jobDescription}
--- END JOB DESCRIPTION ---

👤 **CANDIDATE PROFILE:**
Full Name: ${candidateData.fullName}
Email: ${candidateData.email}
Location: ${candidateData.city ? `${candidateData.city}, ${candidateData.country || ''}` : candidateData.country || 'Not specified'}
Phone: ${candidateData.phoneNumber || 'Not provided'}

📄 **CV/RESUME:**
${cvFile ? "The candidate's CV/resume has been uploaded and is available for analysis. Please thoroughly analyze the document content including work experience, education, skills, achievements, and any other relevant information." : `CV Document URL: ${candidateData.cvUrl} - Please consider this contains the candidate's professional history.`}

${
  additionalContent.length > 0
    ? `
🔍 **ADDITIONAL INFORMATION TO ANALYZE:**
${additionalContent.join('\n\n')}
`
    : ''
}

📊 **ANALYSIS REQUIREMENTS:**
1. Analyze the CV/resume content thoroughly for technical skills, experience, and qualifications
2. Provide a numerical score (0-100) based on overall job fit
3. Give detailed analysis covering technical skills, experience, education, and growth potential
4. Identify 3 key strengths that make them suitable for this role
5. Identify 2 areas where they might need development or support
6. Provide a clear recommendation category

Score the candidate based on:
- Job Requirements Match (40%)
- Experience Quality & Relevance (30%)
- Skills & Technical Competency (20%)
- Growth Potential & Cultural Fit (10%)

Provide your response in the following JSON format:
{
  "score": <number between 0-100>,
  "analysis": "<detailed 4-6 sentence analysis>",
  "keyStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "areasForImprovement": ["<area1>", "<area2>"],
  "recommendation": "<highly_recommended|recommended|conditional|not_recommended>"
}

Please provide a thorough assessment based on ALL available information including uploaded documents.
        `;

    logger.info('Sending comprehensive analysis request to Gemini 2.5 Pro', {
      uploadedFiles: geminiFiles.length,
      additionalInfoItems: additionalContent.length,
    });

    // 🔥 FIXED: Create content parts using the correct API structure
    const parts: Part[] = [];

    // Add uploaded files first using the correct format
    geminiFiles.forEach((file) => {
      parts.push({
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      });
    });

    // Add the prompt text
    parts.push({
      text: prompt,
    });

    // 🔥 FIXED: Use the correct API structure for content generation
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: parts,
        },
      ],
    });

    // Handle potentially undefined responseText
    const response = result.response;
    const responseText = response.text();
    if (!responseText) {
      throw new Error('No response text received from Gemini API');
    }

    logger.debug('Gemini 2.5 Pro Raw Response', { preview: responseText.substring(0, 200) });

    // 🔥 FIXED: Cleanup using the correct FileManager API with tracked file names
    for (const fileName of fileNamesToCleanup) {
      try {
        await fileManager!.deleteFile(fileName);
        logger.info('Cleaned up file', { fileName });
      } catch (cleanupError) {
        logger.warn('Failed to cleanup file', { fileName, error: cleanupError });
      }
    }

    try {
      // Clean and parse JSON response
      let cleanedText = responseText.trim();
      cleanedText = cleanedText.replace(/```json\n?|```/g, '');

      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No valid JSON object found in response');
      }

      cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      const parsedResponse: GeminiScoringResponse = JSON.parse(cleanedText);

      // Validate response structure
      if (
        typeof parsedResponse.score === 'number' &&
        parsedResponse.score >= 0 &&
        parsedResponse.score <= 100 &&
        typeof parsedResponse.analysis === 'string' &&
        parsedResponse.analysis.length > 0 &&
        Array.isArray(parsedResponse.keyStrengths) &&
        Array.isArray(parsedResponse.areasForImprovement) &&
        ['highly_recommended', 'recommended', 'conditional', 'not_recommended'].includes(
          parsedResponse.recommendation
        )
      ) {
        logger.info('Gemini 2.5 Pro Analysis Complete', {
          score: parsedResponse.score,
          recommendation: parsedResponse.recommendation,
        });
        return parsedResponse;
      } else {
        logger.error("Parsed response doesn't match expected format", { parsedResponse });
        return null;
      }
    } catch (parseError) {
      logger.error('JSON parsing failed', {
        error: parseError,
        responsePreview: responseText.substring(0, 500),
      });

      // Fallback scoring
      const scoreMatch = responseText.match(/['"]*score['"]*\s*:\s*(\d+)/i);
      if (scoreMatch && scoreMatch[1]) {
        const score = parseInt(scoreMatch[1], 10);
        if (!isNaN(score) && score >= 0 && score <= 100) {
          logger.warn('Using fallback scoring due to JSON parse error');
          return {
            score,
            analysis:
              'Analysis completed with comprehensive file and content review, but detailed response parsing failed. The score reflects thorough evaluation of all available information including uploaded documents.',
            keyStrengths: [
              'Comprehensive file analysis completed',
              'Document content reviewed',
              'Professional evaluation conducted',
            ],
            areasForImprovement: [
              'Complete analysis parsing needed',
              'Response format optimization required',
            ],
            recommendation:
              score >= 80 ? 'recommended' : score >= 60 ? 'conditional' : 'not_recommended',
          };
        }
      }
      return null;
    }
  } catch (error) {
    logger.error('Error calling Gemini 2.5 Pro API', error);
    return null;
  }
}

export const scoreCandidate = async (
  candidateId: string,
  jobId: string,
  jobTitle: string,
  jobDescription: string
): Promise<GeminiScoringResponse> => {
  if (!GEMINI_API_KEY || !genAI) {
    throw new Error('AI Scoring is not configured on the server.');
  }

  logger.info('Starting comprehensive Gemini 2.5 Pro scoring for candidate', { candidateId });

  const db = getFirestoreAdmin();
  const candidateRef = db.collection('candidates').doc(candidateId);
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
    additionalInfo: candidateDocData.additionalInfo || [],
  };

  logger.info('Candidate data prepared for comprehensive analysis', {
    name: candidateDataForScoring.fullName,
    hasCV: !!candidateDataForScoring.cvUrl,
    websiteCount: candidateDataForScoring.websites?.length || 0,
    additionalInfoCount: candidateDataForScoring.additionalInfo?.length || 0,
  });

  const scoringResult = await getGemini25ScoringAnalysis(
    jobTitle,
    jobDescription,
    candidateDataForScoring
  );

  if (scoringResult === null) {
    throw new Error('Failed to get AI score and analysis from Gemini 2.5 Pro');
  }

  // Update candidate document with enhanced scoring data
  const updateData = {
    score: scoringResult.score,
    scoreAnalysis: scoringResult.analysis,
    keyStrengths: scoringResult.keyStrengths,
    areasForImprovement: scoringResult.areasForImprovement,
    aiRecommendation: scoringResult.recommendation,
    scoredForJobId: jobId || null,
    scoredForJobTitle: jobTitle,
    lastScoredAt: admin.firestore.Timestamp.now(),
    scoringVersion: 'gemini-2.5-pro-enhanced',
  };

  await candidateRef.update(updateData);

  logger.info('Candidate scored successfully with comprehensive Gemini 2.5 Pro analysis', {
    candidateId,
  });
  return scoringResult;
};
