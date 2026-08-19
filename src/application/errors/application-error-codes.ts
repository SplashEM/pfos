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

  /*
   * A giving percentage was not written as a plain percentage.
   *
   * Only the shape is checked here: digits with at most two decimal places and
   * no sign. Whether the value is a usable rate belongs to the domain —
   * `fromPercent` rejects anything finer than a basis point, and `basisPoints`
   * bounds a rate to 0% through 100% — and those answers are returned
   * unchanged rather than restated here. No new limit is introduced.
   */
  APPLICATION_PLAN_GIVING_PERCENT_INVALID: 'APPLICATION_PLAN_GIVING_PERCENT_INVALID',

  /*
   * A per-paycheck funding amount was negative.
   *
   * `parseUsd` accepts a leading minus because negative Money is legitimate
   * elsewhere, so the sign is checked where the value is used. A requirement to
   * put a negative amount into a bucket describes money leaving it, which no
   * accepted funding type expresses.
   *
   * Zero is accepted. A requirement of nothing funds nothing, which is
   * representable and harmless, and refusing it would invent a minimum no
   * accepted source states.
   */
  APPLICATION_PLAN_FUNDING_AMOUNT_NEGATIVE: 'APPLICATION_PLAN_FUNDING_AMOUNT_NEGATIVE',

  /*
   * A destination was left without a name to show.
   *
   * This is a display label, not an identity. PFOS-ENG-00 §14 keeps the bucket
   * identifier opaque and PFOS-ENG-01 §26 forbids resolution from depending on
   * a display name, so an empty label is a presentation problem rather than a
   * financial one — but a preview whose destination has no name cannot be read.
   */
  APPLICATION_PLAN_LEFTOVER_LABEL_EMPTY: 'APPLICATION_PLAN_LEFTOVER_LABEL_EMPTY',
} as const;

export type ApplicationErrorCode =
  (typeof APPLICATION_ERROR_CODES)[keyof typeof APPLICATION_ERROR_CODES];
