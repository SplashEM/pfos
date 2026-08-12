import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { ok, err, type Result } from '@domain/shared/errors/result';

import type { ResolvedTopPriorityPlan } from '../contracts/resolved-top-priority-plan';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { ruleError, type RuleDomainError } from '../errors/rule-error';

/**
 * The V1 ceiling on top-priority buckets (PFOS-ENG-01 §13.1).
 *
 * Deliberately not exported. Decision 076 keeps the number out of the error code
 * itself because the limit may change while the meaning "more than the allowed
 * maximum" does not; the same reasoning keeps it out of the module's public
 * surface, which is the validator alone.
 */
const MAX_TOP_PRIORITIES = 3;

/**
 * Validates that a resolved top-priority plan holds no more than the V1 maximum
 * of three entries (Decision 076; PFOS-ENG-01 §13.1, §21.1).
 *
 * The check applies under either strategy. PFOS-ENG-01 §13.1 limits top
 * priorities as such rather than limiting a particular strategy, so the count is
 * read from `entries` without narrowing on the discriminator.
 *
 * This is the only rule checked here. Decision 076 keeps each top-priority rule
 * in its own bounded validator so that no decision is forced about how
 * simultaneous failures are ordered or aggregated. Duplicate ranks therefore
 * belong to a separate function, and the authored percentage-pool total
 * established by Decision 071 remains separate from both.
 *
 * A plan with zero entries passes. Under SEQUENTIAL that is a valid resolution
 * result (Decision 075), and the warning it requires is not this validator's
 * concern. Under PERCENTAGE_SPLIT an empty pool is a hard validation error, but
 * it is reported as RULE_POOL_NOT_EXACTLY_100_PERCENT by the pool-total
 * validator; Decision 076 introduces no second code for it and this function
 * adds no branch for it.
 *
 * Nothing else about an entry is read. Rank uniqueness, rank positivity or
 * contiguity, share totals and bucket status are all outside this rule
 * (Decision 076).
 *
 * The error names no bucket. Which entries are surplus is undetermined without
 * an ordering rule, and Decision 076 settles none, so `affectedEntityIds` is
 * omitted rather than guessed.
 */
export function validateTopPriorityCount(
  plan: ResolvedTopPriorityPlan,
): Result<void, RuleDomainError> {
  const count = plan.entries.length;

  if (count > MAX_TOP_PRIORITIES) {
    return err(
      ruleError({
        code: RULE_ERROR_CODES.RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: `You can have at most ${String(MAX_TOP_PRIORITIES)} top-priority buckets.`,
        details: `Received ${String(count)} top priorities, where ${String(MAX_TOP_PRIORITIES)} is the maximum.`,
        suggestedResolution: `Remove top priorities until at most ${String(MAX_TOP_PRIORITIES)} remain.`,
      }),
    );
  }

  return ok(undefined);
}
