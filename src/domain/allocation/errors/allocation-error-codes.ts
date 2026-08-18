/**
 * Allocation Engine error codes (Decision 073; PFOS-ENG-02 §39).
 *
 * Decision 073 places engine-specific codes inside the engine that introduces
 * them, and the Rule Engine's registry already records that the Allocation
 * Engine will own `ALLOCATION_*` under the same convention. The architecture
 * tests in src/test/architecture reserve that prefix, so this registry adopts
 * an established convention rather than opening a new one.
 *
 * Every code begins with `ALLOCATION_` so the engine registries stay disjoint
 * by construction, and each key is identical to its value.
 *
 * This registry is deliberately minimal. It holds only codes whose meaning is
 * settled by the behaviour that reports them, following the Rule Engine's rule
 * that no code is published before the behaviour it reports exists. The
 * shortfall, capacity, override and skip codes PFOS-ENG-02 describes arrive with
 * the milestone phase that implements them.
 */
export const ALLOCATION_ERROR_CODES = {
  /*
   * The resolved rule set asked for a stage this executor does not implement.
   *
   * The first executable slice supports GLOBAL_OBLIGATION, TOP_PRIORITY and
   * LEFTOVER_POLICY. A resolved set naming any other stage is a real plan the
   * engine cannot yet execute, and it must be refused rather than skipped:
   * silently ignoring a stage would drop money the plan intended to allocate
   * and produce a confidently wrong answer, which Constitution Principle 4
   * forbids. PFOS-ENG-01 §47.9 requires unknown variants to be rejected rather
   * than accommodated, and the same reasoning applies to a stage the engine
   * recognises but cannot yet run.
   *
   * This reports an unimplemented capability, not invalid data. The category is
   * UNSUPPORTED_STATE for that reason.
   */
  ALLOCATION_STAGE_NOT_SUPPORTED: 'ALLOCATION_STAGE_NOT_SUPPORTED',

  /*
   * A resolved strategy or policy variant this executor does not implement.
   *
   * The first slice executes the SEQUENTIAL top-priority strategy and the
   * SINGLE_DESTINATION leftover policy. Every other accepted variant is a valid
   * plan the engine cannot yet run, and is refused for the same reason as an
   * unsupported stage.
   */
  ALLOCATION_STRATEGY_NOT_SUPPORTED: 'ALLOCATION_STRATEGY_NOT_SUPPORTED',

  /*
   * A top-priority entry names a bucket with no funding requirement.
   *
   * A `ResolvedTopPriorityEntry` carries a rank but no amount, so the amount
   * comes from that bucket's own rule in `requiredFundingRules`. A top priority
   * with no requirement leaves the engine with no defensible amount to
   * allocate, and guessing one — zero, or the whole remaining pool — would
   * invent a financial semantic no accepted source supplies.
   */
  ALLOCATION_TOP_PRIORITY_REQUIREMENT_MISSING: 'ALLOCATION_TOP_PRIORITY_REQUIREMENT_MISSING',

  /*
   * A funding requirement the first slice cannot yet evaluate.
   *
   * FIXED_PER_PAYCHECK states its amount outright and resets each event, so it
   * needs no bucket balance and no period tracking. The other seven funding
   * types in Decision 074 need allocation capacity (§19), which needs bucket
   * state (§7) that this slice does not supply. Each is refused rather than
   * approximated.
   */
  ALLOCATION_FUNDING_TYPE_NOT_SUPPORTED: 'ALLOCATION_FUNDING_TYPE_NOT_SUPPORTED',
} as const;

export type AllocationErrorCode =
  (typeof ALLOCATION_ERROR_CODES)[keyof typeof ALLOCATION_ERROR_CODES];
