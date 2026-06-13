import { test, expect } from '@playwright/test';

test('naomad ui', async ({ page }) => {
  await page.goto('http://192.168.36.212:4646/ui');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Nomad/);
});

test('naomad newui', async ({ page }) => {
  await page.goto('http://192.168.36.213:4646/ui');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/ui/);
});

// test('get started link', async ({ page }) => {
//   await page.goto('http://192.168.36.212:4646/ui');

  // Click the get started link.
  // await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  // await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
