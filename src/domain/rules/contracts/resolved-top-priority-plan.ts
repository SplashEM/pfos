import type { EntityId } from '@domain/shared/ids/entity-id';
import type { BasisPoints } from '@domain/shared/percentages/basis-points';

/**
 * A bucket resolved into the top-priority plan (Decision 074).
 *
 * Top-priority entries are ordered by ascending rank.
 */
export interface ResolvedTopPriorityEntry {
  readonly bucketId: EntityId;
  readonly rank: number;
  readonly ruleVersionIds: readonly EntityId[];
}

/**
 * A top-priority entry carrying its authored share of a percentage split
 * (Decision 074).
 *
 * Percentage-split shares are authored BasisPoints values and are validated by
 * M2 under Decision 071 before M3 receives them.
 */
export interface ResolvedTopPriorityShare extends ResolvedTopPriorityEntry {
  readonly shareBasisPoints: BasisPoints;
}

/**
 * The resolved top-priority plan (Decision 074).
 *
 * The Rule Engine chooses the strategy. M3 does not reinterpret or re-resolve
 * it.
 *
 * `entries` is a plain readonly array in both variants. Decision 075 records
 * that a SEQUENTIAL plan with zero entries is a valid resolution result rather
 * than a validation failure, while an empty PERCENTAGE_SPLIT pool remains a
 * hard validation error reported as RULE_POOL_NOT_EXACTLY_100_PERCENT. That
 * asymmetry belongs to validation; this type represents an empty entry list
 * under either strategy.
 */
export type ResolvedTopPriorityPlan =
  | {
      readonly strategy: 'SEQUENTIAL';
      readonly entries: readonly ResolvedTopPriorityEntry[];
    }
  | {
      readonly strategy: 'PERCENTAGE_SPLIT';
      readonly entries: readonly ResolvedTopPriorityShare[];
    };
