import { money } from '@test/builders/money';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { allocateByWeights } from '@domain/shared/money/allocate-by-weights';
import { allocateObligation } from '@domain/shared/money/single-obligation';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';
import type { DomainError } from '@domain/shared/errors/domain-error';
import type { Result } from '@domain/shared/errors/result';
import type { Money } from '@domain/shared/money/money';

/**
 * Property-based tests for monetary division (PFOS-ENG-00 §31.3; Decision 063).
 *
 * Bounds are chosen so every intermediate product stays exact in ordinary
 * number arithmetic: totals reach one million dollars and weights one million
 * units, so `total * weight` peaks near 1e14 and `share * denominator` near
 * 1.2e15, both well inside the safe integer range. The verification therefore
 * needs no BigInt of its own.
 */

/** Unwraps a successful division, failing loudly if it did not succeed. */
function centsOf(result: Result<readonly Money[], DomainError>): number[] {
  if (!result.ok) {
    throw new Error(`Expected a successful division, received ${result.error.code}.`);
  }
  return result.value.map((share) => share.cents);
}

/** Builds a rate, failing loudly if the generator produced an invalid one. */
function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

const totalArbitrary = fc.integer({ min: 0, max: 100_000_000 });

const weightsArbitrary = fc
  .array(fc.integer({ min: 0, max: 1_000_000 }), { minLength: 1, maxLength: 12 })
  .filter((weights) => weights.some((weight) => weight > 0));

const rateArbitrary = fc.integer({ min: 0, max: 10_000 });

describe('allocateByWeights', () => {
  it('always distributes the total exactly', () => {
    fc.assert(
      fc.property(totalArbitrary, weightsArbitrary, (total, weights) => {
        const shares = centsOf(allocateByWeights(money(total), weights));
        expect(shares.reduce((running, share) => running + share, 0)).toBe(total);
      }),
    );
  });

  it('always returns one share per weight', () => {
    fc.assert(
      fc.property(totalArbitrary, weightsArbitrary, (total, weights) => {
        expect(centsOf(allocateByWeights(money(total), weights))).toHaveLength(weights.length);
      }),
    );
  });

  it('never produces a negative share', () => {
    fc.assert(
      fc.property(totalArbitrary, weightsArbitrary, (total, weights) => {
        const shares = centsOf(allocateByWeights(money(total), weights));
        expect(shares.every((share) => share >= 0)).toBe(true);
      }),
    );
  });

  it('keeps every share within one cent of its exact proportional value', () => {
    fc.assert(
      fc.property(totalArbitrary, weightsArbitrary, (total, weights) => {
        const shares = centsOf(allocateByWeights(money(total), weights));
        const denominator = weights.reduce((running, weight) => running + weight, 0);

        shares.forEach((share, index) => {
          const weight = weights[index] ?? 0;
          expect(Math.abs(share * denominator - total * weight)).toBeLessThan(denominator);
        });
      }),
    );
  });

  it('never gives a cent to a zero weight', () => {
    fc.assert(
      fc.property(totalArbitrary, weightsArbitrary, (total, weights) => {
        const shares = centsOf(allocateByWeights(money(total), weights));

        shares.forEach((share, index) => {
          if (weights[index] === 0) {
            expect(share).toBe(0);
          }
        });
      }),
    );
  });

  it('returns the same result for the same input every time', () => {
    fc.assert(
      fc.property(totalArbitrary, weightsArbitrary, (total, weights) => {
        const first = centsOf(allocateByWeights(money(total), weights));
        const second = centsOf(allocateByWeights(money(total), weights));
        expect(second).toEqual(first);
      }),
    );
  });

  it('preserves every invariant when the weights are reordered', () => {
    fc.assert(
      fc.property(totalArbitrary, weightsArbitrary, (total, weights) => {
        const reversed = [...weights].reverse();
        const shares = centsOf(allocateByWeights(money(total), reversed));
        const denominator = reversed.reduce((running, weight) => running + weight, 0);

        expect(shares).toHaveLength(reversed.length);
        expect(shares.reduce((running, share) => running + share, 0)).toBe(total);
        expect(shares.every((share) => share >= 0)).toBe(true);

        shares.forEach((share, index) => {
          const weight = reversed[index] ?? 0;
          expect(Math.abs(share * denominator - total * weight)).toBeLessThan(denominator);
        });
      }),
    );
  });
});

describe('tie-breaking is positional, not permutation-invariant', () => {
  /*
   * When fractional remainders tie, the residual cent attaches to a position
   * rather than to a weight, so reordering the input genuinely changes the
   * answer. This is the deterministic contract of Decision 071, not a defect:
   * PFOS-ENG-02 §78's order-independence invariant is satisfied by the
   * Allocation Engine sorting into canonical order before calling Money.
   */
  it('gives a different answer for reordered weights when remainders tie', () => {
    expect(centsOf(allocateByWeights(money(6), [1, 3]))).toEqual([2, 4]);
    expect(centsOf(allocateByWeights(money(6), [3, 1]))).toEqual([5, 1]);
  });

  it('does not merely permute the earlier answer', () => {
    const original = centsOf(allocateByWeights(money(6), [1, 3]));
    const reordered = centsOf(allocateByWeights(money(6), [3, 1]));
    expect(reordered).not.toEqual([...original].reverse());
  });
});

describe('allocateObligation', () => {
  it('always matches nearest-cent rounding with ties going to the obligation', () => {
    fc.assert(
      fc.property(totalArbitrary, rateArbitrary, (total, value) => {
        const result = allocateObligation(money(total), rate(value));
        if (!result.ok) {
          throw new Error(`Expected a successful obligation, received ${result.error.code}.`);
        }
        expect(result.value.cents).toBe(Math.floor((total * value + 5000) / 10_000));
      }),
    );
  });

  it('never allocates more than the total', () => {
    fc.assert(
      fc.property(totalArbitrary, rateArbitrary, (total, value) => {
        const result = allocateObligation(money(total), rate(value));
        if (!result.ok) {
          throw new Error(`Expected a successful obligation, received ${result.error.code}.`);
        }
        expect(result.value.cents).toBeLessThanOrEqual(total);
        expect(result.value.cents).toBeGreaterThanOrEqual(0);
      }),
    );
  });
});
