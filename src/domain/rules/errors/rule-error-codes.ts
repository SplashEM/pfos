/**
 * Rule Engine error codes (Decision 073; PFOS-ENG-01 §39).
 *
 * Decision 073 places engine-specific codes inside the engine that introduces
 * them. Shared ERROR_CODES keeps only the shared-primitive families — MONEY_*,
 * BASIS_POINTS_* and DATE_* — and never learns about an engine.
 *
 * Every code here begins with RULE_ so that engine registries stay disjoint by
 * construction. The Allocation Engine and Goal Engine will own ALLOCATION_* and
 * GOAL_* under the same convention. src/test/architecture enforces both the
 * prefix and the disjointness, because the type system no longer can once each
 * registry is declared separately.
 *
 * Codes are part of the domain contract: they are matched by tests, surfaced to
 * the presentation layer, and must not change meaning once released (§39).
 *
 * This registry is deliberately minimal. It holds only the codes whose meaning
 * is already settled by an accepted decision — the two authored-percentage-pool
 * failures assigned to the Rule Engine by Decision 071 "Validation ownership".
 * The remaining hard-validation codes in PFOS-ENG-01 §21.1 arrive with the
 * milestone phase that implements the validation behind them, so that no code
 * is published before the rule it reports is specified.
 */
export const RULE_ERROR_CODES = {
  /*
   * An authored percentage pool must total exactly 10,000 basis points
   * (Decision 071; PFOS-ENG-00 §11; PFOS-ENG-01 §13.3, §14.3, §16.4, §21.1).
   *
   * This applies to authored pools only. Weights derived during allocation
   * legitimately total less once a destination is removed, and Money performs
   * no sum check of any kind.
   */
  RULE_POOL_NOT_EXACTLY_100_PERCENT: 'RULE_POOL_NOT_EXACTLY_100_PERCENT',

  /*
   * An individual pool entry must be between 0 and 10,000 basis points
   * (Decision 071; PFOS-ENG-01 §21.1). A single rate carries no sum
   * requirement and is validated separately (§15.1).
   */
  RULE_POOL_ENTRY_OUT_OF_RANGE: 'RULE_POOL_ENTRY_OUT_OF_RANGE',
} as const;

export type RuleErrorCode = (typeof RULE_ERROR_CODES)[keyof typeof RULE_ERROR_CODES];
