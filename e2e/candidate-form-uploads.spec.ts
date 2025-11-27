import { test, expect } from '@playwright/test';
import { CandidateFormPage } from './pages/candidate-form-page';
import { generateTestEmail } from './utils/test-helpers';
import { testFiles } from './fixtures/test-data';
import path from 'path';

test.describe('Candidate Form - File Uploads', () => {
  let formPage: CandidateFormPage;

  test.beforeEach(async ({ page }) => {
    formPage = new CandidateFormPage(page);

    // Enable mock data
    await page.addInitScript(() => {
      window.localStorage.setItem('USE_MOCK_DATA', 'true');
    });

    await formPage.goto(generateTestEmail());
  });

  test('should upload CV (PDF file)', async ({ page }) => {
    const cvPath = path.resolve(testFiles.validCV);

    // Upload CV
    await formPage.uploadCV(cvPath);

    // Wait for upload to process
    await page.waitForTimeout(500);

    // Verify CV is uploaded by checking input value
    const isUploaded = await formPage.isCVUploaded();
    expect(isUploaded).toBeTruthy();
  });

  test('should upload photo (image file)', async ({ page }) => {
    const photoPath = path.resolve(testFiles.validPhoto);

    // Upload photo
    await formPage.uploadPhoto(photoPath);

    // Wait for upload to process
    await page.waitForTimeout(500);

    // Verify photo is uploaded by checking input value
    const isUploaded = await formPage.isPhotoUploaded();
    expect(isUploaded).toBeTruthy();
  });

  test('should verify CV input accepts PDF files', async ({ page }) => {
    const cvPath = path.resolve(testFiles.validCV);

    // Upload CV
    await formPage.uploadCV(cvPath);
    await page.waitForTimeout(500);

    // Verify file is uploaded by checking input
    const isUploaded = await formPage.isCVUploaded();
    expect(isUploaded).toBeTruthy();
  });

  test('should verify photo input accepts image files', async ({ page }) => {
    const photoPath = path.resolve(testFiles.validPhoto);

    // Upload photo
    await formPage.uploadPhoto(photoPath);
    await page.waitForTimeout(500);

    // Verify file is uploaded
    const isUploaded = await formPage.isPhotoUploaded();
    expect(isUploaded).toBeTruthy();
  });

  test('should allow clearing uploaded CV', async ({ page }) => {
    const cvPath = path.resolve(testFiles.validCV);

    // Upload CV
    await formPage.uploadCV(cvPath);
    await page.waitForTimeout(500);

    // Verify uploaded
    let isUploaded = await formPage.isCVUploaded();
    expect(isUploaded).toBeTruthy();

    // Clear CV
    await formPage.removeCV();
    await page.waitForTimeout(500);

    // Verify cleared
    isUploaded = await formPage.isCVUploaded();
    expect(isUploaded).toBeFalsy();
  });

  test('should allow clearing uploaded photo', async ({ page }) => {
    const photoPath = path.resolve(testFiles.validPhoto);

    // Upload photo
    await formPage.uploadPhoto(photoPath);
    await page.waitForTimeout(500);

    // Verify uploaded
    let isUploaded = await formPage.isPhotoUploaded();
    expect(isUploaded).toBeTruthy();

    // Clear photo
    await formPage.removePhoto();
    await page.waitForTimeout(500);

    // Verify cleared
    isUploaded = await formPage.isPhotoUploaded();
    expect(isUploaded).toBeFalsy();
  });

  test('should upload passport (PDF file)', async ({ page }) => {
    const passportPath = path.resolve(testFiles.validPassport);

    // Upload passport
    await formPage.uploadPassport(passportPath);
    await page.waitForTimeout(500);

    // Verify passport is uploaded
    const isUploaded = await formPage.isPassportUploaded();
    expect(isUploaded).toBeTruthy();
  });

  test('should allow clearing uploaded passport', async ({ page }) => {
    const passportPath = path.resolve(testFiles.validPassport);

    // Upload passport
    await formPage.uploadPassport(passportPath);
    await page.waitForTimeout(500);

    // Verify uploaded
    let isUploaded = await formPage.isPassportUploaded();
    expect(isUploaded).toBeTruthy();

    // Clear passport
    await formPage.removePassport();
    await page.waitForTimeout(500);

    // Verify cleared
    isUploaded = await formPage.isPassportUploaded();
    expect(isUploaded).toBeFalsy();
  });

  test('should have correct accept attribute for CV input', async () => {
    // Verify that the accept attribute is set correctly for CV
    const acceptAttr = await formPage.cvFileInput.getAttribute('accept');
    expect(acceptAttr).toContain('.pdf');
  });

  test('should have correct accept attribute for photo input', async () => {
    // Verify that the accept attribute is set correctly for photo
    const acceptAttr = await formPage.photoFileInput.getAttribute('accept');
    expect(acceptAttr).toContain('.jpg');
    expect(acceptAttr).toContain('.png');
  });

  test('should handle multiple file uploads', async ({ page }) => {
    const cvPath = path.resolve(testFiles.validCV);
    const passportPath = path.resolve(testFiles.validPassport);
    const photoPath = path.resolve(testFiles.validPhoto);

    // Upload all three files
    await formPage.uploadCV(cvPath);
    await page.waitForTimeout(300);

    await formPage.uploadPassport(passportPath);
    await page.waitForTimeout(300);

    await formPage.uploadPhoto(photoPath);
    await page.waitForTimeout(300);

    // Verify all are uploaded
    const cvUploaded = await formPage.isCVUploaded();
    const passportUploaded = await formPage.isPassportUploaded();
    const photoUploaded = await formPage.isPhotoUploaded();

    expect(cvUploaded).toBeTruthy();
    expect(passportUploaded).toBeTruthy();
    expect(photoUploaded).toBeTruthy();
  });

  test('should replace CV when uploading new file', async ({ page }) => {
    const cvPath = path.resolve(testFiles.validCV);

    // Upload first CV
    await formPage.uploadCV(cvPath);
    await page.waitForTimeout(500);

    // Upload second CV (replace)
    await formPage.uploadCV(cvPath);
    await page.waitForTimeout(500);

    // Should still have CV uploaded
    const isUploaded = await formPage.isCVUploaded();
    expect(isUploaded).toBeTruthy();
  });

  test('should replace photo when uploading new file', async ({ page }) => {
    const photoPath = path.resolve(testFiles.validPhoto);

    // Upload first photo
    await formPage.uploadPhoto(photoPath);
    await page.waitForTimeout(500);

    // Upload second photo (replace)
    await formPage.uploadPhoto(photoPath);
    await page.waitForTimeout(500);

    // Should still have photo uploaded
    const isUploaded = await formPage.isPhotoUploaded();
    expect(isUploaded).toBeTruthy();
  });

  test('should have required attribute on CV and passport inputs', async () => {
    // Verify that CV and passport inputs are marked as required
    const cvRequired = await formPage.cvFileInput.getAttribute('required');
    const passportRequired = await formPage.passportFileInput.getAttribute('required');
    const photoRequired = await formPage.photoFileInput.getAttribute('required');

    // CV and passport should be required
    expect(cvRequired).not.toBeNull();
    expect(passportRequired).not.toBeNull();

    // Photo should be optional
    expect(photoRequired).toBeNull();
  });
});
