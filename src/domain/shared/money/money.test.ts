import { describe, expect, it } from 'vitest';

import type { DomainError } from '../errors/domain-error';
import { ERROR_CATEGORIES } from '../errors/error-category';
import { ERROR_CODES } from '../errors/error-codes';
import type { Result } from '../errors/result';
import { fromCents, isMoney, zero, type Money } from './money';

/** Unwraps a successful construction, failing loudly if it did not succeed. */
function valueOf(result: Result<Money, DomainError>): Money {
  if (!result.ok) {
    throw new Error(`Expected valid Money, received ${result.error.code}.`);
  }
  return result.value;
}

/** Unwraps a rejected construction, failing loudly if it unexpectedly succeeded. */
function errorOf(result: Result<Money, DomainError>): DomainError {
  if (result.ok) {
    throw new Error('Expected the amount to be rejected, but it was accepted.');
  }
  return result.error;
}

describe('fromCents', () => {
  describe('accepted amounts', () => {
    it('constructs a positive amount', () => {
      expect(valueOf(fromCents(1234, 'USD'))).toEqual({ cents: 1234, currency: 'USD' });
    });

    it('constructs zero', () => {
      expect(valueOf(fromCents(0, 'USD')).cents).toBe(0);
    });

    it('accepts a negative amount, since liabilities and reversals are negative', () => {
      expect(valueOf(fromCents(-500, 'USD')).cents).toBe(-500);
    });

    it('accepts the largest safe integer', () => {
      expect(valueOf(fromCents(Number.MAX_SAFE_INTEGER, 'USD')).cents).toBe(
        Number.MAX_SAFE_INTEGER,
      );
    });

    it('accepts the smallest safe integer', () => {
      expect(valueOf(fromCents(-Number.MAX_SAFE_INTEGER, 'USD')).cents).toBe(
        -Number.MAX_SAFE_INTEGER,
      );
    });

    it('carries the supplied currency', () => {
      expect(valueOf(fromCents(1, 'USD')).currency).toBe('USD');
    });

    it('freezes the result', () => {
      expect(Object.isFrozen(valueOf(fromCents(1, 'USD')))).toBe(true);
    });
  });

  describe('rejected amounts', () => {
    it('rejects a fractional amount', () => {
      expect(errorOf(fromCents(12.34, 'USD')).code).toBe(ERROR_CODES.MONEY_NOT_INTEGER);
    });

    it('rejects NaN', () => {
      expect(errorOf(fromCents(Number.NaN, 'USD')).code).toBe(ERROR_CODES.MONEY_NOT_INTEGER);
    });

    it('rejects positive infinity', () => {
      expect(errorOf(fromCents(Number.POSITIVE_INFINITY, 'USD')).code).toBe(
        ERROR_CODES.MONEY_NOT_INTEGER,
      );
    });

    it('rejects negative infinity', () => {
      expect(errorOf(fromCents(Number.NEGATIVE_INFINITY, 'USD')).code).toBe(
        ERROR_CODES.MONEY_NOT_INTEGER,
      );
    });

    it('rejects an integer beyond the safe range', () => {
      expect(errorOf(fromCents(Number.MAX_SAFE_INTEGER + 1, 'USD')).code).toBe(
        ERROR_CODES.MONEY_UNSAFE_INTEGER,
      );
    });

    it('classifies rejections as validation failures', () => {
      expect(errorOf(fromCents(1.5, 'USD')).category).toBe(ERROR_CATEGORIES.VALIDATION);
    });

    it('provides a non-empty summary', () => {
      expect(errorOf(fromCents(1.5, 'USD')).summary.length).toBeGreaterThan(0);
    });
  });
});

describe('zero', () => {
  it('is the zero amount in the requested currency', () => {
    expect(zero('USD')).toEqual({ cents: 0, currency: 'USD' });
  });

  it('is frozen', () => {
    expect(Object.isFrozen(zero('USD'))).toBe(true);
  });
});

describe('isMoney', () => {
  describe('accepts', () => {
    it('a value produced by fromCents', () => {
      expect(isMoney(valueOf(fromCents(100, 'USD')))).toBe(true);
    });

    it('a structurally identical plain object', () => {
      expect(isMoney({ cents: 100, currency: 'USD' })).toBe(true);
    });

    it('a zero amount', () => {
      expect(isMoney({ cents: 0, currency: 'USD' })).toBe(true);
    });

    it('a negative amount', () => {
      expect(isMoney({ cents: -100, currency: 'USD' })).toBe(true);
    });
  });

  describe('rejects', () => {
    it('null', () => {
      expect(isMoney(null)).toBe(false);
    });

    it('undefined', () => {
      expect(isMoney(undefined)).toBe(false);
    });

    it('a number', () => {
      expect(isMoney(100)).toBe(false);
    });

    it('a string', () => {
      expect(isMoney('100')).toBe(false);
    });

    it('an array', () => {
      expect(isMoney([100, 'USD'])).toBe(false);
    });

    it('an object with no cents', () => {
      expect(isMoney({ currency: 'USD' })).toBe(false);
    });

    it('an object with no currency', () => {
      expect(isMoney({ cents: 100 })).toBe(false);
    });

    it('a fractional cents value', () => {
      expect(isMoney({ cents: 1.5, currency: 'USD' })).toBe(false);
    });

    it('a cents value beyond the safe range', () => {
      expect(isMoney({ cents: Number.MAX_SAFE_INTEGER + 1, currency: 'USD' })).toBe(false);
    });

    it('an unsupported currency', () => {
      expect(isMoney({ cents: 100, currency: 'EUR' })).toBe(false);
    });

    it('cents supplied as a numeric string', () => {
      expect(isMoney({ cents: '100', currency: 'USD' })).toBe(false);
    });
  });
});
