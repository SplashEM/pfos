import { describe, expect, it } from 'vitest';

import type { DomainError } from '../errors/domain-error';
import { ERROR_CODES } from '../errors/error-codes';
import type { Result } from '../errors/result';
import { compareFinancialDates, financialDate, type FinancialDate } from './financial-date';

/** Unwraps a successful date, failing loudly if it was rejected. */
function valueOf(result: Result<FinancialDate, DomainError>): FinancialDate {
  if (!result.ok) {
    throw new Error(`Expected a valid date, received ${result.error.code}.`);
  }
  return result.value;
}

/** Unwraps a rejected date, failing loudly if it unexpectedly succeeded. */
function codeOf(result: Result<FinancialDate, DomainError>): string {
  if (result.ok) {
    throw new Error('Expected the date to be rejected, but it was accepted.');
  }
  return result.error.code;
}

/** Renders a date for readable assertions. Test-only, not a domain format. */
function label(date: FinancialDate): string {
  return `${String(date.year)}-${String(date.month)}-${String(date.day)}`;
}

describe('financialDate', () => {
  describe('accepted dates', () => {
    it('constructs an ordinary date', () => {
      expect(valueOf(financialDate(2026, 8, 10))).toEqual({ year: 2026, month: 8, day: 10 });
    });

    it('accepts the first day of a year', () => {
      expect(label(valueOf(financialDate(2026, 1, 1)))).toBe('2026-1-1');
    });

    it('accepts the last day of a year', () => {
      expect(label(valueOf(financialDate(2026, 12, 31)))).toBe('2026-12-31');
    });

    it('accepts the earliest supported year', () => {
      expect(valueOf(financialDate(1, 1, 1)).year).toBe(1);
    });

    it('accepts the latest supported year', () => {
      expect(valueOf(financialDate(9999, 12, 31)).year).toBe(9999);
    });

    it('freezes the result', () => {
      expect(Object.isFrozen(valueOf(financialDate(2026, 8, 10)))).toBe(true);
    });
  });

  describe('month lengths', () => {
    const monthLengths: readonly (readonly [number, number])[] = [
      [1, 31],
      [2, 28],
      [3, 31],
      [4, 30],
      [5, 31],
      [6, 30],
      [7, 31],
      [8, 31],
      [9, 30],
      [10, 31],
      [11, 30],
      [12, 31],
    ];

    for (const [month, length] of monthLengths) {
      it(`accepts day ${String(length)} of month ${String(month)} in 2023`, () => {
        expect(valueOf(financialDate(2023, month, length)).day).toBe(length);
      });
    }

    for (const [month, length] of monthLengths) {
      it(`rejects day ${String(length + 1)} of month ${String(month)} in 2023`, () => {
        expect(codeOf(financialDate(2023, month, length + 1))).toBe(
          ERROR_CODES.DATE_INVALID_CALENDAR_DATE,
        );
      });
    }
  });

  describe('leap years', () => {
    const leapCases: readonly (readonly [number, boolean])[] = [
      [2024, true],
      [2023, false],
      [2000, true],
      [1900, false],
      [2100, false],
      [1600, true],
    ];

    it.each(leapCases)('handles 29 February %i', (year, isLeap) => {
      const result = financialDate(year, 2, 29);
      if (isLeap) {
        expect(valueOf(result).day).toBe(29);
      } else {
        expect(codeOf(result)).toBe(ERROR_CODES.DATE_INVALID_CALENDAR_DATE);
      }
    });

    it('accepts 28 February in a non-leap year', () => {
      expect(valueOf(financialDate(1900, 2, 28)).day).toBe(28);
    });
  });

  describe('rejected components', () => {
    const cases: readonly (readonly [string, number, number, number])[] = [
      ['a fractional year', 2026.5, 1, 1],
      ['a fractional month', 2026, 1.5, 1],
      ['a fractional day', 2026, 1, 1.5],
      ['NaN', Number.NaN, 1, 1],
      ['infinity', Number.POSITIVE_INFINITY, 1, 1],
      ['year zero', 0, 1, 1],
      ['a year past the supported range', 10_000, 1, 1],
      ['a negative year', -1, 1, 1],
      ['month zero', 2026, 0, 1],
      ['month thirteen', 2026, 13, 1],
      ['day zero', 2026, 1, 0],
      ['a negative day', 2026, 1, -1],
    ];

    it.each(cases)('rejects %s', (_description, year, month, day) => {
      expect(codeOf(financialDate(year, month, day))).toBe(ERROR_CODES.DATE_INVALID_COMPONENT);
    });
  });

  describe('component and calendar failures stay distinct', () => {
    it('reports day zero as an invalid component', () => {
      expect(codeOf(financialDate(2026, 1, 0))).toBe(ERROR_CODES.DATE_INVALID_COMPONENT);
    });

    it('reports day thirty-two as an invalid calendar date', () => {
      expect(codeOf(financialDate(2026, 1, 32))).toBe(ERROR_CODES.DATE_INVALID_CALENDAR_DATE);
    });

    it('reports 31 April as an invalid calendar date', () => {
      expect(codeOf(financialDate(2026, 4, 31))).toBe(ERROR_CODES.DATE_INVALID_CALENDAR_DATE);
    });

    it('reports 30 February as an invalid calendar date', () => {
      expect(codeOf(financialDate(2026, 2, 30))).toBe(ERROR_CODES.DATE_INVALID_CALENDAR_DATE);
    });
  });
});

describe('compareFinancialDates', () => {
  const earlier = (): FinancialDate => valueOf(financialDate(2025, 12, 31));
  const later = (): FinancialDate => valueOf(financialDate(2026, 1, 1));

  it('orders by year first', () => {
    expect(compareFinancialDates(earlier(), later())).toBe(-1);
  });

  it('orders by month when years match', () => {
    const january = valueOf(financialDate(2026, 1, 31));
    const february = valueOf(financialDate(2026, 2, 1));
    expect(compareFinancialDates(january, february)).toBe(-1);
  });

  it('orders by day when years and months match', () => {
    const first = valueOf(financialDate(2026, 3, 1));
    const second = valueOf(financialDate(2026, 3, 2));
    expect(compareFinancialDates(first, second)).toBe(-1);
  });

  it('reports zero for identical dates', () => {
    expect(compareFinancialDates(earlier(), earlier())).toBe(0);
  });

  it('reverses sign when the arguments are reversed', () => {
    expect(compareFinancialDates(later(), earlier())).toBe(1);
  });

  it('sorts a list chronologically', () => {
    const dates = [
      valueOf(financialDate(2026, 1, 2)),
      valueOf(financialDate(2025, 12, 31)),
      valueOf(financialDate(2026, 1, 1)),
      valueOf(financialDate(2024, 2, 29)),
    ];

    expect([...dates].sort(compareFinancialDates).map(label)).toEqual([
      '2024-2-29',
      '2025-12-31',
      '2026-1-1',
      '2026-1-2',
    ]);
  });
});
