import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Landing Page
 */
export class LandingPage {
  readonly page: Page;

  // Hero Section
  readonly heroHeading: Locator;
  readonly heroSubtitle: Locator;
  readonly emailInput: Locator;
  readonly continueButton: Locator;

  // Features Section
  readonly featuresSection: Locator;
  readonly globalOpportunitiesFeature: Locator;
  readonly verifiedProcessFeature: Locator;
  readonly fastTrackFeature: Locator;

  // Header
  readonly logo: Locator;
  readonly themeToggle: Locator;
  readonly contactBanner: Locator;

  // Footer
  readonly footer: Locator;
  readonly contactInfo: Locator;
  readonly socialLinks: Locator;
  readonly copyright: Locator;

  // Error/Success Messages
  readonly errorMessage: Locator;
  readonly loadingState: Locator;

  constructor(page: Page) {
    this.page = page;

    // Hero Section
    this.heroHeading = page.locator('h1').first();
    this.heroSubtitle = page.locator('p').first();
    this.emailInput = page.locator('input[type="email"]');
    this.continueButton = page.locator('button:has-text("Continue"), button:has-text("Continuer")');

    // Features Section
    this.featuresSection = page.locator('main').first();
    this.globalOpportunitiesFeature = page.locator('text=/Global.*Opportunities/i');
    this.verifiedProcessFeature = page.locator('text=/Verified.*Process/i');
    this.fastTrackFeature = page.locator('text=/Fast.*Track/i');

    // Header - Updated to match actual HTML
    this.logo = page
      .locator('img[alt="Career Portal"], img[alt*="Portal"], img[alt*="Company"]')
      .first();
    this.themeToggle = page.locator('button:has(svg.lucide-sun), button:has(svg.lucide-moon)');
    this.contactBanner = page.locator('.bg-\\[\\#003A70\\]').first();

    // Footer
    this.footer = page.locator('footer');
    this.contactInfo = page.locator('footer a[href^="mailto:"], footer a[href^="tel:"]');
    this.socialLinks = page.locator(
      'footer a[href*="facebook"], footer a[href*="linkedin"], footer a[href*="instagram"]'
    );
    this.copyright = page.locator('footer:has-text("©"), footer:has-text("All Rights Reserved")');

    // Error/Success Messages
    this.errorMessage = page.locator('.text-red-600, .text-red-300');
    this.loadingState = page.locator('text=/Checking/i');
  }

  /**
   * Navigate to the landing page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Enter email and click continue
   * @param email - Email address to enter
   */
  async submitEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.continueButton.click();
  }

  /**
   * Check if hero section is visible
   */
  async isHeroVisible(): Promise<boolean> {
    return await this.heroHeading.isVisible();
  }

  /**
   * Check if features section is visible
   */
  async areFeaturesVisible(): Promise<boolean> {
    const globalVisible = await this.globalOpportunitiesFeature.isVisible().catch(() => false);
    const verifiedVisible = await this.verifiedProcessFeature.isVisible().catch(() => false);
    const fastTrackVisible = await this.fastTrackFeature.isVisible().catch(() => false);

    return globalVisible || verifiedVisible || fastTrackVisible;
  }

  /**
   * Toggle theme (dark/light mode)
   */
  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }

  /**
   * Get current theme
   */
  async getCurrentTheme(): Promise<string> {
    const html = this.page.locator('html');
    const classList = await html.getAttribute('class');
    return classList?.includes('dark') ? 'dark' : 'light';
  }

  /**
   * Check if footer is visible
   */
  async isFooterVisible(): Promise<boolean> {
    return await this.footer.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading(): Promise<void> {
    await this.loadingState.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      // Loading state might not appear for fast operations
    });
  }

  /**
   * Check if email input has validation error
   */
  async hasEmailValidationError(): Promise<boolean> {
    const inputClasses = await this.emailInput.getAttribute('class');
    const ariaInvalid = await this.emailInput.getAttribute('aria-invalid');

    return (
      inputClasses?.includes('error') || inputClasses?.includes('invalid') || ariaInvalid === 'true'
    );
  }
}
