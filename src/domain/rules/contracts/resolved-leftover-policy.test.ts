import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type { ResolvedLeftoverPolicy } from './resolved-leftover-policy';
import type { ResolvedPoolShare } from './resolved-pool-plan';

/** Builds a share, failing loudly if the test supplied an invalid one. */
function share(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid share in test setup: ${result.error.code}`);
  }
  return result.value;
}

const SHARE: ResolvedPoolShare = {
  bucketId: asEntityId('bucket-1'),
  ruleVersionIds: [asEntityId('rule-version-1')],
  shareBasisPoints: share(10_000),
};

describe('ResolvedLeftoverPolicy', () => {
  /*
   * Decision 074: the two field-free variants carry nothing but their
   * discriminator. LEAVE_UNALLOCATED needs no destination, and
   * HIGHEST_PRIORITY_UNFINISHED_GOAL carries no resolved goal-state
   * calculation — the Goal Engine/orchestrator supplies that state.
   */
  it('carries a leave-unallocated policy with nothing but its discriminator', () => {
    const policy: ResolvedLeftoverPolicy = { policyType: 'LEAVE_UNALLOCATED' };
    expect(Object.keys(policy)).toEqual(['policyType']);
  });

  it('carries a highest-priority-unfinished-goal policy with nothing but its discriminator', () => {
    const policy: ResolvedLeftoverPolicy = { policyType: 'HIGHEST_PRIORITY_UNFINISHED_GOAL' };
    expect(Object.keys(policy)).toEqual(['policyType']);
  });

  it('carries a single destination', () => {
    const policy: ResolvedLeftoverPolicy = {
      policyType: 'SINGLE_DESTINATION',
      destinationBucketId: asEntityId('bucket-1'),
    };

    expect(policy).toEqual({
      policyType: 'SINGLE_DESTINATION',
      destinationBucketId: 'bucket-1',
    });
  });

  /* Decision 074 reuses ResolvedPoolShare here rather than declaring a second share type. */
  it('carries percentage-split destinations as pool shares', () => {
    const policy: ResolvedLeftoverPolicy = {
      policyType: 'PERCENTAGE_SPLIT',
      destinations: [SHARE],
    };

    expect(policy).toEqual({
      policyType: 'PERCENTAGE_SPLIT',
      destinations: [
        {
          bucketId: 'bucket-1',
          ruleVersionIds: ['rule-version-1'],
          shareBasisPoints: 10_000,
        },
      ],
    });
  });

  /* The buffer is the authored amount the rule stores, not a calculated remainder. */
  it('carries an authored buffer amount and the bucket to redirect beyond it', () => {
    const policy: ResolvedLeftoverPolicy = {
      policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT',
      bufferAmount: money(50_000),
      destinationBucketId: asEntityId('bucket-2'),
    };

    expect(policy).toEqual({
      policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT',
      bufferAmount: { cents: 50_000, currency: 'USD' },
      destinationBucketId: 'bucket-2',
    });
  });

  it('expresses exactly the five policy types fixed by Decision 074', () => {
    const policies: readonly ResolvedLeftoverPolicy[] = [
      { policyType: 'LEAVE_UNALLOCATED' },
      { policyType: 'SINGLE_DESTINATION', destinationBucketId: asEntityId('bucket-1') },
      { policyType: 'PERCENTAGE_SPLIT', destinations: [SHARE] },
      { policyType: 'HIGHEST_PRIORITY_UNFINISHED_GOAL' },
      {
        policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT',
        bufferAmount: money(50_000),
        destinationBucketId: asEntityId('bucket-2'),
      },
    ];

    expect(policies.map((policy) => policy.policyType)).toEqual([
      'LEAVE_UNALLOCATED',
      'SINGLE_DESTINATION',
      'PERCENTAGE_SPLIT',
      'HIGHEST_PRIORITY_UNFINISHED_GOAL',
      'MAINTAIN_BUFFER_THEN_REDIRECT',
    ]);
  });

  it('narrows on the policyType discriminator', () => {
    const bufferOf = (policy: ResolvedLeftoverPolicy): number | undefined =>
      policy.policyType === 'MAINTAIN_BUFFER_THEN_REDIRECT' ? policy.bufferAmount.cents : undefined;

    expect(
      bufferOf({
        policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT',
        bufferAmount: money(50_000),
        destinationBucketId: asEntityId('bucket-2'),
      }),
    ).toBe(50_000);
    expect(bufferOf({ policyType: 'LEAVE_UNALLOCATED' })).toBeUndefined();
  });

  /*
   * Decision 074 declares the destination list as a plain readonly array. This
   * asserts representability only; no validation runs here.
   */
  it('represents an empty percentage-split destination list', () => {
    const policy: ResolvedLeftoverPolicy = { policyType: 'PERCENTAGE_SPLIT', destinations: [] };
    expect(policy.destinations).toEqual([]);
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsPolicy(policy: ResolvedLeftoverPolicy): ResolvedLeftoverPolicy {
  return policy;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsPolicy({
    // @ts-expect-error - Decision 074 fixes five policy types, and this is not one of them.
    policyType: 'REDIRECT',
  });

  acceptsPolicy(
    // @ts-expect-error - Decision 074: a single-destination policy names its destination.
    { policyType: 'SINGLE_DESTINATION' },
  );

  acceptsPolicy(
    // @ts-expect-error - Decision 074: a buffer policy carries both the buffer and the destination.
    { policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT', bufferAmount: money(50_000) },
  );

  acceptsPolicy({
    policyType: 'SINGLE_DESTINATION',
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    destinationBucketId: 'bucket-1',
  });

  acceptsPolicy({
    policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT',
    // @ts-expect-error - PFOS-ENG-00 §10.4: money is never floating-point dollars.
    bufferAmount: 500,
    destinationBucketId: asEntityId('bucket-2'),
  });

  acceptsPolicy({
    policyType: 'PERCENTAGE_SPLIT',
    destinations: [
      {
        ...SHARE,
        // @ts-expect-error - Decision 071: a share is branded BasisPoints, never a bare number.
        shareBasisPoints: 10_000,
      },
    ],
  });

  acceptsPolicy({
    policyType: 'LEAVE_UNALLOCATED',
    // @ts-expect-error - Decision 074: leaving the remainder unallocated names no destination.
    destinationBucketId: asEntityId('bucket-1'),
  });

  acceptsPolicy({
    policyType: 'SINGLE_DESTINATION',
    destinationBucketId: asEntityId('bucket-1'),
    // @ts-expect-error - Decision 074: no leftover-policy variant carries a fallback.
    fallbackBucketId: asEntityId('bucket-2'),
  });

  acceptsPolicy({
    policyType: 'HIGHEST_PRIORITY_UNFINISHED_GOAL',
    // @ts-expect-error - Decision 074: this variant carries no resolved goal-state calculation.
    goalId: asEntityId('goal-1'),
  });

  const single: ResolvedLeftoverPolicy = {
    policyType: 'SINGLE_DESTINATION',
    destinationBucketId: asEntityId('bucket-1'),
  };

  // @ts-expect-error - Decision 074: the resolved leftover policy is immutable.
  single.policyType = 'LEAVE_UNALLOCATED';

  const split: ResolvedLeftoverPolicy = { policyType: 'PERCENTAGE_SPLIT', destinations: [SHARE] };

  // @ts-expect-error - Decision 074: the destination list is immutable.
  split.destinations.push(SHARE);
}
