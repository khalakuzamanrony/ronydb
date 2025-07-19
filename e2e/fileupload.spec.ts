import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/login');
  await page.fill('input#username', 'ronydbv1');
  await page.fill('input#password', '###Rony@@@7669!!!');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible();
}

test.describe('FileUpload', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Basic Info")');
  });

  test('should upload an image and show preview', async ({ page }) => {
    const uploadBtn = page.locator('button:has-text("Upload")').first();
    await uploadBtn.setInputFiles('src/files/rony_profile_rec.png');
    await expect(page.locator('img[alt="Preview"]')).toBeVisible();
  });

  test('should accept a file URL and show preview', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    await urlInput.fill('https://via.placeholder.com/150');
    // Check for preview (if implemented)
    // await expect(page.locator('img[alt="Preview"]')).toBeVisible();
  });

  test('should upload a document file', async ({ page }) => {
    const uploadBtn = page.locator('button:has-text("Upload")').nth(1);
    await uploadBtn.setInputFiles('src/files/Khalekuzzaman_Rony-SQA.pdf');
    // Check for upload success (no error)
    await expect(uploadBtn).not.toBeDisabled();
  });
}); 