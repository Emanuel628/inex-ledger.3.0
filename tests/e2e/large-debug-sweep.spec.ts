import { expect, type Page, test } from '@playwright/test'

type RuntimeIssue = string

const corePages = [
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

const publicPages = [
  { nav: 'Pricing', heading: 'Start simple. Upgrade when the records matter.' },
  { nav: 'Legal', heading: 'Legal and policies' },
  { nav: 'Privacy', heading: 'Privacy Policy' },
  { nav: 'Terms', heading: 'Terms of Service' },
] as const

test('large debug: public and auth flows report useful errors and stay stable', async ({ page }) => {
  const issues = watchRuntimeIssues(page)

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Clean books without the accounting headache.' })).toBeVisible()
  await expectUsableViewport(page)

  for (const { nav, heading } of publicPages) {
    await page.getByRole('button', { name: nav, exact: true }).click()
    await expect(page.getByRole('heading', { name: heading, level: 1, exact: true })).toBeVisible()
    await expectUsableViewport(page)
    await expectClean(page, issues)
  }

  await page.getByRole('button', { name: 'Sign in' }).first().click()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toContainText('Invalid email or password.')
  await expectClean(page, issues)

  await page.getByRole('button', { name: 'Forgot password?' }).click()
  await expect(page.getByRole('heading', { name: 'Forgot password' })).toBeVisible()
  await page.getByLabel('Email').fill('missing@example.com')
  await page.getByRole('button', { name: 'Send reset code' }).click()
  await expect(page.getByRole('status')).toContainText('If the account exists')
  await page.getByRole('button', { name: 'I have a code' }).click()
  await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible()
  await page.getByLabel('Email').fill('missing@example.com')
  await page.getByLabel('Reset code').fill('123456')
  await page.getByLabel('New password').fill('Passw0rd!')
  await page.getByLabel('Confirm password').fill('Different1!')
  await page.getByRole('button', { name: 'Update password' }).click()
  await expect(page.getByRole('alert')).toContainText('Passwords do not match.')
  await expectClean(page, issues)

  await page.getByRole('button', { name: 'InEx Ledger' }).click()
  await page.getByRole('button', { name: 'Start free' }).first().click()
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('alert')).toContainText('Enter a name and valid email.')
  await expectClean(page, issues)
})

test('large debug: desktop app interactions across core pages stay stable', async ({ page }) => {
  const issues = watchRuntimeIssues(page)
  const unique = Date.now()
  await createSignedInBusiness(page, {
    email: `large-debug-${unique}@example.com`,
    password: 'Passw0rd!',
    businessName: `Large Debug Co ${unique}`,
  })

  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(page.locator('.ledger-shell')).toHaveClass(/sidebar-is-collapsed/)
  await page.getByRole('button', { name: 'Expand sidebar' }).click()
  await expect(page.locator('.ledger-shell')).not.toHaveClass(/sidebar-is-collapsed/)

  for (const { nav, heading } of corePages) {
    await page.getByRole('button', { name: nav, exact: true }).click()
    await expect(page.getByRole('heading', { name: heading, level: 1, exact: true })).toBeVisible()
    await expectUsableViewport(page)
    await expectClean(page, issues)
  }

  await page.getByRole('button', { name: 'Transactions', exact: true }).click()
  await openDialogFromButton(page, 'Add transaction')
  await page.getByRole('button', { name: 'Save transaction' }).click()
  await expect(page.getByRole('alert')).toContainText('Add a description and a valid amount.')
  await page.getByRole('button', { name: 'Expense' }).click()
  await page.getByLabel('Amount').fill('123.45')
  await page.getByLabel('Description').fill('Debug expense')
  await page.getByLabel('Category').selectOption('Office')
  await page.getByLabel('Account').selectOption('Checking')
  await page.getByRole('button', { name: 'Save transaction' }).click()
  await expect(page.getByText('Debug expense')).toBeVisible()
  await page.locator('input[type="file"][accept=".csv,text/csv"]').setInputFiles({
    name: 'transactions.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('date,description,amount,category,account\n2026-07-25,CSV Debug Income,55.25,Income,Checking\n'),
  })
  await expect(page.getByText('CSV Debug Income')).toBeVisible()
  await page.getByRole('button', { name: 'More filters' }).click()
  await page.getByLabel('Status').selectOption('Needs attention')
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await expectClean(page, issues)

  await page.getByRole('button', { name: 'Accounts', exact: true }).click()
  await openDialogFromButton(page, 'Add account')
  await expect(page.getByRole('button', { name: /Connect with Plaid/ })).toBeVisible()
  await page.getByRole('button', { name: 'Close drawer' }).click()

  await page.getByRole('button', { name: 'Categories', exact: true }).click()
  await openDialogFromButton(page, 'Add category')
  await page.getByRole('button', { name: 'Close drawer' }).click()

  await page.getByRole('button', { name: 'Receipts', exact: true }).click()
  await openDialogFromButton(page, 'Upload receipt')
  await expect(page.getByText('Drag and drop receipt')).toBeVisible()
  await page.getByRole('button', { name: 'Close drawer' }).click()

  await page.getByRole('button', { name: 'Mileage', exact: true }).click()
  await page.getByRole('button', { name: 'Expense' }).first().click()
  await expect(page.getByRole('button', { name: 'Add expense' })).toBeVisible()
  await openDialogFromButton(page, 'Add activity')
  await page.getByRole('dialog', { name: 'Add activity' }).getByRole('button', { name: 'Maintenance' }).click()
  await page.getByRole('button', { name: 'Close drawer' }).click()

  await page.getByRole('button', { name: 'Exports', exact: true }).click()
  await page.getByLabel('Include tax ID, business ID, or SSN on this export only').check()
  await expect(page.getByLabel('Sensitive identifier')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Generate PDF' }).filter({ hasText: 'Generate PDF' })).toHaveCount(1)
  await page.getByLabel(/I certify I am authorized/).check()
  await expect(page.getByRole('button', { name: 'Generate PDF' })).toHaveCount(2)
  await page.getByRole('button', { name: 'Generate PDF' }).last().click()
  await expect(page.getByRole('dialog', { name: 'Protected PDF export' })).toBeVisible()
  await page.getByRole('button', { name: 'Close PDF export modal' }).click()

  await page.getByRole('button', { name: 'Invoices', exact: true }).click()
  await openDialogFromButton(page, 'New invoice')
  await expect(page.getByLabel('Invoice line items')).toBeVisible()
  await page.getByRole('button', { name: 'Close drawer' }).click()

  await page.getByRole('button', { name: 'Analytics', exact: true }).click()
  await page.getByRole('button', { name: 'Expenses', exact: true }).click()
  await expect(page.getByRole('img', { name: 'Income and expense trend' })).toBeVisible()

  await page.getByRole('button', { name: 'Messages', exact: true }).click()
  await page.getByRole('button', { name: 'Collapse inbox lanes' }).click()
  await expect(page.locator('.messages-workspace')).toHaveClass(/message-lanes-are-collapsed/)
  await page.getByRole('button', { name: 'Expand inbox lanes' }).click()
  await page.getByRole('button', { name: 'Message filters' }).click()
  await openMessageModal(page, 'Compose', 'Compose message', 'Close compose')
  await openMessageModal(page, 'Request support', 'Request support', 'Close compose')

  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Settings' }).click()
  for (const section of ['Account', 'Business', 'Billing', 'Security', 'Preferences', 'Data']) {
    await page.locator('.settings-section-nav').getByRole('button', { name: new RegExp(`^${section}\\b`) }).click()
    await expect(page.getByText(section).first()).toBeVisible()
    await expectClean(page, issues)
  }

  await expectClean(page, issues)
})

test('large debug: mobile navigation and primary drawers work without viewport overflow', async ({ page }) => {
  const issues = watchRuntimeIssues(page)
  await page.setViewportSize({ width: 390, height: 844 })
  const unique = Date.now()
  await createSignedInBusiness(page, {
    email: `large-mobile-${unique}@example.com`,
    password: 'Passw0rd!',
    businessName: `Mobile Debug Co ${unique}`,
  })

  for (const { nav, heading } of [
    { nav: 'Accounts', heading: 'Accounts' },
    { nav: 'Receipts', heading: 'Receipts' },
    { nav: 'Messages', heading: 'Messages' },
    { nav: 'Transactions', heading: 'Transactions' },
  ] as const) {
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await expect(page.locator('.ledger-shell')).toHaveClass(/mobile-nav-is-open/)
    await page.getByRole('button', { name: nav, exact: true }).click()
    await expect(page.getByRole('heading', { name: heading, level: 1, exact: true })).toBeVisible()
    await expectNoDocumentOverflow(page)
    await expectClean(page, issues)
  }

  await openDialogFromButton(page, 'Add transaction')
  await expectNoDocumentOverflow(page)
  await page.getByRole('button', { name: 'Close drawer' }).click()
  await page.getByRole('button', { name: 'Notifications' }).click()
  await expect(page.getByRole('dialog', { name: 'Notifications' })).toBeVisible()
  await expectNoDocumentOverflow(page)
  await page.getByRole('button', { name: 'Close notifications' }).click()
  await expectClean(page, issues)
})

function watchRuntimeIssues(page: Page) {
  const issues: RuntimeIssue[] = []
  page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      if (/Failed to load resource: the server responded with a status of (400|401|404)/.test(message.text())) {
        return
      }
      issues.push(`console error: ${message.text()}`)
    }
  })
  return issues
}

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

async function openDialogFromButton(page: Page, name: string) {
  await page.getByRole('button', { name }).click()
  await expect(page.getByRole('dialog', { name })).toBeVisible()
}

async function openMessageModal(page: Page, buttonName: string, dialogName: string, closeName: string) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(page.getByRole('dialog', { name: dialogName })).toBeVisible()
  await page.getByRole('button', { name: closeName }).click()
}

async function expectClean(page: Page, issues: RuntimeIssue[]) {
  await expect(page.locator('body')).not.toContainText('Application error')
  await expect(page.locator('body')).not.toContainText('Failed to fetch')
  expect(issues).toEqual([])
}

async function expectUsableViewport(page: Page) {
  await expect(page.locator('body')).toBeVisible()
  await expectNoDocumentOverflow(page)
}

async function expectNoDocumentOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement
    return root.scrollWidth - root.clientWidth
  })
  expect(overflow).toBeLessThanOrEqual(2)
}
