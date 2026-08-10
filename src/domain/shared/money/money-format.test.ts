import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { formatUsd } from './money-format';

describe('formatUsd', () => {
  describe('dollars and cents', () => {
    const cases: readonly (readonly [number, string])[] = [
      [0, '$0.00'],
      [1, '$0.01'],
      [5, '$0.05'],
      [9, '$0.09'],
      [10, '$0.10'],
      [99, '$0.99'],
      [100, '$1.00'],
      [101, '$1.01'],
      [1234, '$12.34'],
      [99_999, '$999.99'],
    ];

    it.each(cases)('formats %i cents as %s', (cents, expected) => {
      expect(formatUsd(money(cents))).toBe(expected);
    });
  });

  describe('thousands grouping', () => {
    const cases: readonly (readonly [number, string])[] = [
      [100_000, '$1,000.00'],
      [123_456, '$1,234.56'],
      [999_999, '$9,999.99'],
      [1_000_000, '$10,000.00'],
      [100_000_000, '$1,000,000.00'],
      [123_456_789, '$1,234,567.89'],
      [100_000_000_000, '$1,000,000,000.00'],
    ];

    it.each(cases)('formats %i cents as %s', (cents, expected) => {
      expect(formatUsd(money(cents))).toBe(expected);
    });

    it('groups the largest representable amount', () => {
      expect(formatUsd(money(Number.MAX_SAFE_INTEGER))).toBe('$90,071,992,547,409.91');
    });
  });

  describe('negative amounts', () => {
    const cases: readonly (readonly [number, string])[] = [
      [-1, '-$0.01'],
      [-100, '-$1.00'],
      [-1234, '-$12.34'],
      [-123_456, '-$1,234.56'],
      [-123_456_789, '-$1,234,567.89'],
    ];

    it.each(cases)('formats %i cents as %s', (cents, expected) => {
      expect(formatUsd(money(cents))).toBe(expected);
    });

    it('places the sign before the currency symbol', () => {
      expect(formatUsd(money(-500)).startsWith('-$')).toBe(true);
    });
  });

  describe('locale independence', () => {
    it('emits only ASCII characters, so no locale-specific spacing can appear', () => {
      const formatted = formatUsd(money(123_456_789));
      expect([...formatted].every((character) => character.charCodeAt(0) < 128)).toBe(true);
    });

    it('always emits exactly two decimal places', () => {
      const amounts = [0, 1, 10, 100, 1000, 123_456];
      for (const cents of amounts) {
        expect(formatUsd(money(cents)).split('.')[1]).toHaveLength(2);
      }
    });
  });
});
