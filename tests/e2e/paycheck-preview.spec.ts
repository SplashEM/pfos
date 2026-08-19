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

/*
 * PFOS-ENG-00 §31.5's fifth core question, in its smallest form: "what happens
 * if I make this financial decision?" Changing the plan changes the answer, and
 * the answer can only change by going back through the resolver.
 */
test('editing the plan changes where the paycheck goes', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Paycheck amount').fill('2000');
  await page.getByLabel('Paycheck date').fill('2026-01-15');
  await page.getByRole('button', { name: 'Preview' }).click();

  const rows = page.getByRole('table').getByRole('row');
  await expect(rows.filter({ hasText: 'Giving' })).toContainText('$200.00');

  await page.getByLabel('Giving').fill('12');
  await page.getByLabel('Priority 1 amount').fill('600');
  await page.getByLabel('Everything left over goes to').fill('Everyday spending');
  await page.getByRole('button', { name: 'Preview' }).click();

  await expect(rows.filter({ hasText: 'Giving' })).toContainText('$240.00');
  await expect(rows.filter({ hasText: 'Emergency Fund' })).toContainText('$600.00');
  await expect(rows.filter({ hasText: 'Everyday spending' })).toContainText('$1,160.00');
  await expect(rows.filter({ hasText: 'Total allocated' })).toContainText('$2,000.00');
  await expect(rows.filter({ hasText: 'Unallocated' })).toContainText('$0.00');
});

/* The plan survives a real reload, and the preview is rebuilt rather than recalled. */
test('the plan is still there after a reload', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Giving').fill('12');
  await page.getByLabel('Priority 1 amount').fill('600');
  await page.getByLabel('Everything left over goes to').fill('Everyday spending');
  await page.getByLabel('Paycheck amount').fill('2000');
  await page.getByLabel('Paycheck date').fill('2026-01-15');
  await page.getByRole('button', { name: 'Preview' }).click();

  const rows = page.getByRole('table').getByRole('row');
  await expect(rows.filter({ hasText: 'Everyday spending' })).toContainText('$1,160.00');

  await page.reload();

  await expect(page.getByLabel('Giving')).toHaveValue('12');
  await expect(page.getByLabel('Priority 1 amount')).toHaveValue('600');
  await expect(page.getByLabel('Everything left over goes to')).toHaveValue('Everyday spending');

  /* No preview is restored: only the plan settings were kept. */
  await expect(page.getByRole('table')).toHaveCount(0);

  await page.getByLabel('Paycheck amount').fill('2000');
  await page.getByLabel('Paycheck date').fill('2026-01-15');
  await page.getByRole('button', { name: 'Preview' }).click();

  await expect(rows.filter({ hasText: 'Giving' })).toContainText('$240.00');
  await expect(rows.filter({ hasText: 'Emergency Fund' })).toContainText('$600.00');
  await expect(rows.filter({ hasText: 'Everyday spending' })).toContainText('$1,160.00');
});

test('clearing the device returns the starting plan', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Giving').fill('12');
  await expect(page.getByLabel('Giving')).toHaveValue('12');

  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();

  await expect(page.getByLabel('Giving')).toHaveValue('10');
  await expect(page.getByLabel('Priority 1 amount')).toHaveValue('500.00');
  await expect(page.getByLabel('Everything left over goes to')).toHaveValue('Spending');
});

/*
 * PFOS-ENG-01 §13.1 allows up to three top priorities, and Decision 087 makes
 * their rank authored. This drives both in a real browser: a second priority is
 * added, funded, and then moved above the first, and the money follows.
 */
test('a person can add, fund and reorder top priorities', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add priority' }).click();
  await page.getByLabel('Priority 2 name').fill('Laptop');
  await page.getByLabel('Priority 2 amount').fill('300');

  await page.getByLabel('Paycheck amount').fill('2000');
  await page.getByLabel('Paycheck date').fill('2026-01-15');
  await page.getByRole('button', { name: 'Preview' }).click();

  const rows = page.getByRole('table').getByRole('row');
  await expect(rows.filter({ hasText: 'Giving' })).toContainText('$200.00');
  await expect(rows.filter({ hasText: 'Emergency Fund' })).toContainText('$500.00');
  await expect(rows.filter({ hasText: 'Laptop' })).toContainText('$300.00');
  await expect(rows.filter({ hasText: 'Spending' })).toContainText('$1,000.00');

  /* A paycheck that cannot cover both requirements makes the order visible. */
  await page.getByLabel('Priority 1 amount').fill('1000');
  await page.getByLabel('Paycheck amount').fill('1200');
  await page.getByRole('button', { name: 'Preview' }).click();

  await expect(rows.filter({ hasText: 'Emergency Fund' })).toContainText('$1,000.00');
  await expect(rows.filter({ hasText: 'Laptop' })).toContainText('$80.00');

  await page.getByRole('button', { name: 'Move up' }).nth(1).click();
  await page.getByRole('button', { name: 'Preview' }).click();

  await expect(rows.filter({ hasText: 'Laptop' })).toContainText('$300.00');
  await expect(rows.filter({ hasText: 'Emergency Fund' })).toContainText('$780.00');

  /* Both priorities and their order survive a reload. */
  await page.reload();

  await expect(page.getByLabel('Priority 1 name')).toHaveValue('Laptop');
  await expect(page.getByLabel('Priority 2 name')).toHaveValue('Emergency Fund');
  await expect(page.getByLabel('Priority 1 amount')).toHaveValue('300');
});

test('an unusable amount is explained rather than previewed', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Paycheck amount').fill('0');
  await page.getByRole('button', { name: 'Preview' }).click();

  await expect(page.getByRole('alert')).toHaveText('Enter a paycheck amount greater than zero.');
  await expect(page.getByRole('table')).toHaveCount(0);
});
