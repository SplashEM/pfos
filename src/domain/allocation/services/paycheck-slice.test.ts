import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import type { ResolvedFundingRule } from '@domain/rules/contracts/resolved-funding-rule';
import type { ResolvedGlobalObligation } from '@domain/rules/contracts/resolved-global-obligation';
import type { ResolvedLeftoverPolicy } from '@domain/rules/contracts/resolved-leftover-policy';
import type { ResolvedPoolPlan } from '@domain/rules/contracts/resolved-pool-plan';
import {
  RESOLVED_RULE_SET_SCHEMA_VERSION,
  type ResolvedRuleSet,
} from '@domain/rules/contracts/resolved-rule-set';
import type { ResolvedTopPriorityPlan } from '@domain/rules/contracts/resolved-top-priority-plan';
import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { timestamp, type Timestamp } from '@domain/shared/dates/timestamp';
import { asEntityId } from '@domain/shared/ids/entity-id';
import { formatUsd } from '@domain/shared/money/money-format';
import { ROUNDING_POLICY_ID } from '@domain/shared/money/rounding-policy';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type { AllocationIncomeEvent } from '../contracts/allocation-income-event';
import { executeAllocation } from './execute-allocation';

/*
 * The first executable PFOS slice: one real paycheck, allocated end to end.
 *
 * This test is the product target. It answers "where should my next paycheck
 * go?" for one hardcoded plan, and it is deliberately the narrowest scenario
 * that still exercises meaningful financial behaviour:
 *
 *   - a global percentage obligation (PFOS-ENG-02 §13, §14),
 *   - a sequential top-priority requirement (§17),
 *   - a single-destination leftover policy (§33).
 *
 * The ResolvedRuleSet below is hardcoded, and deliberately stays that way. That
 * is the Milestone 2 output and the Milestone 3 input, so building it by hand
 * is exactly the M2/M3 boundary Decision 074 defines, and it keeps this file a
 * test of the executor alone: a resolution defect cannot reach it.
 *
 * `authored-paycheck.test.ts` is the product-level test that starts one step
 * earlier and runs authored rules through the resolver into this same executor.
 * PFOS no longer needs a hand-built resolved rule set to answer a paycheck; this
 * one exists so the two halves can fail independently.
 *
 * `stageSequence` deliberately omits REQUIRED_RECURRING. Emergency Fund draws
 * its requirement from `requiredFundingRules` once, at the TOP_PRIORITY stage,
 * and no later stage can fund it again, so the unresolved duplicate-destination
 * question (§48) is structurally unreachable rather than answered here.
 *
 * The scenario is fully funded, so shortfall behaviour (§40, §41) is likewise
 * never exercised.
 */

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Builds a timestamp, failing loudly if the test supplied an invalid one. */
function instant(epochMilliseconds: number, timeZone: string): Timestamp {
  const result = timestamp(epochMilliseconds, timeZone);
  if (!result.ok) {
    throw new Error(`Invalid timestamp in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Builds a rate, failing loudly if the test supplied an invalid one. */
function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

const GIVING = asEntityId('bucket-giving');
const EMERGENCY_FUND = asEntityId('bucket-emergency-fund');
const SPENDING = asEntityId('bucket-spending');

const PRIMARY_JOB = asEntityId('income-source-primary-job');

/* Giving takes 10% of the paycheck: 1,000 basis points (§14). */
const TITHE: ResolvedGlobalObligation = {
  ruleId: asEntityId('rule-giving'),
  ruleVersionId: asEntityId('rule-version-giving-1'),
  destinationBucketId: GIVING,
  rateBasisPoints: rate(1_000),
  incomeBasis: 'NET_DEPOSITED',
};

/* Emergency Fund is the sole top priority, and its rank is what orders it. */
const TOP_PRIORITIES: ResolvedTopPriorityPlan = {
  strategy: 'SEQUENTIAL',
  entries: [
    {
      bucketId: EMERGENCY_FUND,
      rank: 1,
      ruleVersionIds: [asEntityId('rule-version-emergency-fund-1')],
    },
  ],
};

/*
 * The top-priority entry carries rank but no amount, so the requirement comes
 * from the bucket's own funding rule. FIXED_PER_PAYCHECK resets every event, so
 * the requirement needs no bucket balance and no period tracking.
 */
const EMERGENCY_FUND_REQUIREMENT: ResolvedFundingRule = {
  bucketId: EMERGENCY_FUND,
  ruleVersionId: asEntityId('rule-version-emergency-fund-1'),
  sequence: 1,
  isProtected: false,
  allowExcessAboveCapacity: false,
  funding: {
    type: 'FIXED_PER_PAYCHECK',
    amount: money(50_000),
  },
};

/* Whatever survives the earlier stages is everyday spending money. */
const LEFTOVER: ResolvedLeftoverPolicy = {
  policyType: 'SINGLE_DESTINATION',
  destinationBucketId: SPENDING,
};

/* No lower-priority pool participates in this slice. */
const EMPTY_POOL: ResolvedPoolPlan = {
  strategy: 'EVEN_SPLIT',
  destinations: [],
};

const PLAN: ResolvedRuleSet = {
  resolvedRuleSetId: asEntityId('resolved-rule-set-paycheck-1'),
  planVersionId: asEntityId('plan-version-1'),
  schemaVersion: RESOLVED_RULE_SET_SCHEMA_VERSION,
  roundingPolicyId: ROUNDING_POLICY_ID,
  resolvedAt: instant(1_767_225_600_000, 'America/Los_Angeles'),
  evaluationDate: date(2026, 1, 1),
  resolutionMode: 'PREVIEW',
  sourceRuleVersionIds: [
    asEntityId('rule-version-emergency-fund-1'),
    asEntityId('rule-version-giving-1'),
  ],

  allocationBasis: 'NET_AMOUNT',
  stageSequence: ['GLOBAL_OBLIGATION', 'TOP_PRIORITY', 'LEFTOVER_POLICY'],
  globalObligations: [TITHE],
  topPriorities: TOP_PRIORITIES,
  requiredFundingRules: [EMERGENCY_FUND_REQUIREMENT],
  lowerPriorityPool: EMPTY_POOL,
  leftoverPolicy: LEFTOVER,
  rolloverPolicies: [],
  goalPolicies: [],

  skippedRules: [],
  warnings: [],
  explanations: [],
};

const PAYCHECK: AllocationIncomeEvent = {
  incomeEventId: asEntityId('income-event-1'),
  incomeSourceId: PRIMARY_JOB,
  eventDate: date(2026, 1, 15),
  netAmount: money(200_000),
  eligibleAmount: money(200_000),
  eventType: 'PAYCHECK',
};

describe('the first executable paycheck', () => {
  it('answers where a $2,000 paycheck should go', () => {
    const result = executeAllocation(PLAN, PAYCHECK);

    if (!result.ok) {
      throw new Error(`Allocation failed: ${result.error.code} — ${result.error.summary}`);
    }

    const byBucket = Object.fromEntries(
      result.value.lines.map((line) => [line.bucketId, formatUsd(line.amount)]),
    );

    expect(byBucket).toEqual({
      [GIVING]: '$200.00',
      [EMERGENCY_FUND]: '$500.00',
      [SPENDING]: '$1,300.00',
    });

    expect(formatUsd(result.value.totalAllocated)).toBe('$2,000.00');
    expect(formatUsd(result.value.unallocated)).toBe('$0.00');
  });

  it('attributes every line to the stage that produced it', () => {
    const result = executeAllocation(PLAN, PAYCHECK);
    if (!result.ok) {
      throw new Error(`Allocation failed: ${result.error.code}`);
    }

    expect(result.value.lines.map((line) => [line.bucketId, line.stage])).toEqual([
      [GIVING, 'GLOBAL_OBLIGATION'],
      [EMERGENCY_FUND, 'TOP_PRIORITY'],
      [SPENDING, 'LEFTOVER_POLICY'],
    ]);
  });

  it('carries the provenance of the plan and the event it allocated', () => {
    const result = executeAllocation(PLAN, PAYCHECK);
    if (!result.ok) {
      throw new Error(`Allocation failed: ${result.error.code}`);
    }

    expect(result.value.incomeEventId).toBe('income-event-1');
    expect(result.value.resolvedRuleSetId).toBe('resolved-rule-set-paycheck-1');
  });

  /*
   * PFOS-ENG-02 §2: every allocation decreases the remaining pool exactly once,
   * so the input must equal what was allocated plus what was left. This is the
   * invariant that makes the arithmetic trustworthy rather than merely correct
   * for this one example.
   */
  it('conserves the paycheck exactly', () => {
    const result = executeAllocation(PLAN, PAYCHECK);
    if (!result.ok) {
      throw new Error(`Allocation failed: ${result.error.code}`);
    }

    const lineTotal = result.value.lines.reduce((total, line) => total + line.amount.cents, 0);

    expect(lineTotal + result.value.unallocated.cents).toBe(PAYCHECK.netAmount.cents);
    expect(result.value.totalAllocated.cents).toBe(lineTotal);
  });
});
