import type { AllocationBasis } from '@domain/rules/contracts/allocation-basis';
import type { AllocationStage } from '@domain/rules/contracts/allocation-stage';
import type { IncomeBasis } from '@domain/rules/contracts/income-basis';
import type { PercentageBasis } from '@domain/rules/contracts/percentage-basis';
import type { Recurrence } from '@domain/rules/contracts/recurrence';
import type { ResolutionMode } from '@domain/rules/contracts/resolution-mode';
import type { FundingRuleConfig } from '@domain/rules/contracts/resolved-funding-rule';
import type { ResolvedLeftoverPolicy } from '@domain/rules/contracts/resolved-leftover-policy';
import type { ResolvedPoolPlan } from '@domain/rules/contracts/resolved-pool-plan';
import type { RolloverPolicyConfig } from '@domain/rules/contracts/resolved-rollover-policy';
import type { ResolvedTopPriorityPlan } from '@domain/rules/contracts/resolved-top-priority-plan';
import {
  RESOLVED_RULE_SET_SCHEMA_VERSION,
  type ResolvedRuleSet,
} from '@domain/rules/contracts/resolved-rule-set';
import { isMoney } from '@domain/shared/money/money';

/**
 * Reading a stored `ResolvedRuleSet` back (Decision 098 holding 8).
 *
 * A snapshot embeds this contract by value, so a stored one is untrusted data
 * like any other (PFOS-ENG-00 §29.1) and every arm of it is checked before the
 * record it sits inside is accepted. Checking only the outer members would let
 * a snapshot whose funding rule carried a string where an amount belongs read
 * back as a valid record, which is exactly the outcome holding 8 forbids.
 *
 * This is a reader, not a second declaration of the contract. It answers one
 * question — could this value be the `schemaVersion` 3 shape Decisions 094 and
 * 095 fixed? — and it answers nothing about whether the plan inside is a good
 * one. Every discriminated union below is typed as a total record of the
 * domain's own union, so an arm added there fails to compile here rather than
 * being quietly rejected at runtime.
 *
 * `Money` is checked with the domain's own `isMoney`, which §29.1 provides for
 * untrusted input. Nothing is re-spelled: a stored amount is the same
 * `{ cents, currency }` the contract declares, so the snapshot needs no
 * conversion in either direction.
 *
 * Warning codes are deliberately not checked against the current registry.
 * Decision 077 defers narrowing that field so a historical snapshot can
 * preserve a code that was later retired, and refusing one here would destroy
 * the history the snapshot exists to keep.
 */

/** A total map from a union's members to `true`, so a new member must be added here. */
type Known<TUnion extends string> = Readonly<Record<TUnion, true>>;

const RESOLUTION_MODES: Known<ResolutionMode> = {
  PREVIEW: true,
  SIMULATION: true,
  HISTORICAL_RECALCULATION: true,
};

const ALLOCATION_BASES: Known<AllocationBasis> = {
  NET_AMOUNT: true,
  ELIGIBLE_AMOUNT: true,
};

const INCOME_BASES: Known<IncomeBasis> = { NET_DEPOSITED: true };

const PERCENTAGE_BASES: Known<PercentageBasis> = {
  PERCENT_OF_TOTAL_INCOME: true,
  PERCENT_OF_REMAINING_POOL: true,
};

const RECURRENCES: Known<Recurrence> = { MONTHLY: true };

const STAGES: Known<AllocationStage> = {
  GLOBAL_OBLIGATION: true,
  TOP_PRIORITY: true,
  REQUIRED_RECURRING: true,
  GOAL_FUNDING: true,
  LOWER_PRIORITY: true,
  EVERYDAY_SPENDING: true,
  LEFTOVER_POLICY: true,
  EVENT_OVERRIDE: true,
};

/** One arm of a discriminated union, checked by its own members. */
type ArmCheck = (arm: Record<string, unknown>) => boolean;

const FUNDING_ARMS: Readonly<Record<FundingRuleConfig['type'], ArmCheck>> = {
  PERCENTAGE_OF_INCOME: (arm) =>
    isBasisPoints(arm['rateBasisPoints']) &&
    isMember(arm['incomeBasis'], INCOME_BASES) &&
    isOptional(arm['maximumAmount'], isMoney),
  FIXED_PER_PAYCHECK: (arm) =>
    isMoney(arm['amount']) &&
    isOptional(arm['startDate'], isFinancialDate) &&
    isOptional(arm['endDate'], isFinancialDate) &&
    isOptional(arm['maximumAmount'], isMoney),
  FIXED_MONTHLY: (arm) =>
    isMoney(arm['monthlyTarget']) && typeof arm['allowExtraContributions'] === 'boolean',
  RECURRING_BILL: (arm) =>
    isMoney(arm['targetAmount']) &&
    isFinancialDate(arm['dueDate']) &&
    isMember(arm['recurrence'], RECURRENCES),
  GOAL_UNTIL_TARGET: (arm) =>
    isMoney(arm['targetAmount']) &&
    isOptional(arm['deadline'], isFinancialDate) &&
    typeof arm['stopAtTarget'] === 'boolean' &&
    typeof arm['allowManualExcess'] === 'boolean',
  MONTHLY_MINIMUM_PLUS_EXTRA: (arm) =>
    isMoney(arm['monthlyMinimum']) && typeof arm['extraEligible'] === 'boolean',
  UNLIMITED: (arm) => isOptional(arm['minimumAmount'], isMoney),
  DEBT_PAYOFF: (arm) =>
    isMoney(arm['minimumPayment']) &&
    isOptional(arm['dueDate'], isFinancialDate) &&
    typeof arm['extraPaymentEligible'] === 'boolean' &&
    isOptional(arm['targetPayoffAmount'], isMoney),
};

const LEFTOVER_ARMS: Readonly<Record<ResolvedLeftoverPolicy['policyType'], ArmCheck>> = {
  LEAVE_UNALLOCATED: () => true,
  SINGLE_DESTINATION: (arm) => isId(arm['destinationBucketId']),
  PERCENTAGE_SPLIT: (arm) => isArrayOf(arm['destinations'], isPoolShare),
  HIGHEST_PRIORITY_UNFINISHED_GOAL: () => true,
  MAINTAIN_BUFFER_THEN_REDIRECT: (arm) =>
    isMoney(arm['bufferAmount']) && isId(arm['destinationBucketId']),
};

const POOL_ARMS: Readonly<Record<ResolvedPoolPlan['strategy'], ArmCheck>> = {
  EVEN_SPLIT: (arm) => isArrayOf(arm['destinations'], isPoolDestination),
  PERCENTAGE_SPLIT: (arm) =>
    isMember(arm['basis'], PERCENTAGE_BASES) && isArrayOf(arm['destinations'], isPoolShare),
  FIXED_AMOUNTS: (arm) => isArrayOf(arm['destinations'], isPoolFixedAmount),
};

const TOP_PRIORITY_ARMS: Readonly<Record<ResolvedTopPriorityPlan['strategy'], ArmCheck>> = {
  SEQUENTIAL: (arm) => isArrayOf(arm['entries'], isTopPriorityEntry),
  PERCENTAGE_SPLIT: (arm) =>
    isArrayOf(
      arm['entries'],
      (entry) => isTopPriorityEntry(entry) && isBasisPoints(asRecord(entry)?.['shareBasisPoints']),
    ),
};

const ROLLOVER_ARMS: Readonly<Record<RolloverPolicyConfig['policyType'], ArmCheck>> = {
  CARRY_ALL: () => true,
  RESET: () => true,
  CARRY_TO_CAP: (arm) => isMoney(arm['capAmount']),
  REDIRECT_EXCESS: (arm) => isMoney(arm['capAmount']) && isId(arm['destinationBucketId']),
  APPLY_LEFTOVER_POLICY: (arm) => isMoney(arm['capAmount']),
};

/**
 * Whether a stored value is the resolved rule set this build reads.
 *
 * The schema version is checked by the caller, which reports an unreadable
 * version differently from an unreadable shape.
 */
export function isStoredResolvedRuleSet(value: unknown): value is ResolvedRuleSet {
  const set = asRecord(value);
  if (set === undefined) {
    return false;
  }

  return (
    set['schemaVersion'] === RESOLVED_RULE_SET_SCHEMA_VERSION &&
    isId(set['resolvedRuleSetId']) &&
    isId(set['planVersionId']) &&
    isId(set['roundingPolicyId']) &&
    isTimestamp(set['resolvedAt']) &&
    isFinancialDate(set['evaluationDate']) &&
    isMember(set['resolutionMode'], RESOLUTION_MODES) &&
    isOptional(set['historicalSnapshotId'], isId) &&
    isArrayOf(set['sourceRuleVersionIds'], isId) &&
    isMember(set['allocationBasis'], ALLOCATION_BASES) &&
    isArrayOf(set['stageSequence'], (stage) => isMember(stage, STAGES)) &&
    isArrayOf(set['globalObligations'], isGlobalObligation) &&
    isArm(set['topPriorities'], 'strategy', TOP_PRIORITY_ARMS) &&
    isArrayOf(set['requiredFundingRules'], isFundingRule) &&
    isArm(set['lowerPriorityPool'], 'strategy', POOL_ARMS) &&
    isArm(set['leftoverPolicy'], 'policyType', LEFTOVER_ARMS) &&
    isArrayOf(set['rolloverPolicies'], isRolloverPolicy) &&
    isArrayOf(set['goalPolicies'], isGoalPolicy) &&
    isArrayOf(set['skippedRules'], isSkippedRule) &&
    isArrayOf(set['warnings'], isWarning) &&
    isArrayOf(set['explanations'], isExplanation)
  );
}

function isGlobalObligation(value: unknown): boolean {
  const obligation = asRecord(value);

  return (
    obligation !== undefined &&
    isId(obligation['ruleId']) &&
    isId(obligation['ruleVersionId']) &&
    isId(obligation['destinationBucketId']) &&
    isBasisPoints(obligation['rateBasisPoints']) &&
    isMember(obligation['incomeBasis'], INCOME_BASES) &&
    isOptional(obligation['maximumAmount'], isMoney)
  );
}

function isFundingRule(value: unknown): boolean {
  const rule = asRecord(value);

  return (
    rule !== undefined &&
    isId(rule['bucketId']) &&
    isId(rule['ruleVersionId']) &&
    Number.isSafeInteger(rule['sequence']) &&
    typeof rule['isProtected'] === 'boolean' &&
    typeof rule['allowExcessAboveCapacity'] === 'boolean' &&
    isArm(rule['funding'], 'type', FUNDING_ARMS)
  );
}

function isRolloverPolicy(value: unknown): boolean {
  const policy = asRecord(value);
  if (policy === undefined || !isArm(policy['policy'], 'policyType', ROLLOVER_ARMS)) {
    return false;
  }

  const provenance = asRecord(policy['provenance']);
  if (provenance === undefined) {
    return false;
  }

  /* Decision 094: the authored arm names a version, the product default names none. */
  const provenanceIsReadable =
    (provenance['kind'] === 'AUTHORED' && isId(provenance['ruleVersionId'])) ||
    (provenance['kind'] === 'PRODUCT_DEFAULT' && provenance['ruleVersionId'] === undefined);

  return isId(policy['bucketId']) && provenanceIsReadable;
}

function isGoalPolicy(value: unknown): boolean {
  const policy = asRecord(value);

  return (
    policy !== undefined &&
    isId(policy['bucketId']) &&
    isId(policy['ruleVersionId']) &&
    typeof policy['stopAtTarget'] === 'boolean' &&
    typeof policy['allowManualExcess'] === 'boolean' &&
    typeof policy['autoStartNextCycle'] === 'boolean' &&
    typeof policy['resumeRequiresConfirmation'] === 'boolean'
  );
}

function isSkippedRule(value: unknown): boolean {
  const skipped = asRecord(value);

  return (
    skipped !== undefined &&
    isId(skipped['ruleId']) &&
    isOptional(skipped['ruleVersionId'], isId) &&
    isId(skipped['reasonCode']) &&
    isArrayOf(skipped['affectedEntityIds'], isId)
  );
}

function isWarning(value: unknown): boolean {
  const warning = asRecord(value);

  return (
    warning !== undefined &&
    isId(warning['code']) &&
    typeof warning['message'] === 'string' &&
    isArrayOf(warning['affectedEntityIds'], isId) &&
    isOptional(warning['recommendedAction'], (action) => typeof action === 'string')
  );
}

function isExplanation(value: unknown): boolean {
  const explanation = asRecord(value);

  return (
    explanation !== undefined &&
    isId(explanation['code']) &&
    typeof explanation['title'] === 'string' &&
    typeof explanation['summary'] === 'string' &&
    isArrayOf(explanation['affectedEntityIds'], isId) &&
    isOptional(explanation['ruleVersionIds'], (ids) => isArrayOf(ids, isId))
  );
}

function isPoolDestination(value: unknown): boolean {
  const destination = asRecord(value);

  return (
    destination !== undefined &&
    isId(destination['bucketId']) &&
    isArrayOf(destination['ruleVersionIds'], isId)
  );
}

function isPoolShare(value: unknown): boolean {
  return isPoolDestination(value) && isBasisPoints(asRecord(value)?.['shareBasisPoints']);
}

function isPoolFixedAmount(value: unknown): boolean {
  const destination = asRecord(value);

  return (
    isPoolDestination(value) &&
    isMoney(destination?.['amount']) &&
    Number.isSafeInteger(destination?.['sequence'])
  );
}

function isTopPriorityEntry(value: unknown): boolean {
  const entry = asRecord(value);

  return (
    entry !== undefined &&
    isId(entry['bucketId']) &&
    Number.isSafeInteger(entry['rank']) &&
    isArrayOf(entry['ruleVersionIds'], isId)
  );
}

/** Checks a discriminated union: the discriminant names an arm, and the arm reads. */
function isArm(
  value: unknown,
  discriminant: string,
  arms: Readonly<Record<string, ArmCheck>>,
): boolean {
  const record = asRecord(value);
  if (record === undefined) {
    return false;
  }

  const key = record[discriminant];
  if (typeof key !== 'string' || !Object.hasOwn(arms, key)) {
    return false;
  }

  return arms[key]?.(record) ?? false;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function isArrayOf(value: unknown, check: (entry: unknown) => boolean): boolean {
  return Array.isArray(value) && (value as readonly unknown[]).every(check);
}

/** An absent optional member reads; a present one must still be valid. */
function isOptional(value: unknown, check: (present: unknown) => boolean): boolean {
  return value === undefined || check(value);
}

function isMember(value: unknown, known: Readonly<Record<string, true>>): boolean {
  return typeof value === 'string' && Object.hasOwn(known, value);
}

/** An opaque identifier or code (PFOS-ENG-00 §14): a non-empty string, unparsed. */
function isId(value: unknown): boolean {
  return typeof value === 'string' && value.length > 0;
}

/** A rate in basis points: an integer from 0 to 10,000 (PFOS-ENG-00 §11). */
function isBasisPoints(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10_000;
}

function isFinancialDate(value: unknown): boolean {
  const date = asRecord(value);

  return (
    date !== undefined &&
    Number.isSafeInteger(date['year']) &&
    Number.isSafeInteger(date['month']) &&
    Number.isSafeInteger(date['day'])
  );
}

function isTimestamp(value: unknown): boolean {
  const moment = asRecord(value);

  return (
    moment !== undefined &&
    Number.isSafeInteger(moment['epochMilliseconds']) &&
    isId(moment['timeZone'])
  );
}
