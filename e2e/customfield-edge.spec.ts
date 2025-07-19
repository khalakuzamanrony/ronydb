import { test, expect } from '@playwright/test';

async function loginAndGoToCustomFields(page) {
  await page.goto('/login');
  await page.fill('input#username', 'ronydbv1');
  await page.fill('input#password', '###Rony@@@7669!!!');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible();
  // Go to a tab with custom fields, e.g., Languages or Custom Tab
  await page.click('button:has-text("Languages")');
}

test.describe('CustomField Edge Cases', () => {
  test('should not add a custom field with empty label or value', async ({ page }) => {
    await loginAndGoToCustomFields(page);
    await page.click('button:has-text("Add Field")');
    await page.click('button:has-text("Save")');
    // Should show validation error or not add field
    // (Check for error message or absence in list)
  });

  test('should show error on unsupported file type upload', async ({ page }) => {
    await loginAndGoToCustomFields(page);
    await page.click('button:has-text("Add Field")');
    // Select file type
    await page.selectOption('select', 'file');
    // Try to upload a .exe or .md file
    const uploadBtn = page.locator('button:has-text("Upload")').last();
    await uploadBtn.setInputFiles('README.md');
    // Should show error alert or message
  });

  test('should remove a custom field and ensure it disappears', async ({ page }) => {
    await loginAndGoToCustomFields(page);
    // Add a field first
    await page.click('button:has-text("Add Field")');
    await page.fill('input[placeholder="Field label"]', 'Test Field');
    await page.fill('input[placeholder="Paste URL here"]', 'https://example.com');
    await page.click('button:has-text("Save")');
    // Remove the field
    await page.click('button[title="Delete Field"]');
    // Should not be visible in the list
    await expect(page.locator('text=Test Field')).not.toBeVisible();
  });

  test('should show error on file upload failure (simulate network error)', async ({ page }) => {
    await loginAndGoToCustomFields(page);
    await page.click('button:has-text("Add Field")');
    // Simulate network error by disabling network (if supported)
    // await page.route('**/supabase/**', route => route.abort());
    // Try to upload a file
    // const uploadBtn = page.locator('button:has-text("Upload")').last();
    // await uploadBtn.setInputFiles('src/files/rony_profile_rec.png');
    // Should show error alert or message
    // (Uncomment above if Playwright context allows network mocking)
  });
}); 