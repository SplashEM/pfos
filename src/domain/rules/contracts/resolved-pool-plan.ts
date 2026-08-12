import type { EntityId } from '@domain/shared/ids/entity-id';
import type { Money } from '@domain/shared/money/money';
import type { BasisPoints } from '@domain/shared/percentages/basis-points';

import type { PercentageBasis } from './percentage-basis';

/**
 * A destination resolved into the lower-priority pool (Decision 074).
 *
 * Set-like percentage and even-split destinations do not derive financial
 * meaning from array index.
 */
export interface ResolvedPoolDestination {
  readonly bucketId: EntityId;
  readonly ruleVersionIds: readonly EntityId[];
}

/**
 * A pool destination carrying its authored share of a percentage split
 * (Decision 074).
 */
export interface ResolvedPoolShare extends ResolvedPoolDestination {
  readonly shareBasisPoints: BasisPoints;
}

/**
 * A pool destination carrying an authored fixed amount (Decision 074).
 *
 * `sequence` is present because FIXED_AMOUNTS uses it where competition order
 * is financially meaningful.
 */
export interface ResolvedPoolFixedAmount extends ResolvedPoolDestination {
  readonly amount: Money;
  readonly sequence: number;
}

/**
 * The resolved lower-priority pool (Decision 074).
 *
 * V1 represents lower-priority and everyday-spending allocation as one
 * executable `lowerPriorityPool`. A separate `everydaySpendingRules` field is
 * not part of V1, and two executable pools require a later accepted decision
 * establishing behavior that meaningfully distinguishes them.
 *
 * `basis` appears on PERCENTAGE_SPLIT only. Decision 074 keeps
 * percent-of-total-income and percent-of-remaining-pool as explicit, distinct
 * concepts, and neither an even split nor a fixed amount is taken as a
 * percentage of anything.
 */
export type ResolvedPoolPlan =
  | {
      readonly strategy: 'EVEN_SPLIT';
      readonly destinations: readonly ResolvedPoolDestination[];
    }
  | {
      readonly strategy: 'PERCENTAGE_SPLIT';
      readonly basis: PercentageBasis;
      readonly destinations: readonly ResolvedPoolShare[];
    }
  | {
      readonly strategy: 'FIXED_AMOUNTS';
      readonly destinations: readonly ResolvedPoolFixedAmount[];
    };
