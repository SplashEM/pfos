import { describe, expect, it } from 'vitest';

import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import type { Result } from '@domain/shared/errors/result';
import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type {
  ResolvedTopPriorityEntry,
  ResolvedTopPriorityPlan,
  ResolvedTopPriorityShare,
} from '../contracts/resolved-top-priority-plan';
import type { RuleDomainError } from '../errors/rule-error';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { validateTopPriorityRanks } from './top-priority-ranks';

/** Builds a share, failing loudly if the test supplied an invalid one. */
function share(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid share in test setup: ${result.error.code}`);
  }
  return result.value;
}

/**
 * Builds one entry per supplied rank, each with its own bucket.
 *
 * Buckets stay distinct so that a rejected plan is rejected for its ranks alone,
 * and every fixture stays within the three-entry maximum so that no case can be
 * confused with the count rule owned by validateTopPriorityCount.
 */
function entriesWithRanks(...ranks: readonly number[]): readonly ResolvedTopPriorityEntry[] {
  return ranks.map((rank, index) => ({
    bucketId: asEntityId(`bucket-${String(index + 1)}`),
    rank,
    ruleVersionIds: [asEntityId(`rule-version-${String(index + 1)}`)],
  }));
}

/**
 * Builds shares totalling exactly 10,000 basis points, so an accepted
 * percentage-split fixture is one the pool-total validator would also accept and
 * the two rules stay independent in the fixtures as well as in the code.
 */
function sharesWithRanks(...ranks: readonly number[]): readonly ResolvedTopPriorityShare[] {
  const base = Math.floor(10000 / ranks.length);

  return entriesWithRanks(...ranks).map((entry, index) => ({
    ...entry,
    shareBasisPoints: share(index === 0 ? 10000 - base * (ranks.length - 1) : base),
  }));
}

const sequential = (...ranks: readonly number[]): ResolvedTopPriorityPlan => ({
  strategy: 'SEQUENTIAL',
  entries: entriesWithRanks(...ranks),
});

const percentageSplit = (...ranks: readonly number[]): ResolvedTopPriorityPlan => ({
  strategy: 'PERCENTAGE_SPLIT',
  entries: sharesWithRanks(...ranks),
});

/** Unwraps a rejection, failing loudly if the plan was unexpectedly accepted. */
function errorOf(result: Result<void, RuleDomainError>): RuleDomainError {
  if (result.ok) {
    throw new Error('Expected the plan to be rejected, but it was accepted.');
  }
  return result.error;
}

/** Asserts an accepted plan, including the undefined success value. */
function expectAccepted(result: Result<void, RuleDomainError>): void {
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toBeUndefined();
  }
}

/** Asserts the one rejection this validator can produce. */
function expectDuplicateRank(result: Result<void, RuleDomainError>): void {
  const error = errorOf(result);

  expect(error.code).toBe(RULE_ERROR_CODES.RULE_TOP_PRIORITY_DUPLICATE_RANK);
  expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION);
}

describe('validateTopPriorityRanks under SEQUENTIAL', () => {
  it('accepts unique ranks', () => {
    expectAccepted(validateTopPriorityRanks(sequential(1, 2, 3)));
  });

  it('rejects duplicate ranks', () => {
    expectDuplicateRank(validateTopPriorityRanks(sequential(1, 2, 2)));
  });

  /*
   * Decision 075: a SEQUENTIAL plan with zero entries is a valid resolution
   * result. A repeat needs two entries, so this rule cannot fire on it.
   */
  it('accepts zero entries', () => {
    expectAccepted(validateTopPriorityRanks(sequential()));
  });
});

describe('validateTopPriorityRanks under PERCENTAGE_SPLIT', () => {
  /* Decision 076: the rule applies identically under either strategy. */
  it('accepts unique ranks', () => {
    expectAccepted(validateTopPriorityRanks(percentageSplit(1, 2, 3)));
  });

  it('rejects duplicate ranks', () => {
    expectDuplicateRank(validateTopPriorityRanks(percentageSplit(1, 2, 2)));
  });

  /*
   * Decision 076 leaves an empty percentage-split pool to the pool-total
   * validator, which reports RULE_POOL_NOT_EXACTLY_100_PERCENT. This validator
   * introduces no second code for that case, so it accepts the plan rather than
   * take on the pool-total concern.
   */
  it('accepts zero entries, leaving the empty pool to the pool-total validator', () => {
    const plan: ResolvedTopPriorityPlan = { strategy: 'PERCENTAGE_SPLIT', entries: [] };

    expectAccepted(validateTopPriorityRanks(plan));
  });
});

/**
 * Decision 076: ranks are not required to be positive, contiguous, to start at
 * one, or to match array position. No accepted source requires any of those, so
 * each shape below must be accepted on its uniqueness alone. Without these cases
 * a stricter rank rule could be added later without a test failing.
 */
describe('validateTopPriorityRanks constrains nothing but uniqueness', () => {
  it('accepts non-contiguous ranks', () => {
    expectAccepted(validateTopPriorityRanks(sequential(1, 5, 90)));
  });

  it('accepts ranks that do not start at one', () => {
    expectAccepted(validateTopPriorityRanks(sequential(7, 8, 9)));
  });

  it('accepts a rank of zero', () => {
    expectAccepted(validateTopPriorityRanks(sequential(0, 1, 2)));
  });

  it('accepts negative ranks', () => {
    expectAccepted(validateTopPriorityRanks(sequential(-3, -2, -1)));
  });

  it('accepts ranks in descending array order', () => {
    expectAccepted(validateTopPriorityRanks(sequential(3, 2, 1)));
  });

  it('rejects a duplicate among otherwise unusual ranks', () => {
    expectDuplicateRank(validateTopPriorityRanks(sequential(-1, 0, -1)));
  });

  /* Non-adjacent repeats are caught too: detection does not compare neighbours. */
  it('rejects a repeat separated by another rank', () => {
    expectDuplicateRank(validateTopPriorityRanks(sequential(4, 9, 4)));
  });
});

/**
 * The error must not depend on `entries` order.
 *
 * Detection stops at the first repeat, so a plan containing two separate
 * duplicate groups would betray which group the loop reached first if the text
 * named a rank, an index or a position. Decision 076 establishes no ordering or
 * tie-break semantics and canonical ordering is unsettled, so no such detail may
 * leak into the message.
 *
 * The arrangements below collide on different ranks, in different array
 * positions, under both strategies. Every field of the resulting error is
 * compared whole, so adding an order-dependent detail to any field fails here.
 */
describe('validateTopPriorityRanks reports the same error whatever the arrangement', () => {
  const arrangements: readonly ResolvedTopPriorityPlan[] = [
    sequential(1, 1, 2),
    sequential(1, 2, 2),
    sequential(2, 1, 2),
    sequential(9, 9, 9),
    sequential(-4, 0, -4),
    percentageSplit(1, 2, 2),
    percentageSplit(3, 3, 1),
  ];

  const expected: RuleDomainError = {
    code: RULE_ERROR_CODES.RULE_TOP_PRIORITY_DUPLICATE_RANK,
    category: ERROR_CATEGORIES.VALIDATION,
    summary: 'Top-priority ranks must be unique.',
    details: 'Two or more top-priority entries use the same rank.',
    suggestedResolution: 'Assign a unique rank to each top-priority entry.',
  };

  for (const [index, plan] of arrangements.entries()) {
    it(`reports the identical error for arrangement ${String(index + 1)}`, () => {
      expect(errorOf(validateTopPriorityRanks(plan))).toEqual(expected);
    });
  }

  /* No bucket is named, so no entry is singled out of a collision. */
  it('names no affected entity', () => {
    for (const plan of arrangements) {
      expect(errorOf(validateTopPriorityRanks(plan)).affectedEntityIds).toBeUndefined();
    }
  });
});
