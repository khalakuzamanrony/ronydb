import { test, expect } from '@playwright/test';

test.describe('LoginPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('text=Dashboard Login')).toBeVisible();
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.fill('input#username', 'wronguser');
    await page.fill('input#password', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
    await page.fill('input#username', 'ronydbv1');
    await page.fill('input#password', '###Rony@@@7669!!!');
    await page.click('button[type="submit"]');
    // Should redirect to dashboard (check for dashboard content)
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should login with demo credentials and redirect to dashboard', async ({ page }) => {
    await page.fill('input#username', 'admin');
    await page.fill('input#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
}); 