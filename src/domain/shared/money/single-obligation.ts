import type { DomainError } from '../errors/domain-error';
import { ok, type Result } from '../errors/result';
import { BASIS_POINTS_SCALE, type BasisPoints } from '../percentages/basis-points';
import { allocateByWeights } from './allocate-by-weights';
import type { Money } from './money';

/**
 * Unreachable in practice: allocateByWeights returns exactly one share per
 * supplied weight, and this module always supplies two. Reaching this branch
 * means an internal invariant is broken, which is a programming fault rather
 * than a domain failure the user can act on, so it throws instead of
 * fabricating a DomainError (PFOS-ENG-00 §23).
 */
function firstShare(shares: readonly Money[]): Money {
  const share = shares[0];
  if (share === undefined) {
    throw new Error(
      'Invariant violated: allocateByWeights returned no shares for a two-weight split.',
    );
  }
  return share;
}

/**
 * Calculates a single percentage obligation (Decision 071; PFOS-ENG-02 §14).
 *
 * The obligation is the first share of the complementary two-way split
 * [rate, 10000 - rate]. For two complementary weights the fractional parts
 * sum to zero or one, so at most one cent is ever in play; distributing it by
 * largest remainder is therefore exactly nearest-cent rounding, with an exact
 * half going to the obligation because it occupies index 0.
 *
 *   10% of $1,000.05 allocates $100.01.
 *
 * The complement is an arithmetic device. It is never returned and must never
 * become an allocation line: emitting it would double-count the residual pool
 * and break `input = allocated + unallocated` (PFOS-ENG-02 §2).
 *
 * No floating-point ratio is used anywhere in this calculation.
 */
export function allocateObligation(total: Money, rate: BasisPoints): Result<Money, DomainError> {
  const divided = allocateByWeights(total, [rate, BASIS_POINTS_SCALE - rate]);

  if (!divided.ok) {
    return divided;
  }

  return ok(firstShare(divided.value));
}
