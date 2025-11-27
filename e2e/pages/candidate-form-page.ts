import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Candidate Form Page
 */
export class CandidateFormPage {
  readonly page: Page;

  // Form Fields - Personal Info
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly nationalitySelect: Locator;
  readonly genderSelect: Locator;

  // Form Fields - Contact Info
  readonly phoneInput: Locator;
  readonly currentLocationSelect: Locator;

  // Form Fields - Job Info
  readonly jobCategorySelect: Locator;
  readonly jobPositionSelect: Locator;
  readonly specialtyInput: Locator;

  // Form Fields - Additional Info
  readonly sourceSelect: Locator;
  readonly commentTextarea: Locator;

  // File Uploads
  readonly cvFileInput: Locator;
  readonly passportFileInput: Locator;
  readonly photoFileInput: Locator;
  // Note: The current FileInput component is simple and doesn't have preview/remove features
  // These would need to be implemented in the UI if needed

  // Form Actions
  readonly submitButton: Locator;
  readonly backButton: Locator;

  // Validation & Messages
  readonly validationErrors: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Personal Info
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.firstNameInput = page.locator('input[name="firstName"], input[name="first_name"]');
    this.lastNameInput = page.locator('input[name="lastName"], input[name="last_name"]');
    this.dateOfBirthInput = page.locator(
      'input[name="dateOfBirth"], input[name="dob"], input[type="date"]'
    );
    this.nationalitySelect = page.locator('select[name="nationality"], input[name="nationality"]');
    this.genderSelect = page.locator('select[name="gender"], input[name="gender"]');

    // Contact Info
    this.phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    this.currentLocationSelect = page.locator(
      'select[name="currentLocation"], select[name="location"]'
    );

    // Job Info
    this.jobCategorySelect = page.locator('select[name="jobCategory"], select[name="category"]');
    this.jobPositionSelect = page.locator('select[name="jobPosition"], select[name="position"]');
    this.specialtyInput = page.locator('input[name="specialty"], textarea[name="specialty"]');

    // Additional Info
    this.sourceSelect = page.locator('select[name="source"]');
    this.commentTextarea = page.locator('textarea[name="comment"], textarea[name="comments"]');

    // File Uploads
    this.cvFileInput = page.locator('input[type="file"][name="cv"]');
    this.passportFileInput = page.locator('input[type="file"][name="passport"]');
    this.photoFileInput = page.locator('input[type="file"][name="photo"]');

    // Form Actions
    this.submitButton = page.locator('button[type="submit"], button:has-text("Submit")');
    this.backButton = page.locator('button:has-text("Back"), a:has-text("Back")');

    // Validation & Messages
    this.validationErrors = page.locator('.error, [role="alert"], .validation-error');
    this.successMessage = page.locator('[data-testid="success"], .success');
    this.errorMessage = page.locator('[data-testid="error"], .error-message');
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner');
  }

  /**
   * Navigate to the candidate form page
   * @param email - Optional email to pre-fill
   */
  async goto(email?: string) {
    const url = email ? `/candidate-form?email=${encodeURIComponent(email)}` : '/candidate-form';
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill personal information section
   */
  async fillPersonalInfo(data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    gender: string;
  }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.dateOfBirthInput.fill(data.dateOfBirth);

    // Handle both select and input for nationality
    if ((await this.nationalitySelect.evaluate((el) => el.tagName)) === 'SELECT') {
      await this.nationalitySelect.selectOption(data.nationality);
    } else {
      await this.nationalitySelect.fill(data.nationality);
    }

    // Handle both select and input for gender
    if ((await this.genderSelect.evaluate((el) => el.tagName)) === 'SELECT') {
      await this.genderSelect.selectOption(data.gender);
    } else {
      await this.genderSelect.fill(data.gender);
    }
  }

  /**
   * Fill contact information section
   */
  async fillContactInfo(data: { phone: string; currentLocation: string }) {
    await this.phoneInput.fill(data.phone);
    await this.currentLocationSelect.selectOption(data.currentLocation);
  }

  /**
   * Fill job information section
   */
  async fillJobInfo(data: { jobCategory: string; jobPosition: string; specialty?: string }) {
    await this.jobCategorySelect.selectOption(data.jobCategory);

    // Wait for job positions to load based on category
    await this.page.waitForTimeout(500);

    await this.jobPositionSelect.selectOption(data.jobPosition);

    if (data.specialty) {
      await this.specialtyInput.fill(data.specialty);
    }
  }

  /**
   * Fill additional information section
   */
  async fillAdditionalInfo(data: { source: string; comment?: string }) {
    await this.sourceSelect.selectOption(data.source);

    if (data.comment) {
      await this.commentTextarea.fill(data.comment);
    }
  }

  /**
   * Upload CV file
   * @param filePath - Path to CV file
   */
  async uploadCV(filePath: string) {
    await this.cvFileInput.setInputFiles(filePath);
  }

  /**
   * Upload passport file
   * @param filePath - Path to passport file
   */
  async uploadPassport(filePath: string) {
    await this.passportFileInput.setInputFiles(filePath);
  }

  /**
   * Upload photo file
   * @param filePath - Path to photo file
   */
  async uploadPhoto(filePath: string) {
    await this.photoFileInput.setInputFiles(filePath);
  }

  /**
   * Clear uploaded CV by setting empty file list
   */
  async removeCV() {
    await this.cvFileInput.setInputFiles([]);
  }

  /**
   * Clear uploaded passport by setting empty file list
   */
  async removePassport() {
    await this.passportFileInput.setInputFiles([]);
  }

  /**
   * Clear uploaded photo by setting empty file list
   */
  async removePhoto() {
    await this.photoFileInput.setInputFiles([]);
  }

  /**
   * Submit the form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Fill complete form with all data
   */
  async fillCompleteForm(data: {
    email?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    gender: string;
    phone: string;
    currentLocation: string;
    jobCategory: string;
    jobPosition: string;
    specialty?: string;
    source: string;
    comment?: string;
  }) {
    if (data.email) {
      await this.emailInput.fill(data.email);
    }

    await this.fillPersonalInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality,
      gender: data.gender,
    });

    await this.fillContactInfo({
      phone: data.phone,
      currentLocation: data.currentLocation,
    });

    await this.fillJobInfo({
      jobCategory: data.jobCategory,
      jobPosition: data.jobPosition,
      specialty: data.specialty,
    });

    await this.fillAdditionalInfo({
      source: data.source,
      comment: data.comment,
    });
  }

  /**
   * Get validation errors
   */
  async getValidationErrors(): Promise<string[]> {
    const errors = await this.validationErrors.all();
    const errorTexts: string[] = [];

    for (const error of errors) {
      const text = await error.textContent();
      if (text) {
        errorTexts.push(text.trim());
      }
    }

    return errorTexts;
  }

  /**
   * Check if form has validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const count = await this.validationErrors.count();
    return count > 0;
  }

  /**
   * Wait for form submission to complete
   */
  async waitForSubmission() {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
      // Loading might not appear for fast submissions
    });
  }

  /**
   * Check if CV is uploaded
   */
  async isCVUploaded(): Promise<boolean> {
    try {
      const files = await this.cvFileInput.inputValue();
      return files.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if passport is uploaded
   */
  async isPassportUploaded(): Promise<boolean> {
    try {
      const files = await this.passportFileInput.inputValue();
      return files.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if photo is uploaded
   */
  async isPhotoUploaded(): Promise<boolean> {
    try {
      const files = await this.photoFileInput.inputValue();
      return files.length > 0;
    } catch {
      return false;
    }
  }
}
