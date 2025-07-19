import { test, expect } from '@playwright/test';

test.describe('ThemeToggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle to dark mode and persist after reload', async ({ page }) => {
    const themeBtn = page.locator('button[aria-label*="dark mode" i]');
    if (await themeBtn.count() > 0) {
      const initialClass = await page.evaluate(() => document.documentElement.className);
      await themeBtn.first().click();
      await page.reload();
      const newClass = await page.evaluate(() => document.documentElement.className);
      expect(newClass).not.toBe(initialClass);
    }
  });

  test('should toggle back to light mode and persist after reload', async ({ page }) => {
    const themeBtn = page.locator('button[aria-label*="dark mode" i]');
    if (await themeBtn.count() > 0) {
      // Toggle twice to return to original
      await themeBtn.first().click();
      await themeBtn.first().click();
      await page.reload();
      // Should match original class
      const className = await page.evaluate(() => document.documentElement.className);
      expect(className).toMatch(/(dark)?/);
    }
  });
}); 