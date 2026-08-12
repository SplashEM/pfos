import type { EntityId } from '@domain/shared/ids/entity-id';
import type { Money } from '@domain/shared/money/money';

/**
 * A bucket's rollover policy as resolved for execution (Decision 074).
 */
export interface ResolvedRolloverPolicy {
  readonly bucketId: EntityId;
  readonly ruleVersionId: EntityId;
  readonly policy: RolloverPolicyConfig;
}

/**
 * The authored rollover configuration carried by a resolved rollover policy
 * (Decision 074).
 *
 * `capAmount` is the authored cap the rule itself stores. Decision 074 permits
 * only authored monetary requirements in the resolved rule set: the carried,
 * reset and excess amounts are calculated by M3, not represented here.
 */
export type RolloverPolicyConfig =
  | {
      readonly policyType: 'CARRY_ALL';
    }
  | {
      readonly policyType: 'RESET';
    }
  | {
      readonly policyType: 'CARRY_TO_CAP';
      readonly capAmount: Money;
    }
  | {
      readonly policyType: 'REDIRECT_EXCESS';
      readonly capAmount: Money;
      readonly destinationBucketId: EntityId;
    }
  | {
      readonly policyType: 'APPLY_LEFTOVER_POLICY';
      readonly capAmount: Money;
    };
