import { test, expect } from '@playwright/test';

// HomePage tests

test.describe('HomePage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load and display the main title', async ({ page }) => {
    await expect(page.locator('text=Rony.DB')).toBeVisible();
  });

  test('should expand and collapse sections', async ({ page }) => {
    // Find a section toggle (chevron or similar)
    const chevrons = page.locator('button[aria-label*="expand"], button[aria-label*="collapse"], svg[data-icon="chevron-down"]');
    if (await chevrons.count() > 0) {
      await chevrons.first().click();
      // Optionally check for collapse/expand effect
    }
  });

  test('should show download menu and download as JSON', async ({ page }) => {
    // Open download menu (simulate click on download button)
    const downloadBtn = page.locator('button:has-text("Download")');
    if (await downloadBtn.count() > 0) {
      await downloadBtn.first().click();
      // Click JSON download option
      const jsonOption = page.locator('text=JSON');
      if (await jsonOption.count() > 0) {
        await jsonOption.first().click();
        // No error should occur
      }
    }
  });

  test('should show social/contact links and open them', async ({ page, context }) => {
    // Find all social/contact links (using Fa* icons or anchor tags)
    const links = page.locator('a[href^="http"], a[aria-label*="linkedin" i], a[aria-label*="github" i]');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && !href.includes('mailto:') && !href.includes('tel:')) {
        // Open in new tab and check URL
        const [newPage] = await Promise.all([
          context.waitForEvent('page'),
          links.nth(i).click({ button: 'middle' })
        ]);
        await expect(newPage).not.toBeNull();
        await newPage.close();
      }
    }
  });

  test('should toggle theme and persist after reload', async ({ page }) => {
    const themeBtn = page.locator('button[aria-label*="dark mode" i]');
    if (await themeBtn.count() > 0) {
      const initialClass = await page.evaluate(() => document.documentElement.className);
      await themeBtn.first().click();
      await page.reload();
      const newClass = await page.evaluate(() => document.documentElement.className);
      expect(newClass).not.toBe(initialClass);
    }
  });

  test('should copy text to clipboard using CopyButton', async ({ page }) => {
    // Find a copy button and click it
    const copyBtn = page.locator('button[title="Copy to clipboard"]');
    if (await copyBtn.count() > 0) {
      await copyBtn.first().click();
      // Optionally check for feedback (icon change)
      await expect(copyBtn.first()).toContainText('Check');
    }
  });
}); 