import { domainError, type DomainError } from '../errors/domain-error';
import { ERROR_CATEGORIES } from '../errors/error-category';
import { ERROR_CODES } from '../errors/error-codes';
import { err, ok, type Result } from '../errors/result';
import type { CurrencyCode } from './currency';
import { fromCents, zero, type Money } from './money';

/**
 * Money arithmetic (PFOS-ENG-00 §10.3).
 *
 * Every operation that spans two amounts verifies the currencies agree.
 * Version 1 is USD-only, so the check is currently vacuous at runtime, but it
 * is the guard that keeps a future second currency from silently producing
 * nonsense (PFOS-01 §54).
 */
function currencyMismatchError(left: CurrencyCode, right: CurrencyCode): DomainError {
  return domainError({
    code: ERROR_CODES.MONEY_CURRENCY_MISMATCH,
    category: ERROR_CATEGORIES.VALIDATION,
    summary: 'Amounts in different currencies cannot be combined.',
    details: `Received ${left} and ${right}.`,
    suggestedResolution: 'Convert both amounts to a single currency before combining them.',
  });
}

function overflowError(cents: number): DomainError {
  return domainError({
    code: ERROR_CODES.MONEY_UNSAFE_INTEGER,
    category: ERROR_CATEGORIES.VALIDATION,
    summary: 'That total is too large to represent exactly.',
    details: `Running total reached ${String(cents)}, outside the safe integer range.`,
  });
}

export function add(a: Money, b: Money): Result<Money, DomainError> {
  if (a.currency !== b.currency) {
    return err(currencyMismatchError(a.currency, b.currency));
  }
  return fromCents(a.cents + b.cents, a.currency);
}

export function subtract(a: Money, b: Money): Result<Money, DomainError> {
  if (a.currency !== b.currency) {
    return err(currencyMismatchError(a.currency, b.currency));
  }
  return fromCents(a.cents - b.cents, a.currency);
}

export function compare(a: Money, b: Money): Result<-1 | 0 | 1, DomainError> {
  if (a.currency !== b.currency) {
    return err(currencyMismatchError(a.currency, b.currency));
  }
  if (a.cents < b.cents) {
    return ok(-1);
  }
  if (a.cents > b.cents) {
    return ok(1);
  }
  return ok(0);
}

export function min(a: Money, b: Money): Result<Money, DomainError> {
  const ordering = compare(a, b);
  return ordering.ok ? ok(ordering.value <= 0 ? a : b) : ordering;
}

export function max(a: Money, b: Money): Result<Money, DomainError> {
  const ordering = compare(a, b);
  return ordering.ok ? ok(ordering.value >= 0 ? a : b) : ordering;
}

/**
 * Sums a list of amounts.
 *
 * The currency is explicit so an empty list has a well-defined answer rather
 * than an ambiguous one. The running total is range-checked on every step, so
 * precision cannot be lost partway through a long list.
 */
export function sum(values: readonly Money[], currency: CurrencyCode): Result<Money, DomainError> {
  let total = 0;

  for (const value of values) {
    if (value.currency !== currency) {
      return err(currencyMismatchError(currency, value.currency));
    }
    total += value.cents;
    if (!Number.isSafeInteger(total)) {
      return err(overflowError(total));
    }
  }

  return values.length === 0 ? ok(zero(currency)) : fromCents(total, currency);
}

/** Negation cannot fail: the negative of a safe integer is a safe integer. */
export function negate(value: Money): Money {
  return Object.freeze({ cents: value.cents === 0 ? 0 : -value.cents, currency: value.currency });
}

/** Absolute value cannot fail: |safe integer| is a safe integer. */
export function abs(value: Money): Money {
  return Object.freeze({ cents: Math.abs(value.cents), currency: value.currency });
}
