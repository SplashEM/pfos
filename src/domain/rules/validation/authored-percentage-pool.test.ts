import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import type { Result } from '@domain/shared/errors/result';
import {
  BASIS_POINTS_SCALE,
  basisPoints,
  type BasisPoints,
} from '@domain/shared/percentages/basis-points';

import type { RuleDomainError } from '../errors/rule-error';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { validateAuthoredPoolTotal } from './authored-percentage-pool';

/**
 * Every share is built through the supported `basisPoints` factory, never an
 * unsafe cast. A rejected pool is therefore made of entries that are each
 * individually valid, which is what makes the total a separate invariant rather
 * than a restatement of the range the primitive already enforces.
 */
function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Builds an authored pool from whole basis-point values. */
function pool(...values: readonly number[]): readonly BasisPoints[] {
  return values.map(rate);
}

/** Unwraps a rejection, failing loudly if the pool was unexpectedly accepted. */
function errorOf(result: Result<void, RuleDomainError>): RuleDomainError {
  if (result.ok) {
    throw new Error('Expected the pool to be rejected, but it was accepted.');
  }
  return result.error;
}

describe('validateAuthoredPoolTotal', () => {
  /* Decision 071: an authored percentage pool totals exactly 10,000 basis points. */
  it('accepts a pool totalling exactly 100%', () => {
    const result = validateAuthoredPoolTotal(pool(5000, 5000));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeUndefined();
    }
  });

  it('rejects a pool one basis point short', () => {
    const error = errorOf(validateAuthoredPoolTotal(pool(5000, 4999)));

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_POOL_NOT_EXACTLY_100_PERCENT);
    expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION);
  });

  it('rejects a pool one basis point over', () => {
    const error = errorOf(validateAuthoredPoolTotal(pool(5000, 5001)));

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_POOL_NOT_EXACTLY_100_PERCENT);
    expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION);
  });

  /*
   * Decision 075: an empty authored pool totals zero basis points and is a hard
   * validation error reporting this same code. No new code is required.
   */
  it('rejects an empty pool', () => {
    const error = errorOf(validateAuthoredPoolTotal(pool()));

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_POOL_NOT_EXACTLY_100_PERCENT);
    expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION);
  });
});

/**
 * Property-based coverage (PFOS-ENG-00 §31.3; Decision 063; PFOS-ENG-01 §43.6).
 *
 * Both generators emit whole values within 0 to 10,000, so every share is a
 * valid BasisPoints and the primitive's own range rule is never re-tested.
 *
 * Random pools almost never total exactly 10,000, so the implication below
 * would pass vacuously on arbitrary input alone. The generators are therefore
 * mixed with pools built to total exactly 10,000 by construction, so the
 * accepting branch is genuinely exercised.
 */
const arbitraryPool = fc.array(fc.integer({ min: 0, max: BASIS_POINTS_SCALE }), {
  maxLength: 12,
});

/**
 * Partitions 10,000 into the consecutive differences between sorted cut points,
 * so every generated pool totals exactly 10,000 and every entry lands within
 * the range BasisPoints accepts.
 */
const exactPool = fc
  .array(fc.integer({ min: 0, max: BASIS_POINTS_SCALE }), { maxLength: 11 })
  .map((cuts) => {
    const parts: number[] = [];
    let previous = 0;

    for (const bound of [...cuts].sort((left, right) => left - right)) {
      parts.push(bound - previous);
      previous = bound;
    }

    parts.push(BASIS_POINTS_SCALE - previous);
    return parts;
  });

const sumOf = (values: readonly number[]): number =>
  values.reduce((running, value) => running + value, 0);

describe('validateAuthoredPoolTotal properties', () => {
  it('accepts a pool only when its shares total exactly 10,000 basis points', () => {
    fc.assert(
      fc.property(fc.oneof(exactPool, arbitraryPool), (values) => {
        if (validateAuthoredPoolTotal(values.map(rate)).ok) {
          expect(sumOf(values)).toBe(BASIS_POINTS_SCALE);
        }
      }),
    );
  });

  it('accepts every pool constructed to total exactly 10,000 basis points', () => {
    fc.assert(
      fc.property(exactPool, (values) => {
        expect(sumOf(values)).toBe(BASIS_POINTS_SCALE);
        expect(validateAuthoredPoolTotal(values.map(rate)).ok).toBe(true);
      }),
    );
  });
});
