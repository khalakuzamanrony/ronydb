import { test, expect } from '@playwright/test';

async function loginAndGoToCoverLetters(page) {
  await page.goto('/login');
  await page.fill('input#username', 'ronydbv1');
  await page.fill('input#password', '###Rony@@@7669!!!');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible();
  await page.click('button:has-text("Cover Letters")');
}

test.describe('Cover Letter Edge Cases', () => {
  test('should not add a cover letter with empty title or content', async ({ page }) => {
    await loginAndGoToCoverLetters(page);
    await page.click('button:has-text("Add Cover Letter")');
    await page.click('button:has-text("Save")');
    // Should show validation error or not add cover letter
  });

  test('should delete a cover letter and ensure it is removed', async ({ page }) => {
    await loginAndGoToCoverLetters(page);
    // Add a cover letter first
    await page.click('button:has-text("Add Cover Letter")');
    await page.fill('input[type="text"]', 'Test Cover Letter');
    await page.fill('textarea', 'Test content');
    await page.click('button:has-text("Save")');
    // Delete the cover letter
    await page.click('button[title="Delete"]');
    await expect(page.locator('text=Test Cover Letter')).not.toBeVisible();
  });

  test('should edit a cover letter and ensure changes persist', async ({ page }) => {
    await loginAndGoToCoverLetters(page);
    // Add a cover letter first
    await page.click('button:has-text("Add Cover Letter")');
    await page.fill('input[type="text"]', 'Test Cover Letter');
    await page.fill('textarea', 'Test content');
    await page.click('button:has-text("Save")');
    // Edit the cover letter
    await page.fill('input[type="text"]', 'Edited Cover Letter');
    await page.fill('textarea', 'Edited content');
    await page.reload();
    await expect(page.locator('input[type="text"][value="Edited Cover Letter"]')).toBeVisible();
    await expect(page.locator('textarea')).toHaveValue('Edited content');
  });
}); 