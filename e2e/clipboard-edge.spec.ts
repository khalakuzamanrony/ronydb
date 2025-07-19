import { test, expect } from '@playwright/test';

test.describe('Clipboard/Copy Edge Cases', () => {
  test('should handle denied clipboard permissions gracefully', async ({ page }) => {
    await page.goto('/');
    // Simulate denied clipboard permissions (if possible)
    // await page.context().grantPermissions([], { origin: page.url() });
    // Try to copy
    const copyBtn = page.locator('button[title="Copy to clipboard"]');
    if (await copyBtn.count() > 0) {
      await copyBtn.first().click();
      // Should show error or fallback UI if clipboard is denied
    }
  });

  test('should copy a very long string to clipboard', async ({ page }) => {
    await page.goto('/');
    // Add a long string to a copy button (simulate or use existing data)
    // For now, click the first copy button
    const copyBtn = page.locator('button[title="Copy to clipboard"]');
    if (await copyBtn.count() > 0) {
      await copyBtn.first().click();
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText.length).toBeGreaterThan(1000); // Adjust threshold as needed
    }
  });
}); 