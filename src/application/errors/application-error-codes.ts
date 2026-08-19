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

  /*
   * A priority was left without a name to show.
   *
   * Like the leftover label this is a display name rather than an identity — a
   * priority keeps its own stable identifier however it is renamed — but a
   * funding line with no name cannot be read, and a person cannot tell two
   * unnamed priorities apart.
   */
  APPLICATION_PLAN_PRIORITY_LABEL_EMPTY: 'APPLICATION_PLAN_PRIORITY_LABEL_EMPTY',

  /*
   * A stored confirmed financial record could not be read as a valid record.
   *
   * Decision 098 holding 8: a malformed record produces an explicit read
   * failure and the stored data is left untouched. It is never defaulted,
   * repaired, partially accepted, deleted or reinterpreted, which is the point
   * on which a financial record differs from the disposable preview settings.
   *
   * Reported on the way in as well as on the way out. A record that fails
   * validation is not written, so a malformed value cannot become a stored one.
   */
  APPLICATION_CONFIRMED_RECORD_MALFORMED: 'APPLICATION_CONFIRMED_RECORD_MALFORMED',

  /*
   * A stored confirmed record declared a schema version this build does not
   * read.
   *
   * Decision 098 holding 8 names an unrecognised `schemaVersion` as a read
   * failure. No compatibility reader and no read-migration exists, and neither
   * is implied here: this reports that the record was not read, and the bytes
   * stay where they are.
   */
  APPLICATION_CONFIRMED_RECORD_UNSUPPORTED_SCHEMA_VERSION:
    'APPLICATION_CONFIRMED_RECORD_UNSUPPORTED_SCHEMA_VERSION',

  /*
   * A confirmed allocation's totals did not conserve the paycheck.
   *
   * PFOS-ENG-00 §32 Invariant 1: income equals allocated plus unallocated,
   * exactly to the cent. A stored record that breaks it is not a record of any
   * allocation that happened, so it is refused rather than shown.
   */
  APPLICATION_CONFIRMED_RECORD_CONSERVATION_VIOLATED:
    'APPLICATION_CONFIRMED_RECORD_CONSERVATION_VIOLATED',

  /*
   * A confirmed allocation named a Plan Snapshot that is not stored.
   *
   * PFOS-ENG-00 §32 Invariant 12 requires every reference in a confirmed record
   * to resolve, and Invariant 9 ties a historical operation to its snapshot. An
   * allocation whose snapshot is missing cannot be interpreted without falling
   * back to current rules, which Decision 098 holding 4 forbids.
   */
  APPLICATION_CONFIRMATION_SNAPSHOT_MISSING: 'APPLICATION_CONFIRMATION_SNAPSHOT_MISSING',

  /*
   * A confirmation could not be written.
   *
   * Decision 098 holding 1 makes one confirmation one atomic operation: if
   * either record cannot be written, neither is committed. This reports that
   * nothing was stored, so a caller never has to guess whether half of a
   * confirmation survived.
   */
  APPLICATION_CONFIRMATION_WRITE_FAILED: 'APPLICATION_CONFIRMATION_WRITE_FAILED',

  /*
   * A stored confirmation could not be reached.
   *
   * The database itself refused the read — unavailable, blocked, or closed
   * underneath the caller. It says nothing about the contents of any record:
   * a record that was read but could not be understood is
   * `APPLICATION_CONFIRMED_RECORD_MALFORMED` instead, and nothing stored is
   * modified in either case.
   */
  APPLICATION_CONFIRMATION_READ_FAILED: 'APPLICATION_CONFIRMATION_READ_FAILED',
} as const;

export type ApplicationErrorCode =
  (typeof APPLICATION_ERROR_CODES)[keyof typeof APPLICATION_ERROR_CODES];
