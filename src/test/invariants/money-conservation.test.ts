import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { allocateByWeights } from '@domain/shared/money/allocate-by-weights';
import type { DomainError } from '@domain/shared/errors/domain-error';
import type { Result } from '@domain/shared/errors/result';
import type { Money } from '@domain/shared/money/money';

/**
 * Financial invariant tests for monetary division.
 *
 * PFOS-ENG-00 §32 Invariant 1 requires income to equal allocated plus
 * unallocated exactly to the cent. PFOS-01 §55 and PFOS-ENG-02 §77 repeat the
 * requirement for allocation results. Every one of those guarantees rests on
 * the division primitive holding the four properties below across the full
 * range of shapes it will be asked to divide.
 *
 * The fourth property is the one a naive implementation fails silently:
 * renormalising weights conserves the total while shifting each share away
 * from its true proportion, which is exactly the defect Decision 071 rejects.
 */

/** Unwraps a successful division, failing loudly if it did not succeed. */
function centsOf(result: Result<readonly Money[], DomainError>): number[] {
  if (!result.ok) {
    throw new Error(`Expected a successful division, received ${result.error.code}.`);
  }
  return result.value.map((share) => share.cents);
}

/** Renders a case for a readable test title. */
function title(total: number, weights: readonly number[]): string {
  return `${String(total)} cents across [${weights.map(String).join(', ')}]`;
}

/**
 * Shapes chosen to span every form the primitive will meet: even splits,
 * authored percentage pools, the reduced denominators produced by capacity
 * removal, denominators above the basis-point scale, zero-weight members and
 * awkward coprime weights.
 *
 * Totals stay small enough that `total * weight` is exact in ordinary number
 * arithmetic, so the proportional-accuracy check below needs no BigInt.
 */
const cases: readonly (readonly [number, readonly number[]])[] = [
  [0, [1, 1, 1]],
  [1, [1, 1, 1]],
  [2, [1, 1, 1]],
  [10_000, [1, 1, 1]],
  [100, [1, 1, 1, 1, 1, 1, 1]],
  [7, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],

  [123_456, [1]],
  [123_456, [7]],

  [200_000, [1000, 9000]],
  [100_005, [1000, 9000]],
  [1000, [3333, 3333, 3334]],
  [999_999, [3333, 3333, 3334]],
  [123_457, [6000, 4000]],
  [500_003, [2500, 2500, 2500, 2500]],

  [70_000, [4000]],
  [900, [3333, 1667]],
  [123_457, [5000, 4000]],
  [1_000_001, [6000, 3000]],

  [1000, [20_000, 30_000]],
  [999_983, [12_345, 54_321]],

  [100, [1, 1, 1, 0]],
  [123_457, [5000, 0, 5000]],
  [1, [0, 1]],

  [7, [5, 3, 2]],
  [1_000_003, [1, 2, 3, 4, 5, 6, 7]],
];

describe('monetary division invariants', () => {
  for (const [total, weights] of cases) {
    describe(title(total, weights), () => {
      const divide = (): number[] => centsOf(allocateByWeights(money(total), weights));
      const denominator = weights.reduce((running, weight) => running + weight, 0);

      it('distributes the total exactly', () => {
        const shares = divide();
        expect(shares.reduce((running, share) => running + share, 0)).toBe(total);
      });

      it('returns one share per weight', () => {
        expect(divide()).toHaveLength(weights.length);
      });

      it('produces no negative share', () => {
        expect(divide().every((share) => share >= 0)).toBe(true);
      });

      it('keeps every share within one cent of its exact proportional value', () => {
        const shares = divide();

        shares.forEach((share, index) => {
          const weight = weights[index] ?? 0;
          expect(Math.abs(share * denominator - total * weight)).toBeLessThan(denominator);
        });
      });
    });
  }
});
