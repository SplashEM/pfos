import { describe, expect, it } from 'vitest';

import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import type { Result } from '@domain/shared/errors/result';

import type { RuleEffectivePeriod } from '../contracts/rule-effective-period';
import type { RuleDomainError } from '../errors/rule-error';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { validateRuleEffectivePeriod } from './rule-effective-period';

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

/** Unwraps a rejection, failing loudly if the period was unexpectedly accepted. */
function errorOf(result: Result<void, RuleDomainError>): RuleDomainError {
  if (result.ok) {
    throw new Error('Expected the period to be rejected, but it was accepted.');
  }
  return result.error;
}

/** Asserts an accepted period, including the undefined success value. */
function expectAccepted(result: Result<void, RuleDomainError>): void {
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toBeUndefined();
  }
}

const INVERTED: RuleEffectivePeriod = {
  effectiveFrom: date(2026, 3, 31),
  effectiveTo: date(2026, 1, 1),
};

describe('validateRuleEffectivePeriod accepts', () => {
  /* Decision 078: an absent end is open-ended, and that is the ordinary case. */
  it('an open-ended period', () => {
    expectAccepted(validateRuleEffectivePeriod({ effectiveFrom: date(2026, 1, 1) }));
  });

  it('a period whose end follows its start', () => {
    expectAccepted(
      validateRuleEffectivePeriod({
        effectiveFrom: date(2026, 1, 1),
        effectiveTo: date(2026, 3, 31),
      }),
    );
  });

  /* Decision 078: equal endpoints describe a valid one-day period. */
  it('a one-day period', () => {
    expectAccepted(
      validateRuleEffectivePeriod({
        effectiveFrom: date(2026, 2, 14),
        effectiveTo: date(2026, 2, 14),
      }),
    );
  });

  /* Decision 078: §28 permits a rule to take effect immediately or later. */
  it('a period starting in the past', () => {
    expectAccepted(validateRuleEffectivePeriod({ effectiveFrom: date(1970, 1, 1) }));
  });

  it('a period starting far in the future', () => {
    expectAccepted(validateRuleEffectivePeriod({ effectiveFrom: date(9999, 12, 31) }));
  });

  /* An inverted period is the only rejection, so a wide valid span must pass. */
  it('a period spanning several years', () => {
    expectAccepted(
      validateRuleEffectivePeriod({
        effectiveFrom: date(2020, 1, 1),
        effectiveTo: date(2030, 12, 31),
      }),
    );
  });
});

describe('validateRuleEffectivePeriod rejects', () => {
  it('a period whose end precedes its start', () => {
    const error = errorOf(validateRuleEffectivePeriod(INVERTED));

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_EFFECTIVE_PERIOD_INVALID_RANGE);
    expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION);
  });

  /* One day of inversion is still an inversion; the boundary is strict. */
  it('a period inverted by a single day', () => {
    const error = errorOf(
      validateRuleEffectivePeriod({
        effectiveFrom: date(2026, 2, 15),
        effectiveTo: date(2026, 2, 14),
      }),
    );

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_EFFECTIVE_PERIOD_INVALID_RANGE);
  });

  /*
   * Decision 078 fixes the reported text as a literal with no interpolated
   * value, and names no entity because the function receives a period rather
   * than a rule. The error is compared whole, so adding a field or a date to
   * any part of it fails here.
   */
  it('with fixed text that names no entity', () => {
    const expected: RuleDomainError = {
      code: RULE_ERROR_CODES.RULE_EFFECTIVE_PERIOD_INVALID_RANGE,
      category: ERROR_CATEGORIES.VALIDATION,
      summary: 'An end date must fall on or after the start date.',
      details: 'The supplied effective period ends before it begins.',
      suggestedResolution: 'Set the end date on or after the start date, or leave it empty.',
    };

    expect(errorOf(validateRuleEffectivePeriod(INVERTED))).toEqual(expected);
  });
});

describe('validateRuleEffectivePeriod is deterministic and total', () => {
  it('returns an equal Result for structurally equal inverted periods', () => {
    const left: RuleEffectivePeriod = {
      effectiveFrom: date(2026, 3, 31),
      effectiveTo: date(2026, 1, 1),
    };
    const right: RuleEffectivePeriod = {
      effectiveFrom: date(2026, 3, 31),
      effectiveTo: date(2026, 1, 1),
    };

    expect(validateRuleEffectivePeriod(right)).toEqual(validateRuleEffectivePeriod(left));
  });

  it('returns an equal Result for structurally equal valid periods', () => {
    const left: RuleEffectivePeriod = { effectiveFrom: date(2026, 1, 1) };
    const right: RuleEffectivePeriod = { effectiveFrom: date(2026, 1, 1) };

    expect(validateRuleEffectivePeriod(right)).toEqual(validateRuleEffectivePeriod(left));
  });

  it('does not throw on an inverted period', () => {
    expect(() => validateRuleEffectivePeriod(INVERTED)).not.toThrow();
  });

  it('does not throw on an open-ended period', () => {
    expect(() => validateRuleEffectivePeriod({ effectiveFrom: date(2026, 1, 1) })).not.toThrow();
  });
});
