import { domainError, type DomainError } from '../errors/domain-error';
import { ERROR_CATEGORIES } from '../errors/error-category';
import { ERROR_CODES } from '../errors/error-codes';
import { err, ok, type Result } from '../errors/result';

/**
 * A calendar date with no clock time (PFOS-ENG-00 §13.1).
 *
 * Pay dates, due dates, goal deadlines and effective dates are date-only
 * concepts. Storing them as instants would make them shift with timezone,
 * which §13.1 explicitly warns against.
 */
export interface FinancialDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Month lengths are computed arithmetically rather than by constructing a
 * Date, because the domain layer may not read the host calendar (§13.4).
 */
function daysInMonth(year: number, month: number): number {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1] ?? 0;
}

/** Constructs a calendar date, rejecting values that do not exist. */
export function financialDate(
  year: number,
  month: number,
  day: number,
): Result<FinancialDate, DomainError> {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return err(
      domainError({
        code: ERROR_CODES.DATE_INVALID_COMPONENT,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'A date must be made of whole numbers.',
        details: `Received year ${String(year)}, month ${String(month)}, day ${String(day)}.`,
      }),
    );
  }

  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) {
    return err(
      domainError({
        code: ERROR_CODES.DATE_INVALID_COMPONENT,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'That date is outside the supported range.',
        details: `Received year ${String(year)}, month ${String(month)}, day ${String(day)}.`,
      }),
    );
  }

  const monthLength = daysInMonth(year, month);

  if (day > monthLength) {
    return err(
      domainError({
        code: ERROR_CODES.DATE_INVALID_CALENDAR_DATE,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'That day does not exist in that month.',
        details: `Month ${String(month)} of ${String(year)} has ${String(monthLength)} days.`,
      }),
    );
  }

  return ok(Object.freeze({ year, month, day }));
}

/** Chronological ordering. Total and deterministic, so it needs no Result. */
export function compareFinancialDates(a: FinancialDate, b: FinancialDate): -1 | 0 | 1 {
  if (a.year !== b.year) {
    return a.year < b.year ? -1 : 1;
  }
  if (a.month !== b.month) {
    return a.month < b.month ? -1 : 1;
  }
  if (a.day !== b.day) {
    return a.day < b.day ? -1 : 1;
  }
  return 0;
}
