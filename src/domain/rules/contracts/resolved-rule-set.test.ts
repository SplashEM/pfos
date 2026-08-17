import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { timestamp, type Timestamp } from '@domain/shared/dates/timestamp';
import type { DomainWarning } from '@domain/shared/explanations/warning';
import { asEntityId } from '@domain/shared/ids/entity-id';
import { ROUNDING_POLICY_ID } from '@domain/shared/money/rounding-policy';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type { ResolvedFundingRule } from './resolved-funding-rule';
import type { ResolvedGlobalObligation } from './resolved-global-obligation';
import type { ResolvedGoalPolicy } from './resolved-goal-policy';
import type { ResolvedLeftoverPolicy } from './resolved-leftover-policy';
import type { ResolvedPoolPlan } from './resolved-pool-plan';
import type { ResolvedRolloverPolicy } from './resolved-rollover-policy';
import { RESOLVED_RULE_SET_SCHEMA_VERSION, type ResolvedRuleSet } from './resolved-rule-set';
import type { ResolvedTopPriorityPlan } from './resolved-top-priority-plan';
import type { RuleExplanation } from './rule-explanation';
import type { SkippedRule } from './skipped-rule';

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

/** Builds an instant, failing loudly if the test supplied an invalid one. */
function instant(epochMilliseconds: number, timeZone: string): Timestamp {
  const result = timestamp(epochMilliseconds, timeZone);
  if (!result.ok) {
    throw new Error(`Invalid timestamp in test setup: ${result.error.code}`);
  }
  return result.value;
}

/*
 * Each child is built through its own imported contract type, so the root is
 * wired to the accepted contracts rather than to shapes redeclared here.
 */
const OBLIGATION: ResolvedGlobalObligation = {
  ruleId: asEntityId('rule-1'),
  ruleVersionId: asEntityId('rule-version-1'),
  destinationBucketId: asEntityId('bucket-1'),
  rateBasisPoints: rate(1000),
  incomeBasis: 'NET_DEPOSITED',
};

const TOP_PRIORITIES: ResolvedTopPriorityPlan = {
  strategy: 'SEQUENTIAL',
  entries: [
    { bucketId: asEntityId('bucket-2'), rank: 1, ruleVersionIds: [asEntityId('rule-version-2')] },
  ],
};

const FUNDING_RULE: ResolvedFundingRule = {
  bucketId: asEntityId('bucket-3'),
  ruleVersionId: asEntityId('rule-version-3'),
  sequence: 1,
  isProtected: true,
  allowExcessAboveCapacity: false,
  funding: { type: 'FIXED_MONTHLY', monthlyTarget: money(100_000), allowExtraContributions: true },
};

const POOL: ResolvedPoolPlan = {
  strategy: 'EVEN_SPLIT',
  destinations: [
    { bucketId: asEntityId('bucket-4'), ruleVersionIds: [asEntityId('rule-version-4')] },
  ],
};

const LEFTOVER: ResolvedLeftoverPolicy = { policyType: 'LEAVE_UNALLOCATED' };

const ROLLOVER: ResolvedRolloverPolicy = {
  bucketId: asEntityId('bucket-5'),
  ruleVersionId: asEntityId('rule-version-5'),
  policy: { policyType: 'CARRY_ALL' },
};

const GOAL: ResolvedGoalPolicy = {
  bucketId: asEntityId('bucket-6'),
  ruleVersionId: asEntityId('rule-version-6'),
  stopAtTarget: true,
  allowManualExcess: false,
  autoStartNextCycle: false,
  resumeRequiresConfirmation: true,
};

const SKIPPED: SkippedRule = {
  ruleId: asEntityId('rule-7'),
  reasonCode: 'RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE',
  affectedEntityIds: [asEntityId('bucket-7')],
};

const WARNING: DomainWarning = {
  code: 'RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED',
  message: 'No top priorities are configured.',
  affectedEntityIds: [],
};

const EXPLANATION: RuleExplanation = {
  code: 'RULE_EXPLAIN_RESOLUTION_CONTEXT',
  title: 'Resolution context',
  summary: 'Resolved against the evaluation date and the applicable rule versions.',
  affectedEntityIds: [],
};

const RESOLVED_AT: Timestamp = instant(1_767_225_600_000, 'America/Los_Angeles');
const EVALUATION_DATE: FinancialDate = date(2026, 1, 1);

const RULE_SET: ResolvedRuleSet = {
  resolvedRuleSetId: asEntityId('resolved-rule-set-1'),
  planVersionId: asEntityId('plan-version-1'),
  schemaVersion: RESOLVED_RULE_SET_SCHEMA_VERSION,
  roundingPolicyId: ROUNDING_POLICY_ID,
  resolvedAt: RESOLVED_AT,
  evaluationDate: EVALUATION_DATE,
  resolutionMode: 'PREVIEW',
  sourceRuleVersionIds: [asEntityId('rule-version-1')],

  allocationBasis: 'NET_AMOUNT',
  stageSequence: ['GLOBAL_OBLIGATION', 'TOP_PRIORITY', 'REQUIRED_RECURRING'],
  globalObligations: [OBLIGATION],
  topPriorities: TOP_PRIORITIES,
  requiredFundingRules: [FUNDING_RULE],
  lowerPriorityPool: POOL,
  leftoverPolicy: LEFTOVER,
  rolloverPolicies: [ROLLOVER],
  goalPolicies: [GOAL],

  skippedRules: [SKIPPED],
  warnings: [WARNING],
  explanations: [EXPLANATION],
};

const REQUIRED_FIELDS: readonly string[] = [
  'allocationBasis',
  'evaluationDate',
  'explanations',
  'globalObligations',
  'goalPolicies',
  'leftoverPolicy',
  'lowerPriorityPool',
  'planVersionId',
  'requiredFundingRules',
  'resolutionMode',
  'resolvedAt',
  'resolvedRuleSetId',
  'rolloverPolicies',
  'roundingPolicyId',
  'schemaVersion',
  'skippedRules',
  'sourceRuleVersionIds',
  'stageSequence',
  'topPriorities',
  'warnings',
];

/*
 * Decision 092 ratified the baseline of 1 for the shape that carried
 * obligationId and sequence, and established 2 for the shape Decisions 090 and
 * 091 decided. Pinning the literal here keeps the decided value under test while
 * every producer below names the constant.
 */
describe('RESOLVED_RULE_SET_SCHEMA_VERSION', () => {
  it('is the version Decision 092 established', () => {
    expect(RESOLVED_RULE_SET_SCHEMA_VERSION).toBe(2);
  });
});

describe('ResolvedRuleSet', () => {
  it('is constructible complete', () => {
    expect(RULE_SET.resolvedRuleSetId).toBe('resolved-rule-set-1');
    expect(RULE_SET.schemaVersion).toBe(RESOLVED_RULE_SET_SCHEMA_VERSION);
    expect(RULE_SET.resolutionMode).toBe('PREVIEW');
    expect(RULE_SET.allocationBasis).toBe('NET_AMOUNT');
  });

  it('carries every required field', () => {
    expect(Object.keys(RULE_SET).sort()).toEqual(REQUIRED_FIELDS);
  });

  /* Decision 074 marks historicalSnapshotId as the single optional field. */
  it('omits historicalSnapshotId when resolution is not historical', () => {
    expect(Object.keys(RULE_SET)).not.toContain('historicalSnapshotId');
    expect(RULE_SET.historicalSnapshotId).toBeUndefined();
  });

  it('carries historicalSnapshotId when the resolution is a historical recalculation', () => {
    const historical: ResolvedRuleSet = {
      ...RULE_SET,
      resolutionMode: 'HISTORICAL_RECALCULATION',
      historicalSnapshotId: asEntityId('snapshot-1'),
    };

    expect(historical.historicalSnapshotId).toBe('snapshot-1');
    expect(Object.keys(historical).sort()).toEqual(
      [...REQUIRED_FIELDS, 'historicalSnapshotId'].sort(),
    );
  });

  /*
   * Decision 074 represents PFOS-ENG-01 Section 23's effectiveAt as two fields,
   * one date-only and one instant. They are different types carrying different
   * information and neither substitutes for the other.
   */
  it('keeps resolvedAt and evaluationDate as distinct concepts', () => {
    expect(Object.keys(RULE_SET.resolvedAt).sort()).toEqual(['epochMilliseconds', 'timeZone']);
    expect(Object.keys(RULE_SET.evaluationDate).sort()).toEqual(['day', 'month', 'year']);
  });

  /*
   * Decision 071 is authoritative and the identifier is carried once, at the
   * root. It is typed as string rather than the current literal so a historical
   * snapshot can preserve the identifier that applied when it was created.
   */
  it('carries the rounding policy identifier at the root', () => {
    expect(RULE_SET.roundingPolicyId).toBe(ROUNDING_POLICY_ID);
  });

  it('accepts a superseded rounding policy identifier for a historical snapshot', () => {
    const historical: ResolvedRuleSet = { ...RULE_SET, roundingPolicyId: 'PFOS-ROUND-000-LEGACY' };
    expect(historical.roundingPolicyId).toBe('PFOS-ROUND-000-LEGACY');
  });

  it('wires each resolved child contract through its own accepted type', () => {
    expect(RULE_SET.globalObligations).toEqual([OBLIGATION]);
    expect(RULE_SET.topPriorities).toBe(TOP_PRIORITIES);
    expect(RULE_SET.requiredFundingRules).toEqual([FUNDING_RULE]);
    expect(RULE_SET.lowerPriorityPool).toBe(POOL);
    expect(RULE_SET.leftoverPolicy).toBe(LEFTOVER);
    expect(RULE_SET.rolloverPolicies).toEqual([ROLLOVER]);
    expect(RULE_SET.goalPolicies).toEqual([GOAL]);
    expect(RULE_SET.skippedRules).toEqual([SKIPPED]);
    expect(RULE_SET.warnings).toEqual([WARNING]);
    expect(RULE_SET.explanations).toEqual([EXPLANATION]);
  });

  /* The Rule Engine owns the stage order; the resolved set carries it. */
  it('carries the resolved stage sequence in order', () => {
    expect(RULE_SET.stageSequence).toEqual([
      'GLOBAL_OBLIGATION',
      'TOP_PRIORITY',
      'REQUIRED_RECURRING',
    ]);
  });

  it('represents an empty executable and non-executable output', () => {
    const empty: ResolvedRuleSet = {
      ...RULE_SET,
      stageSequence: [],
      globalObligations: [],
      topPriorities: { strategy: 'SEQUENTIAL', entries: [] },
      requiredFundingRules: [],
      rolloverPolicies: [],
      goalPolicies: [],
      skippedRules: [],
      warnings: [],
      explanations: [],
    };

    expect(empty.globalObligations).toEqual([]);
    expect(Object.keys(empty).sort()).toEqual(REQUIRED_FIELDS);
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 *
 * Each literal spreads a complete, valid rule set, so a directive guards the
 * single defect it names rather than an unrelated missing field.
 */
function acceptsRuleSet(ruleSet: ResolvedRuleSet): ResolvedRuleSet {
  return ruleSet;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    resolvedRuleSetId: 'resolved-rule-set-1',
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: planVersionId is an EntityId, never a bare string.
    planVersionId: 'plan-version-1',
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: historicalSnapshotId is an EntityId when present.
    historicalSnapshotId: 'snapshot-1',
  });

  acceptsRuleSet(
    // @ts-expect-error - exactOptionalPropertyTypes: an absent optional is omitted, not undefined.
    { ...RULE_SET, historicalSnapshotId: undefined },
  );

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: schemaVersion is a number.
    schemaVersion: '1',
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: roundingPolicyId is a string identifier.
    roundingPolicyId: 71,
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: resolvedAt is a Timestamp, not a date-only value.
    resolvedAt: EVALUATION_DATE,
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: evaluationDate is a FinancialDate, not an instant.
    evaluationDate: RESOLVED_AT,
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074 fixes three resolution modes, and this is not one of them.
    resolutionMode: 'CONFIRMATION',
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: allocationBasis names NET_AMOUNT or ELIGIBLE_AMOUNT.
    allocationBasis: 'GROSS_AMOUNT',
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: the lower-priority pool is a ResolvedPoolPlan.
    lowerPriorityPool: TOP_PRIORITIES,
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: the leftover policy discriminates on policyType.
    leftoverPolicy: POOL,
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: goalPolicies carries ResolvedGoalPolicy, not a rollover one.
    goalPolicies: [ROLLOVER],
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: no per-rule rounding strategy exists.
    roundingStrategy: 'HALF_UP',
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: no per-rule rounding configuration exists.
    roundingPolicies: [],
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: M2 calculates no allocation amounts.
    totalAllocated: 0,
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: a remaining pool is an M3 calculation.
    remainingPool: 0,
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: allocation lines are M3 output.
    allocationLines: [],
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074 and Blocker F: the contract names the basis, not the amount.
    eligibleIncomeTotal: 0,
  });

  acceptsRuleSet({
    ...RULE_SET,
    // @ts-expect-error - Decision 074: a separate everydaySpendingRules field is not part of V1.
    everydaySpendingRules: [],
  });

  // @ts-expect-error - Decision 074: the resolved rule set is immutable.
  RULE_SET.schemaVersion = 2;

  // @ts-expect-error - Decision 074: the resolved rule set is immutable.
  RULE_SET.resolutionMode = 'SIMULATION';

  // @ts-expect-error - Decision 074: the resolved rule set is immutable.
  RULE_SET.topPriorities = TOP_PRIORITIES;

  // @ts-expect-error - Decision 074: the source rule version list is immutable.
  RULE_SET.sourceRuleVersionIds.push(asEntityId('rule-version-9'));

  // @ts-expect-error - Decision 074: the stage sequence is immutable.
  RULE_SET.stageSequence.push('LEFTOVER_POLICY');

  // @ts-expect-error - Decision 074: the required funding rule list is immutable.
  RULE_SET.requiredFundingRules.push(FUNDING_RULE);

  // @ts-expect-error - Decision 074: the warning channel is immutable.
  RULE_SET.warnings.push(WARNING);

  // @ts-expect-error - Decision 074: the explanation channel is immutable.
  RULE_SET.explanations.push(EXPLANATION);
}
