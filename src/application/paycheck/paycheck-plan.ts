import type { Rule } from '@domain/rules/contracts/rule';
import type {
  AuthoredTopPriorityEntry,
  RuleConfiguration,
} from '@domain/rules/contracts/rule-configuration';
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
 * One thing a person wants funded before everything else.
 *
 * A priority is a single product idea covering two authored rules. Adding one
 * creates a `TOP_PRIORITIES` member and the bucket-owned `REQUIRED_FUNDING` rule
 * that says how much it wants; the two are never offered separately, because a
 * funding rule for a bucket no stage funds is exactly what the resolver refuses.
 *
 * `id` is the bucket's identity and never changes. A rename changes `label` and
 * nothing else, so the authored rules keep pointing at the same bucket:
 * PFOS-ENG-00 §14 keeps an identifier opaque and PFOS-ENG-01 §26 forbids
 * resolution from depending on a display name.
 *
 * `rank` is the person's explicit ordering, carried per priority rather than
 * implied by where the priority sits in a list. Decision 087 requires an
 * authored rank and Decision 080 excludes array position, so the value travels
 * as its own field from the moment it is chosen: reordering the collection
 * without changing ranks changes nothing about the money.
 */
export interface EditablePriority {
  /** Stable identity, also the bucket the rules address. */
  readonly id: string;
  /** What to call it on screen. */
  readonly label: string;
  /** A dollar amount as typed, such as `500` or `$1,250.00`. */
  readonly amountPerPaycheck: string;
  /** The person's explicit ordering. Lower is funded first. */
  readonly rank: number;
}

/**
 * The plan values a person can currently change.
 *
 * Each text field is held as typed and parsed here, so the screen stores what
 * was typed and this layer owns every conversion. Nothing above parses money or
 * a rate, and nothing below sees a string.
 *
 * This is not the authoring system. Rule authoring covers owners, slot kinds,
 * strategies, applicability, effective periods and lifecycle; this covers a
 * giving rate, a ranked list of priorities and one name. Everything else about
 * the plan stays fixed, and the authored rules built below are the same shape a
 * real authoring system will produce.
 */
export interface EditablePaycheckPlan {
  /** A plain percentage as typed, such as `10` or `12.5`. */
  readonly givingPercent: string;
  /** What gets funded first, in the person's own order. */
  readonly priorities: readonly EditablePriority[];
  /** What to call the bucket that receives whatever is left. */
  readonly leftoverLabel: string;
}

/**
 * The most top priorities V1 allows.
 *
 * PFOS-ENG-01 §13.1 limits a plan to three, and Decision 076 makes exceeding it
 * a hard validation error the resolver already reports. This constant is here so
 * the screen can stop offering a fourth rather than let a person build a plan
 * that will be refused; the domain remains the thing that enforces it.
 */
export const MAXIMUM_TOP_PRIORITIES = 3;

/** The plan a person starts from, before changing anything. */
export const DEFAULT_PAYCHECK_PLAN: EditablePaycheckPlan = {
  givingPercent: '10',
  priorities: [
    {
      id: 'bucket-emergency-fund',
      label: 'Emergency Fund',
      amountPerPaycheck: '500.00',
      rank: 1,
    },
  ],
  leftoverLabel: 'Spending',
};

/** Authored rules ready for the resolver, with names for what they fund. */
export interface AuthoredPaycheckPlan {
  readonly rules: readonly AuthoredRuleVersions[];
  readonly labels: Readonly<Record<EntityId, string>>;
}

/** Bucket identities that are not a priority, and so are not editable. */
export const GIVING_BUCKET = asEntityId('bucket-giving');
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
 * Every priority produces two rules, and never one without the other. A
 * `TOP_PRIORITIES` member gives it a place in the funding order; the
 * bucket-owned `REQUIRED_FUNDING` rule gives it an amount. The resolver refuses
 * a funding rule whose bucket no emitted stage funds, so a bucket that is not a
 * top priority is not something this layer can build.
 *
 * The plan stays inside the shape the resolver can answer: one obligation, one
 * top-priority rule, one leftover policy, and a funding rule only for buckets
 * that are top priorities. Editing cannot move it out of that shape.
 */
export function buildAuthoredPaycheckPlan(
  plan: EditablePaycheckPlan,
): Result<AuthoredPaycheckPlan, DomainError> {
  const givingRate = parseGivingPercent(plan.givingPercent);
  if (!givingRate.ok) {
    return givingRate;
  }

  const priorities = parsePriorities(plan.priorities);
  if (!priorities.ok) {
    return priorities;
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

  const labels: Record<string, string> = {
    [GIVING_BUCKET]: 'Giving',
    [LEFTOVER_BUCKET]: leftoverLabel,
  };

  for (const priority of priorities.value) {
    labels[priority.bucketId] = priority.label;
  }

  return ok({
    rules: [
      givingRule(givingRate.value),
      ...topPriorityRules(priorities.value),
      ...priorities.value.map(fundingRule),
      leftoverRule(),
    ],
    labels,
  });
}

/** One priority with its text turned into the values the rules need. */
interface ParsedPriority {
  readonly bucketId: EntityId;
  readonly label: string;
  readonly amount: Money;
  readonly rank: number;
}

/** Reads every priority, failing on the first one a person needs to fix. */
function parsePriorities(
  priorities: readonly EditablePriority[],
): Result<readonly ParsedPriority[], DomainError> {
  const parsed: ParsedPriority[] = [];

  for (const priority of priorities) {
    const label = priority.label.trim();
    if (label === '') {
      return err(
        domainError({
          code: APPLICATION_ERROR_CODES.APPLICATION_PLAN_PRIORITY_LABEL_EMPTY,
          category: ERROR_CATEGORIES.VALIDATION,
          summary: 'Give every priority a name.',
          details: 'A priority was left without a label.',
        }),
      );
    }

    const amount = parseFundingAmount(priority.amountPerPaycheck);
    if (!amount.ok) {
      return amount;
    }

    parsed.push({
      bucketId: asEntityId(priority.id),
      label,
      amount: amount.value,
      rank: priority.rank,
    });
  }

  return ok(parsed);
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

/**
 * "These come first, in this order."
 *
 * Decision 082 makes this one `GLOBAL` rule carrying the whole member set, so
 * there is exactly one of these however many priorities a person has — or none
 * at all, which Decision 075 accepts as a valid plan that resolves with a
 * warning rather than a failure.
 *
 * Each member carries its own explicit `rank`, taken from the person's ordering
 * choice. Position in the array expresses nothing, which is what Decision 087
 * requires.
 */
function topPriorityRules(priorities: readonly ParsedPriority[]): readonly AuthoredRuleVersions[] {
  if (priorities.length === 0) {
    return [];
  }

  const entries: readonly AuthoredTopPriorityEntry[] = priorities.map((priority) => ({
    bucketId: priority.bucketId,
    rank: priority.rank,
  }));

  return [
    {
      rule: rule('rule-top-priorities', GLOBAL, 'TOP_PRIORITIES'),
      versions: [
        version('rule-top-priorities', 'rule-version-top-priorities-1', {
          slotKind: 'TOP_PRIORITIES',
          strategy: 'SEQUENTIAL',
          entries,
        }),
      ],
    },
  ];
}

/**
 * "Put this much into it every paycheck."
 *
 * `sequence` and `rank` both carry the same explicit ordering, because this
 * product offers one ordering control and a person moving a priority up is
 * authoring one intention. Neither is derived from array position, an
 * identifier, repository order or storage order — the values Decision 080
 * excludes — and both are written as explicit integers into authored
 * configuration, which is what Decision 097 requires of `sequence` and
 * Decision 087 of `rank`.
 *
 * They are equal here rather than identical in meaning. `rank` orders top
 * priorities within their stage; `sequence` is the competition order of
 * bucket-owned funding rules, which Decision 097 says nothing further
 * constrains. A later product that offered two ordering controls could author
 * them apart without contradicting anything decided.
 *
 * `isProtected` and `allowExcessAboveCapacity` keep the values this plan has
 * always authored. Decision 097 makes both explicit authored booleans, and no
 * control for either is introduced here.
 */
function fundingRule(priority: ParsedPriority): AuthoredRuleVersions {
  const ruleId = `rule-funding-${priority.bucketId}`;

  return {
    rule: rule(ruleId, { ownerType: 'BUCKET', ownerId: priority.bucketId }, 'REQUIRED_FUNDING'),
    versions: [
      version(ruleId, `rule-version-funding-${priority.bucketId}`, {
        slotKind: 'REQUIRED_FUNDING',
        sequence: priority.rank,
        isProtected: false,
        allowExcessAboveCapacity: false,
        funding: { type: 'FIXED_PER_PAYCHECK', amount: priority.amount },
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
