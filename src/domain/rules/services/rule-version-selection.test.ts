import { describe, expect, it } from 'vitest';

import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import type { Result } from '@domain/shared/errors/result';
import { asEntityId } from '@domain/shared/ids/entity-id';

import type { RuleDomainError } from '../errors/rule-error';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import type { RuleVersionEffectivePeriodLike } from '../validation/rule-version-effective-starts';
import { selectRuleVersionEffectiveOn } from './rule-version-selection';

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

/**
 * Builds one version. Identifiers only make a version recognisable while
 * reading a test; nothing under test reads or orders them.
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

/** Unwraps a successful selection, failing loudly if it was rejected. */
function selectionOf<T>(result: Result<T | undefined, RuleDomainError>): T | undefined {
  if (!result.ok) {
    throw new Error(`Expected a selection, but it failed with ${result.error.code}.`);
  }
  return result.value;
}

/** Unwraps a rejection, failing loudly if the selection unexpectedly succeeded. */
function errorOf<T>(result: Result<T | undefined, RuleDomainError>): RuleDomainError {
  if (result.ok) {
    throw new Error('Expected the selection to be rejected, but it succeeded.');
  }
  return result.error;
}

const JANUARY = date(2026, 1, 1);
const FEBRUARY = date(2026, 2, 15);
const APRIL = date(2026, 4, 1);
const JUNE = date(2026, 6, 15);
const JULY = date(2026, 7, 1);

/*
 * PFOS-ENG-01 §19.2's worked example: a 10% version effective January 1 and a
 * 12% version effective April 1. Neither carries an end, because Decision 078
 * fixes a period at creation and §28 offers no way to close the January one.
 */
const V1 = version('rule-version-1', JANUARY);
const V2 = version('rule-version-2', APRIL);
const PROSPECTIVE_CHANGE: readonly RuleVersionEffectivePeriodLike[] = [V1, V2];

describe('selectRuleVersionEffectiveOn selects nothing', () => {
  it('from an empty history', () => {
    expect(selectionOf(selectRuleVersionEffectiveOn([], JANUARY))).toBeUndefined();
  });

  it('when every version begins after the evaluation date', () => {
    const future: readonly RuleVersionEffectivePeriodLike[] = [
      version('rule-version-1', APRIL),
      version('rule-version-2', JULY),
    ];

    expect(selectionOf(selectRuleVersionEffectiveOn(future, JANUARY))).toBeUndefined();
  });

  it('when every version has already ended', () => {
    const ended: readonly RuleVersionEffectivePeriodLike[] = [
      version('rule-version-1', JANUARY, FEBRUARY),
      version('rule-version-2', APRIL, JUNE),
    ];

    expect(selectionOf(selectRuleVersionEffectiveOn(ended, JULY))).toBeUndefined();
  });

  /*
   * Decision 078 and Decision 079: an empty selection says only that this rule
   * contributes no version on this date. It is a success, not a failure, and it
   * carries no fallback, default or precedence outcome — that is Blocker C.
   */
  it('as a success rather than a failure', () => {
    const result = selectRuleVersionEffectiveOn([], JANUARY);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeUndefined();
    }
  });
});

describe('selectRuleVersionEffectiveOn selects the only effective version', () => {
  it('when it is open-ended', () => {
    expect(selectionOf(selectRuleVersionEffectiveOn([V1], JUNE))).toBe(V1);
  });

  it('when it is finite', () => {
    const finite = version('rule-version-1', JANUARY, JULY);

    expect(selectionOf(selectRuleVersionEffectiveOn([finite], APRIL))).toBe(finite);
  });

  /* Decision 078: both endpoints are inclusive. */
  it('on its exact start date', () => {
    const finite = version('rule-version-1', JANUARY, JULY);

    expect(selectionOf(selectRuleVersionEffectiveOn([finite], JANUARY))).toBe(finite);
  });

  it('on its exact end date', () => {
    const finite = version('rule-version-1', JANUARY, JULY);

    expect(selectionOf(selectRuleVersionEffectiveOn([finite], JULY))).toBe(finite);
  });

  it('on the single day of a one-day version', () => {
    const oneDay = version('rule-version-1', APRIL, APRIL);

    expect(selectionOf(selectRuleVersionEffectiveOn([oneDay], APRIL))).toBe(oneDay);
  });
});

describe('selectRuleVersionEffectiveOn prefers the latest effective start', () => {
  it('between two open-ended versions', () => {
    expect(selectionOf(selectRuleVersionEffectiveOn(PROSPECTIVE_CHANGE, JUNE))).toBe(V2);
  });

  /* §19.2 in January: only the first version has begun. */
  it('choosing the January version on its own start date', () => {
    expect(selectionOf(selectRuleVersionEffectiveOn(PROSPECTIVE_CHANGE, JANUARY))).toBe(V1);
  });

  it('choosing the January version in February', () => {
    expect(selectionOf(selectRuleVersionEffectiveOn(PROSPECTIVE_CHANGE, FEBRUARY))).toBe(V1);
  });

  /*
   * §19.3 reports this change to the user as happening on April 1, so April 1
   * itself must already answer with the April version. An exclusive start would
   * be a one-day error in a real paycheck.
   */
  it('choosing the April version on April 1 itself', () => {
    expect(selectionOf(selectRuleVersionEffectiveOn(PROSPECTIVE_CHANGE, APRIL))).toBe(V2);
  });

  it('choosing the April version after April', () => {
    expect(selectionOf(selectRuleVersionEffectiveOn(PROSPECTIVE_CHANGE, JULY))).toBe(V2);
  });

  it('among three overlapping versions', () => {
    const third = version('rule-version-3', JUNE);
    const three: readonly RuleVersionEffectivePeriodLike[] = [V1, V2, third];

    expect(selectionOf(selectRuleVersionEffectiveOn(three, JULY))).toBe(third);
  });

  /*
   * A version starting later than the evaluation date is not a candidate, so a
   * scheduled future change cannot reach back and answer for today.
   */
  it('ignoring a version that has not yet begun', () => {
    const scheduled = version('rule-version-3', JULY);
    const withScheduled: readonly RuleVersionEffectivePeriodLike[] = [V1, V2, scheduled];

    expect(selectionOf(selectRuleVersionEffectiveOn(withScheduled, JUNE))).toBe(V2);
  });

  /* A later start still wins when the earlier version is the one that is finite. */
  it('over an earlier finite version that is still running', () => {
    const earlier = version('rule-version-1', JANUARY, JULY);
    const later = version('rule-version-2', APRIL);

    expect(selectionOf(selectRuleVersionEffectiveOn([earlier, later], JUNE))).toBe(later);
  });
});

describe('selectRuleVersionEffectiveOn is order- and identifier-independent', () => {
  it('selects the same version however the history is arranged', () => {
    const forward: readonly RuleVersionEffectivePeriodLike[] = [V1, V2];
    const reversed: readonly RuleVersionEffectivePeriodLike[] = [V2, V1];

    expect(selectionOf(selectRuleVersionEffectiveOn(reversed, JUNE))?.ruleVersionId).toBe(
      selectionOf(selectRuleVersionEffectiveOn(forward, JUNE))?.ruleVersionId,
    );
  });

  it('selects the same version under every arrangement of three candidates', () => {
    const third = version('rule-version-3', JUNE);
    const arrangements: readonly (readonly RuleVersionEffectivePeriodLike[])[] = [
      [V1, V2, third],
      [V1, third, V2],
      [V2, V1, third],
      [V2, third, V1],
      [third, V1, V2],
      [third, V2, V1],
    ];

    for (const arrangement of arrangements) {
      expect(selectionOf(selectRuleVersionEffectiveOn(arrangement, JULY))).toBe(third);
    }
  });

  /*
   * PFOS-ENG-00 §14 keeps identifiers opaque. Relabelling so that the winner
   * sorts first alphabetically must not change which start wins.
   */
  it('ignores the version identifiers entirely', () => {
    const early = version('zzz-9999', JANUARY);
    const late = version('aaa-0001', APRIL);

    expect(
      selectionOf(selectRuleVersionEffectiveOn([early, late], JUNE))?.period.effectiveFrom,
    ).toEqual(APRIL);
  });

  it('does not mutate the supplied collection', () => {
    const supplied = [V1, V2];
    selectRuleVersionEffectiveOn(supplied, JUNE);

    expect(supplied).toEqual([V1, V2]);
    expect(supplied[0]).toBe(V1);
  });

  it('returns the supplied object rather than a copy of it', () => {
    expect(selectionOf(selectRuleVersionEffectiveOn(PROSPECTIVE_CHANGE, JUNE))).toBe(V2);
  });
});

describe('selectRuleVersionEffectiveOn refuses to guess', () => {
  const TIED_ON_APRIL: readonly RuleVersionEffectivePeriodLike[] = [
    version('rule-version-1', APRIL),
    version('rule-version-2', APRIL),
  ];

  it('when two effective candidates share the greatest start', () => {
    const error = errorOf(selectRuleVersionEffectiveOn(TIED_ON_APRIL, JUNE));

    expect(error.code).toBe(RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM);
    expect(error.category).toBe(ERROR_CATEGORIES.VALIDATION);
  });

  it('when the tie sits above an earlier effective version', () => {
    const withEarlier: readonly RuleVersionEffectivePeriodLike[] = [V1, ...TIED_ON_APRIL];

    expect(errorOf(selectRuleVersionEffectiveOn(withEarlier, JUNE)).code).toBe(
      RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM,
    );
  });

  /*
   * The text is fixed and interpolates nothing — no date, no identifier, no
   * count. The error is compared whole, so adding a field to any part of it
   * fails here rather than silently establishing a convention.
   */
  it('with fixed text that names no entity', () => {
    const expected: RuleDomainError = {
      code: RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM,
      category: ERROR_CATEGORIES.VALIDATION,
      summary: 'Two versions of this rule apply on the same date.',
      details:
        'More than one version in effect on the evaluation date shares the latest effective ' +
        'start date, so no single version applies.',
      suggestedResolution: 'Give each version its own effective start date.',
    };

    expect(errorOf(selectRuleVersionEffectiveOn(TIED_ON_APRIL, JUNE))).toEqual(expected);
  });

  it('names no affected entity', () => {
    const error = errorOf(selectRuleVersionEffectiveOn(TIED_ON_APRIL, JUNE));

    expect(Object.keys(error)).not.toContain('affectedEntityIds');
  });

  it('reports an identical error however the tied history is arranged', () => {
    const reversed = [...TIED_ON_APRIL].reverse();

    expect(selectRuleVersionEffectiveOn(reversed, JUNE)).toEqual(
      selectRuleVersionEffectiveOn(TIED_ON_APRIL, JUNE),
    );
  });
});

describe('selectRuleVersionEffectiveOn is not the history validator', () => {
  /*
   * Decision 079 keeps the two concerns apart. Selection assumes valid input
   * and compares only what it must, so a duplicate it never had to compare
   * cannot fail it. A returned version answers for one date and is never a
   * finding that the history is valid;
   * validateDistinctRuleVersionEffectiveStarts remains authoritative for that.
   */
  it('succeeds when the duplicate start is not in effect on this date', () => {
    const history: readonly RuleVersionEffectivePeriodLike[] = [
      version('rule-version-1', JANUARY, FEBRUARY),
      version('rule-version-2', JANUARY, FEBRUARY),
      version('rule-version-3', APRIL),
    ];

    expect(selectionOf(selectRuleVersionEffectiveOn(history, JUNE))?.ruleVersionId).toBe(
      'rule-version-3',
    );
  });

  /*
   * Decision 079 fails selection only where the tie sits at the greatest
   * effective start. A duplicate at a lesser start leaves one unique answer for
   * this date, so selection returns it.
   */
  it('succeeds when a duplicate sits below a unique later start', () => {
    const history: readonly RuleVersionEffectivePeriodLike[] = [
      version('rule-version-1', JANUARY),
      version('rule-version-2', JANUARY),
      version('rule-version-3', APRIL),
    ];

    expect(selectionOf(selectRuleVersionEffectiveOn(history, JUNE))?.ruleVersionId).toBe(
      'rule-version-3',
    );
  });

  it('succeeds identically whichever way that history is arranged', () => {
    const history: readonly RuleVersionEffectivePeriodLike[] = [
      version('rule-version-1', JANUARY),
      version('rule-version-2', JANUARY),
      version('rule-version-3', APRIL),
    ];
    const reversed = [...history].reverse();

    expect(selectionOf(selectRuleVersionEffectiveOn(reversed, JUNE))?.ruleVersionId).toBe(
      selectionOf(selectRuleVersionEffectiveOn(history, JUNE))?.ruleVersionId,
    );
  });
});

/**
 * A caller's own version type. The authored RuleVersion payload remains open
 * (Decision 079), so this stands in for whatever a caller eventually supplies.
 */
interface LabelledVersion extends RuleVersionEffectivePeriodLike {
  readonly label: string;
  readonly rateBasisPoints: number;
}

describe('selectRuleVersionEffectiveOn preserves the caller type', () => {
  const TEN_PERCENT: LabelledVersion = {
    ruleVersionId: asEntityId('rule-version-1'),
    period: { effectiveFrom: JANUARY },
    label: 'tithing v1',
    rateBasisPoints: 1000,
  };

  const TWELVE_PERCENT: LabelledVersion = {
    ruleVersionId: asEntityId('rule-version-2'),
    period: { effectiveFrom: APRIL },
    label: 'tithing v2',
    rateBasisPoints: 1200,
  };

  it('returns the subtype with its extra fields intact', () => {
    const selected = selectionOf(selectRuleVersionEffectiveOn([TEN_PERCENT, TWELVE_PERCENT], JUNE));

    expect(selected).toBe(TWELVE_PERCENT);
    expect(selected?.label).toBe('tithing v2');
    expect(selected?.rateBasisPoints).toBe(1200);
  });

  it('carries the payload of the earlier version before the change', () => {
    const selected = selectionOf(
      selectRuleVersionEffectiveOn([TEN_PERCENT, TWELVE_PERCENT], FEBRUARY),
    );

    expect(selected?.rateBasisPoints).toBe(1000);
  });
});
