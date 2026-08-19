import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import type { Rule } from '@domain/rules/contracts/rule';
import type { RuleConfiguration } from '@domain/rules/contracts/rule-configuration';
import type { RuleVersion } from '@domain/rules/contracts/rule-version';
import { resolveRuleSet, type AuthoredRuleVersions } from '@domain/rules/services/resolve-rule-set';
import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { timestamp, type Timestamp } from '@domain/shared/dates/timestamp';
import { asEntityId, type EntityId } from '@domain/shared/ids/entity-id';
import { formatUsd } from '@domain/shared/money/money-format';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type { AllocationIncomeEvent } from '../contracts/allocation-income-event';
import { executeAllocation } from './execute-allocation';

/*
 * The first end-to-end PFOS slice: authored rules answer a real paycheck.
 *
 * This is the product target. `paycheck-slice.test.ts` asks the same question of
 * a hand-built `ResolvedRuleSet` and remains the lower-level executor test; this
 * one starts one step earlier, from what a user actually authors, and runs the
 * whole path:
 *
 *   authored rule versions -> resolver -> ResolvedRuleSet -> allocation
 *
 * Nothing between the two ends is hardcoded. The stage sequence, the obligation,
 * the top-priority plan, the funding requirement and the leftover policy are all
 * produced by `resolveRuleSet` from the four authored rules below, so a defect
 * in resolution now fails a test about money rather than a test about shapes.
 *
 * The plan is the narrowest one that still exercises meaningful financial
 * behaviour, and it is deliberately arranged so that no unresolved question is
 * reachable: one rule per slot means no same-level contention, one obligation
 * means no canonical-ordering question, and the only funding requirement belongs
 * to the only top priority, so no REQUIRED_RECURRING stage is needed.
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

/** The user authored this plan on New Year's Day, before the January paycheck. */
const AUTHORED_ON = date(2026, 1, 1);

function rule(ruleId: string, owner: Rule['owner'], slotKind: Rule['slotKind']): Rule {
  return { ruleId: asEntityId(ruleId), owner, slotKind, status: 'ACTIVE' };
}

function version(ruleId: string, versionId: string, configuration: RuleConfiguration): RuleVersion {
  return {
    kind: 'CONFIGURED',
    ruleVersionId: asEntityId(versionId),
    ruleId: asEntityId(ruleId),
    period: { effectiveFrom: AUTHORED_ON },
    configuration,
  };
}

const GLOBAL: Rule['owner'] = { ownerType: 'GLOBAL' };

function bucket(bucketId: EntityId): Rule['owner'] {
  return { ownerType: 'BUCKET', ownerId: bucketId };
}

/* "Give 10% of every paycheck." */
const GIVING_RULE: AuthoredRuleVersions = {
  rule: rule('rule-giving', GLOBAL, 'GLOBAL_OBLIGATION'),
  versions: [
    version('rule-giving', 'rule-version-giving-1', {
      slotKind: 'GLOBAL_OBLIGATION',
      destinationBucketId: GIVING,
      rateBasisPoints: rate(1_000),
      incomeBasis: 'NET_DEPOSITED',
      applicability: { scope: 'ALL_SOURCES' },
    }),
  ],
};

/* "Emergency Fund comes first." */
const TOP_PRIORITY_RULE: AuthoredRuleVersions = {
  rule: rule('rule-top-priorities', GLOBAL, 'TOP_PRIORITIES'),
  versions: [
    version('rule-top-priorities', 'rule-version-top-priorities-1', {
      slotKind: 'TOP_PRIORITIES',
      strategy: 'SEQUENTIAL',
      entries: [{ bucketId: EMERGENCY_FUND, rank: 1 }],
    }),
  ],
};

/* "Put $500 into it every paycheck." */
const EMERGENCY_FUND_RULE: AuthoredRuleVersions = {
  rule: rule('rule-emergency-fund', bucket(EMERGENCY_FUND), 'REQUIRED_FUNDING'),
  versions: [
    version('rule-emergency-fund', 'rule-version-emergency-fund-1', {
      slotKind: 'REQUIRED_FUNDING',
      sequence: 1,
      isProtected: false,
      allowExcessAboveCapacity: false,
      funding: { type: 'FIXED_PER_PAYCHECK', amount: money(50_000) },
    }),
  ],
};

/* "Whatever is left is spending money." */
const LEFTOVER_RULE: AuthoredRuleVersions = {
  rule: rule('rule-leftover', GLOBAL, 'LEFTOVER_POLICY'),
  versions: [
    version('rule-leftover', 'rule-version-leftover-1', {
      slotKind: 'LEFTOVER_POLICY',
      policyType: 'SINGLE_DESTINATION',
      destinationBucketId: SPENDING,
    }),
  ],
};

const AUTHORED_PLAN: readonly AuthoredRuleVersions[] = [
  GIVING_RULE,
  TOP_PRIORITY_RULE,
  EMERGENCY_FUND_RULE,
  LEFTOVER_RULE,
];

const PAYCHECK: AllocationIncomeEvent = {
  incomeEventId: asEntityId('income-event-1'),
  incomeSourceId: PRIMARY_JOB,
  eventDate: date(2026, 1, 15),
  netAmount: money(200_000),
  eligibleAmount: money(200_000),
  eventType: 'PAYCHECK',
};

/** Runs the whole path, failing loudly at whichever end broke. */
function allocateAuthoredPaycheck() {
  const plan = resolveRuleSet({
    rules: AUTHORED_PLAN,
    evaluationDate: PAYCHECK.eventDate,
    incomeSourceId: PAYCHECK.incomeSourceId,
    resolvedRuleSetId: asEntityId('resolved-rule-set-paycheck-1'),
    planVersionId: asEntityId('plan-version-1'),
    resolvedAt: instant(1_767_225_600_000, 'America/Los_Angeles'),
    resolutionMode: 'PREVIEW',
  });

  if (!plan.ok) {
    throw new Error(`Resolution failed: ${plan.error.code} — ${plan.error.summary}`);
  }

  const result = executeAllocation(plan.value, PAYCHECK);
  if (!result.ok) {
    throw new Error(`Allocation failed: ${result.error.code} — ${result.error.summary}`);
  }

  return { plan: plan.value, allocation: result.value };
}

describe('the first paycheck answered from authored rules', () => {
  it('sends a $2,000 paycheck where the authored plan says it goes', () => {
    const { allocation } = allocateAuthoredPaycheck();

    const byBucket = Object.fromEntries(
      allocation.lines.map((line) => [line.bucketId, formatUsd(line.amount)]),
    );

    expect(byBucket).toEqual({
      [GIVING]: '$200.00',
      [EMERGENCY_FUND]: '$500.00',
      [SPENDING]: '$1,300.00',
    });

    expect(formatUsd(allocation.totalAllocated)).toBe('$2,000.00');
    expect(formatUsd(allocation.unallocated)).toBe('$0.00');
  });

  it('attributes every line to the stage the resolver sequenced', () => {
    const { plan, allocation } = allocateAuthoredPaycheck();

    expect(plan.stageSequence).toEqual(['GLOBAL_OBLIGATION', 'TOP_PRIORITY', 'LEFTOVER_POLICY']);
    expect(allocation.lines.map((line) => [line.bucketId, line.stage])).toEqual([
      [GIVING, 'GLOBAL_OBLIGATION'],
      [EMERGENCY_FUND, 'TOP_PRIORITY'],
      [SPENDING, 'LEFTOVER_POLICY'],
    ]);
  });

  /* §19.1: the versions that produced a confirmed allocation stay nameable. */
  it('carries the authored versions that produced the answer', () => {
    const { plan } = allocateAuthoredPaycheck();

    expect(plan.sourceRuleVersionIds).toEqual([
      'rule-version-giving-1',
      'rule-version-top-priorities-1',
      'rule-version-emergency-fund-1',
      'rule-version-leftover-1',
    ]);
  });

  /*
   * PFOS-ENG-02 §2: every allocation decreases the remaining pool exactly once,
   * so the paycheck must equal what was allocated plus what was left. The
   * invariant is asserted here too, because resolution now stands between the
   * authored plan and the arithmetic and could lose money without it.
   */
  it('conserves the paycheck exactly', () => {
    const { allocation } = allocateAuthoredPaycheck();

    const lineTotal = allocation.lines.reduce((total, line) => total + line.amount.cents, 0);

    expect(lineTotal + allocation.unallocated.cents).toBe(PAYCHECK.netAmount.cents);
    expect(allocation.totalAllocated.cents).toBe(lineTotal);
  });

  /*
   * Decision 022 makes an edit prospective: a rate raised in April changes the
   * April paycheck and leaves the January one exactly as it was. This is the
   * property the hand-built plan could not test at all, because it had no
   * versions to select between.
   */
  it('answers a later paycheck under the version effective then', () => {
    const givingWithRaise: AuthoredRuleVersions = {
      rule: rule('rule-giving', GLOBAL, 'GLOBAL_OBLIGATION'),
      versions: [
        ...GIVING_RULE.versions,
        {
          kind: 'CONFIGURED',
          ruleVersionId: asEntityId('rule-version-giving-2'),
          ruleId: asEntityId('rule-giving'),
          period: { effectiveFrom: date(2026, 4, 1) },
          configuration: {
            slotKind: 'GLOBAL_OBLIGATION',
            destinationBucketId: GIVING,
            rateBasisPoints: rate(1_500),
            incomeBasis: 'NET_DEPOSITED',
            applicability: { scope: 'ALL_SOURCES' },
          },
        },
      ],
    };

    const aprilPaycheck: AllocationIncomeEvent = { ...PAYCHECK, eventDate: date(2026, 4, 15) };

    const plan = resolveRuleSet({
      rules: [givingWithRaise, TOP_PRIORITY_RULE, EMERGENCY_FUND_RULE, LEFTOVER_RULE],
      evaluationDate: aprilPaycheck.eventDate,
      incomeSourceId: aprilPaycheck.incomeSourceId,
      resolvedRuleSetId: asEntityId('resolved-rule-set-paycheck-2'),
      planVersionId: asEntityId('plan-version-1'),
      resolvedAt: instant(1_767_225_600_000, 'America/Los_Angeles'),
      resolutionMode: 'PREVIEW',
    });

    if (!plan.ok) {
      throw new Error(`Resolution failed: ${plan.error.code}`);
    }

    const result = executeAllocation(plan.value, aprilPaycheck);
    if (!result.ok) {
      throw new Error(`Allocation failed: ${result.error.code}`);
    }

    const byBucket = Object.fromEntries(
      result.value.lines.map((line) => [line.bucketId, formatUsd(line.amount)]),
    );

    expect(byBucket).toEqual({
      [GIVING]: '$300.00',
      [EMERGENCY_FUND]: '$500.00',
      [SPENDING]: '$1,200.00',
    });
  });
});
