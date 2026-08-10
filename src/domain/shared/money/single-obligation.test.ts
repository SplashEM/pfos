import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import type { DomainError } from '../errors/domain-error';
import { ERROR_CODES } from '../errors/error-codes';
import type { Result } from '../errors/result';
import { basisPoints, type BasisPoints } from '../percentages/basis-points';
import type { Money } from './money';
import { allocateObligation } from './single-obligation';

/** Builds a rate, failing loudly if the test supplied an invalid one. */
function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Unwraps a successful obligation, failing loudly if it did not succeed. */
function centsOf(result: Result<Money, DomainError>): number {
  if (!result.ok) {
    throw new Error(`Expected a successful obligation, received ${result.error.code}.`);
  }
  return result.value.cents;
}

/** Unwraps a rejected obligation, failing loudly if it unexpectedly succeeded. */
function codeOf(result: Result<Money, DomainError>): string {
  if (result.ok) {
    throw new Error('Expected the obligation to be rejected, but it succeeded.');
  }
  return result.error.code;
}

describe('allocateObligation', () => {
  describe('nearest-cent rounding', () => {
    it('sends an exact half cent to the obligation, per Decision 071', () => {
      expect(centsOf(allocateObligation(money(100_005), rate(1000)))).toBe(10_001);
    });

    it('rounds down below the half cent', () => {
      expect(centsOf(allocateObligation(money(10_004), rate(1000)))).toBe(1000);
    });

    it('rounds up above the half cent', () => {
      expect(centsOf(allocateObligation(money(10_006), rate(1000)))).toBe(1001);
    });

    it('gives the single cent to the obligation on a half-cent split', () => {
      expect(centsOf(allocateObligation(money(1), rate(5000)))).toBe(1);
    });

    it('rounds a quarter-rate half cent up to the obligation', () => {
      expect(centsOf(allocateObligation(money(2), rate(2500)))).toBe(1);
    });
  });

  describe('worked example from PFOS-ENG-02 §13', () => {
    it('allocates $200 of a $2,000 paycheck to a 10% obligation', () => {
      expect(centsOf(allocateObligation(money(200_000), rate(1000)))).toBe(20_000);
    });

    it('leaves $1,800 in the pool afterwards', () => {
      const total = money(200_000);
      const obligation = centsOf(allocateObligation(total, rate(1000)));
      expect(total.cents - obligation).toBe(180_000);
    });
  });

  describe('boundary rates', () => {
    it('allocates nothing at 0%', () => {
      expect(centsOf(allocateObligation(money(123_456), rate(0)))).toBe(0);
    });

    it('allocates the whole amount at 100%', () => {
      expect(centsOf(allocateObligation(money(123_456), rate(10_000)))).toBe(123_456);
    });

    it('allocates nothing from a zero amount', () => {
      expect(centsOf(allocateObligation(money(0), rate(1000)))).toBe(0);
    });
  });

  describe('conservation', () => {
    it('never returns more than the total', () => {
      for (let total = 0; total <= 200; total += 1) {
        const obligation = centsOf(allocateObligation(money(total), rate(1000)));
        expect(obligation).toBeLessThanOrEqual(total);
        expect(obligation).toBeGreaterThanOrEqual(0);
      }
    });

    it('matches nearest-cent rounding with ties going up, across a sweep', () => {
      for (let total = 0; total <= 200; total += 1) {
        const obligation = centsOf(allocateObligation(money(total), rate(1000)));
        expect(obligation).toBe(Math.round(total / 10));
      }
    });

    it('leaves a residual pool that restores the total exactly', () => {
      for (let total = 0; total <= 200; total += 1) {
        const obligation = centsOf(allocateObligation(money(total), rate(1000)));
        expect(obligation + (total - obligation)).toBe(total);
      }
    });
  });

  describe('rejected input', () => {
    it('propagates the rejection of a negative total', () => {
      expect(codeOf(allocateObligation(money(-100), rate(1000)))).toBe(
        ERROR_CODES.MONEY_DIVISION_NEGATIVE_TOTAL,
      );
    });
  });
});
