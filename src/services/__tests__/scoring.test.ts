
const mockDoc = {
    get: jest.fn(),
    update: jest.fn(),
};
const mockCollection = {
    doc: jest.fn(() => mockDoc),
};
const mockDb = {
    collection: jest.fn(() => mockCollection),
};
const mockFileManager = {
    uploadFile: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
};
const mockGenerativeModel = {
    generateContent: jest.fn(),
};

jest.mock('@/lib/firebase-admin', () => ({
    getFirestoreAdmin: () => mockDb,
}));
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn(() => ({
        getGenerativeModel: () => mockGenerativeModel,
    })),
}));
jest.mock('@google/generative-ai/server', () => ({
    GoogleAIFileManager: jest.fn(() => mockFileManager),
}));

global.fetch = jest.fn();

describe('Scoring Service', () => {
    let scoreCandidate: any;

    beforeEach(() => {
        jest.clearAllMocks();
        scoreCandidate = require('../scoring').scoreCandidate;
    });

    describe('scoreCandidate', () => {
        it('should score a candidate and update firestore', async () => {
            const candidateId = 'candidate-1';
            const jobId = 'job-1';
            const jobTitle = 'Software Engineer';
            const jobDescription = 'Develop amazing things.';

            const candidateData = {
                fullName: 'John Doe',
                cvUrl: 'http://example.com/cv.pdf',
                email: 'john.doe@example.com',
            };
            mockDoc.get.mockResolvedValue({ exists: true, data: () => candidateData });

            const mockFile = {
                name: 'file-123',
                uri: 'file-uri',
                mimeType: 'application/pdf',
                state: 'ACTIVE',
            };
            (mockFileManager.uploadFile as jest.Mock).mockResolvedValue({ file: mockFile });
            (mockFileManager.getFile as jest.Mock).mockResolvedValue({ file: mockFile });

            const mockApiResponse = {
                score: 85,
                analysis: 'Great candidate',
                keyStrengths: ['React', 'Node.js'],
                areasForImprovement: ['Testing'],
                recommendation: 'recommended',
            };
            mockGenerativeModel.generateContent.mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockApiResponse),
                },
            });

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
            });

            const result = await scoreCandidate(candidateId, jobId, jobTitle, jobDescription);

            expect(result).toEqual(mockApiResponse);
            expect(mockDoc.update).toHaveBeenCalledWith(expect.objectContaining({
                score: mockApiResponse.score,
                scoreAnalysis: mockApiResponse.analysis,
            }));
        });

        it('should throw an error if candidate not found', async () => {
            mockDoc.get.mockResolvedValue({ exists: false });
            await expect(scoreCandidate('1', '1', 't', 'd')).rejects.toThrow('Candidate not found');
        });

        it('should throw an error if AI scoring fails', async () => {
            mockDoc.get.mockResolvedValue({ exists: true, data: () => ({ cvUrl: 'url' }) });
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
            });
            (mockFileManager.uploadFile as jest.Mock).mockResolvedValue({ file: { state: 'ACTIVE' } });
            mockGenerativeModel.generateContent.mockResolvedValue({
                response: {
                    text: () => 'invalid json',
                },
            });
            await expect(scoreCandidate('1', '1', 't', 'd')).rejects.toThrow('Failed to get AI score and analysis from Gemini 2.5 Pro');
        });
    });
});
