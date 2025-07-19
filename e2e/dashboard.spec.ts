import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/login');
  await page.fill('input#username', 'ronydbv1');
  await page.fill('input#password', '###Rony@@@7669!!!');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible();
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display all main tabs', async ({ page }) => {
    const tabs = [
      'Basic Info', 'Contacts', 'My Tools', 'Work Experience',
      'Education', 'Skills', 'Certificates', 'Languages', 'Cover Letters'
    ];
    for (const tab of tabs) {
      await expect(page.locator(`button:has-text("${tab}")`)).toBeVisible();
    }
  });

  test('should switch between tabs', async ({ page }) => {
    await page.click('button:has-text("Skills")');
    await expect(page.locator('label:has-text("Technical Skills")')).toBeVisible();
    await page.click('button:has-text("Work Experience")');
    await expect(page.locator('label:has-text("Position")')).toBeVisible();
  });

  test('should add and delete a custom tab', async ({ page }) => {
    await page.click('button:has-text("Add Tab")');
    const newTab = page.locator('button:has-text("New Tab")');
    await expect(newTab).toBeVisible();
    // Delete the new tab
    await newTab.click({ button: 'right' }); // Simulate right-click or use delete button
    const deleteBtn = page.locator('button:has-text("Delete")');
    if (await deleteBtn.count() > 0) {
      await deleteBtn.click();
      await expect(newTab).not.toBeVisible();
    }
  });

  test('should edit a field and save', async ({ page }) => {
    await page.click('button:has-text("Basic Info")');
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('Test User');
    await expect(nameInput).toHaveValue('Test User');
    // Wait for auto-save feedback
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 4000 });
  });

  test('should upload a file', async ({ page }) => {
    await page.click('button:has-text("Basic Info")');
    const uploadBtn = page.locator('button:has-text("Upload")').first();
    await uploadBtn.setInputFiles('src/files/rony_profile_rec.png');
    // Check for preview or success
    await expect(page.locator('img[alt="Preview"]')).toBeVisible();
  });

  test('should drag and drop to reorder tabs', async ({ page }) => {
    // Simulate drag and drop (if supported by the UI)
    // This is a placeholder; actual selectors may differ
    const tab1 = page.locator('button:has-text("Basic Info")');
    const tab2 = page.locator('button:has-text("Contacts")');
    await tab1.dragTo(tab2);
    // Optionally check for order change
  });

  test('should logout and redirect to home', async ({ page }) => {
    await page.click('button:has-text("Logout")');
    await expect(page.locator('text=Rony.DB')).toBeVisible();
  });
}); 