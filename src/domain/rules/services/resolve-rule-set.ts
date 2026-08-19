import type { FinancialDate } from '@domain/shared/dates/financial-date';
import type { Timestamp } from '@domain/shared/dates/timestamp';
import type { DomainWarning } from '@domain/shared/explanations/warning';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { err, ok, type Result } from '@domain/shared/errors/result';
import type { EntityId } from '@domain/shared/ids/entity-id';
import { ROUNDING_POLICY_ID } from '@domain/shared/money/rounding-policy';

import type { AllocationStage } from '../contracts/allocation-stage';
import type { ConfiguredRuleVersion } from '../contracts/configured-rule-version';
import type { PlanVersionId } from '../contracts/plan-version-id';
import type { ResolutionMode } from '../contracts/resolution-mode';
import type { ResolvedFundingRule } from '../contracts/resolved-funding-rule';
import type { ResolvedGlobalObligation } from '../contracts/resolved-global-obligation';
import type { ResolvedLeftoverPolicy } from '../contracts/resolved-leftover-policy';
import type { ResolvedPoolPlan } from '../contracts/resolved-pool-plan';
import {
  RESOLVED_RULE_SET_SCHEMA_VERSION,
  type ResolvedRuleSet,
} from '../contracts/resolved-rule-set';
import type { ResolvedTopPriorityPlan } from '../contracts/resolved-top-priority-plan';
import type { Rule } from '../contracts/rule';
import type {
  GlobalObligationConfiguration,
  IncomeSourceApplicability,
  LeftoverPolicyConfiguration,
  TopPrioritiesConfiguration,
} from '../contracts/rule-configuration';
import type { RuleVersion } from '../contracts/rule-version';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { ruleError, type RuleDomainError } from '../errors/rule-error';
import { validateAuthoredPoolTotal } from '../validation/authored-percentage-pool';
import { validateDistinctAuthoredScopes } from '../validation/authored-scope-uniqueness';
import { validateDistinctFundingSequences } from '../validation/funding-sequence-uniqueness';
import { validateTopPriorityCount } from '../validation/top-priority-count';
import { validateTopPriorityRanks } from '../validation/top-priority-ranks';
import { produceTopPriorityWarnings } from '../warnings/top-priority-warnings';
import { selectRuleVersionEffectiveOn } from './rule-version-selection';

/**
 * One authored rule together with its own versions.
 *
 * This is a resolver input shape, not the aggregate contract Decision 086
 * deferred. It pairs the two for the length of one call, enforces no invariant
 * between them, and neither the retirement invariant nor Decision 086's
 * `configuration.slotKind === Rule.slotKind` invariant is checked here. When an
 * accepted contract pairs a `Rule` with its versions, this gives way to it.
 */
export interface AuthoredRuleVersions {
  readonly rule: Rule;
  readonly versions: readonly RuleVersion[];
}

/**
 * Everything one resolution reads.
 *
 * The evaluation-context contract of PFOS-ENG-01 §25 is unresolved, and this is
 * deliberately not it: it is a private, reversible input shape carrying only
 * what this slice reads, and it persists nothing.
 *
 * Four provenance values are supplied rather than derived. `resolvedRuleSetId`
 * determinism is an open question; `planVersionId`, `resolvedAt` and
 * `resolutionMode` belong to the caller that requested the resolution, and
 * PFOS-ENG-00 §13.4 forbids a deterministic engine function from reading a
 * clock, so the moment arrives as an argument.
 *
 * `incomeSourceId` is the identity Decision 088's applicability question is
 * asked about. §25 supplies the income source for the event, so applicability is
 * a membership question over one identity and needs no population of sources.
 */
export interface RuleResolutionInput {
  readonly rules: readonly AuthoredRuleVersions[];
  readonly evaluationDate: FinancialDate;
  readonly incomeSourceId: EntityId;
  readonly resolvedRuleSetId: EntityId;
  readonly planVersionId: PlanVersionId;
  readonly resolvedAt: Timestamp;
  readonly resolutionMode: ResolutionMode;
}

/** One configured version that survived selection, with the rule that owns it. */
interface Contribution {
  readonly rule: Rule;
  readonly version: ConfiguredRuleVersion;
}

/**
 * Resolves authored rules into the single `ResolvedRuleSet` the Allocation
 * Engine executes (Decision 074).
 *
 * This is the Milestone 2 entry point. It reads authored rules and produces
 * resolved policy; it calculates no allocation amount, which Decision 074 places
 * on the far side of the M2/M3 boundary.
 *
 * The shape of one resolution:
 *
 *   1. reject two active rules claiming one authored scope (Decision 084);
 *   2. select each rule's version effective on the evaluation date
 *      (Decision 079), discarding rules with no effective version and rules
 *      whose effective version is a stop (Decision 085);
 *   3. dispatch each surviving configuration on its own family tag;
 *   4. fill the members no authored rule addresses from accepted product
 *      defaults only.
 *
 * Dispatch reads `configuration.slotKind` and never `Rule.slotKind`. Decision
 * 086 accepted that the two can disagree and authorised no validator for the
 * invariant, so reading only the payload's own tag means a disagreement cannot
 * send a configuration to the wrong family. `Rule.owner` is read for one thing
 * only: Decision 082 makes a funding rule's bucket its owner rather than
 * versioned configuration.
 *
 * Nothing is invented where authority is silent. Where an input would require
 * answering an unsettled question, resolution fails with
 * RULE_RESOLUTION_NOT_SUPPORTED rather than choosing, because choosing would be
 * a silent financial decision under Constitution Principle 4.
 *
 * Three channels stay empty by design. `skippedRules` and `explanations` are
 * empty because Decisions 080, 085, 086 and 088 defer skip and explanation
 * emission, and Decision 088 states plainly that no skip-emission behaviour is
 * authorised — so an obligation that does not apply is simply absent, exactly as
 * Decision 080 describes it being removed. `warnings` carries only the
 * top-priority warning Decision 075 requires.
 */
export function resolveRuleSet(
  input: RuleResolutionInput,
): Result<ResolvedRuleSet, RuleDomainError> {
  const scopes = validateDistinctAuthoredScopes(input.rules.map((authored) => authored.rule));
  if (!scopes.ok) {
    return scopes;
  }

  const contributions = selectContributions(input);
  if (!contributions.ok) {
    return contributions;
  }

  const obligations = resolveGlobalObligations(contributions.value, input.incomeSourceId);

  const topPriorities = resolveTopPriorities(contributions.value);
  if (!topPriorities.ok) {
    return topPriorities;
  }

  const fundingRules = resolveFundingRules(contributions.value);
  if (!fundingRules.ok) {
    return fundingRules;
  }

  const leftoverPolicy = resolveLeftoverPolicy(contributions.value);
  if (!leftoverPolicy.ok) {
    return leftoverPolicy;
  }

  const stageSequence = resolveStageSequence(obligations, topPriorities.value, fundingRules.value);
  if (!stageSequence.ok) {
    return stageSequence;
  }

  const warnings: readonly DomainWarning[] = produceTopPriorityWarnings(topPriorities.value);

  return ok({
    resolvedRuleSetId: input.resolvedRuleSetId,
    planVersionId: input.planVersionId,
    schemaVersion: RESOLVED_RULE_SET_SCHEMA_VERSION,
    roundingPolicyId: ROUNDING_POLICY_ID,
    resolvedAt: input.resolvedAt,
    evaluationDate: input.evaluationDate,
    resolutionMode: input.resolutionMode,
    sourceRuleVersionIds: contributions.value.map(
      (contribution) => contribution.version.ruleVersionId,
    ),

    allocationBasis: 'NET_AMOUNT',
    stageSequence: stageSequence.value,
    globalObligations: obligations,
    topPriorities: topPriorities.value,
    requiredFundingRules: fundingRules.value,
    lowerPriorityPool: EMPTY_POOL,
    leftoverPolicy: leftoverPolicy.value,
    rolloverPolicies: [],
    goalPolicies: [],

    skippedRules: [],
    warnings,
    explanations: [],
  });
}

/**
 * The lower-priority pool this slice resolves.
 *
 * The pool is empty because it cannot be otherwise. `LOWER_PRIORITY_POOL` is not
 * authorable under Decision 096, so no authored source can supply a destination.
 * The `LOWER_PRIORITY` stage is never sequenced and no money passes through this
 * pool.
 *
 * PFOS-ENG-01 §14.1 and PFOS-ENG-02 §27 establish even splitting as this
 * family's division method once a pool is populated — "split evenly among
 * eligible categories" — and PFOS-ENG-02 §28 defines that as a weighted split
 * carrying weight 1 for every eligible destination.
 *
 * Neither designates the resolved `lowerPriorityPool` value for the case where
 * no rule addresses the slot at all, and nothing here designates one either.
 * `ResolvedPoolPlan` has no tag-free arm, so an empty pool must still carry a
 * strategy, and across zero destinations every arm allocates nothing. The tag is
 * inert in this slice: it establishes no product default, and it has no
 * financial effect. Decision 093 designated the two members that needed a
 * product default, and this is not one of them.
 *
 * If `LOWER_PRIORITY_POOL` ever becomes authorable, the strategy comes from the
 * authored configuration and this constant goes away.
 */
const EMPTY_POOL: ResolvedPoolPlan = { strategy: 'EVEN_SPLIT', destinations: [] };

/** The top-priority plan when no authored rule supplies one (Decision 075; §13.2). */
const NO_TOP_PRIORITIES: ResolvedTopPriorityPlan = { strategy: 'SEQUENTIAL', entries: [] };

/** The leftover policy when no authored rule supplies one (Decision 093). */
const DEFAULT_LEFTOVER: ResolvedLeftoverPolicy = { policyType: 'LEAVE_UNALLOCATED' };

/**
 * Selects each rule's effective version and keeps the configured ones.
 *
 * A rule with no effective version contributes nothing, and so does a rule whose
 * effective version is a stop. The two are different states — only the second
 * records an authored, dated act — but neither contributes, and neither is
 * reported here, because skip emission is deferred.
 *
 * Input order is preserved. It carries no financial meaning at any point below.
 */
function selectContributions(
  input: RuleResolutionInput,
): Result<readonly Contribution[], RuleDomainError> {
  const contributions: Contribution[] = [];

  for (const authored of input.rules) {
    const selected = selectRuleVersionEffectiveOn(authored.versions, input.evaluationDate);
    if (!selected.ok) {
      return selected;
    }

    const version = selected.value;
    if (version === undefined || version.kind === 'TERMINATING') {
      continue;
    }

    contributions.push({ rule: authored.rule, version });
  }

  return ok(contributions);
}

/**
 * Resolves the global obligations that apply to this income source.
 *
 * Separately authored obligations accumulate and stay independent (Decision 080;
 * Decision 089), so every applicable one is emitted and none displaces another.
 *
 * An obligation that does not apply is absent rather than skipped. Decision 080
 * removes a non-applicable obligation rather than emitting it with a filter
 * attached, and Decision 088 authorises no skip-emission behaviour, so nothing
 * is recorded on the skip channel.
 *
 * The emitted order is the caller's. Decision 089 established that a resolved
 * global obligation carries no financial execution order in V1 and Decision 090
 * removed the field rather than keep an ordinal, so this order decides nothing
 * financial. The canonical ordering key that would make two differently-arranged
 * reads deep-equal is still unresolved, and none is invented here.
 */
function resolveGlobalObligations(
  contributions: readonly Contribution[],
  incomeSourceId: EntityId,
): readonly ResolvedGlobalObligation[] {
  const obligations: ResolvedGlobalObligation[] = [];

  for (const contribution of contributions) {
    const configuration = contribution.version.configuration;
    if (configuration.slotKind !== 'GLOBAL_OBLIGATION') {
      continue;
    }

    if (!appliesToIncomeSource(configuration.applicability, incomeSourceId)) {
      continue;
    }

    obligations.push(toResolvedObligation(contribution.version, configuration));
  }

  return obligations;
}

/** Decision 088's three applicability semantics, as a membership question. */
function appliesToIncomeSource(
  applicability: IncomeSourceApplicability,
  incomeSourceId: EntityId,
): boolean {
  switch (applicability.scope) {
    case 'ALL_SOURCES':
      return true;

    case 'ONLY_LISTED_SOURCES':
      return applicability.incomeSourceIds.includes(incomeSourceId);

    case 'ALL_EXCEPT_LISTED_SOURCES':
      return !applicability.incomeSourceIds.includes(incomeSourceId);
  }
}

/**
 * Builds one resolved obligation.
 *
 * `maximumAmount` is absent. Decision 096 settled that V1 global obligations
 * carry no authored cap, so there is nothing to copy and the optional resolved
 * member stays unpopulated until an accepted source grants one.
 *
 * Both provenance identities come from the version rather than the
 * configuration: `ruleId` is the stable rule that outlives every edit, and
 * `ruleVersionId` is the exact version that supplied this rate, basis and
 * destination (Decision 091).
 */
function toResolvedObligation(
  version: ConfiguredRuleVersion,
  configuration: GlobalObligationConfiguration,
): ResolvedGlobalObligation {
  return {
    ruleId: version.ruleId,
    ruleVersionId: version.ruleVersionId,
    destinationBucketId: configuration.destinationBucketId,
    rateBasisPoints: configuration.rateBasisPoints,
    incomeBasis: configuration.incomeBasis,
  };
}

/**
 * Resolves the top-priority plan.
 *
 * At most one may contribute. `TOP_PRIORITIES` is a replacing slot kind authored
 * as one Rule per owner (Decision 082), so two effective configurations mean two
 * owners competing, which is precedence and fallback behaviour and remains
 * Blocker C. Choosing between them would invent a precedence rule.
 *
 * Entries are ordered by ascending rank, which Decision 074 places among the
 * financial orderings the Rule Engine owns and Decision 087 confirms is authored
 * under both strategies. The authored array is copied before sorting so the
 * caller's order is not disturbed, and array position expresses nothing.
 */
function resolveTopPriorities(
  contributions: readonly Contribution[],
): Result<ResolvedTopPriorityPlan, RuleDomainError> {
  const authored: { version: ConfiguredRuleVersion; configuration: TopPrioritiesConfiguration }[] =
    [];

  for (const contribution of contributions) {
    const candidate = contribution.version.configuration;
    if (candidate.slotKind === 'TOP_PRIORITIES') {
      authored.push({ version: contribution.version, configuration: candidate });
    }
  }

  const only = authored[0];
  if (only === undefined) {
    return ok(NO_TOP_PRIORITIES);
  }

  if (authored.length > 1) {
    return err(contendingConfigurations('TOP_PRIORITIES'));
  }

  const configuration = only.configuration;
  const ruleVersionIds = [only.version.ruleVersionId];

  const plan: ResolvedTopPriorityPlan =
    configuration.strategy === 'SEQUENTIAL'
      ? {
          strategy: 'SEQUENTIAL',
          entries: [...configuration.entries]
            .sort(byAscendingRank)
            .map((entry) => ({ bucketId: entry.bucketId, rank: entry.rank, ruleVersionIds })),
        }
      : {
          strategy: 'PERCENTAGE_SPLIT',
          entries: [...configuration.entries].sort(byAscendingRank).map((entry) => ({
            bucketId: entry.bucketId,
            rank: entry.rank,
            shareBasisPoints: entry.shareBasisPoints,
            ruleVersionIds,
          })),
        };

  const count = validateTopPriorityCount(plan);
  if (!count.ok) {
    return count;
  }

  const ranks = validateTopPriorityRanks(plan);
  if (!ranks.ok) {
    return ranks;
  }

  if (plan.strategy === 'PERCENTAGE_SPLIT') {
    const total = validateAuthoredPoolTotal(plan.entries.map((entry) => entry.shareBasisPoints));
    if (!total.ok) {
      return total;
    }
  }

  return ok(plan);
}

/** Ascending rank, the financial ordering Decision 074 assigns to top priorities. */
function byAscendingRank(
  left: { readonly rank: number },
  right: { readonly rank: number },
): number {
  return left.rank - right.rank;
}

/**
 * Resolves the required funding rules.
 *
 * The bucket is the rule's owner, not versioned configuration (Decision 082;
 * Decision 097), so it is read from `Rule.owner` and never duplicated inside the
 * configuration. A funding rule owned by anything other than a bucket cannot
 * name the bucket it funds, and no accepted code reports that defect, so it is
 * refused rather than guessed at.
 *
 * Rules are ordered by ascending `sequence`, which Decision 074 places among the
 * financial orderings the Rule Engine owns. Sorting is total only because the
 * values are distinct, so Decision 097's uniqueness invariant is checked first:
 * a duplicate would leave the sort deciding the order from whichever arrangement
 * arrived, which is exactly what Decision 080 forbids. This is the unit
 * Decision 097 left that check to.
 */
function resolveFundingRules(
  contributions: readonly Contribution[],
): Result<readonly ResolvedFundingRule[], RuleDomainError> {
  const fundingRules: ResolvedFundingRule[] = [];

  for (const contribution of contributions) {
    const configuration = contribution.version.configuration;
    if (configuration.slotKind !== 'REQUIRED_FUNDING') {
      continue;
    }

    if (contribution.rule.owner.ownerType !== 'BUCKET') {
      return err(
        notSupported(
          'A required-funding rule is owned by something other than a bucket.',
          'Decision 082 confines REQUIRED_FUNDING to bucket owners, and no accepted source ' +
            'says which bucket a rule at another owner would fund.',
        ),
      );
    }

    fundingRules.push({
      bucketId: contribution.rule.owner.ownerId,
      ruleVersionId: contribution.version.ruleVersionId,
      sequence: configuration.sequence,
      isProtected: configuration.isProtected,
      allowExcessAboveCapacity: configuration.allowExcessAboveCapacity,
      funding: configuration.funding,
    });
  }

  const distinct = validateDistinctFundingSequences(fundingRules);
  if (!distinct.ok) {
    return distinct;
  }

  return ok([...fundingRules].sort((left, right) => left.sequence - right.sequence));
}

/**
 * Resolves the leftover policy.
 *
 * `LEAVE_UNALLOCATED` is the product default when no rule addresses the slot
 * (Decision 093). It is the only arm inhabitable without authored data, and
 * Decision 020 requires a default to exist so a first allocation is possible.
 *
 * At most one authored policy may contribute, for the same reason as top
 * priorities: this is a replacing slot kind, and two owners competing is
 * unresolved precedence.
 */
function resolveLeftoverPolicy(
  contributions: readonly Contribution[],
): Result<ResolvedLeftoverPolicy, RuleDomainError> {
  const authored: { version: ConfiguredRuleVersion; configuration: LeftoverPolicyConfiguration }[] =
    [];

  for (const contribution of contributions) {
    const candidate = contribution.version.configuration;
    if (candidate.slotKind === 'LEFTOVER_POLICY') {
      authored.push({ version: contribution.version, configuration: candidate });
    }
  }

  const only = authored[0];
  if (only === undefined) {
    return ok(DEFAULT_LEFTOVER);
  }

  if (authored.length > 1) {
    return err(contendingConfigurations('LEFTOVER_POLICY'));
  }

  const configuration = only.configuration;

  switch (configuration.policyType) {
    case 'LEAVE_UNALLOCATED':
    case 'HIGHEST_PRIORITY_UNFINISHED_GOAL':
      return ok({ policyType: configuration.policyType });

    case 'SINGLE_DESTINATION':
      return ok({
        policyType: 'SINGLE_DESTINATION',
        destinationBucketId: configuration.destinationBucketId,
      });

    case 'MAINTAIN_BUFFER_THEN_REDIRECT':
      return ok({
        policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT',
        bufferAmount: configuration.bufferAmount,
        destinationBucketId: configuration.destinationBucketId,
      });

    case 'PERCENTAGE_SPLIT': {
      const total = validateAuthoredPoolTotal(
        configuration.destinations.map((destination) => destination.shareBasisPoints),
      );
      if (!total.ok) {
        return total;
      }

      return ok({
        policyType: 'PERCENTAGE_SPLIT',
        destinations: configuration.destinations.map((destination) => ({
          bucketId: destination.bucketId,
          shareBasisPoints: destination.shareBasisPoints,
          ruleVersionIds: [only.version.ruleVersionId],
        })),
      });
    }
  }
}

/**
 * Orders the stages this resolution emits (Decision 074; PFOS-ENG-02 §9).
 *
 * PFOS-ENG-02 §9 states the conceptual order — global obligations, then top
 * priorities, then required recurring obligations, then the lower-priority pool,
 * then the leftover policy — and records that the exact ordering comes from the
 * resolved rule set. Decision 074 places `stageSequence` among the orderings the
 * Rule Engine owns. This transcribes that order and emits only the stages this
 * resolution populates.
 *
 * `LEFTOVER_POLICY` is always emitted, because `leftoverPolicy` is a required
 * member that always holds a policy, the product default included.
 *
 * `REQUIRED_RECURRING` is never emitted, and a requirement that would need it is
 * refused rather than dropped. A top-priority entry carries a rank but no
 * amount, so it draws its requirement from that bucket's own funding rule at the
 * TOP_PRIORITY stage; a funding rule for a bucket no earlier stage funds would
 * therefore need its own stage, and emitting one alongside TOP_PRIORITY raises
 * the duplicate-destination question PFOS-ENG-02 §48 leaves open. Silently
 * omitting the stage would drop money the plan intended to allocate, which
 * Constitution Principle 4 forbids and the conservation invariant would not
 * catch, because the money would simply appear as unallocated.
 */
function resolveStageSequence(
  obligations: readonly ResolvedGlobalObligation[],
  topPriorities: ResolvedTopPriorityPlan,
  fundingRules: readonly ResolvedFundingRule[],
): Result<readonly AllocationStage[], RuleDomainError> {
  const prioritisedBuckets = new Set(topPriorities.entries.map((entry) => entry.bucketId));

  const unfunded = fundingRules.filter(
    (fundingRule) => !prioritisedBuckets.has(fundingRule.bucketId),
  );

  if (unfunded.length > 0) {
    return err(
      notSupported(
        'A funding requirement belongs to no stage this resolution can emit.',
        'A bucket with a funding rule that is not a top priority would need the ' +
          'REQUIRED_RECURRING stage, and PFOS-ENG-02 §48 leaves open whether a destination may ' +
          'be funded at more than one stage.',
      ),
    );
  }

  const stages: AllocationStage[] = [];

  if (obligations.length > 0) {
    stages.push('GLOBAL_OBLIGATION');
  }

  if (topPriorities.entries.length > 0) {
    stages.push('TOP_PRIORITY');
  }

  stages.push('LEFTOVER_POLICY');

  return ok(stages);
}

/** Two effective configurations competing for one replacing slot kind. */
function contendingConfigurations(slotKind: string): RuleDomainError {
  return notSupported(
    'Two rules both configure the same part of the plan.',
    `More than one effective configuration was found for ${slotKind}, and which one wins is ` +
      'precedence and fallback behaviour that no accepted source settles.',
  );
}

/** An input whose resolution would require answering an unsettled question. */
function notSupported(summary: string, details: string): RuleDomainError {
  return ruleError({
    code: RULE_ERROR_CODES.RULE_RESOLUTION_NOT_SUPPORTED,
    category: ERROR_CATEGORIES.UNSUPPORTED_STATE,
    summary,
    details,
  });
}
