import { describe, expect, it } from 'vitest';

import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import type { Result } from '@domain/shared/errors/result';
import { asEntityId } from '@domain/shared/ids/entity-id';

import type { RuleDomainError } from '../errors/rule-error';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import {
  validateDistinctRuleVersionEffectiveStarts,
  type RuleVersionEffectivePeriodLike,
} from './rule-version-effective-starts';

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

/**
 * Builds one version. Identifiers are sequential only so each version is
 * distinguishable while reading a test; nothing under test reads them.
 */
function version(
  id: string,
  effectiveFrom: FinancialDate,
  effectiveTo?: FinancialDate,
): RuleVersionEffectivePeriodLike {
  return {
    ruleVersionId: asEntityId(id),
    period: effectiveTo === undefined ? { effectiveFrom } : { effectiveFrom, effectiveTo },
  };
}

/** Unwraps a rejection, failing loudly if the history was unexpectedly accepted. */
function errorOf(result: Result<void, RuleDomainError>): RuleDomainError {
  if (result.ok) {
    throw new Error('Expected the version history to be rejected, but it was accepted.');
  }
  return result.error;
}

/** Asserts an accepted history, including the undefined success value. */
function expectAccepted(result: Result<void, RuleDomainError>): void {
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toBeUndefined();
  }
}

const JANUARY = date(2026, 1, 1);
const APRIL = date(2026, 4, 1);
const JULY = date(2026, 7, 1);

/* The §19.2 shape: an open-ended January version and a later April one. */
const PROSPECTIVE_CHANGE: readonly RuleVersionEffectivePeriodLike[] = [
  version('rule-version-1', JANUARY),
  version('rule-version-2', APRIL),
];

/* Two versions claiming the same start, which is the one rejected shape. */
const DUPLICATE_START: readonly RuleVersionEffectivePeriodLike[] = [
  version('rule-version-1', JANUARY),
  version('rule-version-2', JANUARY),
];

describe('validateDistinctRuleVersionEffectiveStarts accepts', () => {
  it('an empty history', () => {
    expectAccepted(validateDistinctRuleVersionEffectiveStarts([]));
  });

  it('a single version', () => {
    expectAccepted(
      validateDistinctRuleVersionEffectiveStarts([version('rule-version-1', JANUARY)]),
    );
  });

  it('two versions with distinct starts', () => {
    expectAccepted(validateDistinctRuleVersionEffectiveStarts(PROSPECTIVE_CHANGE));
  });

  /*
   * Decision 079 permits overlap outright. Here the January version runs to
   * July while the April version has already begun, so both are in effect
   * together through the spring.
   */
  it('overlapping periods whose starts differ', () => {
    expectAccepted(
      validateDistinctRuleVersionEffectiveStarts([
        version('rule-version-1', JANUARY, JULY),
        version('rule-version-2', APRIL, date(2026, 12, 31)),
      ]),
    );
  });

  /*
   * The §19.2 example itself: neither version carries an end, so both are
   * open-ended and both are in effect from April onward.
   */
  it('several open-ended versions whose starts differ', () => {
    expectAccepted(
      validateDistinctRuleVersionEffectiveStarts([
        version('rule-version-1', JANUARY),
        version('rule-version-2', APRIL),
        version('rule-version-3', JULY),
      ]),
    );
  });

  it('a mix of finite and open-ended periods', () => {
    expectAccepted(
      validateDistinctRuleVersionEffectiveStarts([
        version('rule-version-1', JANUARY, date(2026, 3, 31)),
        version('rule-version-2', APRIL),
      ]),
    );
  });

  /* Contiguity is not required, so a history with a gap in it passes. */
  it('a history containing a gap', () => {
    expectAccepted(
      validateDistinctRuleVersionEffectiveStarts([
        version('rule-version-1', JANUARY, date(2026, 2, 28)),
        version('rule-version-2', JULY),
      ]),
    );
  });

  /* One-day versions are valid (Decision 078) and collide only on their start. */
  it('one-day versions on different days', () => {
    expectAccepted(
      validateDistinctRuleVersionEffectiveStarts([
        version('rule-version-1', JANUARY, JANUARY),
        version('rule-version-2', APRIL, APRIL),
      ]),
    );
  });

  /* Starts one day apart are distinct; the comparison is exact, not approximate. */
  it('starts separated by a single day', () => {
    expectAccepted(
      validateDistinctRuleVersionEffectiveStarts([
        version('rule-version-1', date(2026, 6, 15)),
        version('rule-version-2', date(2026, 6, 16)),
      ]),
    );
  });
});

describe('validateDistinctRuleVersionEffectiveStarts rejects', () => {
  it('two versions sharing a start', () => {
    const error = errorOf(validateDistinctRuleVersionEffectiveStarts(DUPLICATE_START));

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM);
    expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION);
  });

  /*
   * The ends differ in every way available — open-ended, one-day, finite — and
   * none of it matters. Decision 079 rejects the shared start itself, so the
   * outcome cannot depend on how the two periods otherwise relate.
   */
  it('a shared start where one version is open-ended and the other one-day', () => {
    const error = errorOf(
      validateDistinctRuleVersionEffectiveStarts([
        version('rule-version-1', JANUARY),
        version('rule-version-2', JANUARY, JANUARY),
      ]),
    );

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM);
  });

  it('a shared start where the two periods end on different days', () => {
    const error = errorOf(
      validateDistinctRuleVersionEffectiveStarts([
        version('rule-version-1', JANUARY, APRIL),
        version('rule-version-2', JANUARY, JULY),
      ]),
    );

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM);
  });

  it('a shared start where neither period contains the other', () => {
    const error = errorOf(
      validateDistinctRuleVersionEffectiveStarts([
        version('rule-version-1', JANUARY, APRIL),
        version('rule-version-2', JANUARY),
      ]),
    );

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM);
  });

  /* A duplicate is found wherever it sits, not only between neighbours. */
  it('a duplicate separated by an unrelated version', () => {
    const error = errorOf(
      validateDistinctRuleVersionEffectiveStarts([
        version('rule-version-1', JANUARY),
        version('rule-version-2', APRIL),
        version('rule-version-3', JANUARY),
      ]),
    );

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM);
  });

  /* Two separate collisions still produce one error, and the same one. */
  it('a history containing two separate duplicate groups', () => {
    const twoGroups: readonly RuleVersionEffectivePeriodLike[] = [
      version('rule-version-1', JANUARY),
      version('rule-version-2', JANUARY),
      version('rule-version-3', JULY),
      version('rule-version-4', JULY),
    ];

    expect(validateDistinctRuleVersionEffectiveStarts(twoGroups)).toEqual(
      validateDistinctRuleVersionEffectiveStarts(DUPLICATE_START),
    );
  });

  /*
   * The text is fixed, interpolates nothing, and names no entity. The error is
   * compared whole, so adding a field, a date or an identifier to any part of
   * it fails here rather than silently establishing a convention.
   */
  it('with fixed text that names no entity', () => {
    const expected: RuleDomainError = {
      code: RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM,
      category: ERROR_CATEGORIES.VALIDATION,
      summary: 'Each version of a rule must start on a different date.',
      details: 'Two or more versions of this rule share the same effective start date.',
      suggestedResolution: 'Give each version its own effective start date.',
    };

    expect(errorOf(validateDistinctRuleVersionEffectiveStarts(DUPLICATE_START))).toEqual(expected);
  });

  it('names no affected entity', () => {
    expect(
      Object.keys(errorOf(validateDistinctRuleVersionEffectiveStarts(DUPLICATE_START))),
    ).not.toContain('affectedEntityIds');
  });
});

describe('validateDistinctRuleVersionEffectiveStarts is deterministic', () => {
  const THREE: readonly RuleVersionEffectivePeriodLike[] = [
    version('rule-version-1', JANUARY),
    version('rule-version-2', APRIL),
    version('rule-version-3', JULY),
  ];

  it('accepts identically however a valid history is arranged', () => {
    const reversed = [...THREE].reverse();
    const rotated = [...THREE.slice(1), ...THREE.slice(0, 1)];

    expect(validateDistinctRuleVersionEffectiveStarts(reversed)).toEqual(
      validateDistinctRuleVersionEffectiveStarts(THREE),
    );
    expect(validateDistinctRuleVersionEffectiveStarts(rotated)).toEqual(
      validateDistinctRuleVersionEffectiveStarts(THREE),
    );
  });

  it('rejects identically however a duplicate history is arranged', () => {
    const withDuplicate: readonly RuleVersionEffectivePeriodLike[] = [
      version('rule-version-1', JANUARY),
      version('rule-version-2', APRIL),
      version('rule-version-3', JANUARY),
    ];
    const reversed = [...withDuplicate].reverse();

    expect(validateDistinctRuleVersionEffectiveStarts(reversed)).toEqual(
      validateDistinctRuleVersionEffectiveStarts(withDuplicate),
    );
  });

  /* Identifiers are opaque (PFOS-ENG-00 §14), so relabelling changes nothing. */
  it('ignores the version identifiers entirely', () => {
    const relabelled: readonly RuleVersionEffectivePeriodLike[] = [
      version('zzz-9999', JANUARY),
      version('aaa-0001', APRIL),
      version('mmm-5000', JULY),
    ];

    expect(validateDistinctRuleVersionEffectiveStarts(relabelled)).toEqual(
      validateDistinctRuleVersionEffectiveStarts(THREE),
    );
  });

  /*
   * Version-history validity does not depend on a date, so the function takes
   * exactly one argument. An evaluation-date parameter could not be added
   * without failing this.
   */
  it('accepts no evaluation date', () => {
    expect(validateDistinctRuleVersionEffectiveStarts.length).toBe(1);
  });

  it('does not mutate the supplied collection', () => {
    const supplied = [...THREE];
    validateDistinctRuleVersionEffectiveStarts(supplied);

    expect(supplied).toEqual([...THREE]);
  });

  it('does not throw on a duplicate history', () => {
    expect(() => validateDistinctRuleVersionEffectiveStarts(DUPLICATE_START)).not.toThrow();
  });

  it('does not throw on an empty history', () => {
    expect(() => validateDistinctRuleVersionEffectiveStarts([])).not.toThrow();
  });
});
