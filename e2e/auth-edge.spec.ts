import { test, expect } from '@playwright/test';

test.describe('Session/Authentication Edge Cases', () => {
  test('should redirect to login after clearing localStorage', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#username', 'ronydbv1');
    await page.fill('input#password', '###Rony@@@7669!!!');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard Login')).toBeVisible();
  });

  test('should not allow dashboard access after tampering with localStorage', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#username', 'ronydbv1');
    await page.fill('input#password', '###Rony@@@7669!!!');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await page.evaluate(() => localStorage.setItem('isAuthenticated', 'false'));
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard Login')).toBeVisible();
  });

  test('should show error after multiple failed login attempts', async ({ page }) => {
    await page.goto('/login');
    for (let i = 0; i < 5; i++) {
      await page.fill('input#username', 'wronguser');
      await page.fill('input#password', 'wrongpass');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    }
    // Optionally check for lockout or escalation
  });
}); 