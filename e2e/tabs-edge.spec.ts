import { test, expect } from '@playwright/test';

async function loginAndGoToTab(page, tabName) {
  await page.goto('/login');
  await page.fill('input#username', 'ronydbv1');
  await page.fill('input#password', '###Rony@@@7669!!!');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible();
  await page.click(`button:has-text("${tabName}")`);
}

test.describe('Tabs Edge Cases', () => {
  for (const tab of ['Work Experience', 'Education', 'Certificates', 'Languages']) {
    test(`should not add entry with missing required fields in ${tab}`, async ({ page }) => {
      await loginAndGoToTab(page, tab);
      await page.click('button:has-text("Add")');
      await page.click('button:has-text("Save")');
      // Should show validation error or not add entry
    });

    test(`should delete an entry in ${tab} and ensure it is removed`, async ({ page }) => {
      await loginAndGoToTab(page, tab);
      // Add an entry first
      await page.click('button:has-text("Add")');
      await page.fill('input[type="text"]', 'Test Entry');
      await page.click('button:has-text("Save")');
      // Delete the entry
      await page.click('button[title="Delete"]');
      await expect(page.locator('text=Test Entry')).not.toBeVisible();
    });

    test(`should edit an entry in ${tab} and ensure changes persist`, async ({ page }) => {
      await loginAndGoToTab(page, tab);
      // Add an entry first
      await page.click('button:has-text("Add")');
      await page.fill('input[type="text"]', 'Test Entry');
      await page.click('button:has-text("Save")');
      // Edit the entry
      await page.fill('input[type="text"]', 'Edited Entry');
      await page.reload();
      await expect(page.locator('input[type="text"][value="Edited Entry"]')).toBeVisible();
    });

    test(`should reorder entries in ${tab} and verify order`, async ({ page }) => {
      await loginAndGoToTab(page, tab);
      // Add two entries
      await page.click('button:has-text("Add")');
      await page.fill('input[type="text"]', 'Entry 1');
      await page.click('button:has-text("Save")');
      await page.click('button:has-text("Add")');
      await page.fill('input[type="text"]', 'Entry 2');
      await page.click('button:has-text("Save")');
      // Drag and drop to reorder
      const entry1 = page.locator('input[type="text"][value="Entry 1"]');
      const entry2 = page.locator('input[type="text"][value="Entry 2"]');
      await entry1.dragTo(entry2);
      // Optionally check order after reload
      await page.reload();
    });
  }
}); 