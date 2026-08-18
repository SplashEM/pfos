import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import type { AllocationStage } from '@domain/rules/contracts/allocation-stage';
import {
  RESOLVED_RULE_SET_SCHEMA_VERSION,
  type ResolvedRuleSet,
} from '@domain/rules/contracts/resolved-rule-set';
import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { timestamp, type Timestamp } from '@domain/shared/dates/timestamp';
import { asEntityId } from '@domain/shared/ids/entity-id';
import { ROUNDING_POLICY_ID } from '@domain/shared/money/rounding-policy';

import type { AllocationIncomeEvent } from '../contracts/allocation-income-event';
import { ALLOCATION_ERROR_CODES } from '../errors/allocation-error-codes';
import { executeAllocation } from './execute-allocation';

function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

function instant(epochMilliseconds: number, timeZone: string): Timestamp {
  const result = timestamp(epochMilliseconds, timeZone);
  if (!result.ok) {
    throw new Error(`Invalid timestamp in test setup: ${result.error.code}`);
  }
  return result.value;
}

const SPENDING = asEntityId('bucket-spending');

/** A plan carrying only a leftover policy, so a stage can be varied in isolation. */
function planWithStages(stageSequence: readonly AllocationStage[]): ResolvedRuleSet {
  return {
    resolvedRuleSetId: asEntityId('resolved-rule-set-1'),
    planVersionId: asEntityId('plan-version-1'),
    schemaVersion: RESOLVED_RULE_SET_SCHEMA_VERSION,
    roundingPolicyId: ROUNDING_POLICY_ID,
    resolvedAt: instant(1_767_225_600_000, 'America/Los_Angeles'),
    evaluationDate: date(2026, 1, 1),
    resolutionMode: 'PREVIEW',
    sourceRuleVersionIds: [],

    allocationBasis: 'NET_AMOUNT',
    stageSequence,
    globalObligations: [],
    topPriorities: { strategy: 'SEQUENTIAL', entries: [] },
    requiredFundingRules: [],
    lowerPriorityPool: { strategy: 'EVEN_SPLIT', destinations: [] },
    leftoverPolicy: { policyType: 'SINGLE_DESTINATION', destinationBucketId: SPENDING },
    rolloverPolicies: [],
    goalPolicies: [],

    skippedRules: [],
    warnings: [],
    explanations: [],
  };
}

const PAYCHECK: AllocationIncomeEvent = {
  incomeEventId: asEntityId('income-event-1'),
  incomeSourceId: asEntityId('income-source-1'),
  eventDate: date(2026, 1, 15),
  netAmount: money(200_000),
  eligibleAmount: money(150_000),
  eventType: 'PAYCHECK',
};

describe('executeAllocation', () => {
  it('starts the pool from the net amount under the NET_AMOUNT basis', () => {
    const result = executeAllocation(planWithStages(['LEFTOVER_POLICY']), PAYCHECK);

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    /* The event's eligible amount differs, so this proves which one was used. */
    expect(result.value.totalAllocated).toEqual(money(200_000));
  });

  /*
   * The Rule Engine owns the stage order and the Allocation Engine executes it,
   * so a plan sequencing no stages allocates nothing rather than falling back to
   * a default order held here.
   */
  it('executes exactly the stages the resolved set sequences', () => {
    const result = executeAllocation(planWithStages([]), PAYCHECK);

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines).toEqual([]);
    expect(result.value.totalAllocated).toEqual(money(0));
    expect(result.value.unallocated).toEqual(money(200_000));
  });

  /*
   * Skipping an unsupported stage would silently drop money the plan intended
   * to allocate and report it as unallocated, which reads as a correct answer.
   */
  it('refuses a stage it cannot execute rather than skipping it', () => {
    const result = executeAllocation(planWithStages(['GOAL_FUNDING']), PAYCHECK);

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe(ALLOCATION_ERROR_CODES.ALLOCATION_STAGE_NOT_SUPPORTED);
  });

  it('refuses the REQUIRED_RECURRING stage this slice deliberately omits', () => {
    const result = executeAllocation(planWithStages(['REQUIRED_RECURRING']), PAYCHECK);

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe(ALLOCATION_ERROR_CODES.ALLOCATION_STAGE_NOT_SUPPORTED);
  });

  it('refuses an allocation basis it cannot execute', () => {
    const eligibleBasis: ResolvedRuleSet = {
      ...planWithStages(['LEFTOVER_POLICY']),
      allocationBasis: 'ELIGIBLE_AMOUNT',
    };

    const result = executeAllocation(eligibleBasis, PAYCHECK);

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe(ALLOCATION_ERROR_CODES.ALLOCATION_STRATEGY_NOT_SUPPORTED);
  });

  /* PFOS-ENG-02 §2, checked on a plan that leaves money on the table. */
  it('conserves the pool when no stage consumes it', () => {
    const result = executeAllocation(planWithStages([]), PAYCHECK);

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.totalAllocated.cents + result.value.unallocated.cents).toBe(
      PAYCHECK.netAmount.cents,
    );
  });
});
