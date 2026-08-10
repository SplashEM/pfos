import { describe, expect, it } from 'vitest';

import type { DomainError } from '../errors/domain-error';
import { ERROR_CODES } from '../errors/error-codes';
import type { Result } from '../errors/result';
import { contains, dateRange, overlaps, type DateRange } from './date-range';
import { financialDate, type FinancialDate } from './financial-date';

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Builds a range, failing loudly if the test supplied an invalid one. */
function range(start: FinancialDate, end: FinancialDate): DateRange {
  const result = dateRange(start, end);
  if (!result.ok) {
    throw new Error(`Invalid range in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Unwraps a rejected range, failing loudly if it unexpectedly succeeded. */
function codeOf(result: Result<DateRange, DomainError>): string {
  if (result.ok) {
    throw new Error('Expected the range to be rejected, but it was accepted.');
  }
  return result.error.code;
}

describe('dateRange', () => {
  it('accepts a range spanning several days', () => {
    const result = range(date(2026, 1, 1), date(2026, 1, 31));
    expect(result.start).toEqual({ year: 2026, month: 1, day: 1 });
    expect(result.end).toEqual({ year: 2026, month: 1, day: 31 });
  });

  it('accepts a single-day range', () => {
    const day = date(2026, 6, 15);
    expect(range(day, day).start).toEqual(range(day, day).end);
  });

  it('accepts a range spanning a year boundary', () => {
    const result = range(date(2025, 12, 31), date(2026, 1, 1));
    expect(result.end.year).toBe(2026);
  });

  it('rejects a range that starts after it ends', () => {
    expect(codeOf(dateRange(date(2026, 1, 31), date(2026, 1, 1)))).toBe(
      ERROR_CODES.DATE_RANGE_INVALID_ORDER,
    );
  });

  it('rejects a range inverted by a single day', () => {
    expect(codeOf(dateRange(date(2026, 1, 2), date(2026, 1, 1)))).toBe(
      ERROR_CODES.DATE_RANGE_INVALID_ORDER,
    );
  });

  it('freezes the result', () => {
    expect(Object.isFrozen(range(date(2026, 1, 1), date(2026, 1, 31)))).toBe(true);
  });
});

describe('contains', () => {
  const january = range(date(2026, 1, 1), date(2026, 1, 31));

  it('contains a date in the middle', () => {
    expect(contains(january, date(2026, 1, 15))).toBe(true);
  });

  it('contains the first day, since the range is inclusive', () => {
    expect(contains(january, date(2026, 1, 1))).toBe(true);
  });

  it('contains the last day, since the range is inclusive', () => {
    expect(contains(january, date(2026, 1, 31))).toBe(true);
  });

  it('excludes the day before the range', () => {
    expect(contains(january, date(2025, 12, 31))).toBe(false);
  });

  it('excludes the day after the range', () => {
    expect(contains(january, date(2026, 2, 1))).toBe(false);
  });

  it('excludes a date in a later year', () => {
    expect(contains(january, date(2027, 1, 15))).toBe(false);
  });

  describe('single-day range', () => {
    const oneDay = range(date(2026, 6, 15), date(2026, 6, 15));

    it('contains its own day', () => {
      expect(contains(oneDay, date(2026, 6, 15))).toBe(true);
    });

    it('excludes the previous day', () => {
      expect(contains(oneDay, date(2026, 6, 14))).toBe(false);
    });

    it('excludes the following day', () => {
      expect(contains(oneDay, date(2026, 6, 16))).toBe(false);
    });
  });
});

describe('overlaps', () => {
  const january = range(date(2026, 1, 1), date(2026, 1, 31));

  it('overlaps an identical range', () => {
    expect(overlaps(january, range(date(2026, 1, 1), date(2026, 1, 31)))).toBe(true);
  });

  it('overlaps a range that starts inside it', () => {
    expect(overlaps(january, range(date(2026, 1, 15), date(2026, 2, 15)))).toBe(true);
  });

  it('overlaps a range wholly inside it', () => {
    expect(overlaps(january, range(date(2026, 1, 10), date(2026, 1, 20)))).toBe(true);
  });

  it('overlaps a range that wholly contains it', () => {
    expect(overlaps(january, range(date(2025, 6, 1), date(2027, 6, 1)))).toBe(true);
  });

  it('overlaps a range touching on a single shared day', () => {
    expect(overlaps(january, range(date(2026, 1, 31), date(2026, 2, 5)))).toBe(true);
  });

  it('does not overlap an adjacent range starting the next day', () => {
    expect(overlaps(january, range(date(2026, 2, 1), date(2026, 2, 28)))).toBe(false);
  });

  it('does not overlap an adjacent range ending the previous day', () => {
    expect(overlaps(january, range(date(2025, 12, 1), date(2025, 12, 31)))).toBe(false);
  });

  it('does not overlap a wholly separate range', () => {
    expect(overlaps(january, range(date(2027, 1, 1), date(2027, 1, 31)))).toBe(false);
  });

  describe('symmetry', () => {
    const cases: readonly (readonly [string, DateRange])[] = [
      ['an overlapping range', range(date(2026, 1, 15), date(2026, 2, 15))],
      ['a touching range', range(date(2026, 1, 31), date(2026, 2, 5))],
      ['an adjacent range', range(date(2026, 2, 1), date(2026, 2, 28))],
      ['a separate range', range(date(2027, 1, 1), date(2027, 1, 31))],
    ];

    it.each(cases)('gives the same answer in either order for %s', (_description, other) => {
      expect(overlaps(january, other)).toBe(overlaps(other, january));
    });
  });
});
