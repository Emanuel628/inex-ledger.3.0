import { expect, type Page, test } from '@playwright/test'

const sidebarPages = [
  { nav: 'Transactions', heading: 'Transactions' },
  { nav: 'Accounts', heading: 'Accounts' },
  { nav: 'Categories', heading: 'Tax Categories' },
  { nav: 'Receipts', heading: 'Receipts' },
  { nav: 'Mileage', heading: 'Mileage' },
  { nav: 'Exports', heading: 'Exports' },
  { nav: 'Invoices', heading: 'Invoices' },
  { nav: 'Analytics', heading: 'Analytics' },
  { nav: 'Messages', heading: 'Messages' },
] as const

test('debug sweep: core app pages do not crash and primary controls open', async ({ page }) => {
  const runtimeIssues: string[] = []
  page.on('pageerror', (error) => runtimeIssues.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeIssues.push(`console error: ${message.text()}`)
    }
  })

  const uniqueId = Date.now()
  const email = `debug-sweep-${uniqueId}@example.com`
  const password = 'Passw0rd!'
  const businessName = `Debug Sweep Co ${uniqueId}`

  await createSignedInBusiness(page, { email, password, businessName })
  await expectClean(page, runtimeIssues)

  for (const { nav, heading } of sidebarPages) {
    await page.getByRole('button', { name: nav, exact: true }).click()
    await expect(page.getByRole('heading', { name: heading, level: 1, exact: true })).toBeVisible()
    await expectClean(page, runtimeIssues)
  }

  await page.getByRole('button', { name: 'Transactions' }).click()
  await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible()
  await openAndCloseDialog(page, 'Add transaction', 'Close drawer')
  await page.getByRole('button', { name: /Actions for Stripe payout/ }).click()
  await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
  await page.getByRole('button', { name: 'View details' }).click()
  await expect(page.getByRole('dialog', { name: 'Stripe payout' })).toBeVisible()
  await page.getByRole('button', { name: 'Close transaction details' }).click()
  await openAndCloseDialog(page, 'More filters', 'Close filters')
  await page.getByRole('button', { name: 'Notifications' }).click()
  await expect(page.getByRole('dialog', { name: 'Notifications' })).toBeVisible()
  await page.getByRole('button', { name: 'Close notifications' }).click()
  await expectClean(page, runtimeIssues)

  await page.getByRole('button', { name: 'Accounts' }).click()
  await openAndCloseDialog(page, 'Add account', 'Close drawer')
  await expectClean(page, runtimeIssues)

  await page.getByRole('button', { name: 'Receipts' }).click()
  await openAndCloseDialog(page, 'Upload receipt', 'Close drawer')
  await expectClean(page, runtimeIssues)

  await page.getByRole('button', { name: 'Mileage' }).click()
  await openAndCloseDialog(page, 'Add activity', 'Close drawer')
  await expectClean(page, runtimeIssues)

  await page.getByRole('button', { name: 'Exports' }).click()
  await page.getByRole('button', { name: 'Generate PDF' }).first().click()
  await expect(page.getByRole('dialog', { name: 'Protected PDF export' })).toBeVisible()
  await page.getByRole('button', { name: 'Close PDF export modal' }).click()
  await expectClean(page, runtimeIssues)

  await page.getByRole('button', { name: 'Invoices' }).click()
  await openAndCloseDialog(page, 'New invoice', 'Close drawer')
  await expectClean(page, runtimeIssues)

  await page.getByRole('button', { name: 'Messages' }).click()
  await page.getByRole('button', { name: 'Compose' }).click()
  await expect(page.getByRole('dialog', { name: 'Compose message' })).toBeVisible()
  await page.getByRole('button', { name: 'Close compose' }).click()
  await page.getByRole('button', { name: 'Request support' }).click()
  await expect(page.getByRole('dialog', { name: 'Request support' })).toBeVisible()
  await page.getByRole('button', { name: 'Close compose' }).click()
  await page.getByRole('button', { name: /Alex Chen/ }).click()
  await expect(page.getByRole('dialog', { name: 'Re: Website build invoice' })).toBeVisible()
  await page.getByRole('button', { name: 'Close message' }).click()
  await expectClean(page, runtimeIssues)

  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await page.getByRole('button', { name: 'Billing' }).click()
  await page.getByRole('button', { name: 'Open billing' }).click()
  await expect(page.getByRole('heading', { name: 'Billing' })).toBeVisible()
  await page.getByRole('button', { name: 'Manage plan' }).click()
  await expect(page.getByRole('heading', { name: 'Subscription' })).toBeVisible()
  await page.getByRole('button', { name: 'Yearly' }).click()
  await expect(page.getByText('$122.40/yr')).toBeVisible()
  await page.getByRole('button', { name: 'Back to settings' }).click()
  await page.getByRole('button', { name: 'Security' }).click()
  await page.getByRole('button', { name: 'Review sessions' }).click()
  await expect(page.getByRole('heading', { name: 'Sessions' })).toBeVisible()
  await expectClean(page, runtimeIssues)

  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(page.getByRole('heading', { name: 'Clean books without the accounting headache.' })).toBeVisible()

  for (const { nav, heading } of [
    { nav: 'Pricing', heading: 'Start simple. Upgrade when the records matter.' },
    { nav: 'Legal', heading: 'Legal and policies' },
    { nav: 'Privacy', heading: 'Privacy Policy' },
    { nav: 'Terms', heading: 'Terms of Service' },
  ] as const) {
    await page.getByRole('button', { name: nav, exact: true }).click()
    await expect(page.getByRole('heading', { name: heading, level: 1, exact: true })).toBeVisible()
    await expectClean(page, runtimeIssues)
  }
})

async function createSignedInBusiness(
  page: Page,
  input: { email: string; password: string; businessName: string },
) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start free' }).first().click()
  await page.getByLabel('First name').fill('Debug')
  await page.getByLabel('Last name').fill('User')
  await page.getByLabel('Email').fill(input.email)
  await page.getByRole('textbox', { name: 'Password' }).fill(input.password)
  await page.getByLabel('I agree to the Terms and Privacy Policy.').check()
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.getByRole('button', { name: 'Verify email' }).click()
  await page.getByLabel('Business name').fill(input.businessName)
  await page.getByRole('button', { name: 'Enter dashboard' }).click()
  await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible()
}

async function openAndCloseDialog(page: Page, dialogName: string, closeButtonName: string) {
  await page.getByRole('button', { name: dialogName }).click()
  await expect(page.getByRole('dialog', { name: dialogName })).toBeVisible()
  await page.getByRole('button', { name: closeButtonName }).click()
}

async function expectClean(page: Page, runtimeIssues: string[]) {
  await expect(page.locator('body')).not.toContainText('Application error')
  expect(runtimeIssues).toEqual([])
}
