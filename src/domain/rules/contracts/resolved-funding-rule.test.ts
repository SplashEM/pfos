import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type { FundingRuleConfig, ResolvedFundingRule } from './resolved-funding-rule';

/** Builds a rate, failing loudly if the test supplied an invalid one. */
function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

const PERCENTAGE: FundingRuleConfig = {
  type: 'PERCENTAGE_OF_INCOME',
  rateBasisPoints: rate(1500),
  incomeBasis: 'NET_DEPOSITED',
};

const RULE: ResolvedFundingRule = {
  bucketId: asEntityId('bucket-1'),
  ruleVersionId: asEntityId('rule-version-1'),
  sequence: 1,
  isProtected: true,
  allowExcessAboveCapacity: false,
  funding: PERCENTAGE,
};

describe('ResolvedFundingRule', () => {
  it('carries every field', () => {
    expect(RULE).toEqual({
      bucketId: 'bucket-1',
      ruleVersionId: 'rule-version-1',
      sequence: 1,
      isProtected: true,
      allowExcessAboveCapacity: false,
      funding: {
        type: 'PERCENTAGE_OF_INCOME',
        rateBasisPoints: 1500,
        incomeBasis: 'NET_DEPOSITED',
      },
    });
  });

  /*
   * Decision 074: isProtected and allowExcessAboveCapacity record resolved
   * policy. Capacity itself is calculated by M3, so both are plain flags here.
   */
  it('records resolved policy flags independently', () => {
    const unprotected: ResolvedFundingRule = {
      ...RULE,
      isProtected: false,
      allowExcessAboveCapacity: true,
    };

    expect([unprotected.isProtected, unprotected.allowExcessAboveCapacity]).toEqual([false, true]);
  });
});

describe('FundingRuleConfig', () => {
  /*
   * Every variant fixed by Decision 074 must be constructible. A variant that
   * could not be expressed would leave an authored requirement unresolvable.
   */
  const VARIANTS: readonly FundingRuleConfig[] = [
    PERCENTAGE,
    { type: 'FIXED_PER_PAYCHECK', amount: money(25_000) },
    { type: 'FIXED_MONTHLY', monthlyTarget: money(100_000), allowExtraContributions: true },
    {
      type: 'RECURRING_BILL',
      targetAmount: money(8_500),
      dueDate: date(2026, 9, 1),
      recurrence: 'MONTHLY',
    },
    {
      type: 'GOAL_UNTIL_TARGET',
      targetAmount: money(500_000),
      stopAtTarget: true,
      allowManualExcess: false,
    },
    { type: 'MONTHLY_MINIMUM_PLUS_EXTRA', monthlyMinimum: money(20_000), extraEligible: true },
    { type: 'UNLIMITED' },
    { type: 'DEBT_PAYOFF', minimumPayment: money(35_000), extraPaymentEligible: true },
  ];

  it('expresses exactly the eight types fixed by Decision 074', () => {
    expect(VARIANTS.map((variant) => variant.type)).toEqual([
      'PERCENTAGE_OF_INCOME',
      'FIXED_PER_PAYCHECK',
      'FIXED_MONTHLY',
      'RECURRING_BILL',
      'GOAL_UNTIL_TARGET',
      'MONTHLY_MINIMUM_PLUS_EXTRA',
      'UNLIMITED',
      'DEBT_PAYOFF',
    ]);
  });

  it('narrows on the type discriminator', () => {
    const rateOf = (funding: FundingRuleConfig): BasisPoints | undefined =>
      funding.type === 'PERCENTAGE_OF_INCOME' ? funding.rateBasisPoints : undefined;

    expect(rateOf(PERCENTAGE)).toBe(1500);
    expect(rateOf({ type: 'UNLIMITED' })).toBeUndefined();
  });

  it('omits optional members entirely when they are not supplied', () => {
    expect(Object.keys(PERCENTAGE).sort()).toEqual(['incomeBasis', 'rateBasisPoints', 'type']);
  });

  it('carries the optional members when they are supplied', () => {
    const bounded: FundingRuleConfig = {
      type: 'FIXED_PER_PAYCHECK',
      amount: money(25_000),
      startDate: date(2026, 1, 1),
      endDate: date(2026, 12, 31),
      maximumAmount: money(300_000),
    };

    expect(bounded).toEqual({
      type: 'FIXED_PER_PAYCHECK',
      amount: { cents: 25_000, currency: 'USD' },
      startDate: { year: 2026, month: 1, day: 1 },
      endDate: { year: 2026, month: 12, day: 31 },
      maximumAmount: { cents: 300_000, currency: 'USD' },
    });
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsRule(rule: ResolvedFundingRule): ResolvedFundingRule {
  return rule;
}

function acceptsFunding(funding: FundingRuleConfig): FundingRuleConfig {
  return funding;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsRule({
    ...RULE,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    bucketId: 'bucket-1',
  });

  acceptsFunding(
    // @ts-expect-error - Decision 074 fixes eight funding types, and this is not one of them.
    { type: 'PERCENTAGE', rateBasisPoints: rate(1000), incomeBasis: 'NET_DEPOSITED' },
  );

  acceptsFunding({
    type: 'RECURRING_BILL',
    targetAmount: money(8_500),
    dueDate: date(2026, 9, 1),
    recurrence: 'MONTHLY',
    // @ts-expect-error - Decision 074: RECURRING_BILL carries no underfunding configuration.
    underfundingBehavior: 'PARTIAL',
  });

  acceptsFunding({
    type: 'PERCENTAGE_OF_INCOME',
    // @ts-expect-error - Decision 071: a rate is branded BasisPoints, never a bare number.
    rateBasisPoints: 1500,
    incomeBasis: 'NET_DEPOSITED',
  });

  acceptsFunding({
    type: 'FIXED_MONTHLY',
    // @ts-expect-error - PFOS-ENG-00 §10.4: money is never floating-point dollars.
    monthlyTarget: 1000,
    allowExtraContributions: true,
  });

  acceptsFunding(
    // @ts-expect-error - Decision 074: FIXED_MONTHLY requires allowExtraContributions.
    { type: 'FIXED_MONTHLY', monthlyTarget: money(100_000) },
  );

  acceptsFunding({
    type: 'RECURRING_BILL',
    targetAmount: money(8_500),
    dueDate: date(2026, 9, 1),
    // @ts-expect-error - Decision 074: V1 supports only MONTHLY.
    recurrence: 'WEEKLY',
  });

  // @ts-expect-error - Decision 074: the resolved funding rule is immutable.
  RULE.sequence = 2;

  // @ts-expect-error - Decision 074: the resolved funding rule is immutable.
  RULE.funding = PERCENTAGE;
}
