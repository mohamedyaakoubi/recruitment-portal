/**
 * Test data fixtures for E2E tests
 */

/**
 * Admin user credentials (loaded from environment variables)
 */
export const testAdmin = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'test-password-123',
  uid: 'test-admin-uid',
  displayName: 'Test Admin',
};

/**
 * Mock candidate data for testing
 */
export const testCandidates = [
  {
    id: 'test-candidate-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-15',
    nationality: 'Tunisia',
    gender: 'Male',
    phone: '+21612345678',
    currentLocation: 'Tunisia',
    jobCategory: 'Healthcare',
    jobPosition: 'Nurse',
    source: 'Facebook',
    specialty: 'Pediatrics',
    comment: 'Experienced nurse with 5 years in pediatrics',
    status: 'submitted',
    submittedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'test-candidate-2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1988-08-22',
    nationality: 'Morocco',
    gender: 'Female',
    phone: '+212612345678',
    currentLocation: 'Morocco',
    jobCategory: 'Healthcare',
    jobPosition: 'Doctor',
    source: 'LinkedIn',
    specialty: 'Cardiology',
    comment: 'Cardiologist with international experience',
    status: 'interview',
    submittedAt: new Date('2024-01-20').toISOString(),
    interviewDate: new Date('2024-02-01').toISOString(),
    interviewTime: '10:00',
    meetLink: 'https://meet.google.com/test-link-123',
  },
  {
    id: 'test-candidate-3',
    email: 'ahmed.ali@example.com',
    firstName: 'Ahmed',
    lastName: 'Ali',
    dateOfBirth: '1992-03-10',
    nationality: 'Egypt',
    gender: 'Male',
    phone: '+201234567890',
    currentLocation: 'Egypt',
    jobCategory: 'Engineering',
    jobPosition: 'Software Engineer',
    source: 'Website',
    specialty: 'Full Stack Development',
    comment: 'Full stack developer with React and Node.js expertise',
    status: 'hired',
    submittedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'test-candidate-4',
    email: 'fatima.hassan@example.com',
    firstName: 'Fatima',
    lastName: 'Hassan',
    dateOfBirth: '1995-11-30',
    nationality: 'Algeria',
    gender: 'Female',
    phone: '+213612345678',
    currentLocation: 'Algeria',
    jobCategory: 'Healthcare',
    jobPosition: 'Pharmacist',
    source: 'Instagram',
    specialty: 'Clinical Pharmacy',
    comment: 'Clinical pharmacist with hospital experience',
    status: 'rejected',
    submittedAt: new Date('2024-01-25').toISOString(),
  },
];

/**
 * Mock job listings for testing
 */
export const testJobs = [
  {
    id: 'job-1',
    title: 'Registered Nurse',
    category: 'Healthcare',
    description: 'We are looking for experienced registered nurses',
    requirements: [
      'Valid nursing license',
      'Minimum 2 years experience',
      'Good communication skills',
    ],
    location: 'Germany',
    salary: '€3,500 - €4,500/month',
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'job-2',
    title: 'General Practitioner',
    category: 'Healthcare',
    description: 'Seeking qualified general practitioners',
    requirements: ['Medical degree', 'Valid medical license', 'Minimum 3 years experience'],
    location: 'France',
    salary: '€5,000 - €7,000/month',
    isActive: true,
    createdAt: new Date('2024-01-05').toISOString(),
  },
  {
    id: 'job-3',
    title: 'Software Engineer',
    category: 'Engineering',
    description: 'Full stack developer position',
    requirements: [
      "Bachelor's degree in Computer Science",
      'Experience with React and Node.js',
      'Strong problem-solving skills',
    ],
    location: 'Remote',
    salary: '€4,000 - €6,000/month',
    isActive: true,
    createdAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'job-4',
    title: 'Pharmacist',
    category: 'Healthcare',
    description: 'Hospital pharmacist position',
    requirements: ['Pharmacy degree', 'Valid pharmacy license', 'Hospital experience preferred'],
    location: 'Belgium',
    salary: '€3,800 - €4,800/month',
    isActive: false,
    createdAt: new Date('2023-12-15').toISOString(),
  },
];

/**
 * Mock file paths for testing file uploads
 */
export const testFiles = {
  validCV: 'e2e/fixtures/files/test-cv.pdf',
  validPassport: 'e2e/fixtures/files/test-passport.pdf',
  validPhoto: 'public/logo-skills.png',
  validImage: 'public/logo-skills.png',
  invalidFile: 'package.json', // Wrong file type
  textFile: 'README.md', // Wrong file type for image
};

/**
 * Common test data
 */
export const testData = {
  validEmails: ['test@example.com', 'user.name@domain.co', 'test+tag@example.com'],
  invalidEmails: ['invalid-email', '@example.com', 'test@', 'test', ''],
  phoneNumbers: {
    tunisia: '+21612345678',
    morocco: '+212612345678',
    egypt: '+201234567890',
    algeria: '+213612345678',
  },
  nationalities: ['Tunisia', 'Morocco', 'Egypt', 'Algeria', 'Libya', 'Mauritania'],
  jobCategories: ['Healthcare', 'Engineering', 'Education', 'Hospitality', 'Construction'],
  sources: ['Facebook', 'LinkedIn', 'Instagram', 'Website', 'Friend', 'Other'],
  statuses: ['submitted', 'interview', 'hired', 'rejected'],
};

/**
 * API endpoints for testing
 */
export const apiEndpoints = {
  checkEmail: '/api/check-email',
  submitCandidate: '/api/candidates',
  getCandidates: '/api/candidates',
  updateCandidate: '/api/candidates/:id',
  deleteCandidate: '/api/candidates/:id',
  scheduleInterview: '/api/interviews',
  scoreCandidate: '/api/score',
  exportCandidates: '/api/export',
  getJobs: '/api/jobs',
  createJob: '/api/jobs',
  updateJob: '/api/jobs/:id',
  deleteJob: '/api/jobs/:id',
};

/**
 * Page routes for testing
 */
export const routes = {
  home: '/',
  candidateForm: '/candidate-form',
  candidateDashboard: '/candidate-dashboard',
  candidateChoices: '/candidate-choices',
  adminDashboard: '/admin-dashboard-secret',
  adminLogin: '/admin-dashboard-secret/login',
};

/**
 * Common selectors for testing
 */
export const selectors = {
  // Landing page
  emailInput: 'input[type="email"]',
  continueButton: 'button:has-text("Continue")',

  // Candidate form
  firstNameInput: 'input[name="firstName"]',
  lastNameInput: 'input[name="lastName"]',
  dobInput: 'input[name="dateOfBirth"]',
  phoneInput: 'input[name="phone"]',
  submitButton: 'button[type="submit"]',

  // Admin dashboard
  candidateTable: 'table',
  searchInput: 'input[placeholder*="Search"]',
  filterDropdown: 'select[name="status"]',

  // Common
  loadingSpinner: '[data-testid="loading"]',
  errorMessage: '[role="alert"]',
  successMessage: '[data-testid="success"]',
};
