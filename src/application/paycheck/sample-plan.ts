import type { Rule } from '@domain/rules/contracts/rule';
import type { RuleConfiguration } from '@domain/rules/contracts/rule-configuration';
import type { RuleVersion } from '@domain/rules/contracts/rule-version';
import type { AuthoredRuleVersions } from '@domain/rules/services/resolve-rule-set';
import { financialDate } from '@domain/shared/dates/financial-date';
import { asEntityId, type EntityId } from '@domain/shared/ids/entity-id';
import { fromCents, type Money } from '@domain/shared/money/money';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

/**
 * The one authored plan this slice previews against.
 *
 * There is no rule authoring and no persistence yet, so the plan a person sees
 * is this constant. It is a placeholder for authored data, not a product
 * default and not a fallback: nothing here resolves when a rule is missing, and
 * removing this file removes the sample plan rather than changing any rule.
 *
 * It is built from the same authored contracts a real plan will use, so the
 * preview runs the real path — Decision 086's configured versions, through
 * `resolveRuleSet`, into `executeAllocation`. When rule authoring arrives, the
 * authored rules come from the user instead and this file is deleted.
 *
 * The plan is deliberately the narrow one Decisions 096 and 097 make
 * resolvable: one rule per slot, so no same-level contention arises; one
 * obligation, so no canonical ordering question arises; and the only funding
 * requirement belongs to the only top priority, so no REQUIRED_RECURRING stage
 * is needed.
 */

/** Builds a value the constants below are known to satisfy, or fails loudly. */
function required<T>(result: { ok: true; value: T } | { ok: false; error: { code: string } }): T {
  if (!result.ok) {
    throw new Error(`The sample plan is malformed: ${result.error.code}`);
  }
  return result.value;
}

function rate(value: number): BasisPoints {
  return required(basisPoints(value));
}

function usd(cents: number): Money {
  return required(fromCents(cents, 'USD'));
}

export const GIVING_BUCKET = asEntityId('bucket-giving');
export const EMERGENCY_FUND_BUCKET = asEntityId('bucket-emergency-fund');
export const SPENDING_BUCKET = asEntityId('bucket-spending');

/**
 * The income source every previewed paycheck is attributed to.
 *
 * Decision 088 asks its applicability question about one income-source
 * identity, so a preview needs one even though the sample obligation applies to
 * every source.
 */
export const SAMPLE_INCOME_SOURCE = asEntityId('income-source-primary-job');

/** The user authored this plan before the first paycheck it applies to. */
const AUTHORED_ON = required(financialDate(2026, 1, 1));

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

/** "Give 10% of every paycheck." */
const GIVING_RULE: AuthoredRuleVersions = {
  rule: rule('rule-giving', GLOBAL, 'GLOBAL_OBLIGATION'),
  versions: [
    version('rule-giving', 'rule-version-giving-1', {
      slotKind: 'GLOBAL_OBLIGATION',
      destinationBucketId: GIVING_BUCKET,
      rateBasisPoints: rate(1_000),
      incomeBasis: 'NET_DEPOSITED',
      applicability: { scope: 'ALL_SOURCES' },
    }),
  ],
};

/** "Emergency Fund comes first." */
const TOP_PRIORITY_RULE: AuthoredRuleVersions = {
  rule: rule('rule-top-priorities', GLOBAL, 'TOP_PRIORITIES'),
  versions: [
    version('rule-top-priorities', 'rule-version-top-priorities-1', {
      slotKind: 'TOP_PRIORITIES',
      strategy: 'SEQUENTIAL',
      entries: [{ bucketId: EMERGENCY_FUND_BUCKET, rank: 1 }],
    }),
  ],
};

/** "Put $500 into it every paycheck." */
const EMERGENCY_FUND_RULE: AuthoredRuleVersions = {
  rule: rule(
    'rule-emergency-fund',
    { ownerType: 'BUCKET', ownerId: EMERGENCY_FUND_BUCKET },
    'REQUIRED_FUNDING',
  ),
  versions: [
    version('rule-emergency-fund', 'rule-version-emergency-fund-1', {
      slotKind: 'REQUIRED_FUNDING',
      sequence: 1,
      isProtected: false,
      allowExcessAboveCapacity: false,
      funding: { type: 'FIXED_PER_PAYCHECK', amount: usd(50_000) },
    }),
  ],
};

/** "Whatever is left is spending money." */
const LEFTOVER_RULE: AuthoredRuleVersions = {
  rule: rule('rule-leftover', GLOBAL, 'LEFTOVER_POLICY'),
  versions: [
    version('rule-leftover', 'rule-version-leftover-1', {
      slotKind: 'LEFTOVER_POLICY',
      policyType: 'SINGLE_DESTINATION',
      destinationBucketId: SPENDING_BUCKET,
    }),
  ],
};

export const SAMPLE_AUTHORED_PLAN: readonly AuthoredRuleVersions[] = [
  GIVING_RULE,
  TOP_PRIORITY_RULE,
  EMERGENCY_FUND_RULE,
  LEFTOVER_RULE,
];

/**
 * Display names for the buckets this plan allocates to.
 *
 * PFOS-ENG-00 §14 keeps an identifier opaque and PFOS-ENG-01 §26 forbids
 * resolution from depending on a display name, so this mapping lives outside
 * the domain and is read only when rendering. Nothing resolves, matches or
 * orders by a label.
 */
export const SAMPLE_BUCKET_LABELS: Readonly<Record<EntityId, string>> = {
  [GIVING_BUCKET]: 'Giving',
  [EMERGENCY_FUND_BUCKET]: 'Emergency Fund',
  [SPENDING_BUCKET]: 'Spending',
};
