import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Admin Dashboard Page
 */
export class AdminDashboardPage {
  readonly page: Page;

  // Navigation
  readonly dashboardLink: Locator;
  readonly candidatesLink: Locator;
  readonly jobsLink: Locator;
  readonly calendarLink: Locator;
  readonly logoutButton: Locator;

  // Candidate Table
  readonly candidateTable: Locator;
  readonly tableRows: Locator;
  readonly tableHeaders: Locator;

  // Search & Filters
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly categoryFilter: Locator;
  readonly dateFilter: Locator;
  readonly clearFiltersButton: Locator;

  // Pagination
  readonly paginationContainer: Locator;
  readonly nextPageButton: Locator;
  readonly prevPageButton: Locator;
  readonly pageNumbers: Locator;

  // Candidate Actions
  readonly viewButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly scheduleInterviewButton: Locator;
  readonly scoreButton: Locator;

  // Profile Modal
  readonly profileModal: Locator;
  readonly modalCloseButton: Locator;
  readonly modalPersonalInfo: Locator;
  readonly modalJobInfo: Locator;
  readonly modalDocuments: Locator;
  readonly modalCVLink: Locator;
  readonly modalPhotoPreview: Locator;

  // Edit Modal
  readonly editModal: Locator;
  readonly editStatusSelect: Locator;
  readonly editSaveButton: Locator;
  readonly editCancelButton: Locator;

  // Interview Modal
  readonly interviewModal: Locator;
  readonly interviewDateInput: Locator;
  readonly interviewTimeInput: Locator;
  readonly interviewDurationSelect: Locator;
  readonly createMeetLinkButton: Locator;
  readonly sendEmailCheckbox: Locator;
  readonly scheduleButton: Locator;

  // Export
  readonly exportButton: Locator;
  readonly exportCSVButton: Locator;
  readonly exportExcelButton: Locator;

  // Statistics
  readonly statsCards: Locator;
  readonly totalCandidatesCard: Locator;
  readonly submittedCard: Locator;
  readonly interviewCard: Locator;
  readonly hiredCard: Locator;
  readonly statusChart: Locator;
  readonly scoreChart: Locator;

  // Messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.dashboardLink = page.locator('a[href*="dashboard"], nav a:has-text("Dashboard")');
    this.candidatesLink = page.locator('a[href*="candidates"], nav a:has-text("Candidates")');
    this.jobsLink = page.locator('a[href*="jobs"], nav a:has-text("Jobs")');
    this.calendarLink = page.locator('a[href*="calendar"], nav a:has-text("Calendar")');
    this.logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');

    // Candidate Table
    this.candidateTable = page.locator('table, [role="table"]');
    this.tableRows = page.locator('tbody tr, [role="row"]');
    this.tableHeaders = page.locator('thead th, [role="columnheader"]');

    // Search & Filters
    this.searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    this.statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
    this.categoryFilter = page.locator('select[name="category"], [data-testid="category-filter"]');
    this.dateFilter = page.locator('input[type="date"], [data-testid="date-filter"]');
    this.clearFiltersButton = page.locator('button:has-text("Clear"), button:has-text("Reset")');

    // Pagination
    this.paginationContainer = page.locator('[data-testid="pagination"], .pagination');
    this.nextPageButton = page.locator('button:has-text("Next"), button[aria-label="Next page"]');
    this.prevPageButton = page.locator(
      'button:has-text("Previous"), button[aria-label="Previous page"]'
    );
    this.pageNumbers = page.locator('.pagination button[data-page], .pagination a[data-page]');

    // Candidate Actions
    this.viewButton = page.locator('button:has-text("View"), button[aria-label*="View"]');
    this.editButton = page.locator('button:has-text("Edit"), button[aria-label*="Edit"]');
    this.deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="Delete"]');
    this.scheduleInterviewButton = page.locator(
      'button:has-text("Schedule"), button:has-text("Interview")'
    );
    this.scoreButton = page.locator('button:has-text("Score"), button[aria-label*="Score"]');

    // Profile Modal
    this.profileModal = page.locator('[data-testid="profile-modal"], [role="dialog"]');
    this.modalCloseButton = page.locator(
      '[data-testid="profile-modal"] button[aria-label="Close"], [role="dialog"] button:has-text("×")'
    );
    this.modalPersonalInfo = page.locator('[data-testid="personal-info"], .personal-info');
    this.modalJobInfo = page.locator('[data-testid="job-info"], .job-info');
    this.modalDocuments = page.locator('[data-testid="documents"], .documents');
    this.modalCVLink = page.locator('a[href*="cv"], a:has-text("CV")');
    this.modalPhotoPreview = page.locator('img[alt*="photo"], img[alt*="Photo"]');

    // Edit Modal
    this.editModal = page.locator('[data-testid="edit-modal"], [role="dialog"]:has-text("Edit")');
    this.editStatusSelect = page.locator('[data-testid="edit-modal"] select[name="status"]');
    this.editSaveButton = page.locator('[data-testid="edit-modal"] button:has-text("Save")');
    this.editCancelButton = page.locator('[data-testid="edit-modal"] button:has-text("Cancel")');

    // Interview Modal
    this.interviewModal = page.locator(
      '[data-testid="interview-modal"], [role="dialog"]:has-text("Interview")'
    );
    this.interviewDateInput = page.locator('[data-testid="interview-modal"] input[type="date"]');
    this.interviewTimeInput = page.locator('[data-testid="interview-modal"] input[type="time"]');
    this.interviewDurationSelect = page.locator(
      '[data-testid="interview-modal"] select[name="duration"]'
    );
    this.createMeetLinkButton = page.locator(
      'button:has-text("Create Meet Link"), button:has-text("Generate Link")'
    );
    this.sendEmailCheckbox = page.locator('input[type="checkbox"][name="sendEmail"]');
    this.scheduleButton = page.locator(
      '[data-testid="interview-modal"] button:has-text("Schedule")'
    );

    // Export
    this.exportButton = page.locator('button:has-text("Export")');
    this.exportCSVButton = page.locator('button:has-text("CSV"), a[href*=".csv"]');
    this.exportExcelButton = page.locator('button:has-text("Excel"), a[href*=".xlsx"]');

    // Statistics
    this.statsCards = page.locator('[data-testid="stats-card"], .stats-card');
    this.totalCandidatesCard = page.locator(
      '[data-testid="total-candidates"], .stat:has-text("Total")'
    );
    this.submittedCard = page.locator('[data-testid="submitted"], .stat:has-text("Submitted")');
    this.interviewCard = page.locator('[data-testid="interview"], .stat:has-text("Interview")');
    this.hiredCard = page.locator('[data-testid="hired"], .stat:has-text("Hired")');
    this.statusChart = page.locator('[data-testid="status-chart"], .recharts-wrapper').first();
    this.scoreChart = page.locator('[data-testid="score-chart"], .recharts-wrapper').last();

    // Messages
    this.successMessage = page.locator('[role="alert"]:has-text("Success"), .success');
    this.errorMessage = page.locator('[role="alert"]:has-text("Error"), .error');
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner');
  }

  /**
   * Navigate to admin dashboard
   */
  async goto() {
    await this.page.goto('/admin-dashboard-secret');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for candidates by name
   * @param searchTerm - Search term
   */
  async searchCandidates(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Wait for debounce
  }

  /**
   * Filter candidates by status
   * @param status - Status to filter by
   */
  async filterByStatus(status: string) {
    await this.statusFilter.selectOption(status);
    await this.page.waitForTimeout(500);
  }

  /**
   * Filter candidates by category
   * @param category - Category to filter by
   */
  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption(category);
    await this.page.waitForTimeout(500);
  }

  /**
   * Clear all filters
   */
  async clearFilters() {
    await this.clearFiltersButton.click();
  }

  /**
   * Get number of candidates in table
   */
  async getCandidateCount(): Promise<number> {
    return await this.tableRows.count();
  }

  /**
   * Click on a candidate row to view profile
   * @param index - Row index (0-based)
   */
  async viewCandidateProfile(index: number) {
    await this.tableRows.nth(index).click();
    await this.profileModal.waitFor({ state: 'visible' });
  }

  /**
   * Close profile modal
   */
  async closeProfileModal() {
    await this.modalCloseButton.click();
    await this.profileModal.waitFor({ state: 'hidden' });
  }

  /**
   * Edit candidate status
   * @param newStatus - New status value
   */
  async editCandidateStatus(newStatus: string) {
    await this.editButton.first().click();
    await this.editModal.waitFor({ state: 'visible' });
    await this.editStatusSelect.selectOption(newStatus);
    await this.editSaveButton.click();
  }

  /**
   * Delete a candidate
   * @param confirmDialog - Whether to confirm the deletion dialog
   */
  async deleteCandidate(confirmDialog = true) {
    await this.deleteButton.first().click();

    if (confirmDialog) {
      // Handle confirmation dialog
      this.page.on('dialog', (dialog) => dialog.accept());
    }
  }

  /**
   * Schedule an interview
   * @param data - Interview data
   */
  async scheduleInterview(data: {
    date: string;
    time: string;
    duration?: string;
    createMeetLink?: boolean;
    sendEmail?: boolean;
  }) {
    await this.scheduleInterviewButton.first().click();
    await this.interviewModal.waitFor({ state: 'visible' });

    await this.interviewDateInput.fill(data.date);
    await this.interviewTimeInput.fill(data.time);

    if (data.duration) {
      await this.interviewDurationSelect.selectOption(data.duration);
    }

    if (data.createMeetLink) {
      await this.createMeetLinkButton.click();
    }

    if (data.sendEmail) {
      await this.sendEmailCheckbox.check();
    }

    await this.scheduleButton.click();
  }

  /**
   * Trigger AI scoring for a candidate
   */
  async scoreCandidate() {
    await this.scoreButton.first().click();
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
  }

  /**
   * Export candidates to CSV
   */
  async exportToCSV() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    await this.exportCSVButton.click();
    return await downloadPromise;
  }

  /**
   * Export candidates to Excel
   */
  async exportToExcel() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    await this.exportExcelButton.click();
    return await downloadPromise;
  }

  /**
   * Go to next page
   */
  async goToNextPage() {
    await this.nextPageButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Go to previous page
   */
  async goToPreviousPage() {
    await this.prevPageButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get statistics values
   */
  async getStatistics(): Promise<{
    total: number;
    submitted: number;
    interview: number;
    hired: number;
  }> {
    const totalText = (await this.totalCandidatesCard.textContent()) || '0';
    const submittedText = (await this.submittedCard.textContent()) || '0';
    const interviewText = (await this.interviewCard.textContent()) || '0';
    const hiredText = (await this.hiredCard.textContent()) || '0';

    return {
      total: parseInt(totalText.match(/\d+/)?.[0] || '0'),
      submitted: parseInt(submittedText.match(/\d+/)?.[0] || '0'),
      interview: parseInt(interviewText.match(/\d+/)?.[0] || '0'),
      hired: parseInt(hiredText.match(/\d+/)?.[0] || '0'),
    };
  }

  /**
   * Check if charts are visible
   */
  async areChartsVisible(): Promise<boolean> {
    const statusChartVisible = await this.statusChart.isVisible();
    const scoreChartVisible = await this.scoreChart.isVisible();
    return statusChartVisible && scoreChartVisible;
  }

  /**
   * Logout from admin dashboard
   */
  async logout() {
    await this.logoutButton.click();
  }
}
