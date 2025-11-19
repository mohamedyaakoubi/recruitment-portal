import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase Admin
const mockFirestore = {
    collection: vi.fn(),
    doc: vi.fn(),
};

const mockDocRef = {
    get: vi.fn(),
    update: vi.fn(),
};

vi.mock('@/lib/firebase-admin', () => ({
    getFirestoreAdmin: () => mockFirestore,
}));

vi.mock('firebase-admin', () => ({
    default: {
        firestore: {
            Timestamp: {
                now: () => 'mock-timestamp',
            },
        },
    },
}));

// Mock Google Generative AI
const mockGenerativeModel = {
    generateContent: vi.fn(),
};

const mockGoogleGenerativeAI = {
    getGenerativeModel: vi.fn(() => mockGenerativeModel),
};

const mockFileManager = {
    uploadFile: vi.fn(),
    getFile: vi.fn(),
    deleteFile: vi.fn(),
};

vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn(() => mockGoogleGenerativeAI),
}));

vi.mock('@google/generative-ai/server', () => ({
    GoogleAIFileManager: vi.fn(() => mockFileManager),
}));

// Mock global fetch
global.fetch = vi.fn();

describe('scoring service', () => {
    let scoreCandidate: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        process.env.GEMINI_API_KEY = 'mock-api-key';

        // Re-import module to pick up env var
        const scoring = await import('../scoring');
        scoreCandidate = scoring.scoreCandidate;

        // Setup Firestore mocks
        mockFirestore.collection.mockReturnValue(mockFirestore);
        mockFirestore.doc.mockReturnValue(mockDocRef);
    });

    it('should throw error if candidate not found', async () => {
        mockDocRef.get.mockResolvedValue({ exists: false });

        await expect(scoreCandidate('invalid-id', 'job-1', 'Dev', 'Desc'))
            .rejects.toThrow('Candidate not found');
    });

    it('should successfully score a candidate', async () => {
        // Mock candidate data
        mockDocRef.get.mockResolvedValue({
            exists: true,
            data: () => ({
                fullName: 'John Doe',
                cvUrl: 'http://example.com/cv.pdf',
                email: 'john@example.com',
            }),
        });

        // Mock file upload
        (global.fetch as any).mockResolvedValue({
            ok: true,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        });

        mockFileManager.uploadFile.mockResolvedValue({
            file: { uri: 'mock-uri', state: 'ACTIVE', name: 'mock-file-name' }
        });

        // Mock Gemini response
        const mockAnalysis = {
            score: 85,
            analysis: 'Good fit',
            keyStrengths: ['Coding', 'Testing'],
            areasForImprovement: ['Design'],
            recommendation: 'recommended'
        };

        mockGenerativeModel.generateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify(mockAnalysis)
            }
        });

        const result = await scoreCandidate('cand-1', 'job-1', 'Dev', 'Desc');

        expect(result).toEqual(mockAnalysis);
        expect(mockDocRef.update).toHaveBeenCalledWith(expect.objectContaining({
            score: 85,
            aiRecommendation: 'recommended'
        }));
    });

    it('should handle JSON parsing errors gracefully', async () => {
        // Mock candidate data
        mockDocRef.get.mockResolvedValue({
            exists: true,
            data: () => ({
                fullName: 'John Doe',
                cvUrl: 'http://example.com/cv.pdf',
            }),
        });

        // Mock file upload
        (global.fetch as any).mockResolvedValue({
            ok: true,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        });

        mockFileManager.uploadFile.mockResolvedValue({
            file: { uri: 'mock-uri', state: 'ACTIVE', name: 'mock-file-name' }
        });

        // Mock Malformed JSON response but with a score
        mockGenerativeModel.generateContent.mockResolvedValue({
            response: {
                text: () => "Here is the score: 75. Analysis: Good."
            }
        });

        const result = await scoreCandidate('cand-1', 'job-1', 'Dev', 'Desc');

        // Should use fallback scoring
        expect(result.score).toBe(75);
        expect(result.recommendation).toBe('conditional');
    });
});
