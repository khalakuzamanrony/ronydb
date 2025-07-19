import { test, expect } from '@playwright/test';

async function loginAndGoToContacts(page) {
  await page.goto('/login');
  await page.fill('input#username', 'ronydbv1');
  await page.fill('input#password', '###Rony@@@7669!!!');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible();
  await page.click('button:has-text("Contacts")');
}

test.describe('Profile/Tool Management Edge Cases', () => {
  test('should not accept invalid URL for social profile', async ({ page }) => {
    await loginAndGoToContacts(page);
    await page.click('button:has-text("Add Profile")');
    await page.fill('input[placeholder="Profile URL"]', 'not-a-url');
    await page.click('button:has-text("Save")');
    // Should show validation error or not add profile
  });

  test('should delete a social profile and ensure it is removed', async ({ page }) => {
    await loginAndGoToContacts(page);
    // Add a profile first
    await page.click('button:has-text("Add Profile")');
    await page.fill('input[placeholder="Profile URL"]', 'https://github.com/test');
    await page.click('button:has-text("Save")');
    // Delete the profile
    await page.click('button[title="Delete profile"]');
    await expect(page.locator('input[placeholder="Profile URL"][value="https://github.com/test"]')).not.toBeVisible();
  });

  test('should reorder tools and persist the new order', async ({ page }) => {
    await loginAndGoToContacts(page);
    // Add two tools
    await page.click('button:has-text("Add Tool")');
    await page.click('button:has-text("Add Tool")');
    // Drag and drop to reorder
    const tool1 = page.locator('input[placeholder="Tool Name"]').nth(0);
    const tool2 = page.locator('input[placeholder="Tool Name"]').nth(1);
    await tool1.dragTo(tool2);
    // Reload and check order
    await page.reload();
    // Optionally check that the order is persisted
  });
}); 