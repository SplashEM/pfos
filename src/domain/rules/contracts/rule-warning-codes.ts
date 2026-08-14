/**
 * Rule Engine warning codes (Decision 077; PFOS-ENG-01 §21.2).
 *
 * Decision 077 adds a fourth independent closed registry, completing the set
 * Decision 074 began:
 *
 *   RULE_*          errors          (../errors/rule-error-codes)
 *   RULE_EXPLAIN_*  explanations    (./rule-explanation-codes)
 *   RULE_SKIP_*     skip reasons    (./rule-skip-reason-codes)
 *   RULE_WARN_*     warnings        (this file)
 *
 * A warning is neither an error nor an explanation. It says resolution
 * succeeded and the result may still be undesirable (PFOS-ENG-00 §21), so it
 * travels alongside a successful result rather than replacing one. Presentation
 * severity does not substitute for it: an explanation carrying
 * `severity: 'WARNING'` is still an explanation (Decision 077).
 *
 * The registry constant is named RULE_WARNING_CODES while the prefix is
 * RULE_WARN_, exactly as RULE_EXPLAIN_* lives inside RULE_EXPLANATION_CODES.
 *
 * The vocabulary is closed. Warning codes are persisted inside a Plan Snapshot
 * (Decision 023), so a released code must not change meaning, and a new one
 * requires an accepted decision.
 *
 * It holds one code. Of the nine warnings PFOS-ENG-01 §21.2 lists as examples,
 * none is producible in Milestone 2 — they require projected amounts, bucket
 * balances, goal state, precedence resolution or authored contracts that do not
 * exist, and several are already owned by the Allocation Engine under
 * PFOS-ENG-02 §62. Decision 073 introduces a code with the behavior it reports,
 * so none of them is registered here.
 */
export const RULE_WARNING_CODES = {
  /*
   * A top-priority plan resolved to zero entries under the SEQUENTIAL strategy
   * (Decision 075; Decision 077). Decision 075 makes this a valid resolution
   * result rather than a failure, so it is reported here and never on the
   * Result error channel.
   *
   * A zero-entry PERCENTAGE_SPLIT plan is not this warning. It remains a hard
   * validation error reporting RULE_POOL_NOT_EXACTLY_100_PERCENT, and its
   * invalidity stays owned by percentage-pool validation.
   */
  RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED: 'RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED',
} as const;

export type RuleWarningCode = (typeof RULE_WARNING_CODES)[keyof typeof RULE_WARNING_CODES];
