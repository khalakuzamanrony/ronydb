import { test, expect } from '@playwright/test';

test.describe('Google Authentication', () => {
  test('should redirect to login page when accessing protected routes', async ({ page }) => {
    // Try to access the dashboard directly
    await page.goto('/alutila999');
    
    // Should be redirected to login page
    await expect(page.locator('text=Portal Login')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible();
  });

  test('should redirect to login page when accessing homepage', async ({ page }) => {
    // Try to access the homepage directly
    await page.goto('/');
    
    // Should be redirected to login page
    await expect(page.locator('text=Portal Login')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible();
  });

  // Note: Testing actual Google OAuth requires special setup with mock OAuth providers
  // This is a placeholder for manual testing or more advanced test setup
  test.skip('should allow login with authorized Google account', async ({ page }) => {
    await page.goto('/login');
    
    // Click the Google sign-in button
    await page.click('button:has-text("Sign in with Google")');
    
    // This would normally redirect to Google's OAuth page
    // For testing, you would need to mock this or use a test account
    
    // After successful login, should be redirected to dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});