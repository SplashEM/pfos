/**
 * Stable error codes (PFOS-ENG-00 §22, §42).
 *
 * Codes are part of the domain contract: they are matched by tests, surfaced
 * to the presentation layer, and must not change meaning once released.
 *
 * Milestone 1 owns only the shared-primitive codes below, in three families:
 * MONEY_*, BASIS_POINTS_* and DATE_*. Engine-specific codes (allocation,
 * rules, goals) belong to the milestones that introduce those engines.
 *
 * Timestamp failures use the DATE_* family because Timestamp is part of the
 * shared date module. No separate TIMESTAMP_* family exists.
 */
export const ERROR_CODES = {
  /* Money — construction and arithmetic (§10.1, §10.2). */
  MONEY_NOT_INTEGER: 'MONEY_NOT_INTEGER',
  MONEY_UNSAFE_INTEGER: 'MONEY_UNSAFE_INTEGER',
  MONEY_CURRENCY_MISMATCH: 'MONEY_CURRENCY_MISMATCH',

  /* Money — weighted division (Decision 071). */
  MONEY_DIVISION_EMPTY_WEIGHTS: 'MONEY_DIVISION_EMPTY_WEIGHTS',
  MONEY_DIVISION_INVALID_WEIGHT: 'MONEY_DIVISION_INVALID_WEIGHT',
  MONEY_DIVISION_ZERO_TOTAL_WEIGHT: 'MONEY_DIVISION_ZERO_TOTAL_WEIGHT',
  MONEY_DIVISION_NEGATIVE_TOTAL: 'MONEY_DIVISION_NEGATIVE_TOTAL',
  MONEY_DIVISION_UNSAFE_PRODUCT: 'MONEY_DIVISION_UNSAFE_PRODUCT',

  /* Money — parsing untrusted user input (§10.3, §29.1). */
  MONEY_PARSE_INVALID_FORMAT: 'MONEY_PARSE_INVALID_FORMAT',
  MONEY_PARSE_UNSAFE_AMOUNT: 'MONEY_PARSE_UNSAFE_AMOUNT',

  /* Basis points (§11). */
  BASIS_POINTS_NOT_INTEGER: 'BASIS_POINTS_NOT_INTEGER',
  BASIS_POINTS_OUT_OF_RANGE: 'BASIS_POINTS_OUT_OF_RANGE',
  BASIS_POINTS_NOT_REPRESENTABLE: 'BASIS_POINTS_NOT_REPRESENTABLE',

  /* Dates, date ranges and timestamps (§13). */
  DATE_INVALID_COMPONENT: 'DATE_INVALID_COMPONENT',
  DATE_INVALID_CALENDAR_DATE: 'DATE_INVALID_CALENDAR_DATE',
  DATE_PARSE_INVALID_FORMAT: 'DATE_PARSE_INVALID_FORMAT',
  DATE_RANGE_INVALID_ORDER: 'DATE_RANGE_INVALID_ORDER',
  DATE_INVALID_TIMESTAMP: 'DATE_INVALID_TIMESTAMP',
  DATE_INVALID_TIME_ZONE: 'DATE_INVALID_TIME_ZONE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
