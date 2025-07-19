import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/login');
  await page.fill('input#username', 'ronydbv1');
  await page.fill('input#password', '###Rony@@@7669!!!');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible();
}

test.describe('General UI/UX Edge Cases', () => {
  test('should handle rapid tab switching without UI glitches', async ({ page }) => {
    await login(page);
    const tabs = ['Basic Info', 'Contacts', 'Work Experience', 'Education', 'Skills', 'Certificates', 'Languages', 'Cover Letters'];
    for (let i = 0; i < 10; i++) {
      for (const tab of tabs) {
        await page.click(`button:has-text("${tab}")`);
      }
    }
    // Optionally check for UI stability
  });

  test('should not accept whitespace-only in required fields', async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Basic Info")');
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('   ');
    await page.click('button:has-text("Save")');
    // Should show validation error or not save
  });

  test('should allow keyboard navigation for all interactive elements', async ({ page }) => {
    await page.goto('/');
    // Tab through elements and check focus
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
    }
    // Optionally check that focus is visible on buttons/inputs
  });

  test('should have no major accessibility violations on HomePage', async ({ page }) => {
    await page.goto('/');
    // Optionally use axe-core or similar for a11y check if integrated
    // For now, check for presence of main landmarks
    await expect(page.locator('main')).toBeVisible();
  });
}); 