import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { ok, err, type Result } from '@domain/shared/errors/result';

import type { ResolvedTopPriorityPlan } from '../contracts/resolved-top-priority-plan';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { ruleError, type RuleDomainError } from '../errors/rule-error';

/**
 * Validates that no two top-priority entries share a rank (Decision 076;
 * PFOS-ENG-01 §13.1, §21.1). PFOS-ENG-01 §27 gives the same rule its reason:
 * equal ranks are ambiguous, and the user should normally be prevented from
 * creating them rather than left to a tie-breaker.
 *
 * The check applies under either strategy. PFOS-ENG-01 §13.1 limits top
 * priorities as such rather than limiting a particular strategy, so ranks are
 * read from `entries` without narrowing on the discriminator. A
 * ResolvedTopPriorityShare is a ResolvedTopPriorityEntry, so it carries the same
 * rank and needs no separate branch.
 *
 * Uniqueness is the only constraint imposed here. Decision 076 records that
 * ranks are not required to be positive, contiguous, to start at one, or to
 * match array position, because no accepted source requires any of those. Zero,
 * negative and widely spaced ranks therefore pass, and only a repeat fails.
 *
 * This is the only rule checked here. Decision 076 keeps each top-priority rule
 * in its own bounded validator so that no decision is forced about how
 * simultaneous failures are ordered or aggregated. The entry count belongs to
 * validateTopPriorityCount, and the authored percentage-pool total established
 * by Decision 071 remains separate from both.
 *
 * A plan with zero or one entry passes under either strategy: a repeat needs two
 * entries. An empty PERCENTAGE_SPLIT pool is still a hard validation error, but
 * it is reported as RULE_POOL_NOT_EXACTLY_100_PERCENT by the pool-total
 * validator, and this function adds no branch for it.
 *
 * Entries are read in the order given. Nothing is sorted, copied back, or
 * otherwise reordered: the resolved plan is immutable and M3 receives the order
 * the Rule Engine produced.
 *
 * The error names no bucket, no rank, no index and no position. Both entries
 * carrying a repeated rank are equally part of the collision, and Decision 076
 * provides no rule for calling one of them at fault, so `affectedEntityIds` is
 * omitted rather than guessed.
 *
 * Naming the repeated rank would have had the same problem one level down. A
 * plan containing two separate duplicate groups would report whichever group the
 * loop reached first, making the message depend on `entries` order. Decision 076
 * establishes no ordering or tie-break semantics and canonical ordering is
 * unsettled, so the text is fixed and order-independent: every rejected plan
 * yields byte-identical error text, whatever arrangement produced it.
 */
export function validateTopPriorityRanks(
  plan: ResolvedTopPriorityPlan,
): Result<void, RuleDomainError> {
  const seen = new Set<number>();

  for (const entry of plan.entries) {
    if (seen.has(entry.rank)) {
      return err(
        ruleError({
          code: RULE_ERROR_CODES.RULE_TOP_PRIORITY_DUPLICATE_RANK,
          category: ERROR_CATEGORIES.VALIDATION,
          summary: 'Top-priority ranks must be unique.',
          details: 'Two or more top-priority entries use the same rank.',
          suggestedResolution: 'Assign a unique rank to each top-priority entry.',
        }),
      );
    }

    seen.add(entry.rank);
  }

  return ok(undefined);
}
