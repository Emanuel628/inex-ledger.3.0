import { expect, test } from '@playwright/test'

test('auth smoke: register, onboard, sign out, and sign back in', async ({ page }) => {
  const uniqueId = Date.now()
  const email = `smoke-${uniqueId}@example.com`
  const password = 'Passw0rd!'
  const businessName = `Smoke Test Co ${uniqueId}`

  await page.goto('/')

  await page.getByRole('button', { name: 'Start free' }).first().click()
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()

  await page.getByLabel('First name').fill('Smoke')
  await page.getByLabel('Last name').fill('User')
  await page.getByLabel('Email').fill(email)
  await page.getByRole('textbox', { name: 'Password' }).fill(password)
  await page.getByLabel('I agree to the Terms and Privacy Policy.').check()
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible()
  await page.getByRole('button', { name: 'Verify email' }).click()

  await expect(page.getByRole('heading', { name: 'Business basics' })).toBeVisible()
  await page.getByLabel('Business name').fill(businessName)
  await page.getByRole('button', { name: 'Enter dashboard' }).click()

  await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible()
  await expect(page.getByRole('button', { name: businessName })).toBeVisible()

  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()

  await expect(page.getByRole('heading', { name: 'Clean books without the accounting headache.' })).toBeVisible()

  await page.getByRole('button', { name: 'Sign in' }).first().click()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await page.getByLabel('Email').fill(email)
  await page.getByRole('textbox', { name: 'Password' }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible()
  await expect(page.getByRole('button', { name: businessName })).toBeVisible()
})
