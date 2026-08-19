import { expect, test } from '@playwright/test';

/*
 * The first of PFOS-ENG-00 §31.5's five core product questions, driven in a real
 * browser: "Where should my next paycheck go?"
 *
 * This runs the shipped bundle end to end — authored rules, resolver, allocation
 * engine, screen — so it fails if any layer stops agreeing with the others.
 */
test('a person can preview where a paycheck goes', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'PFOS' })).toBeVisible();

  await page.getByLabel('Paycheck amount').fill('2000');
  await page.getByLabel('Paycheck date').fill('2026-01-15');
  await page.getByRole('button', { name: 'Preview' }).click();

  const rows = page.getByRole('table').getByRole('row');

  await expect(rows.filter({ hasText: 'Giving' })).toContainText('$200.00');
  await expect(rows.filter({ hasText: 'Emergency Fund' })).toContainText('$500.00');
  await expect(rows.filter({ hasText: 'Spending' })).toContainText('$1,300.00');
  await expect(rows.filter({ hasText: 'Total allocated' })).toContainText('$2,000.00');
  await expect(rows.filter({ hasText: 'Unallocated' })).toContainText('$0.00');
});

/* Changing the paycheck must re-run the domain rather than adjust a number. */
test('a different paycheck produces a different split', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Paycheck amount').fill('1000');
  await page.getByLabel('Paycheck date').fill('2026-01-15');
  await page.getByRole('button', { name: 'Preview' }).click();

  const rows = page.getByRole('table').getByRole('row');

  await expect(rows.filter({ hasText: 'Giving' })).toContainText('$100.00');
  await expect(rows.filter({ hasText: 'Emergency Fund' })).toContainText('$500.00');
  await expect(rows.filter({ hasText: 'Spending' })).toContainText('$400.00');
});

test('an unusable amount is explained rather than previewed', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Paycheck amount').fill('0');
  await page.getByRole('button', { name: 'Preview' }).click();

  await expect(page.getByRole('alert')).toHaveText('Enter a paycheck amount greater than zero.');
  await expect(page.getByRole('table')).toHaveCount(0);
});
