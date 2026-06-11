import { test, expect } from '@playwright/test'

test.describe('Nomad UI', () => {
  test('app loads and shows login page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Nomad')).toBeVisible()
    await expect(page.getByLabel('ACL Token')).toBeVisible()
  })

  test('login flow with token', async ({ page }) => {
    await page.goto('/')
    const tokenInput = page.getByLabel('ACL Token')
    await tokenInput.fill('test-management-token')
    await page.getByRole('button', { name: /Sign In with Token/i }).click()
    await expect(page).toHaveURL(/\/jobs/)
  })

  test('navigation to jobs page', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('ACL Token').fill('test-management-token')
    await page.getByRole('button', { name: /Sign In with Token/i }).click()
    await expect(page.getByText('Jobs')).toBeVisible()
  })

  test('job list displays after login', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('ACL Token').fill('test-management-token')
    await page.getByRole('button', { name: /Sign In with Token/i }).click()
    await page.waitForURL(/\/jobs/)
    await expect(page.getByText('Manage and monitor Nomad jobs')).toBeVisible()
  })
})
