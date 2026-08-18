import type { ResolvedGlobalObligation } from '@domain/rules/contracts/resolved-global-obligation';
import type { DomainError } from '@domain/shared/errors/domain-error';
import { ok, type Result } from '@domain/shared/errors/result';
import { subtract } from '@domain/shared/money/money-arithmetic';
import type { Money } from '@domain/shared/money/money';
import { allocateObligation } from '@domain/shared/money/single-obligation';

import type { AllocationIncomeEvent } from '../contracts/allocation-income-event';
import type { AllocationLine } from '../contracts/allocation-result';

/** What a stage produced, and what is left of the pool afterwards. */
export interface StageOutcome {
  readonly lines: readonly AllocationLine[];
  readonly remainingPool: Money;
}

/**
 * Executes the global percentage obligations (PFOS-ENG-02 §13, §14).
 *
 * Each obligation is calculated against the income amount its own configured
 * basis names, not against the running pool. §14 states that separately
 * authored obligations "are independent complementary two-way splits, each
 * evaluated against its own configured income basis", so a second obligation
 * must not be computed on an amount the first one already reduced. §13's worked
 * example shows the same thing: 10% of $2,000 is $200, and the pool becomes
 * $1,800 afterwards.
 *
 * The arithmetic is `allocateObligation`, which Decision 071 already ships and
 * tests. It performs the complementary two-way weighted split §14 requires, so
 * nothing here re-derives rounding: the obligation occupies index 0, an exact
 * half therefore rounds to the obligation, and no floating-point ratio is used.
 *
 * The complement is never emitted. §14 is explicit that emitting it would
 * double-count the residual pool and break the conservation invariant in §2, so
 * this returns one line per obligation and decrements the pool by exactly that
 * amount.
 *
 * `NET_DEPOSITED` is the only `IncomeBasis` Decision 074 exposes in V1, so the
 * basis selection is total without a fallback branch. When a second basis is
 * accepted, this is where the event amount it names is chosen.
 *
 * `maximumAmount` is not applied. No obligation in the first slice carries one,
 * and capping is an allocation-capacity behaviour (§19) that needs the bucket
 * state this slice does not supply.
 */
export function executeGlobalObligations(
  obligations: readonly ResolvedGlobalObligation[],
  event: AllocationIncomeEvent,
  remainingPool: Money,
): Result<StageOutcome, DomainError> {
  const lines: AllocationLine[] = [];
  let pool = remainingPool;

  for (const obligation of obligations) {
    const base = event.netAmount;

    const amount = allocateObligation(base, obligation.rateBasisPoints);
    if (!amount.ok) {
      return amount;
    }

    const reduced = subtract(pool, amount.value);
    if (!reduced.ok) {
      return reduced;
    }

    lines.push({
      bucketId: obligation.destinationBucketId,
      stage: 'GLOBAL_OBLIGATION',
      amount: amount.value,
    });
    pool = reduced.value;
  }

  return ok({ lines, remainingPool: pool });
}
