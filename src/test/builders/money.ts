import type { CurrencyCode } from '@domain/shared/money/currency';
import { fromCents, type Money } from '@domain/shared/money/money';

/**
 * Test builder for Money (PFOS-ENG-00 §33).
 *
 * Provides a valid default currency and allows an explicit override, so tests
 * read as `money(10_000)` rather than unwrapping a Result on every line.
 *
 * This throws rather than returning a Result because a builder that receives
 * an invalid amount indicates a defect in the test itself, not a domain
 * failure under examination. Production code must never use this: it calls
 * `fromCents` and handles the Result (§23).
 */
export function money(cents: number, currency: CurrencyCode = 'USD'): Money {
  const result = fromCents(cents, currency);

  if (!result.ok) {
    throw new Error(
      `money() builder received an invalid amount (${String(cents)}): ${result.error.code}`,
    );
  }

  return result.value;
}
