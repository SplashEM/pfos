import { describe, expect, it } from 'vitest';

import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';

import { isEffectiveOn, type RuleEffectivePeriod } from './rule-effective-period';

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

const FINITE: RuleEffectivePeriod = {
  effectiveFrom: date(2026, 1, 1),
  effectiveTo: date(2026, 3, 31),
};

const OPEN_ENDED: RuleEffectivePeriod = { effectiveFrom: date(2026, 1, 1) };

const ONE_DAY: RuleEffectivePeriod = {
  effectiveFrom: date(2026, 2, 14),
  effectiveTo: date(2026, 2, 14),
};

describe('isEffectiveOn over a finite period', () => {
  it('excludes the day before it starts', () => {
    expect(isEffectiveOn(FINITE, date(2025, 12, 31))).toBe(false);
  });

  /* Decision 078: the start is inclusive. */
  it('includes the first day', () => {
    expect(isEffectiveOn(FINITE, date(2026, 1, 1))).toBe(true);
  });

  it('includes a day inside the period', () => {
    expect(isEffectiveOn(FINITE, date(2026, 2, 15))).toBe(true);
  });

  /* Decision 078: the end is inclusive. This is the boundary a half-open
   * convention would get wrong by exactly one day. */
  it('includes the last day', () => {
    expect(isEffectiveOn(FINITE, date(2026, 3, 31))).toBe(true);
  });

  it('excludes the day after it ends', () => {
    expect(isEffectiveOn(FINITE, date(2026, 4, 1))).toBe(false);
  });
});

describe('isEffectiveOn over an open-ended period', () => {
  it('excludes the day before it starts', () => {
    expect(isEffectiveOn(OPEN_ENDED, date(2025, 12, 31))).toBe(false);
  });

  it('includes the first day', () => {
    expect(isEffectiveOn(OPEN_ENDED, date(2026, 1, 1))).toBe(true);
  });

  it('includes a date far in the future', () => {
    expect(isEffectiveOn(OPEN_ENDED, date(9999, 12, 31))).toBe(true);
  });

  /*
   * Decision 078: an absent end is absent, not a sentinel. This is the
   * observable difference between the chosen shape and either a DateRange,
   * which requires both endpoints, or a far-future placeholder end.
   */
  it('leaves effectiveTo absent rather than filling in an end', () => {
    expect('effectiveTo' in OPEN_ENDED).toBe(false);
  });
});

describe('isEffectiveOn over a one-day period', () => {
  /* Decision 078: equal endpoints describe a valid one-day period. */
  it('includes its own day', () => {
    expect(isEffectiveOn(ONE_DAY, date(2026, 2, 14))).toBe(true);
  });

  it('excludes the previous day', () => {
    expect(isEffectiveOn(ONE_DAY, date(2026, 2, 13))).toBe(false);
  });

  it('excludes the following day', () => {
    expect(isEffectiveOn(ONE_DAY, date(2026, 2, 15))).toBe(false);
  });
});

/*
 * PFOS-ENG-01 §26: resolution must not depend on object identity. The predicate
 * reads values only, so two structurally equal but distinct inputs must agree.
 */
describe('isEffectiveOn reads values rather than references', () => {
  it('agrees for structurally equal but distinct periods', () => {
    const left: RuleEffectivePeriod = {
      effectiveFrom: date(2026, 1, 1),
      effectiveTo: date(2026, 3, 31),
    };
    const right: RuleEffectivePeriod = {
      effectiveFrom: date(2026, 1, 1),
      effectiveTo: date(2026, 3, 31),
    };
    const evaluationDate = date(2026, 2, 15);

    expect(isEffectiveOn(right, evaluationDate)).toBe(isEffectiveOn(left, evaluationDate));
    expect(isEffectiveOn(left, evaluationDate)).toBe(true);
  });

  it('agrees with itself on repeated evaluation', () => {
    const evaluationDate = date(2026, 2, 15);

    expect(isEffectiveOn(FINITE, evaluationDate)).toBe(isEffectiveOn(FINITE, evaluationDate));
  });
});

/*
 * Decision 078: isEffectiveOn is a predicate, not a validator. An inverted
 * period belongs to the separate period validator and its own error code. Here
 * it must simply satisfy no date, without special-casing, throwing or
 * reporting anything.
 */
describe('isEffectiveOn over an inverted period', () => {
  const INVERTED: RuleEffectivePeriod = {
    effectiveFrom: date(2026, 3, 31),
    effectiveTo: date(2026, 1, 1),
  };

  it('matches no date between the two endpoints', () => {
    expect(isEffectiveOn(INVERTED, date(2026, 2, 15))).toBe(false);
  });

  it('matches neither endpoint', () => {
    expect(isEffectiveOn(INVERTED, date(2026, 1, 1))).toBe(false);
    expect(isEffectiveOn(INVERTED, date(2026, 3, 31))).toBe(false);
  });

  it('does not throw', () => {
    expect(() => isEffectiveOn(INVERTED, date(2026, 2, 15))).not.toThrow();
  });
});
