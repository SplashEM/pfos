import type { EntityId } from '@domain/shared/ids/entity-id';
import type { Money } from '@domain/shared/money/money';

import type { ResolvedPoolShare } from './resolved-pool-plan';

/**
 * The resolved policy for the remainder left after every earlier stage
 * (Decision 074).
 *
 * No variant carries a fallback. If a destination cannot receive the remainder
 * and no existing policy redirects it, the remainder stays unallocated.
 *
 * `HIGHEST_PRIORITY_UNFINISHED_GOAL` carries no resolved goal-state
 * calculation. The Goal Engine/orchestrator supplies or determines the relevant
 * goal state; M2 does not compute funded state as allocation arithmetic.
 *
 * `bufferAmount` is the authored buffer the rule itself stores, not a
 * calculated remainder.
 */
export type ResolvedLeftoverPolicy =
  | {
      readonly policyType: 'LEAVE_UNALLOCATED';
    }
  | {
      readonly policyType: 'SINGLE_DESTINATION';
      readonly destinationBucketId: EntityId;
    }
  | {
      readonly policyType: 'PERCENTAGE_SPLIT';
      readonly destinations: readonly ResolvedPoolShare[];
    }
  | {
      readonly policyType: 'HIGHEST_PRIORITY_UNFINISHED_GOAL';
    }
  | {
      readonly policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT';
      readonly bufferAmount: Money;
      readonly destinationBucketId: EntityId;
    };
