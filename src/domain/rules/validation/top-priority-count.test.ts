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
import { validateTopPriorityCount } from './top-priority-count';

/** Builds a share, failing loudly if the test supplied an invalid one. */
function share(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid share in test setup: ${result.error.code}`);
  }
  return result.value;
}

/**
 * Builds `count` entries with distinct ranks and buckets.
 *
 * Ranks are distinct so that an over-count plan fails the count rule alone. A
 * plan that also carried duplicate ranks would leave it ambiguous which rule
 * this validator responded to.
 */
function entries(count: number): readonly ResolvedTopPriorityEntry[] {
  return Array.from({ length: count }, (_unused, index) => ({
    bucketId: asEntityId(`bucket-${String(index + 1)}`),
    rank: index + 1,
    ruleVersionIds: [asEntityId(`rule-version-${String(index + 1)}`)],
  }));
}

/**
 * Builds `count` shares that together total exactly 10,000 basis points, so an
 * accepted percentage-split plan is one the pool-total validator would also
 * accept and the two rules stay independent in the fixtures as well as in code.
 */
function shares(count: number): readonly ResolvedTopPriorityShare[] {
  const base = Math.floor(10000 / count);

  return entries(count).map((entry, index) => ({
    ...entry,
    shareBasisPoints: share(index === 0 ? 10000 - base * (count - 1) : base),
  }));
}

const sequential = (count: number): ResolvedTopPriorityPlan => ({
  strategy: 'SEQUENTIAL',
  entries: entries(count),
});

const percentageSplit = (count: number): ResolvedTopPriorityPlan => ({
  strategy: 'PERCENTAGE_SPLIT',
  entries: shares(count),
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

describe('validateTopPriorityCount under SEQUENTIAL', () => {
  /*
   * Decision 075: a SEQUENTIAL plan with zero entries is a valid resolution
   * result. The count rule cannot fire on an empty entry list, and the warning
   * Decision 075 requires is not produced here.
   */
  it('accepts zero entries', () => {
    expectAccepted(validateTopPriorityCount(sequential(0)));
  });

  it('accepts one entry', () => {
    expectAccepted(validateTopPriorityCount(sequential(1)));
  });

  /* PFOS-ENG-01 §13.1 admits up to three, so three is accepted, not rejected. */
  it('accepts three entries', () => {
    expectAccepted(validateTopPriorityCount(sequential(3)));
  });

  it('rejects four entries', () => {
    const error = errorOf(validateTopPriorityCount(sequential(4)));

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM);
    expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION);
  });
});

describe('validateTopPriorityCount under PERCENTAGE_SPLIT', () => {
  /*
   * Decision 076: the limit applies under either strategy, because §13.1 limits
   * top priorities as such rather than limiting a particular strategy.
   */
  it('accepts three entries', () => {
    expectAccepted(validateTopPriorityCount(percentageSplit(3)));
  });

  it('rejects four entries', () => {
    const error = errorOf(validateTopPriorityCount(percentageSplit(4)));

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM);
    expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION);
  });

  /*
   * Decision 076 leaves an empty percentage-split pool to the pool-total
   * validator, which reports RULE_POOL_NOT_EXACTLY_100_PERCENT. This validator
   * introduces no second code for that case, so it must accept the plan rather
   * than take on the pool-total concern.
   */
  it('accepts zero entries, leaving the empty pool to the pool-total validator', () => {
    const plan: ResolvedTopPriorityPlan = { strategy: 'PERCENTAGE_SPLIT', entries: [] };

    expectAccepted(validateTopPriorityCount(plan));
  });
});
