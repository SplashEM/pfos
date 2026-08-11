import type { EntityId } from '@domain/shared/ids/entity-id';

import type { RuleSkipReasonCode } from './rule-skip-reason-codes';

/**
 * A rule that was considered during resolution and deliberately not applied
 * (Decision 074; PFOS-ENG-01 §24.2).
 *
 * This is the structure that carries a RULE_SKIP_* code. The registry in
 * ./rule-skip-reason-codes fixes the vocabulary; this fixes what travels with
 * it. A skipped rule is a successful resolution outcome, carried on
 * `ResolvedRuleSet.skippedRules`.
 *
 * A RuleDomainError (../errors/rule-error) is a failure. A RuleExplanation is
 * human-facing reasoning. `reasonCode` is machine-readable and pairs with the
 * RULE_EXPLAIN_RULE_SKIPPED explanation (Decision 074).
 *
 * Decision 074 defines `ruleVersionId` as optional.
 *
 * Skipped rules are persisted inside a Plan Snapshot alongside the resolved
 * rule set (Decision 023; Decision 074). Changing the persisted resolved
 * contract after snapshots exist requires a schema-version change.
 */
export interface SkippedRule {
  readonly ruleId: EntityId;
  readonly ruleVersionId?: EntityId;
  readonly reasonCode: RuleSkipReasonCode;
  readonly affectedEntityIds: readonly EntityId[];
}
