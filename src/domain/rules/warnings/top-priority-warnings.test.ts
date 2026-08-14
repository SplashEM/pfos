import { describe, expect, it } from 'vitest';

import type { DomainWarning } from '@domain/shared/explanations/warning';
import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type {
  ResolvedTopPriorityEntry,
  ResolvedTopPriorityPlan,
  ResolvedTopPriorityShare,
} from '../contracts/resolved-top-priority-plan';
import { RULE_WARNING_CODES } from '../contracts/rule-warning-codes';

import { produceTopPriorityWarnings } from './top-priority-warnings';

/** Builds a share, failing loudly if the test supplied an invalid one. */
function share(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid share in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Builds `count` entries with distinct ranks and buckets. */
function entries(count: number): readonly ResolvedTopPriorityEntry[] {
  return Array.from({ length: count }, (_unused, index) => ({
    bucketId: asEntityId(`bucket-${String(index + 1)}`),
    rank: index + 1,
    ruleVersionIds: [asEntityId(`rule-version-${String(index + 1)}`)],
  }));
}

/**
 * Builds `count` shares totalling exactly 10,000 basis points, so an unwarned
 * percentage-split plan is one the pool-total validator would also accept and
 * the two concerns stay independent in the fixtures as well as in code.
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

describe('produceTopPriorityWarnings under SEQUENTIAL', () => {
  /*
   * Decision 075: zero entries is a valid resolution result that must warn.
   * The whole warning is asserted rather than the code alone, because Decision
   * 077 fixes the text as a literal: a reworded message is a contract change.
   */
  it('warns exactly once when no top priorities are configured', () => {
    expect(produceTopPriorityWarnings(sequential(0))).toEqual([
      {
        code: 'RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED',
        message: 'No top priorities are configured.',
        affectedEntityIds: [],
        recommendedAction: 'Add a top priority if desired, or leave top priorities empty.',
      },
    ]);
  });

  it('carries the registered code', () => {
    const [warning] = produceTopPriorityWarnings(sequential(0));

    expect(warning?.code).toBe(RULE_WARNING_CODES.RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED);
  });

  /* A plan with no entries names no entity, and the shared field is required. */
  it('names no affected entity', () => {
    const [warning] = produceTopPriorityWarnings(sequential(0));

    expect(warning?.affectedEntityIds).toEqual([]);
  });

  it('does not warn on one entry', () => {
    expect(produceTopPriorityWarnings(sequential(1))).toEqual([]);
  });

  it('does not warn on two entries', () => {
    expect(produceTopPriorityWarnings(sequential(2))).toEqual([]);
  });

  it('does not warn on three entries', () => {
    expect(produceTopPriorityWarnings(sequential(3))).toEqual([]);
  });
});

describe('produceTopPriorityWarnings under PERCENTAGE_SPLIT', () => {
  /*
   * Decision 075 keeps an empty percentage-split pool a hard validation error
   * reporting RULE_POOL_NOT_EXACTLY_100_PERCENT. Warning here as well would
   * report one condition on two channels, so the producer must stay silent.
   */
  it('does not warn on zero entries, leaving the empty pool to the pool-total validator', () => {
    const plan: ResolvedTopPriorityPlan = { strategy: 'PERCENTAGE_SPLIT', entries: [] };

    expect(produceTopPriorityWarnings(plan)).toEqual([]);
  });

  it('does not warn on three entries', () => {
    expect(produceTopPriorityWarnings(percentageSplit(3))).toEqual([]);
  });
});

describe('produceTopPriorityWarnings is bounded and deterministic', () => {
  /*
   * Decision 077 describes a producer returning zero or one warning and
   * introduces no aggregation contract. Nothing may accumulate.
   */
  it('never returns more than one warning', () => {
    for (const count of [0, 1, 2, 3, 4]) {
      expect(produceTopPriorityWarnings(sequential(count)).length).toBeLessThanOrEqual(1);
      expect(produceTopPriorityWarnings(percentageSplit(count)).length).toBeLessThanOrEqual(1);
    }
  });

  /*
   * The text carries no interpolated value, so two separately built plans in
   * the same state yield byte-identical warnings.
   */
  it('yields identical text for separately built equivalent plans', () => {
    expect(produceTopPriorityWarnings(sequential(0))).toEqual(
      produceTopPriorityWarnings(sequential(0)),
    );
  });

  /*
   * Decision 077: the intersection narrows `code` and changes nothing else, so
   * the result drops into ResolvedRuleSet.warnings — which stays
   * readonly DomainWarning[] — without a cast.
   */
  it('produces warnings that fit ResolvedRuleSet.warnings without a cast', () => {
    const warnings: readonly DomainWarning[] = produceTopPriorityWarnings(sequential(0));

    expect(warnings).toHaveLength(1);
  });
});
