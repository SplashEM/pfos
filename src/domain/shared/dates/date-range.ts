import { domainError, type DomainError } from '../errors/domain-error';
import { ERROR_CATEGORIES } from '../errors/error-category';
import { ERROR_CODES } from '../errors/error-codes';
import { err, ok, type Result } from '../errors/result';
import { compareFinancialDates, type FinancialDate } from './financial-date';

/**
 * A span of calendar dates, inclusive at both ends (PFOS-ENG-00 §9).
 *
 * Inclusivity is deliberate: planning periods, goal windows and rule
 * effective ranges are described to the user by their first and last day, so
 * a half-open range would misreport every boundary.
 */
export interface DateRange {
  readonly start: FinancialDate;
  readonly end: FinancialDate;
}

/** Constructs a range, rejecting one whose start falls after its end. */
export function dateRange(
  start: FinancialDate,
  end: FinancialDate,
): Result<DateRange, DomainError> {
  if (compareFinancialDates(start, end) > 0) {
    return err(
      domainError({
        code: ERROR_CODES.DATE_RANGE_INVALID_ORDER,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'A date range must start on or before it ends.',
        details: 'The supplied start date falls after the supplied end date.',
      }),
    );
  }

  return ok(Object.freeze({ start, end }));
}

/** Whether a date falls within the range, counting both endpoints. */
export function contains(range: DateRange, date: FinancialDate): boolean {
  return (
    compareFinancialDates(range.start, date) <= 0 && compareFinancialDates(date, range.end) <= 0
  );
}

/** Whether two ranges share at least one day. */
export function overlaps(a: DateRange, b: DateRange): boolean {
  return compareFinancialDates(a.start, b.end) <= 0 && compareFinancialDates(b.start, a.end) <= 0;
}
