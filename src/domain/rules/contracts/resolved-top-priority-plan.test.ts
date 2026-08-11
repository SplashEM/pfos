import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type {
  ResolvedTopPriorityEntry,
  ResolvedTopPriorityPlan,
  ResolvedTopPriorityShare,
} from './resolved-top-priority-plan';

/** Builds a share, failing loudly if the test supplied an invalid one. */
function share(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid share in test setup: ${result.error.code}`);
  }
  return result.value;
}

const ENTRY: ResolvedTopPriorityEntry = {
  bucketId: asEntityId('bucket-1'),
  rank: 1,
  ruleVersionIds: [asEntityId('rule-version-1')],
};

const SHARE: ResolvedTopPriorityShare = { ...ENTRY, shareBasisPoints: share(6000) };

describe('ResolvedTopPriorityEntry', () => {
  it('carries the bucket, rank and rule versions it was derived from', () => {
    expect(ENTRY).toEqual({
      bucketId: 'bucket-1',
      rank: 1,
      ruleVersionIds: ['rule-version-1'],
    });
  });
});

describe('ResolvedTopPriorityShare', () => {
  it('extends an entry with its authored share', () => {
    expect(SHARE).toEqual({
      bucketId: 'bucket-1',
      rank: 1,
      ruleVersionIds: ['rule-version-1'],
      shareBasisPoints: 6000,
    });
  });

  it('is usable wherever an entry is expected', () => {
    const entry: ResolvedTopPriorityEntry = SHARE;
    expect(entry.bucketId).toBe('bucket-1');
  });
});

describe('ResolvedTopPriorityPlan', () => {
  it('carries sequential entries', () => {
    const plan: ResolvedTopPriorityPlan = { strategy: 'SEQUENTIAL', entries: [ENTRY] };
    expect(plan.entries).toEqual([ENTRY]);
  });

  it('carries percentage-split shares', () => {
    const plan: ResolvedTopPriorityPlan = { strategy: 'PERCENTAGE_SPLIT', entries: [SHARE] };
    expect(plan.entries).toEqual([SHARE]);
  });

  /*
   * Decision 075: a SEQUENTIAL plan with zero entries is a valid resolution
   * result, not a validation failure. The warning it requires travels on
   * ResolvedRuleSet.warnings and is not a field of this contract.
   */
  it('accepts a sequential plan with zero entries', () => {
    const plan: ResolvedTopPriorityPlan = { strategy: 'SEQUENTIAL', entries: [] };
    expect(plan.entries).toEqual([]);
  });

  /*
   * Decision 075 keeps an empty PERCENTAGE_SPLIT pool a hard validation error
   * reported as RULE_POOL_NOT_EXACTLY_100_PERCENT. Decision 074 nonetheless
   * records that the contract can represent an empty entry list under either
   * strategy, so this asserts representability only. No validation runs here.
   */
  it('represents an empty percentage-split entry list', () => {
    const plan: ResolvedTopPriorityPlan = { strategy: 'PERCENTAGE_SPLIT', entries: [] };
    expect(plan.entries).toEqual([]);
  });

  it('narrows on the strategy discriminator', () => {
    const shares = (plan: ResolvedTopPriorityPlan): readonly ResolvedTopPriorityShare[] =>
      plan.strategy === 'PERCENTAGE_SPLIT' ? plan.entries : [];

    expect(shares({ strategy: 'PERCENTAGE_SPLIT', entries: [SHARE] })).toEqual([SHARE]);
    expect(shares({ strategy: 'SEQUENTIAL', entries: [ENTRY] })).toEqual([]);
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsPlan(plan: ResolvedTopPriorityPlan): ResolvedTopPriorityPlan {
  return plan;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsPlan({
    // @ts-expect-error - Decision 074 fixes two strategies, and this is not one of them.
    strategy: 'PERCENTAGE',
    entries: [],
  });

  acceptsPlan(
    // @ts-expect-error - Decision 074: a percentage split carries shares, not bare entries.
    {
      strategy: 'PERCENTAGE_SPLIT',
      entries: [ENTRY],
    },
  );

  acceptsPlan({
    strategy: 'SEQUENTIAL',
    entries: [
      {
        ...ENTRY,
        // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
        bucketId: 'bucket-1',
      },
    ],
  });

  acceptsPlan({
    strategy: 'PERCENTAGE_SPLIT',
    entries: [
      {
        ...SHARE,
        // @ts-expect-error - Decision 071: a share is branded BasisPoints, never a bare number.
        shareBasisPoints: 6000,
      },
    ],
  });

  const sequential: ResolvedTopPriorityPlan = { strategy: 'SEQUENTIAL', entries: [ENTRY] };

  // @ts-expect-error - Decision 074: the resolved plan is immutable.
  sequential.strategy = 'PERCENTAGE_SPLIT';

  // @ts-expect-error - Decision 074: the entry list is immutable.
  sequential.entries.push(ENTRY);

  // @ts-expect-error - Decision 074: a resolved entry is immutable.
  ENTRY.rank = 2;
}
