import { expect, test } from '@playwright/test';

const successResponse = { accessToken: 'legacy-e2e-token', id: 'user-42' };

test.beforeEach(async ({ page }) => {
  await page.route('http://api.test/**', async route => {
    const { pathname } = new URL(route.request().url());

    if (pathname === '/api/auth/login' && route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as { readonly username?: string } | null;
      if (body?.username === 'wrong-user') {
        await route.fulfill({
          status: 401,
          json: {
            error: { code: 'invalid_credentials', message: 'Invalid username or password.' },
          },
        });
        return;
      }

      await route.fulfill({ json: successResponse });
      return;
    }

    if (pathname === '/api/user/profile') {
      await route.fulfill({ json: { username: 'fixture-user' } });
      return;
    }

    await route.fulfill({ status: 404, json: { error: { message: 'Unexpected API request' } } });
  });
});

test('redirects protected navigation to login, persists the legacy token, and returns', async ({
  page,
}) => {
  await page.goto('/#/user/profile');

  await expect(page).toHaveURL(/#\/auth\/login\?redirect=%2Fuser%2Fprofile$/);
  await page.getByLabel('Username').fill('fixture-user');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/#\/user\/profile$/);
  await expect(page.getByText('Hello')).toContainText('fixture-user');
  await expect(page.evaluate(() => window.localStorage.getItem('TOKENS'))).resolves.toBe(
    JSON.stringify(successResponse.accessToken),
  );
});

test('shows a safe error for failed login', async ({ page }) => {
  await page.goto('/#/auth/login');

  await page.getByLabel('Username').fill('wrong-user');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByText('Invalid username or password.')).toBeVisible();
  await expect(page).toHaveURL(/#\/auth\/login$/);
});
