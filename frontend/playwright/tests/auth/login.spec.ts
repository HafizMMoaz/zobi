
import { test, expect } from '@playwright/test';
import { AuthPage } from '../../pages/AuthPage';
import { URL } from '../../utils/urls';
import { TIMEOUT } from '../../utils/constants';

// Test credentials - can be overridden via environment variables
const adminUsername = process.env.PLAYWRIGHT_ADMIN_USERNAME || 'admin';
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD || 'general';

/**
 * Auth/login tests use per-test navigation via beforeEach.
 * Each test starts fresh on the login page without global authentication.
 * This follows the Cypress pattern for auth testing - simple and isolated.
 */

let authPage: AuthPage;

test.beforeEach(async ({ page }) => {
  // Navigate to login page before each test (ensures clean state)
  authPage = new AuthPage(page);
  await authPage.goto();
  await authPage.waitForLoginForm();
});

test('should redirect to login with incorrect username and password', async ({
  page,
}) => {
  // The form submission is async (ZobiClient.postForm uses ensureAuth)
  // so listen for the page reload before triggering the login
  await Promise.all([
    page.waitForEvent('load', { timeout: TIMEOUT.PAGE_LOAD }),
    authPage.loginWithCredentials('wronguser', 'wrongpassword'),
  ]);

  // After the reload, wait for the React login form to render
  await authPage.waitForLoginForm();

  // Verify we stay on login page
  expect(page.url()).toContain(URL.LOGIN);

  // Verify error message is shown
  const hasError = await authPage.hasLoginError();
  expect(hasError).toBe(true);
});

test('should login with correct username and password', async ({ page }) => {
  // Login with correct credentials
  await authPage.loginWithCredentials(adminUsername, adminPassword);

  // Use waitForLoginSuccess (proven in global-setup) — guards against race
  // conditions with cookie check before falling back to response interception
  await authPage.waitForLoginSuccess({ timeout: TIMEOUT.PAGE_LOAD });

  // Wait for successful redirect to welcome page
  await page.waitForURL(url => url.pathname.endsWith(URL.WELCOME), {
    timeout: TIMEOUT.PAGE_LOAD,
  });

  // Verify specific session cookie exists
  const sessionCookie = await authPage.getSessionCookie();
  expect(sessionCookie).not.toBeNull();
  expect(sessionCookie?.value).toBeTruthy();
});
