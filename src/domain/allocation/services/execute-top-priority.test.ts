import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import type { ResolvedFundingRule } from '@domain/rules/contracts/resolved-funding-rule';
import type { ResolvedTopPriorityPlan } from '@domain/rules/contracts/resolved-top-priority-plan';
import { asEntityId } from '@domain/shared/ids/entity-id';

import { ALLOCATION_ERROR_CODES } from '../errors/allocation-error-codes';
import { executeTopPriority } from './execute-top-priority';

const EMERGENCY_FUND = asEntityId('bucket-emergency-fund');
const INSURANCE = asEntityId('bucket-insurance');

function fixedFunding(bucketId: string, cents: number): ResolvedFundingRule {
  return {
    bucketId: asEntityId(bucketId),
    ruleVersionId: asEntityId(`rule-version-${bucketId}`),
    sequence: 1,
    isProtected: false,
    allowExcessAboveCapacity: false,
    funding: { type: 'FIXED_PER_PAYCHECK', amount: money(cents) },
  };
}

function sequential(
  entries: readonly { bucketId: string; rank: number }[],
): ResolvedTopPriorityPlan {
  return {
    strategy: 'SEQUENTIAL',
    entries: entries.map((entry) => ({
      bucketId: asEntityId(entry.bucketId),
      rank: entry.rank,
      ruleVersionIds: [asEntityId(`rule-version-${entry.bucketId}`)],
    })),
  };
}

describe('executeTopPriority', () => {
  it('funds a requirement in full when the pool covers it', () => {
    const result = executeTopPriority(
      sequential([{ bucketId: 'bucket-emergency-fund', rank: 1 }]),
      [fixedFunding('bucket-emergency-fund', 50_000)],
      money(180_000),
    );

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines).toEqual([
      { bucketId: EMERGENCY_FUND, stage: 'TOP_PRIORITY', amount: money(50_000) },
    ]);
    expect(result.value.remainingPool).toEqual(money(130_000));
  });

  /* §17: allocate as much as needed or available, then stop. */
  it('funds partially and exhausts the pool when the requirement exceeds it', () => {
    const result = executeTopPriority(
      sequential([{ bucketId: 'bucket-emergency-fund', rank: 1 }]),
      [fixedFunding('bucket-emergency-fund', 50_000)],
      money(30_000),
    );

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines[0]?.amount).toEqual(money(30_000));
    expect(result.value.remainingPool).toEqual(money(0));
  });

  /*
   * §17 forbids skipping a priority to fund a later one, so rank order decides
   * who is funded when money runs short. Declaring the entries out of order
   * proves the executor sorts by rank rather than trusting array position.
   */
  it('walks priorities in ascending rank regardless of array order', () => {
    const result = executeTopPriority(
      sequential([
        { bucketId: 'bucket-insurance', rank: 2 },
        { bucketId: 'bucket-emergency-fund', rank: 1 },
      ]),
      [fixedFunding('bucket-emergency-fund', 50_000), fixedFunding('bucket-insurance', 30_000)],
      money(60_000),
    );

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines.map((line) => [line.bucketId, line.amount.cents])).toEqual([
      [EMERGENCY_FUND, 50_000],
      [INSURANCE, 10_000],
    ]);
    expect(result.value.remainingPool).toEqual(money(0));
  });

  it('refuses a top priority that has no funding requirement', () => {
    const result = executeTopPriority(
      sequential([{ bucketId: 'bucket-emergency-fund', rank: 1 }]),
      [],
      money(180_000),
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe(
      ALLOCATION_ERROR_CODES.ALLOCATION_TOP_PRIORITY_REQUIREMENT_MISSING,
    );
  });

  it('refuses a funding type this slice cannot evaluate', () => {
    const monthly: ResolvedFundingRule = {
      bucketId: EMERGENCY_FUND,
      ruleVersionId: asEntityId('rule-version-emergency-fund'),
      sequence: 1,
      isProtected: false,
      allowExcessAboveCapacity: false,
      funding: {
        type: 'FIXED_MONTHLY',
        monthlyTarget: money(50_000),
        allowExtraContributions: false,
      },
    };

    const result = executeTopPriority(
      sequential([{ bucketId: 'bucket-emergency-fund', rank: 1 }]),
      [monthly],
      money(180_000),
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe(ALLOCATION_ERROR_CODES.ALLOCATION_FUNDING_TYPE_NOT_SUPPORTED);
  });

  it('refuses a strategy this slice does not implement', () => {
    const percentageSplit: ResolvedTopPriorityPlan = {
      strategy: 'PERCENTAGE_SPLIT',
      entries: [],
    };

    const result = executeTopPriority(percentageSplit, [], money(180_000));

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe(ALLOCATION_ERROR_CODES.ALLOCATION_STRATEGY_NOT_SUPPORTED);
  });

  it('allocates nothing when no top priority is configured', () => {
    const result = executeTopPriority(sequential([]), [], money(180_000));

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines).toEqual([]);
    expect(result.value.remainingPool).toEqual(money(180_000));
  });
});
