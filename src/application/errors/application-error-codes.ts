/**
 * Application-layer error codes.
 *
 * Decision 073 places engine-specific codes inside the engine that introduces
 * them, keeping the shared registry to the shared primitive families. The same
 * separation is applied one layer out: these report failures of user input
 * handed to a use case, which is neither a shared primitive nor an engine rule.
 *
 * Every code begins with `APPLICATION_` so this registry stays disjoint from
 * the shared `MONEY_*`, `BASIS_POINTS_*` and `DATE_*` families and from the
 * `RULE_*` and `ALLOCATION_*` engine registries. Each key is identical to its
 * value, as every other registry requires.
 *
 * These report input a person can correct, never a financial rule. No code here
 * describes money moving, a plan resolving, or a decision being made.
 */
export const APPLICATION_ERROR_CODES = {
  /*
   * A paycheck amount parsed correctly but was zero or negative.
   *
   * `parseUsd` accepts a leading minus because a negative Money is legitimate
   * elsewhere in the domain, so the sign is checked here rather than there. A
   * paycheck that pays nothing has nothing to allocate, and allocating a
   * negative pool would invert every stage. This is input validation, not a
   * financial rule: no accepted source is consulted and none is needed.
   */
  APPLICATION_PAYCHECK_AMOUNT_NOT_POSITIVE: 'APPLICATION_PAYCHECK_AMOUNT_NOT_POSITIVE',

  /*
   * A paycheck date did not arrive as a calendar date this layer can read.
   *
   * The date input supplies `YYYY-MM-DD`. Anything else cannot be split into
   * the three components `financialDate` requires, so it is refused before the
   * domain sees it. Dates that are well-formed but do not exist — 31 February —
   * are the domain's own `DATE_INVALID_CALENDAR_DATE`, and are not reported
   * here.
   */
  APPLICATION_PAYCHECK_DATE_INVALID_FORMAT: 'APPLICATION_PAYCHECK_DATE_INVALID_FORMAT',
} as const;

export type ApplicationErrorCode =
  (typeof APPLICATION_ERROR_CODES)[keyof typeof APPLICATION_ERROR_CODES];
