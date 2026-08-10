import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import type { DomainError } from '../errors/domain-error';
import { ERROR_CODES } from '../errors/error-codes';
import type { Result } from '../errors/result';
import { allocateByWeights } from './allocate-by-weights';
import type { Money } from './money';

/** Unwraps a successful division, failing loudly if it did not succeed. */
function centsOf(result: Result<readonly Money[], DomainError>): number[] {
  if (!result.ok) {
    throw new Error(`Expected a successful division, received ${result.error.code}.`);
  }
  return result.value.map((share) => share.cents);
}

/** Unwraps a rejected division, failing loudly if it unexpectedly succeeded. */
function codeOf(result: Result<readonly Money[], DomainError>): string {
  if (result.ok) {
    throw new Error('Expected the division to be rejected, but it succeeded.');
  }
  return result.error.code;
}

describe('allocateByWeights', () => {
  describe('worked examples from the specifications', () => {
    it('splits $100.00 three ways as PFOS-ENG-00 §12 requires', () => {
      expect(centsOf(allocateByWeights(money(10_000), [1, 1, 1]))).toEqual([3334, 3333, 3333]);
    });

    it('splits a $1,000 pool 60/40 as PFOS-ENG-02 §72 requires', () => {
      expect(centsOf(allocateByWeights(money(100_000), [6000, 4000]))).toEqual([60_000, 40_000]);
    });
  });

  describe('largest-remainder distribution', () => {
    it('gives the cent to the largest remainder, not to the first position', () => {
      expect(centsOf(allocateByWeights(money(1000), [3333, 3333, 3334]))).toEqual([333, 333, 334]);
    });

    it('breaks an exact tie by position', () => {
      expect(centsOf(allocateByWeights(money(3), [1, 1]))).toEqual([2, 1]);
    });

    it('never gives a cent to a zero weight', () => {
      expect(centsOf(allocateByWeights(money(100), [1, 1, 1, 0]))).toEqual([34, 33, 33, 0]);
    });
  });

  describe('denominators other than 10,000', () => {
    it('divides across a single surviving destination', () => {
      expect(centsOf(allocateByWeights(money(70_000), [4000]))).toEqual([70_000]);
    });

    it('preserves relative proportions when the weights total 5,000', () => {
      expect(centsOf(allocateByWeights(money(900), [3333, 1667]))).toEqual([600, 300]);
    });

    it('accepts weights that total more than 10,000', () => {
      expect(centsOf(allocateByWeights(money(1000), [20_000, 30_000]))).toEqual([400, 600]);
    });

    it('accepts weights that total less than 10,000', () => {
      expect(centsOf(allocateByWeights(money(1000), [5000, 4000]))).toEqual([556, 444]);
    });
  });

  describe('conservation', () => {
    const cases: readonly (readonly [number, readonly number[]])[] = [
      [1, [1, 1, 1]],
      [2, [1, 1, 1]],
      [10_000, [1, 1, 1]],
      [100_005, [1000, 9000]],
      [999_999, [3333, 3333, 3334]],
      [1, [1, 1, 1, 1, 1, 1, 1]],
      [7, [5, 3, 2]],
      [0, [1, 1]],
    ];

    it.each(cases)('distributes %i cents exactly', (total, weights) => {
      const shares = centsOf(allocateByWeights(money(total), weights));
      expect(shares.reduce((running, share) => running + share, 0)).toBe(total);
    });
  });

  describe('shape of the result', () => {
    it('returns one share per weight, in the same order', () => {
      const result = allocateByWeights(money(1000), [1, 2, 3, 4]);
      expect(centsOf(result)).toHaveLength(4);
      expect(centsOf(result)).toEqual([100, 200, 300, 400]);
    });

    it('freezes the returned shares', () => {
      const result = allocateByWeights(money(1000), [1, 1]);
      if (!result.ok) {
        throw new Error('Expected a successful division.');
      }
      expect(Object.isFrozen(result.value)).toBe(true);
      expect(Object.isFrozen(result.value[0])).toBe(true);
    });

    it('carries the currency of the total onto every share', () => {
      const result = allocateByWeights(money(1000), [1, 1]);
      if (!result.ok) {
        throw new Error('Expected a successful division.');
      }
      expect(result.value.every((share) => share.currency === 'USD')).toBe(true);
    });
  });

  describe('rejected input', () => {
    it('rejects an empty weight list', () => {
      expect(codeOf(allocateByWeights(money(100), []))).toBe(
        ERROR_CODES.MONEY_DIVISION_EMPTY_WEIGHTS,
      );
    });

    it('rejects a negative weight', () => {
      expect(codeOf(allocateByWeights(money(100), [1, -1]))).toBe(
        ERROR_CODES.MONEY_DIVISION_INVALID_WEIGHT,
      );
    });

    it('rejects a fractional weight', () => {
      expect(codeOf(allocateByWeights(money(100), [1.5, 1]))).toBe(
        ERROR_CODES.MONEY_DIVISION_INVALID_WEIGHT,
      );
    });

    it('rejects a weight that is not a number at all', () => {
      expect(codeOf(allocateByWeights(money(100), [Number.NaN, 1]))).toBe(
        ERROR_CODES.MONEY_DIVISION_INVALID_WEIGHT,
      );
    });

    it('rejects weights that are all zero', () => {
      expect(codeOf(allocateByWeights(money(100), [0, 0]))).toBe(
        ERROR_CODES.MONEY_DIVISION_ZERO_TOTAL_WEIGHT,
      );
    });

    it('rejects a negative total', () => {
      expect(codeOf(allocateByWeights(money(-100), [1, 1]))).toBe(
        ERROR_CODES.MONEY_DIVISION_NEGATIVE_TOTAL,
      );
    });

    it('rejects a product beyond the safe integer range', () => {
      expect(codeOf(allocateByWeights(money(1_000_000_000_000_000), [10]))).toBe(
        ERROR_CODES.MONEY_DIVISION_UNSAFE_PRODUCT,
      );
    });

    it('accepts a product exactly at the safe integer boundary', () => {
      expect(centsOf(allocateByWeights(money(900_719_925_474_099), [10]))).toEqual([
        900_719_925_474_099,
      ]);
    });
  });
});
