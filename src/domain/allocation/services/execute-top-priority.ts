import type { ResolvedFundingRule } from '@domain/rules/contracts/resolved-funding-rule';
import type { ResolvedTopPriorityPlan } from '@domain/rules/contracts/resolved-top-priority-plan';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import type { DomainError } from '@domain/shared/errors/domain-error';
import { err, ok, type Result } from '@domain/shared/errors/result';
import { min, subtract } from '@domain/shared/money/money-arithmetic';
import type { Money } from '@domain/shared/money/money';

import type { AllocationLine } from '../contracts/allocation-result';
import { ALLOCATION_ERROR_CODES } from '../errors/allocation-error-codes';
import { allocationError } from '../errors/allocation-error';
import type { StageOutcome } from './execute-global-obligations';

/**
 * Executes the sequential top-priority stage (PFOS-ENG-02 §16, §17).
 *
 * §17 walks priorities in order, allocating "as much as needed or available" to
 * each before moving to the next, and forbids skipping a priority to fund a
 * later one. That is `min(requirement, remainingPool)` per entry, in ascending
 * rank, which is what this does.
 *
 * The requirement comes from the bucket's own funding rule. A
 * `ResolvedTopPriorityEntry` carries a rank but no amount, so `requiredFundingRules`
 * keyed by `bucketId` is the only place in the resolved contract that can supply
 * one. A top priority naming a bucket with no funding rule is refused rather
 * than defaulted: allocating zero or the whole pool would each invent a
 * financial semantic no accepted source supplies.
 *
 * Entries are sorted by rank here rather than trusted in array order. Decision
 * 074 documents top-priority entries as ordered by ascending rank, and §17 makes
 * that order financially meaningful, so deriving it from the rank the contract
 * carries is safer than depending on how the array was built.
 *
 * Only `SEQUENTIAL` is executed. `PERCENTAGE_SPLIT` (§18) is a valid accepted
 * strategy that this slice does not implement, and it is refused rather than
 * approximated by the sequential path, which would allocate quite different
 * amounts.
 *
 * Only `FIXED_PER_PAYCHECK` funding is evaluated. It states its amount outright
 * and resets every event, so the requirement needs no bucket balance and no
 * period tracking. Every other funding type needs allocation capacity (§19),
 * which needs the bucket state (§7) this slice does not supply, so each is
 * refused rather than guessed at.
 *
 * `isProtected`, `allowExcessAboveCapacity` and `sequence` are not read. Each
 * governs behaviour — protected treatment, excess above capacity, and
 * competition order within the required stage — that this slice does not
 * execute.
 */
export function executeTopPriority(
  plan: ResolvedTopPriorityPlan,
  fundingRules: readonly ResolvedFundingRule[],
  remainingPool: Money,
): Result<StageOutcome, DomainError> {
  if (plan.strategy !== 'SEQUENTIAL') {
    return err(
      allocationError({
        code: ALLOCATION_ERROR_CODES.ALLOCATION_STRATEGY_NOT_SUPPORTED,
        category: ERROR_CATEGORIES.UNSUPPORTED_STATE,
        summary: 'That top-priority strategy cannot be allocated yet.',
        details: `Received strategy ${plan.strategy}; this executor implements SEQUENTIAL only.`,
      }),
    );
  }

  const lines: AllocationLine[] = [];
  let pool = remainingPool;

  const byRank = [...plan.entries].sort((a, b) => a.rank - b.rank);

  for (const entry of byRank) {
    const requirement = requirementFor(entry.bucketId, fundingRules);
    if (!requirement.ok) {
      return requirement;
    }

    const allocated = min(requirement.value, pool);
    if (!allocated.ok) {
      return allocated;
    }

    const reduced = subtract(pool, allocated.value);
    if (!reduced.ok) {
      return reduced;
    }

    lines.push({
      bucketId: entry.bucketId,
      stage: 'TOP_PRIORITY',
      amount: allocated.value,
    });
    pool = reduced.value;
  }

  return ok({ lines, remainingPool: pool });
}

/** The amount a top-priority bucket is asking for on this income event. */
function requirementFor(
  bucketId: string,
  fundingRules: readonly ResolvedFundingRule[],
): Result<Money, DomainError> {
  const rule = fundingRules.find((candidate) => candidate.bucketId === bucketId);

  if (rule === undefined) {
    return err(
      allocationError({
        code: ALLOCATION_ERROR_CODES.ALLOCATION_TOP_PRIORITY_REQUIREMENT_MISSING,
        category: ERROR_CATEGORIES.MISSING_REFERENCE,
        summary: 'A top-priority bucket has no funding requirement to allocate against.',
        details: `No required funding rule addresses bucket ${bucketId}.`,
        affectedEntityIds: [bucketId],
      }),
    );
  }

  if (rule.funding.type !== 'FIXED_PER_PAYCHECK') {
    return err(
      allocationError({
        code: ALLOCATION_ERROR_CODES.ALLOCATION_FUNDING_TYPE_NOT_SUPPORTED,
        category: ERROR_CATEGORIES.UNSUPPORTED_STATE,
        summary: 'That funding requirement cannot be evaluated yet.',
        details: `Bucket ${bucketId} uses ${rule.funding.type}; this executor implements FIXED_PER_PAYCHECK only.`,
        affectedEntityIds: [bucketId],
      }),
    );
  }

  return ok(rule.funding.amount);
}
