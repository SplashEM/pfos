import { describe, expect, it } from 'vitest';

import type { DomainError } from '../errors/domain-error';
import { ERROR_CODES } from '../errors/error-codes';
import type { Result } from '../errors/result';
import {
  BASIS_POINTS_SCALE,
  basisPoints,
  fromPercent,
  toRatio,
  type BasisPoints,
} from './basis-points';

/** Unwraps a successful rate, failing loudly if it was rejected. */
function valueOf(result: Result<BasisPoints, DomainError>): BasisPoints {
  if (!result.ok) {
    throw new Error(`Expected a valid rate, received ${result.error.code}.`);
  }
  return result.value;
}

/** Unwraps a rejected rate, failing loudly if it unexpectedly succeeded. */
function codeOf(result: Result<BasisPoints, DomainError>): string {
  if (result.ok) {
    throw new Error('Expected the rate to be rejected, but it was accepted.');
  }
  return result.error.code;
}

describe('BASIS_POINTS_SCALE', () => {
  it('is ten thousand, so one hundred percent is 10,000 basis points', () => {
    expect(BASIS_POINTS_SCALE).toBe(10_000);
  });
});

describe('basisPoints', () => {
  describe('accepted rates', () => {
    const cases: readonly number[] = [0, 1, 250, 1000, 3333, 5000, 9999, 10_000];

    it.each(cases)('accepts %i basis points', (value) => {
      expect(valueOf(basisPoints(value))).toBe(value);
    });

    it('accepts the full scale as one hundred percent', () => {
      expect(valueOf(basisPoints(BASIS_POINTS_SCALE))).toBe(10_000);
    });
  });

  describe('rejected rates', () => {
    it('rejects a fractional rate', () => {
      expect(codeOf(basisPoints(10.5))).toBe(ERROR_CODES.BASIS_POINTS_NOT_INTEGER);
    });

    it('rejects NaN', () => {
      expect(codeOf(basisPoints(Number.NaN))).toBe(ERROR_CODES.BASIS_POINTS_NOT_INTEGER);
    });

    it('rejects infinity', () => {
      expect(codeOf(basisPoints(Number.POSITIVE_INFINITY))).toBe(
        ERROR_CODES.BASIS_POINTS_NOT_INTEGER,
      );
    });

    it('rejects a negative rate', () => {
      expect(codeOf(basisPoints(-1))).toBe(ERROR_CODES.BASIS_POINTS_OUT_OF_RANGE);
    });

    it('rejects a rate above one hundred percent', () => {
      expect(codeOf(basisPoints(10_001))).toBe(ERROR_CODES.BASIS_POINTS_OUT_OF_RANGE);
    });
  });
});

describe('fromPercent', () => {
  describe('accepted percentages', () => {
    const cases: readonly (readonly [number, number])[] = [
      [0, 0],
      [0.01, 1],
      [1, 100],
      [7, 700],
      [0.07, 7],
      [10, 1000],
      [12.5, 1250],
      [33.33, 3333],
      [29.97, 2997],
      [99.99, 9999],
      [100, 10_000],
    ];

    it.each(cases)('converts %s percent to %i basis points', (percent, expected) => {
      expect(valueOf(fromPercent(percent))).toBe(expected);
    });
  });

  describe('rejected percentages', () => {
    it('rejects a value finer than one basis point', () => {
      expect(codeOf(fromPercent(0.001))).toBe(ERROR_CODES.BASIS_POINTS_NOT_REPRESENTABLE);
    });

    it('rejects a half basis point', () => {
      expect(codeOf(fromPercent(0.005))).toBe(ERROR_CODES.BASIS_POINTS_NOT_REPRESENTABLE);
    });

    it('rejects NaN', () => {
      expect(codeOf(fromPercent(Number.NaN))).toBe(ERROR_CODES.BASIS_POINTS_NOT_REPRESENTABLE);
    });

    it('rejects infinity', () => {
      expect(codeOf(fromPercent(Number.POSITIVE_INFINITY))).toBe(
        ERROR_CODES.BASIS_POINTS_NOT_REPRESENTABLE,
      );
    });

    it('reports an out-of-range percentage as out of range, not unrepresentable', () => {
      expect(codeOf(fromPercent(100.01))).toBe(ERROR_CODES.BASIS_POINTS_OUT_OF_RANGE);
    });

    it('reports a negative percentage as out of range', () => {
      expect(codeOf(fromPercent(-0.01))).toBe(ERROR_CODES.BASIS_POINTS_OUT_OF_RANGE);
    });
  });
});

describe('toRatio', () => {
  const cases: readonly (readonly [number, number])[] = [
    [0, 0],
    [1, 0.0001],
    [1000, 0.1],
    [2500, 0.25],
    [5000, 0.5],
    [10_000, 1],
  ];

  it.each(cases)('converts %i basis points to the ratio %s', (value, expected) => {
    expect(toRatio(valueOf(basisPoints(value)))).toBe(expected);
  });
});
