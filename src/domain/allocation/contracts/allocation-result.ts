import type { AllocationStage } from '@domain/rules/contracts/allocation-stage';
import type { EntityId } from '@domain/shared/ids/entity-id';
import type { Money } from '@domain/shared/money/money';

import type { AllocationExplanation } from './allocation-explanation';

/**
 * One proposed movement of money into one bucket (PFOS-ENG-02 §11).
 *
 * A line records which bucket receives money, how much, and which stage
 * produced it. The stage is carried because it is what makes an allocation
 * explainable under Constitution Principle 9: "$200 to Giving" is a number,
 * while "$200 to Giving, at the global-obligation stage" is an answer.
 *
 * `stage` reuses the Rule Engine's `AllocationStage` vocabulary rather than
 * declaring a second one. Decision 074 gives that type to the Rule Engine and
 * the Allocation Engine consumes it, so there is one stage vocabulary in the
 * system rather than two that can drift.
 *
 * `explanation` carries the structured facts behind the amount (PFOS-ENG-02
 * §52). Constitution Principle 9 asks that an allocation be explainable, and a
 * line that says only "$780" is not: the reason belongs beside the number
 * rather than being reconstructed by whoever displays it. It is required, so no
 * stage can emit money without saying why.
 *
 * A line is a proposal, not a posted transaction. Nothing here confirms,
 * persists or moves physical money; Constitution Principle 8 keeps physical
 * money and virtual planning separate, and this contract lives entirely on the
 * planning side.
 */
export interface AllocationLine {
  readonly bucketId: EntityId;
  readonly stage: AllocationStage;
  readonly amount: Money;
  readonly explanation: AllocationExplanation;
}

/**
 * The result of allocating one income event against one resolved rule set
 * (PFOS-ENG-02 §46).
 *
 * `incomeEventId` and `resolvedRuleSetId` are the provenance of the answer:
 * together they say which paycheck was allocated and which resolved plan
 * decided it. Constitution Principle 12 asks which rule or plan version was
 * used, and Decision 074 keeps the resolved set identifiable for exactly this
 * reason.
 *
 * `totalAllocated` and `unallocated` are both carried, and their sum must equal
 * the starting pool. PFOS-ENG-02 §2 states the invariant that every allocation
 * decreases the remaining pool exactly once, so recording both halves lets a
 * caller check conservation without re-deriving it. Storing only one would make
 * the invariant unverifiable from the result alone.
 *
 * This is the minimum shape the current slices need. §46 and the neighbouring
 * sections describe more that a full preview eventually carries — run states
 * (§8), shortfall and unmet amounts (§41), skipped allocations (§50) and the
 * invariant report (§47). None is included here: publishing empty shapes for
 * behaviour nothing yet produces would fix contracts ahead of the code that
 * gives them meaning.
 *
 * Per-line explanations were on that list until a plan could hold two
 * priorities competing for one paycheck. A person can now see a number smaller
 * than what was asked for, so the reason arrived with the behaviour that made
 * it necessary, on `AllocationLine.explanation`.
 */
export interface AllocationResult {
  readonly incomeEventId: EntityId;
  readonly resolvedRuleSetId: EntityId;
  readonly lines: readonly AllocationLine[];
  readonly totalAllocated: Money;
  readonly unallocated: Money;
}
