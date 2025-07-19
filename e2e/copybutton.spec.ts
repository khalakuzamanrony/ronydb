import { test, expect } from '@playwright/test';

test.describe('CopyButton', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should copy text to clipboard and show feedback', async ({ page }) => {
    const copyBtn = page.locator('button[title="Copy to clipboard"]');
    if (await copyBtn.count() > 0) {
      await copyBtn.first().click();
      // Optionally check for feedback (icon change)
      await expect(copyBtn.first()).toContainText('Check');
      // Check clipboard content (if Playwright browser supports it)
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText.length).toBeGreaterThan(0);
    }
  });
}); 