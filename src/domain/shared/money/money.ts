import { domainError, type DomainError } from '../errors/domain-error';
import { ERROR_CATEGORIES } from '../errors/error-category';
import { ERROR_CODES } from '../errors/error-codes';
import { err, ok, type Result } from '../errors/result';
import type { CurrencyCode } from './currency';

/**
 * An exact monetary amount (PFOS-ENG-00 §10.1; PFOS-00 Principle 19).
 *
 * Money is integer cents plus an explicit currency. It is never binary
 * floating-point dollars, never a formatted string in the domain, and never a
 * mix of cents and dollars in one interface (§10.4).
 *
 * The currency travels on the value rather than being assumed globally so a
 * mismatch stays representable and testable instead of silently ignored.
 */
export interface Money {
  readonly cents: number;
  readonly currency: CurrencyCode;
}

/**
 * Constructs Money from integer cents.
 *
 * Rejects non-integers and values outside the safe integer range (§10.2).
 * Negative amounts are permitted: liabilities, reversals and overspent
 * buckets are legitimately negative (Decision 036).
 */
export function fromCents(cents: number, currency: CurrencyCode): Result<Money, DomainError> {
  if (!Number.isInteger(cents)) {
    return err(
      domainError({
        code: ERROR_CODES.MONEY_NOT_INTEGER,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'A monetary amount must be a whole number of cents.',
        details: `Received ${String(cents)}.`,
        suggestedResolution: 'Supply an integer number of cents rather than a decimal amount.',
      }),
    );
  }

  if (!Number.isSafeInteger(cents)) {
    return err(
      domainError({
        code: ERROR_CODES.MONEY_UNSAFE_INTEGER,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'That amount is too large to represent exactly.',
        details: `Received ${String(cents)}, outside the safe integer range.`,
      }),
    );
  }

  return ok(Object.freeze({ cents, currency }));
}

/** The zero amount in a currency. Always valid, so it needs no Result. */
export function zero(currency: CurrencyCode): Money {
  return Object.freeze({ cents: 0, currency });
}

/**
 * Structural guard for untrusted input (§29.1).
 *
 * Backups and imports are untrusted until validated, so a runtime check is
 * required at those boundaries rather than a type assertion.
 */
export function isMoney(value: unknown): value is Money {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { readonly cents?: unknown; readonly currency?: unknown };

  return (
    typeof candidate.cents === 'number' &&
    Number.isSafeInteger(candidate.cents) &&
    candidate.currency === 'USD'
  );
}
