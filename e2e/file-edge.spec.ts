import { test, expect } from '@playwright/test';

async function loginAndGoToFileUpload(page) {
  await page.goto('/login');
  await page.fill('input#username', 'ronydbv1');
  await page.fill('input#password', '###Rony@@@7669!!!');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible();
  await page.click('button:has-text("Basic Info")');
}

test.describe('File Upload/Download Edge Cases', () => {
  test('should show error on very large file upload', async ({ page }) => {
    await loginAndGoToFileUpload(page);
    const uploadBtn = page.locator('button:has-text("Upload")').first();
    // Simulate large file (if possible, otherwise skip)
    // await uploadBtn.setInputFiles('path/to/largefile.bin');
    // Should show error or timeout
  });

  test('should fail to download after file is deleted', async ({ page }) => {
    await page.goto('/');
    // Simulate download, then delete file from storage, then try download again
    // This requires backend or storage mocking, so placeholder for now
  });

  test('should show error on malformed download URL', async ({ page }) => {
    await page.goto('/');
    // Simulate clicking a download button with a malformed URL
    // For now, this is a placeholder
    // await page.click('button:has-text("Download Malformed URL")');
    // await expect(page.locator('text=Download failed')).toBeVisible();
  });
}); 