/**
 * A stage of allocation (Decision 074).
 *
 * The Rule Engine owns this type, so it belongs under the Rule Engine contract
 * layer and the Allocation Engine imports and consumes it.
 *
 * EVERYDAY_SPENDING remains part of the documented stage vocabulary but is not
 * emitted by V1.
 */
export type AllocationStage =
  | 'GLOBAL_OBLIGATION'
  | 'TOP_PRIORITY'
  | 'REQUIRED_RECURRING'
  | 'GOAL_FUNDING'
  | 'LOWER_PRIORITY'
  | 'EVERYDAY_SPENDING'
  | 'LEFTOVER_POLICY'
  | 'EVENT_OVERRIDE';
