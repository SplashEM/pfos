import type { EntityId } from '@domain/shared/ids/entity-id';

/**
 * A bucket's goal policy as resolved for execution (Decision 074).
 *
 * This is configuration only. The resolved rule set does not carry computed
 * goal balances or derive a final funded amount.
 *
 * Goal state is supplied in the evaluation context (PFOS-ENG-01 §32); the Rule
 * Engine does not determine it.
 */
export interface ResolvedGoalPolicy {
  readonly bucketId: EntityId;
  readonly ruleVersionId: EntityId;
  readonly stopAtTarget: boolean;
  readonly allowManualExcess: boolean;
  readonly autoStartNextCycle: boolean;
  readonly resumeRequiresConfirmation: boolean;
}
