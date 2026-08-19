import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import type { ResolvedGlobalObligation } from '@domain/rules/contracts/resolved-global-obligation';
import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type { AllocationIncomeEvent } from '../contracts/allocation-income-event';
import { executeGlobalObligations } from './execute-global-obligations';

function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

const GIVING = asEntityId('bucket-giving');
const SAVINGS = asEntityId('bucket-savings');

function event(netCents: number): AllocationIncomeEvent {
  return {
    incomeEventId: asEntityId('income-event-1'),
    incomeSourceId: asEntityId('income-source-1'),
    eventDate: date(2026, 1, 15),
    netAmount: money(netCents),
    eligibleAmount: money(netCents),
    eventType: 'PAYCHECK',
  };
}

function obligation(bucketId: string, bp: number): ResolvedGlobalObligation {
  return {
    ruleId: asEntityId(`rule-${bucketId}`),
    ruleVersionId: asEntityId(`rule-version-${bucketId}`),
    destinationBucketId: asEntityId(bucketId),
    rateBasisPoints: rate(bp),
    incomeBasis: 'NET_DEPOSITED',
  };
}

describe('executeGlobalObligations', () => {
  it('allocates ten percent of a two thousand dollar paycheck', () => {
    const result = executeGlobalObligations(
      [obligation('bucket-giving', 1_000)],
      event(200_000),
      money(200_000),
    );

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines).toEqual([
      {
        bucketId: GIVING,
        stage: 'GLOBAL_OBLIGATION',
        amount: money(20_000),
        explanation: {
          code: 'ALLOCATION_EXPLAIN_OBLIGATION_RATE',
          rateBasisPoints: 1_000,
        },
      },
    ]);
    expect(result.value.remainingPool).toEqual(money(180_000));
  });

  /*
   * PFOS-ENG-02 §14's worked example. The obligation occupies index 0 of the
   * complementary split, so an exact half cent rounds to the obligation.
   */
  it('rounds an exact half cent to the obligation', () => {
    const result = executeGlobalObligations(
      [obligation('bucket-giving', 1_000)],
      event(100_005),
      money(100_005),
    );

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines[0]?.amount).toEqual(money(10_001));
  });

  /* §14: the complement is an arithmetic device and must never become a line. */
  it('emits one line per obligation and never the complement', () => {
    const result = executeGlobalObligations(
      [obligation('bucket-giving', 1_000)],
      event(200_000),
      money(200_000),
    );

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines).toHaveLength(1);
  });

  /*
   * §14: separately authored obligations are independent splits, each against
   * its own income basis. The second must not be computed on the amount the
   * first already reduced, which would yield $180 rather than $200.
   */
  it('evaluates each obligation against the income amount, not the depleted pool', () => {
    const result = executeGlobalObligations(
      [obligation('bucket-giving', 1_000), obligation('bucket-savings', 1_000)],
      event(200_000),
      money(200_000),
    );

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines.map((line) => [line.bucketId, line.amount.cents])).toEqual([
      [GIVING, 20_000],
      [SAVINGS, 20_000],
    ]);
    expect(result.value.remainingPool).toEqual(money(160_000));
  });

  it('leaves the pool untouched when no obligation is authored', () => {
    const result = executeGlobalObligations([], event(200_000), money(200_000));

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines).toEqual([]);
    expect(result.value.remainingPool).toEqual(money(200_000));
  });
});
