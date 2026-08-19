import type { Rule } from '@domain/rules/contracts/rule';
import type { RuleConfiguration } from '@domain/rules/contracts/rule-configuration';
import type { RuleVersion } from '@domain/rules/contracts/rule-version';
import type { AuthoredRuleVersions } from '@domain/rules/services/resolve-rule-set';
import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { domainError, type DomainError } from '@domain/shared/errors/domain-error';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { err, ok, type Result } from '@domain/shared/errors/result';
import { asEntityId, type EntityId } from '@domain/shared/ids/entity-id';
import { formatUsd } from '@domain/shared/money/money-format';
import { parseUsd } from '@domain/shared/money/money-parse';
import type { Money } from '@domain/shared/money/money';
import { fromPercent, type BasisPoints } from '@domain/shared/percentages/basis-points';

import { APPLICATION_ERROR_CODES } from '../errors/application-error-codes';

/**
 * The few plan values a person can currently change.
 *
 * Each is held as typed text and parsed here, so the screen stores what was
 * typed and this layer owns every conversion. Nothing above parses money or a
 * rate, and nothing below sees a string.
 *
 * This is not the authoring system. Rule authoring covers owners, slot kinds,
 * strategies, applicability, effective periods and lifecycle; this covers three
 * numbers and a name, chosen because they are the values that visibly move the
 * answer in the one scenario PFOS can currently preview. Everything else about
 * the plan stays fixed, and the authored rules built below are the same shape a
 * real authoring system will produce.
 *
 * Edits live for as long as the page does. Nothing here persists, and no part of
 * the product suggests otherwise.
 */
export interface EditablePaycheckPlan {
  /** A plain percentage as typed, such as `10` or `12.5`. */
  readonly givingPercent: string;
  /** A dollar amount as typed, such as `500` or `$1,250.00`. */
  readonly emergencyFundPerPaycheck: string;
  /** What to call the bucket that receives whatever is left. */
  readonly leftoverLabel: string;
}

/** The plan a person starts from, before changing anything. */
export const DEFAULT_PAYCHECK_PLAN: EditablePaycheckPlan = {
  givingPercent: '10',
  emergencyFundPerPaycheck: '500.00',
  leftoverLabel: 'Spending',
};

/** Authored rules ready for the resolver, with names for what they fund. */
export interface AuthoredPaycheckPlan {
  readonly rules: readonly AuthoredRuleVersions[];
  readonly labels: Readonly<Record<EntityId, string>>;
}

/**
 * Bucket identities are stable across every edit.
 *
 * Renaming a destination changes what a person is shown and nothing else: the
 * bucket keeps its identifier, so the authored rules keep pointing at the same
 * bucket and no edit mints an entity. PFOS-ENG-00 §14 keeps identifiers opaque
 * and PFOS-ENG-01 §26 forbids resolution from depending on a display name,
 * which is exactly why a label can change freely.
 */
export const GIVING_BUCKET = asEntityId('bucket-giving');
export const EMERGENCY_FUND_BUCKET = asEntityId('bucket-emergency-fund');
export const LEFTOVER_BUCKET = asEntityId('bucket-leftover');

/**
 * The income source every previewed paycheck is attributed to.
 *
 * Decision 088 asks its applicability question about one income-source
 * identity, so a preview needs one even though this plan's obligation applies
 * to every source.
 */
export const SAMPLE_INCOME_SOURCE = asEntityId('income-source-primary-job');

/** The date from which this plan's rules are in effect. */
const AUTHORED_ON: FinancialDate = (() => {
  const result = financialDate(2026, 1, 1);
  if (!result.ok) {
    throw new Error(`The plan's effective date is malformed: ${result.error.code}`);
  }
  return result.value;
})();

/**
 * Builds the authored rule versions for one edited plan.
 *
 * The output is ordinary authored data — Decision 086 configured versions
 * carrying Decision 096 and 097 configurations — so it flows through
 * `resolveRuleSet` exactly as a stored plan would. Nothing here resolves,
 * allocates, or decides an order.
 *
 * The plan is deliberately the narrow one the resolver can answer: one rule per
 * slot, so no same-level contention arises; one obligation, so no canonical
 * ordering question arises; and the only funding requirement belongs to the
 * only top priority, so no REQUIRED_RECURRING stage is needed. Editing the
 * three values below cannot move it out of that shape.
 */
export function buildAuthoredPaycheckPlan(
  plan: EditablePaycheckPlan,
): Result<AuthoredPaycheckPlan, DomainError> {
  const givingRate = parseGivingPercent(plan.givingPercent);
  if (!givingRate.ok) {
    return givingRate;
  }

  const emergencyFundAmount = parseFundingAmount(plan.emergencyFundPerPaycheck);
  if (!emergencyFundAmount.ok) {
    return emergencyFundAmount;
  }

  const leftoverLabel = plan.leftoverLabel.trim();
  if (leftoverLabel === '') {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_PLAN_LEFTOVER_LABEL_EMPTY,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'Name the destination that receives what is left.',
        details: 'The leftover destination label was blank.',
      }),
    );
  }

  return ok({
    rules: [
      givingRule(givingRate.value),
      topPriorityRule(),
      emergencyFundRule(emergencyFundAmount.value),
      leftoverRule(),
    ],
    labels: {
      [GIVING_BUCKET]: 'Giving',
      [EMERGENCY_FUND_BUCKET]: 'Emergency Fund',
      [LEFTOVER_BUCKET]: leftoverLabel,
    },
  });
}

const PERCENT_PATTERN = /^([0-9]{1,3})(?:[.]([0-9]{1,2}))?$/;

/**
 * Reads a typed percentage into an exact rate.
 *
 * Only the shape is checked here. `fromPercent` owns the conversion, including
 * its guard against a value finer than one basis point, and `basisPoints` owns
 * the 0%-to-100% bound; both answers are returned unchanged, so no percentage
 * limit is restated or invented in this layer.
 */
function parseGivingPercent(input: string): Result<BasisPoints, DomainError> {
  const trimmed = input.trim();

  if (!PERCENT_PATTERN.test(trimmed)) {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_PLAN_GIVING_PERCENT_INVALID,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'Enter a percentage such as 10 or 12.5.',
        details: `Received ${JSON.stringify(input)}.`,
      }),
    );
  }

  return fromPercent(Number(trimmed));
}

/** Reads a typed dollar amount into a funding requirement. */
function parseFundingAmount(input: string): Result<Money, DomainError> {
  const amount = parseUsd(input);
  if (!amount.ok) {
    return amount;
  }

  if (amount.value.cents < 0) {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_PLAN_FUNDING_AMOUNT_NEGATIVE,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'A funding amount cannot be negative.',
        details: `Received ${formatUsd(amount.value)}.`,
      }),
    );
  }

  return ok(amount.value);
}

const GLOBAL: Rule['owner'] = { ownerType: 'GLOBAL' };

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

/** "Give this share of every paycheck." */
function givingRule(rateBasisPoints: BasisPoints): AuthoredRuleVersions {
  return {
    rule: rule('rule-giving', GLOBAL, 'GLOBAL_OBLIGATION'),
    versions: [
      version('rule-giving', 'rule-version-giving-1', {
        slotKind: 'GLOBAL_OBLIGATION',
        destinationBucketId: GIVING_BUCKET,
        rateBasisPoints,
        incomeBasis: 'NET_DEPOSITED',
        applicability: { scope: 'ALL_SOURCES' },
      }),
    ],
  };
}

/** "Emergency Fund comes first." */
function topPriorityRule(): AuthoredRuleVersions {
  return {
    rule: rule('rule-top-priorities', GLOBAL, 'TOP_PRIORITIES'),
    versions: [
      version('rule-top-priorities', 'rule-version-top-priorities-1', {
        slotKind: 'TOP_PRIORITIES',
        strategy: 'SEQUENTIAL',
        entries: [{ bucketId: EMERGENCY_FUND_BUCKET, rank: 1 }],
      }),
    ],
  };
}

/** "Put this much into it every paycheck." */
function emergencyFundRule(amount: Money): AuthoredRuleVersions {
  return {
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
        funding: { type: 'FIXED_PER_PAYCHECK', amount },
      }),
    ],
  };
}

/** "Whatever is left goes here." */
function leftoverRule(): AuthoredRuleVersions {
  return {
    rule: rule('rule-leftover', GLOBAL, 'LEFTOVER_POLICY'),
    versions: [
      version('rule-leftover', 'rule-version-leftover-1', {
        slotKind: 'LEFTOVER_POLICY',
        policyType: 'SINGLE_DESTINATION',
        destinationBucketId: LEFTOVER_BUCKET,
      }),
    ],
  };
}
