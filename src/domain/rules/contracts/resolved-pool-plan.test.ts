import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type {
  ResolvedPoolDestination,
  ResolvedPoolFixedAmount,
  ResolvedPoolPlan,
  ResolvedPoolShare,
} from './resolved-pool-plan';

/** Builds a share, failing loudly if the test supplied an invalid one. */
function share(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid share in test setup: ${result.error.code}`);
  }
  return result.value;
}

const DESTINATION: ResolvedPoolDestination = {
  bucketId: asEntityId('bucket-1'),
  ruleVersionIds: [asEntityId('rule-version-1')],
};

const SHARE: ResolvedPoolShare = { ...DESTINATION, shareBasisPoints: share(4000) };

const FIXED: ResolvedPoolFixedAmount = { ...DESTINATION, amount: money(25_000), sequence: 1 };

describe('ResolvedPoolDestination', () => {
  it('carries the bucket and the rule versions it was derived from', () => {
    expect(DESTINATION).toEqual({
      bucketId: 'bucket-1',
      ruleVersionIds: ['rule-version-1'],
    });
  });
});

describe('ResolvedPoolShare', () => {
  it('extends a destination with its authored share', () => {
    expect(SHARE).toEqual({
      bucketId: 'bucket-1',
      ruleVersionIds: ['rule-version-1'],
      shareBasisPoints: 4000,
    });
  });

  it('is usable wherever a destination is expected', () => {
    const destination: ResolvedPoolDestination = SHARE;
    expect(destination.bucketId).toBe('bucket-1');
  });
});

describe('ResolvedPoolFixedAmount', () => {
  /*
   * Decision 074: FIXED_AMOUNTS uses sequence where competition order is
   * financially meaningful. The amount is the authored requirement, not a
   * calculated allocation.
   */
  it('extends a destination with its authored amount and sequence', () => {
    expect(FIXED).toEqual({
      bucketId: 'bucket-1',
      ruleVersionIds: ['rule-version-1'],
      amount: { cents: 25_000, currency: 'USD' },
      sequence: 1,
    });
  });

  it('is usable wherever a destination is expected', () => {
    const destination: ResolvedPoolDestination = FIXED;
    expect(destination.bucketId).toBe('bucket-1');
  });
});

describe('ResolvedPoolPlan', () => {
  it('carries even-split destinations', () => {
    const plan: ResolvedPoolPlan = { strategy: 'EVEN_SPLIT', destinations: [DESTINATION] };
    expect(plan.destinations).toEqual([DESTINATION]);
  });

  it('carries percentage-split shares alongside the basis they are taken of', () => {
    const plan: ResolvedPoolPlan = {
      strategy: 'PERCENTAGE_SPLIT',
      basis: 'PERCENT_OF_REMAINING_POOL',
      destinations: [SHARE],
    };

    expect(plan).toEqual({
      strategy: 'PERCENTAGE_SPLIT',
      basis: 'PERCENT_OF_REMAINING_POOL',
      destinations: [SHARE],
    });
  });

  it('carries fixed amounts', () => {
    const plan: ResolvedPoolPlan = { strategy: 'FIXED_AMOUNTS', destinations: [FIXED] };
    expect(plan.destinations).toEqual([FIXED]);
  });

  it('expresses exactly the three strategies fixed by Decision 074', () => {
    const plans: readonly ResolvedPoolPlan[] = [
      { strategy: 'EVEN_SPLIT', destinations: [DESTINATION] },
      { strategy: 'PERCENTAGE_SPLIT', basis: 'PERCENT_OF_TOTAL_INCOME', destinations: [SHARE] },
      { strategy: 'FIXED_AMOUNTS', destinations: [FIXED] },
    ];

    expect(plans.map((plan) => plan.strategy)).toEqual([
      'EVEN_SPLIT',
      'PERCENTAGE_SPLIT',
      'FIXED_AMOUNTS',
    ]);
  });

  it('narrows on the strategy discriminator', () => {
    const basisOf = (plan: ResolvedPoolPlan): string | undefined =>
      plan.strategy === 'PERCENTAGE_SPLIT' ? plan.basis : undefined;

    expect(
      basisOf({
        strategy: 'PERCENTAGE_SPLIT',
        basis: 'PERCENT_OF_TOTAL_INCOME',
        destinations: [SHARE],
      }),
    ).toBe('PERCENT_OF_TOTAL_INCOME');
    expect(basisOf({ strategy: 'EVEN_SPLIT', destinations: [DESTINATION] })).toBeUndefined();
  });

  /*
   * Decision 074 declares the destination lists as plain readonly arrays. This
   * asserts representability only; no validation runs here, and this test does
   * not claim an empty pool is a valid resolution result.
   */
  it('represents an empty destination list under every strategy', () => {
    const plans: readonly ResolvedPoolPlan[] = [
      { strategy: 'EVEN_SPLIT', destinations: [] },
      { strategy: 'PERCENTAGE_SPLIT', basis: 'PERCENT_OF_TOTAL_INCOME', destinations: [] },
      { strategy: 'FIXED_AMOUNTS', destinations: [] },
    ];

    expect(plans.map((plan) => plan.destinations)).toEqual([[], [], []]);
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsPlan(plan: ResolvedPoolPlan): ResolvedPoolPlan {
  return plan;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsPlan({
    // @ts-expect-error - Decision 074 fixes three strategies, and this is not one of them.
    strategy: 'PERCENTAGE',
    destinations: [],
  });

  acceptsPlan(
    // @ts-expect-error - Decision 074: a percentage split carries the basis it is taken of.
    {
      strategy: 'PERCENTAGE_SPLIT',
      destinations: [SHARE],
    },
  );

  acceptsPlan({
    strategy: 'PERCENTAGE_SPLIT',
    // @ts-expect-error - Decision 074: the basis is closed to the PercentageBasis values.
    basis: 'PERCENT_OF_PAYCHECK',
    destinations: [SHARE],
  });

  acceptsPlan(
    // @ts-expect-error - Decision 074: a percentage split carries shares, not bare destinations.
    {
      strategy: 'PERCENTAGE_SPLIT',
      basis: 'PERCENT_OF_TOTAL_INCOME',
      destinations: [DESTINATION],
    },
  );

  acceptsPlan(
    // @ts-expect-error - Decision 074: a fixed amount carries an amount and a sequence.
    {
      strategy: 'FIXED_AMOUNTS',
      destinations: [DESTINATION],
    },
  );

  acceptsPlan({
    strategy: 'EVEN_SPLIT',
    destinations: [
      {
        ...DESTINATION,
        // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
        bucketId: 'bucket-1',
      },
    ],
  });

  acceptsPlan({
    strategy: 'PERCENTAGE_SPLIT',
    basis: 'PERCENT_OF_TOTAL_INCOME',
    destinations: [
      {
        ...SHARE,
        // @ts-expect-error - Decision 071: a share is branded BasisPoints, never a bare number.
        shareBasisPoints: 4000,
      },
    ],
  });

  acceptsPlan({
    strategy: 'FIXED_AMOUNTS',
    destinations: [
      {
        ...FIXED,
        // @ts-expect-error - PFOS-ENG-00 §10.4: money is never floating-point dollars.
        amount: 250,
      },
    ],
  });

  const evenSplit: ResolvedPoolPlan = { strategy: 'EVEN_SPLIT', destinations: [DESTINATION] };

  // @ts-expect-error - Decision 074: the resolved pool plan is immutable.
  evenSplit.strategy = 'FIXED_AMOUNTS';

  // @ts-expect-error - Decision 074: the destination list is immutable.
  evenSplit.destinations.push(DESTINATION);

  // @ts-expect-error - Decision 074: a resolved destination is immutable.
  DESTINATION.bucketId = asEntityId('bucket-2');

  // @ts-expect-error - Decision 074: a resolved fixed amount is immutable.
  FIXED.sequence = 2;
}
