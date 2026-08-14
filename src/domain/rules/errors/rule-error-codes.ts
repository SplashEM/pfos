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
 * failures assigned to the Rule Engine by Decision 071 "Validation ownership",
 * the two top-priority failures named by Decision 076, and the effective-period
 * range failure named by Decision 078. The remaining hard-validation codes in
 * PFOS-ENG-01 §21.1 arrive with the milestone phase that implements the
 * validation behind them, so that no code is published before the rule it
 * reports is specified.
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

  /*
   * A top-priority plan must hold no more than the V1 maximum of three entries
   * (Decision 076; PFOS-ENG-01 §13.1, §21.1). The limit applies under either
   * strategy, because §13.1 limits top priorities as such rather than limiting a
   * particular strategy.
   *
   * The number three is deliberately absent from the name: the V1 limit may
   * change, the meaning "more than the allowed maximum" does not.
   */
  RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM: 'RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM',

  /*
   * Two top-priority entries must not share a rank (Decision 076;
   * PFOS-ENG-01 §13.1, §21.1). Uniqueness is the only constraint on rank —
   * ranks need not be positive, contiguous, start at one, or match array
   * position, because no accepted source requires any of those.
   */
  RULE_TOP_PRIORITY_DUPLICATE_RANK: 'RULE_TOP_PRIORITY_DUPLICATE_RANK',

  /*
   * A rule version's effective period ends before it starts (Decision 078;
   * PFOS-ENG-01 §18, §21.1, §43.3).
   *
   * This reports one condition and only one: `effectiveTo` is present and falls
   * strictly before `effectiveFrom`. An absent `effectiveTo` is an open-ended
   * period and is valid, and endpoints that are equal describe a valid one-day
   * period, so neither is reported here.
   *
   * It says nothing about how two periods relate. Decision 078 introduces no
   * overlap rule, no contiguity rule and no restriction on the number of
   * open-ended versions, so no code is registered for any of them.
   *
   * The shared DATE_RANGE_INVALID_ORDER is not reused. It belongs to the shared
   * DateRange primitive, which requires both endpoints, while Decision 073
   * confines shared codes to the shared primitive families.
   */
  RULE_EFFECTIVE_PERIOD_INVALID_RANGE: 'RULE_EFFECTIVE_PERIOD_INVALID_RANGE',
} as const;

export type RuleErrorCode = (typeof RULE_ERROR_CODES)[keyof typeof RULE_ERROR_CODES];
