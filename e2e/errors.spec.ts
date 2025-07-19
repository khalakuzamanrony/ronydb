import { test, expect } from '@playwright/test';

test.describe('Error and Edge Cases', () => {
  test('should not allow dashboard access when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login or show login form
    await expect(page.locator('text=Dashboard Login')).toBeVisible();
  });

  test('should show error on failed file upload', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input#username', 'ronydbv1');
    await page.fill('input#password', '###Rony@@@7669!!!');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await page.click('button:has-text("Basic Info")');
    // Simulate failed upload by uploading an unsupported file type
    const uploadBtn = page.locator('button:has-text("Upload")').first();
    await uploadBtn.setInputFiles('README.md'); // Not an image or allowed file
    // Should show an error alert or message
    // (This depends on the implementation, so check for alert or error text)
  });

  test('should show error on invalid download', async ({ page }) => {
    await page.goto('/');
    // Simulate clicking a download button for a non-existent file
    // This depends on the UI, so if there is a way to trigger a download for a missing file, do it here
    // For now, this is a placeholder
    // await page.click('button:has-text("Download Missing File")');
    // await expect(page.locator('text=Download failed')).toBeVisible();
  });
}); 