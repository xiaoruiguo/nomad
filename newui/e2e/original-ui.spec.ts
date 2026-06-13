import { test, expect } from '@playwright/test';

test('original UI loads correctly', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('http://192.168.36.213:8080/ui/', { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(10000);

  const title = await page.title();
  console.log('Title:', title);
  console.log('URL:', page.url());
  console.log('Console errors:', errors.length > 0 ? errors.join('\n') : 'none');

  const bodyText = await page.locator('body').innerText();
  console.log('Body text (first 500 chars):', bodyText.substring(0, 500));

  await page.screenshot({ path: 'test-original-ui.png' });
});

test('newui loads correctly', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('http://192.168.36.213:8080/newui/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log('Title:', title);
  console.log('URL:', page.url());
  console.log('Console errors:', errors.length > 0 ? errors.join('\n') : 'none');

  await page.screenshot({ path: 'test-newui.png' });
});

test('API gateway works', async ({ request }) => {
  const r1 = await request.get('http://192.168.36.213:8080/v1/status/leader');
  console.log('/v1/status/leader:', r1.status(), await r1.text());

  const r2 = await request.get('http://192.168.36.213:8080/v1/regions');
  console.log('/v1/regions:', r2.status(), await r2.text());

  expect(r1.status()).toBe(200);
  expect(r2.status()).toBe(200);
});
