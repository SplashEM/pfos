import type { EntityId } from '@domain/shared/ids/entity-id';
import type { Money } from '@domain/shared/money/money';
import type { BasisPoints } from '@domain/shared/percentages/basis-points';

import type { IncomeBasis } from './income-basis';
import type { FundingRuleConfig } from './resolved-funding-rule';

/**
 * The authored configuration carried by one configured rule version
 * (Decision 086; Decision 096; Decision 097).
 *
 * Decision 086 fixed the architecture: an explicitly discriminated union whose
 * family tag is carried inside the configuration value and drawn from the
 * existing `ResolvedSlotKind` vocabulary, leaving each family's own inner
 * discriminant from Decision 074 unchanged. `slotKind` is that tag, spelled as
 * Decision 086's cross-object invariant already spells it.
 *
 * Decision 096 fixed the scope: the union covers a bounded subset of
 * `ResolvedSlotKind` rather than all eight families, and a family outside the
 * subset is not authorable rather than silently absent. Decision 097 added
 * `REQUIRED_FUNDING` to that subset through Decision 096's extension rule, so
 * the authorable subset is now four families:
 *
 *   GLOBAL_OBLIGATION  TOP_PRIORITIES  REQUIRED_FUNDING  LEFTOVER_POLICY
 *
 * `LOWER_PRIORITY_POOL`, `ALLOCATION_BASIS`, `GOAL_POLICY` and `ROLLOVER_POLICY`
 * are deliberately absent. Each still needs a semantic no accepted source
 * supplies, and Decision 096 requires their absence to be an enforced boundary
 * rather than a gap: a configuration carrying one of them is rejected at rule
 * admission, and no placeholder arm, nullable configuration, `unknown`,
 * `Record<string, unknown>`, arbitrary JSON or invented type stands in for the
 * payload they do not have. `ResolvedSlotKind` keeps all eight members, so a
 * rule of an unsupported family remains addressable; it is its configuration
 * that cannot exist.
 *
 * Provenance is never authored. `ruleId`, `ruleVersionId` and `ruleVersionIds`
 * on the resolved contracts are supplied during resolution from the envelope,
 * and no arm here carries them (Decision 096).
 *
 * Three fields PFOS-ENG-01 lists as configurable are owned elsewhere and appear
 * on no arm: the effective date is the version's own `period` (Decision 078),
 * enablement is rule lifecycle (Decisions 083 and 085), and rounding is uniform
 * under Decision 071, which admits no per-rule rounding field.
 */
export type RuleConfiguration =
  | GlobalObligationConfiguration
  | TopPrioritiesConfiguration
  | RequiredFundingConfiguration
  | LeftoverPolicyConfiguration;

/**
 * Which income sources one global obligation applies to (Decision 088;
 * Decision 096).
 *
 * Decision 088 established that eligibility and exclusion are two authoring
 * gestures for one policy rather than two simultaneously active dimensions, so
 * exactly one semantic is active and a contradictory pair is unrepresentable
 * rather than merely invalid. Decision 096 fixed these three spellings.
 *
 * The word "eligible" is deliberately absent. PFOS-ENG-01 §12.2's "eligible
 * income sources" names this applicability question while §12.1, §12.4 and §25
 * use "eligible income" for the amount-qualification question Blocker F owns,
 * and Decision 088 asks that the two be kept apart by vocabulary.
 *
 * `incomeSourceIds` is semantically non-empty on both listed arms. An empty set
 * under `ALL_EXCEPT_LISTED_SOURCES` would mean every source, duplicating
 * `ALL_SOURCES`; an empty set under `ONLY_LISTED_SOURCES` would mean no source,
 * duplicating a terminating version and expressing a stop with no date. How
 * non-emptiness is enforced is not settled, and no validator or error code
 * exists for it (Decision 088).
 *
 * The collection is a set: duplicate identifiers add no financial meaning and
 * order adds none either. Identifiers are opaque under PFOS-ENG-00 §14, so no
 * sentinel may inhabit the collection — `"all"`, `"*"` and `"default"` are all
 * excluded, and §42.1's `["all"]` is not adopted.
 */
export type IncomeSourceApplicability =
  | { readonly scope: 'ALL_SOURCES' }
  | { readonly scope: 'ONLY_LISTED_SOURCES'; readonly incomeSourceIds: readonly EntityId[] }
  | { readonly scope: 'ALL_EXCEPT_LISTED_SOURCES'; readonly incomeSourceIds: readonly EntityId[] };

/**
 * An authored global obligation, such as tithing (Decision 096).
 *
 * `destinationBucketId`, `rateBasisPoints` and `incomeBasis` transcribe
 * PFOS-ENG-01 §12.2 and Decision 074. `applicability` carries Decision 088's
 * single active semantic.
 *
 * There is no cap member. §12.2 enumerates this family's configurable fields
 * and contains no cap or maximum, and §15.1's "Maximum, if any" is a field of
 * the funding-rule types governing `REQUIRED_FUNDING`. Decision 096 settled the
 * question negatively: V1 global obligations carry no authored cap, so
 * `ResolvedGlobalObligation.maximumAmount` stays optional on the resolved
 * contract and is not populated. A later accepted source granting a cap would
 * add a member here and populate that already-present optional field.
 */
export interface GlobalObligationConfiguration {
  readonly slotKind: 'GLOBAL_OBLIGATION';
  readonly destinationBucketId: EntityId;
  readonly rateBasisPoints: BasisPoints;
  readonly incomeBasis: IncomeBasis;
  readonly applicability: IncomeSourceApplicability;
}

/**
 * One member of an authored top-priority set (Decision 087; Decision 082).
 *
 * `rank` is required under both strategies. Decision 087 settled that a member
 * carries an authored rank whether the strategy is `SEQUENTIAL` or
 * `PERCENTAGE_SPLIT`, and that the position of a member within an authored
 * collection carries no financial meaning under either. Rank must not be
 * derived from array position, an identifier, repository order, storage order,
 * creation order or a version number.
 *
 * Uniqueness is the only accepted constraint on rank. Ranks need not be
 * positive, contiguous, start at one, or match array position (Decision 076).
 */
export interface AuthoredTopPriorityEntry {
  readonly bucketId: EntityId;
  readonly rank: number;
}

/** A top-priority member carrying its authored share of a percentage split. */
export interface AuthoredTopPriorityShare extends AuthoredTopPriorityEntry {
  readonly shareBasisPoints: BasisPoints;
}

/**
 * The authored top-priority set (Decision 082; Decision 087; Decision 096).
 *
 * Decision 082 fixes the granularity: one `GLOBAL` Rule whose version
 * configuration carries the strategy together with the whole member set. The
 * entry type is a function of the strategy, exactly as Decision 074 makes it on
 * the resolved side, so strategy and membership are one logical rule rather than
 * two.
 *
 * PFOS-ENG-01 §42.2 and §42.3 both omit the authored rank this shape requires,
 * so neither is authority on member shape (Decision 087). §42.2's bare
 * `bucketIds` array in particular must not be read as making array position the
 * financial rank.
 */
export type TopPrioritiesConfiguration =
  | {
      readonly slotKind: 'TOP_PRIORITIES';
      readonly strategy: 'SEQUENTIAL';
      readonly entries: readonly AuthoredTopPriorityEntry[];
    }
  | {
      readonly slotKind: 'TOP_PRIORITIES';
      readonly strategy: 'PERCENTAGE_SPLIT';
      readonly entries: readonly AuthoredTopPriorityShare[];
    };

/**
 * An authored funding requirement for one bucket (Decision 097).
 *
 * Decision 082 makes this family bucket-owned, one Rule per bucket, so the
 * bucket identity is the rule's owner rather than versioned configuration and
 * no `bucketId` appears here. `ruleVersionId` is absent for the same reason
 * every arm omits provenance: it is resolver-supplied.
 *
 * `funding` is Decision 074's `FundingRuleConfig`, unchanged and reused rather
 * than restated, so the authored requirement and the resolved one cannot drift.
 *
 * The three envelope members are authored explicitly. None is derived from the
 * funding type, defaulted, or assigned a fixed V1 constant (Decision 097):
 *
 * - `sequence` is the competition order of distinct buckets for the same money.
 *   Decision 074 classifies it as a financially meaningful ordering and Decision
 *   090 preserved that classification, while Decision 080 excludes every
 *   implicit source — identifier, array position, repository and storage order.
 *   Decision 097 supersedes Decision 082's sentence excluding the rule's own
 *   configuration, and this is where the value now lives. Values must be
 *   distinct across the funding rules resolved into one `ResolvedRuleSet`;
 *   nothing further constrains them, so they need not be positive, contiguous
 *   or start at one, and gaps are not defects.
 * - `isProtected` records whether the requirement receives protected treatment
 *   under PFOS-ENG-02 §44, which names a "user-designated protected obligation"
 *   among its examples. It is not derived from the funding type: §44's other
 *   examples are requirements a user commonly designates, not a mapping from
 *   `FundingRuleConfig` variants to protection.
 * - `allowExcessAboveCapacity` is the permission PFOS-ENG-02 §19 requires
 *   before the Allocation Engine may allocate above a finite capacity. It is
 *   distinct from the extra-money booleans Decision 074 places inside
 *   `FundingRuleConfig`: `allowManualExcess` governs manual event overrides
 *   beyond a goal target, `extraEligible` and `extraPaymentEligible` govern
 *   participation in a later stage, and `allowExtraContributions` is a per-type
 *   field of `FIXED_MONTHLY`.
 */
export interface RequiredFundingConfiguration {
  readonly slotKind: 'REQUIRED_FUNDING';
  readonly sequence: number;
  readonly isProtected: boolean;
  readonly allowExcessAboveCapacity: boolean;
  readonly funding: FundingRuleConfig;
}

/** A leftover destination carrying its authored share of a percentage split. */
export interface AuthoredLeftoverShare {
  readonly bucketId: EntityId;
  readonly shareBasisPoints: BasisPoints;
}

/**
 * The authored policy for the remainder left after every earlier stage
 * (Decision 074; Decision 096; PFOS-ENG-01 §16).
 *
 * The five `policyType` spellings and their members are Decision 074's, with
 * provenance removed: the resolved `PERCENTAGE_SPLIT` destinations carry
 * `ruleVersionIds`, which the resolver supplies and no author writes.
 *
 * No arm carries a fallback (Decision 074). If a destination cannot receive the
 * remainder and no existing policy redirects it, the remainder stays
 * unallocated.
 *
 * `LEAVE_UNALLOCATED` is also the product default for
 * `ResolvedRuleSet.leftoverPolicy` (Decision 093). That does not make it
 * unauthorable: a product default is not a rule (Decision 081), so the default
 * and the authored arm coexist, and no default-sourced provenance appears in
 * authored configuration.
 *
 * §16.4 requires an authored percentage pool to total exactly 10,000 basis
 * points. That requirement is unchanged and is validated where authored pools
 * are validated, not by this shape.
 */
export type LeftoverPolicyConfiguration =
  | {
      readonly slotKind: 'LEFTOVER_POLICY';
      readonly policyType: 'LEAVE_UNALLOCATED';
    }
  | {
      readonly slotKind: 'LEFTOVER_POLICY';
      readonly policyType: 'SINGLE_DESTINATION';
      readonly destinationBucketId: EntityId;
    }
  | {
      readonly slotKind: 'LEFTOVER_POLICY';
      readonly policyType: 'PERCENTAGE_SPLIT';
      readonly destinations: readonly AuthoredLeftoverShare[];
    }
  | {
      readonly slotKind: 'LEFTOVER_POLICY';
      readonly policyType: 'HIGHEST_PRIORITY_UNFINISHED_GOAL';
    }
  | {
      readonly slotKind: 'LEFTOVER_POLICY';
      readonly policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT';
      readonly bufferAmount: Money;
      readonly destinationBucketId: EntityId;
    };

/**
 * The slot kinds a `RuleConfiguration` may carry (Decision 096; Decision 097).
 *
 * This is the authorable subset, not a second slot-kind vocabulary. Every member
 * is a `ResolvedSlotKind`, and the type is derived from the union above rather
 * than restated, so an arm cannot be added or removed without this following.
 * Decision 081 refused a duplicate vocabulary that could disagree with the one
 * it duplicates, and deriving it here is what keeps that impossible.
 */
export type AuthorableSlotKind = RuleConfiguration['slotKind'];
