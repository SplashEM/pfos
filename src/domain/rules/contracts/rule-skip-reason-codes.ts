/**
 * Rule Engine skip-reason codes (Decision 074; PFOS-ENG-01 §24.2).
 *
 * A skip reason is the machine-readable outcome recorded when a rule was
 * considered during resolution and deliberately not applied. It is neither an
 * error nor an explanation: resolution still succeeds, and the human-facing
 * text travels separately under RULE_EXPLAIN_RULE_SKIPPED.
 *
 * Two boundaries define this registry, both fixed by Decision 074.
 *
 * A condition observed while money is being allocated is not a Rule Engine skip
 * reason. No remaining income, a capacity reached during execution and a
 * monthly requirement already satisfied are Allocation Engine runtime
 * reporting, and belong to Milestone 3.
 *
 * An invalid destination that blocks rule activation is a validation error
 * under PFOS-ENG-01 §21.1, not a skipped resolved rule. RULE_SKIP_* describes
 * rules that were valid and simply did not apply here.
 *
 * The vocabulary is closed. It is persisted inside a Plan Snapshot alongside
 * the resolved rule set (Decision 023; Decision 074), so a released code must
 * not change meaning, and a new one requires an accepted decision.
 *
 * Decision 074 writes the vocabulary as a bare literal union. It is declared
 * here as a `const` object with the union derived from it, matching the shape
 * Decision 073 established for RULE_ERROR_CODES. The derived type is identical
 * to the union in the decision, and the object gives the architecture tests
 * that Decision 074 requires something to enumerate at run time.
 */
export const RULE_SKIP_REASON_CODES = {
  /*
   * The rule version was not in effect on the evaluation date (§18, §19).
   * Rule changes are prospective (Decision 022), so a rule that starts later —
   * or has already ended — takes no part in this resolution.
   */
  RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE: 'RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE',

  /*
   * A higher-precedence rule replaced this one under the hierarchy in §6 —
   * for example a bucket rule replacing a group default.
   */
  RULE_SKIP_SUPERSEDED_BY_HIGHER_PRECEDENCE: 'RULE_SKIP_SUPERSEDED_BY_HIGHER_PRECEDENCE',

  /*
   * The income source is excluded from the rule (§12.5). A reimbursement,
   * refund, internal transfer or loan proceed is not eligible income unless
   * the user recorded it as such.
   */
  RULE_SKIP_INCOME_SOURCE_EXCLUDED: 'RULE_SKIP_INCOME_SOURCE_EXCLUDED',

  /*
   * The destination bucket is archived, so the rule cannot route money there
   * (§16.4, §24.2). An archived *required* destination is a hard validation
   * error instead, because it blocks activation (§21.1).
   */
  RULE_SKIP_DESTINATION_ARCHIVED: 'RULE_SKIP_DESTINATION_ARCHIVED',

  /*
   * The goal has reached its target and automatic allocation is paused
   * (Decision 025; §15.5, §24.4). Goal state is supplied in the evaluation
   * context (§32); the Rule Engine does not determine it.
   */
  RULE_SKIP_GOAL_FUNDED_ALLOCATION_PAUSED: 'RULE_SKIP_GOAL_FUNDED_ALLOCATION_PAUSED',

  /*
   * A one-time event-level override skipped the rule for this event only
   * (§29). The permanent rule is untouched.
   */
  RULE_SKIP_EVENT_OVERRIDE_SKIPPED: 'RULE_SKIP_EVENT_OVERRIDE_SKIPPED',
} as const;

export type RuleSkipReasonCode =
  (typeof RULE_SKIP_REASON_CODES)[keyof typeof RULE_SKIP_REASON_CODES];
