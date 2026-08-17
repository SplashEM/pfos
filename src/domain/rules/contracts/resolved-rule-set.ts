import type { FinancialDate } from '@domain/shared/dates/financial-date';
import type { Timestamp } from '@domain/shared/dates/timestamp';
import type { DomainWarning } from '@domain/shared/explanations/warning';
import type { EntityId } from '@domain/shared/ids/entity-id';

import type { AllocationBasis } from './allocation-basis';
import type { AllocationStage } from './allocation-stage';
import type { PlanVersionId } from './plan-version-id';
import type { ResolutionMode } from './resolution-mode';
import type { ResolvedFundingRule } from './resolved-funding-rule';
import type { ResolvedGlobalObligation } from './resolved-global-obligation';
import type { ResolvedGoalPolicy } from './resolved-goal-policy';
import type { ResolvedLeftoverPolicy } from './resolved-leftover-policy';
import type { ResolvedPoolPlan } from './resolved-pool-plan';
import type { ResolvedRolloverPolicy } from './resolved-rollover-policy';
import type { ResolvedTopPriorityPlan } from './resolved-top-priority-plan';
import type { RuleExplanation } from './rule-explanation';
import type { SkippedRule } from './skipped-rule';

/**
 * The schema version assigned to the current `ResolvedRuleSet` contract
 * (Decision 092).
 *
 * Decision 092 ratified the previously implicit baseline of 1, naming the
 * seven-member `ResolvedGlobalObligation` shape that carried `obligationId` and
 * `sequence`, and established 2 for the shape Decisions 090 and 091 decided.
 * Both incompatible changes are carried by that one transition.
 *
 * Changing the persisted contract incompatibly requires a new version under
 * Decision 074, never a silent edit of this value.
 *
 * This versions the persisted `ResolvedRuleSet` contract and nothing else. It is
 * not the database schema version, the backup format version, or the application
 * version, and Decision 092 leaves its relationship to the conceptual
 * `PlanSnapshot` schema version undetermined.
 */
export const RESOLVED_RULE_SET_SCHEMA_VERSION = 2;

/**
 * The single output of the Rule Engine and the single rule input to the
 * Allocation Engine (Decision 074).
 *
 * The Rule Engine resolves policy. The Allocation Engine executes that resolved
 * policy. The Rule Engine must not calculate final allocation amounts, and the
 * Allocation Engine must not independently re-resolve rule precedence.
 *
 * PFOS-ENG-01 §23's `effectiveAt` concept is represented by two fields, one for
 * each half of PFOS-ENG-00's distinction between date-only financial concepts
 * and moments in time:
 *
 *   evaluationDate  the date against which rules are evaluated
 *   resolvedAt      the moment the resolution occurred
 *
 * `roundingPolicyId` is carried once, at the root. Decision 071 is
 * authoritative and there is no per-rule rounding strategy. It is a string
 * rather than the current literal so a historical snapshot can preserve the
 * identifier that applied when that snapshot was created.
 *
 * The resolved set is persisted inside a Plan Snapshot (Decision 023), so this
 * shape is a contract: an incompatible change requires a `schemaVersion`
 * increment so existing snapshots continue to reproduce the rules under which
 * they were created.
 */
export interface ResolvedRuleSet {
  // Provenance
  readonly resolvedRuleSetId: EntityId;
  readonly planVersionId: PlanVersionId;
  readonly schemaVersion: number;
  readonly roundingPolicyId: string;
  readonly resolvedAt: Timestamp;
  readonly evaluationDate: FinancialDate;
  readonly resolutionMode: ResolutionMode;
  readonly historicalSnapshotId?: EntityId;
  readonly sourceRuleVersionIds: readonly EntityId[];

  // Executable output
  readonly allocationBasis: AllocationBasis;
  readonly stageSequence: readonly AllocationStage[];
  readonly globalObligations: readonly ResolvedGlobalObligation[];
  readonly topPriorities: ResolvedTopPriorityPlan;
  readonly requiredFundingRules: readonly ResolvedFundingRule[];
  readonly lowerPriorityPool: ResolvedPoolPlan;
  readonly leftoverPolicy: ResolvedLeftoverPolicy;
  readonly rolloverPolicies: readonly ResolvedRolloverPolicy[];
  readonly goalPolicies: readonly ResolvedGoalPolicy[];

  // Non-executable output
  readonly skippedRules: readonly SkippedRule[];
  readonly warnings: readonly DomainWarning[];
  readonly explanations: readonly RuleExplanation[];
}
