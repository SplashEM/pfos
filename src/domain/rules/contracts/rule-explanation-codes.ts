/**
 * Rule Engine explanation codes (Decision 074; PFOS-ENG-01 §24).
 *
 * Decision 074 gives the Rule Engine three independent closed code registries:
 *
 *   RULE_*          errors          (Decision 073, already registered)
 *   RULE_EXPLAIN_*  explanations    (this file)
 *   RULE_SKIP_*     skip reasons    (./rule-skip-reason-codes)
 *
 * The three are deliberately different concepts and must not be conflated. An
 * error is a domain failure. A skip reason is a machine-readable resolution
 * outcome. An explanation is user-facing reasoning about how resolution
 * occurred, and it travels with a successful result rather than replacing one.
 *
 * The vocabulary below is fixed by Decision 074 and derives from the
 * explainability contract in PFOS-ENG-01 §24. It is closed: a new code requires
 * an accepted decision, because explanations are persisted inside a Plan
 * Snapshot (Decision 023) and a released code must not change meaning.
 *
 * Decision 074 writes the vocabulary as a bare literal union. It is declared
 * here as a `const` object with the union derived from it, matching the shape
 * Decision 073 established for RULE_ERROR_CODES. The derived type is identical
 * to the union in the decision, and the object gives the architecture tests
 * that Decision 074 requires something to enumerate at run time.
 *
 * Warning categories stay on the DomainWarning channel (PFOS-ENG-00 §21) and
 * are not duplicated here.
 */
export const RULE_EXPLANATION_CODES = {
  /*
   * The inputs and rule/plan context used during resolution — event type,
   * income source, evaluation date and the applicable rules (§24.1).
   */
  RULE_EXPLAIN_RESOLUTION_CONTEXT: 'RULE_EXPLAIN_RESOLUTION_CONTEXT',

  /* A rule was selected and appears in the resolved rule set (§24.2). */
  RULE_EXPLAIN_RULE_APPLIED: 'RULE_EXPLAIN_RULE_APPLIED',

  /*
   * An additive rule survived alongside another applicable rule rather than
   * replacing it (§10.2, §24.2).
   *
   * Decision 074 records that this code has no producer until additive-versus-
   * replacing behavior is classified — blocker C, which remains open.
   */
  RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY: 'RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY',

  /* A lower-precedence rule was replaced by a higher-precedence one (§6, §24.2). */
  RULE_EXPLAIN_RULE_OVERRIDDEN: 'RULE_EXPLAIN_RULE_OVERRIDDEN',

  /*
   * An applicable default was inherited because no replacing override exists
   * (§9, §24.2) — a group default, a global rule or a product default.
   */
  RULE_EXPLAIN_DEFAULT_INHERITED: 'RULE_EXPLAIN_DEFAULT_INHERITED',

  /*
   * A rule was skipped (§24.2). This pairs with the machine-readable
   * RULE_SKIP_* reason carried by the corresponding SkippedRule; the two
   * registries stay separate because they serve different consumers.
   */
  RULE_EXPLAIN_RULE_SKIPPED: 'RULE_EXPLAIN_RULE_SKIPPED',
} as const;

export type RuleExplanationCode =
  (typeof RULE_EXPLANATION_CODES)[keyof typeof RULE_EXPLANATION_CODES];
