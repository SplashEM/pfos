import { describe, expect, it } from 'vitest';

import type { DomainError } from '../errors/domain-error';
import { ERROR_CODES } from '../errors/error-codes';
import type { Result } from '../errors/result';
import { formatUsd } from './money-format';
import type { Money } from './money';
import { parseUsd } from './money-parse';

/** Unwraps a successful parse, failing loudly if it was rejected. */
function centsOf(result: Result<Money, DomainError>): number {
  if (!result.ok) {
    throw new Error(`Expected a successful parse, received ${result.error.code}.`);
  }
  return result.value.cents;
}

/** Unwraps a rejected parse, failing loudly if it unexpectedly succeeded. */
function codeOf(result: Result<Money, DomainError>): string {
  if (result.ok) {
    throw new Error('Expected the input to be rejected, but it parsed.');
  }
  return result.error.code;
}

describe('parseUsd', () => {
  describe('accepted input', () => {
    const cases: readonly (readonly [string, number])[] = [
      ['0', 0],
      ['1', 100],
      ['0.00', 0],
      ['0.01', 1],
      ['1.5', 150],
      ['1.50', 150],
      ['12.34', 1234],
      ['1234.56', 123_456],
      ['1,234.56', 123_456],
      ['1,234,567.89', 123_456_789],
      ['999', 99_900],
      ['1000', 100_000],
    ];

    it.each(cases)('parses %s as %i cents', (input, expected) => {
      expect(centsOf(parseUsd(input))).toBe(expected);
    });
  });

  describe('currency symbol and sign', () => {
    it('accepts a leading dollar sign', () => {
      expect(centsOf(parseUsd('$12.34'))).toBe(1234);
    });

    it('accepts a grouped amount with a dollar sign', () => {
      expect(centsOf(parseUsd('$1,234.56'))).toBe(123_456);
    });

    it('accepts a negative amount', () => {
      expect(centsOf(parseUsd('-1.00'))).toBe(-100);
    });

    it('accepts a negative amount with a dollar sign', () => {
      expect(centsOf(parseUsd('-$1.00'))).toBe(-100);
    });

    it('rejects a sign placed after the dollar sign', () => {
      expect(codeOf(parseUsd('$-1.00'))).toBe(ERROR_CODES.MONEY_PARSE_INVALID_FORMAT);
    });

    it('normalises negative zero to zero', () => {
      expect(Object.is(centsOf(parseUsd('-0.00')), 0)).toBe(true);
    });
  });

  describe('surrounding whitespace', () => {
    it('trims leading and trailing whitespace', () => {
      expect(centsOf(parseUsd('  12.34  '))).toBe(1234);
    });

    it('rejects whitespace inside the number', () => {
      expect(codeOf(parseUsd('1 234.56'))).toBe(ERROR_CODES.MONEY_PARSE_INVALID_FORMAT);
    });
  });

  describe('rejected format', () => {
    const cases: readonly string[] = [
      '',
      '   ',
      'abc',
      '1e5',
      '1E5',
      'Infinity',
      'NaN',
      '1.234',
      '1.',
      '.50',
      '1,23',
      '1,2345',
      '12,34.56',
      '1.2.3',
      '--1',
      '+1',
      '1..2',
      '$',
      '-',
    ];

    it.each(cases)('rejects %s', (input) => {
      expect(codeOf(parseUsd(input))).toBe(ERROR_CODES.MONEY_PARSE_INVALID_FORMAT);
    });

    it('rejects non-ASCII digits', () => {
      const arabicIndicTwelve = String.fromCharCode(0x0661, 0x0662);
      expect(codeOf(parseUsd(arabicIndicTwelve))).toBe(ERROR_CODES.MONEY_PARSE_INVALID_FORMAT);
    });
  });

  describe('amounts beyond the safe range', () => {
    it('accepts the largest representable amount', () => {
      expect(centsOf(parseUsd('90071992547409.91'))).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('rejects an amount one cent beyond the safe range', () => {
      expect(codeOf(parseUsd('90071992547409.92'))).toBe(ERROR_CODES.MONEY_PARSE_UNSAFE_AMOUNT);
    });

    it('rejects a whole part that cannot be scaled to cents', () => {
      expect(codeOf(parseUsd('90071992547410.00'))).toBe(ERROR_CODES.MONEY_PARSE_UNSAFE_AMOUNT);
    });

    it('rejects a whole part that is not itself a safe integer', () => {
      expect(codeOf(parseUsd('99999999999999999'))).toBe(ERROR_CODES.MONEY_PARSE_UNSAFE_AMOUNT);
    });
  });

  describe('round trip with formatUsd', () => {
    const cases: readonly string[] = [
      '$0.00',
      '$0.01',
      '$1.00',
      '$12.34',
      '$1,234.56',
      '$1,234,567.89',
      '-$1.00',
      '-$1,234.56',
    ];

    it.each(cases)('formats %s back to itself after parsing', (formatted) => {
      const result = parseUsd(formatted);
      if (!result.ok) {
        throw new Error(`Expected ${formatted} to parse, received ${result.error.code}.`);
      }
      expect(formatUsd(result.value)).toBe(formatted);
    });
  });
});
