import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import type {
  ResolvedTopPriorityEntry,
  ResolvedTopPriorityPlan,
  ResolvedTopPriorityShare,
} from '@domain/rules/contracts/resolved-top-priority-plan';
import {
  isEffectiveOn,
  type RuleEffectivePeriod,
} from '@domain/rules/contracts/rule-effective-period';
import { RULE_WARNING_CODES } from '@domain/rules/contracts/rule-warning-codes';
import { RULE_ERROR_CODES } from '@domain/rules/errors/rule-error-codes';
import { validateAuthoredPoolTotal } from '@domain/rules/validation/authored-percentage-pool';
import { validateRuleEffectivePeriod } from '@domain/rules/validation/rule-effective-period';
import { validateTopPriorityCount } from '@domain/rules/validation/top-priority-count';
import { validateTopPriorityRanks } from '@domain/rules/validation/top-priority-ranks';
import { produceTopPriorityWarnings } from '@domain/rules/warnings/top-priority-warnings';
import { financialDate, type FinancialDate } from '@domain/shared/dates/financial-date';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { asEntityId } from '@domain/shared/ids/entity-id';
import {
  BASIS_POINTS_SCALE,
  basisPoints,
  type BasisPoints,
} from '@domain/shared/percentages/basis-points';

/**
 * Property-based invariance tests over the completed Milestone 2 behavior
 * surface (PFOS-ENG-00 §48; PFOS-ENG-01 §26, §43.4, §43.6).
 *
 * PFOS-ENG-01 §26 requires that resolution never depend on object iteration
 * order or on random identifiers, and §43.4 asks that repeated and reordered
 * input produce identical output. The six functions exercised below are the
 * only Rule Engine behavior accepted so far (Decisions 071, 075, 076, 077,
 * 078), so they are the only place those requirements can be tested today.
 *
 * Example-based coverage already sits beside each function and is not repeated
 * here. This file adds only what an example cannot state: that the
 * characterising condition holds across arbitrary input, and that permuting
 * entries or changing identifiers changes nothing. The authored pool's
 * accept-only-at-10,000 rule is already proven in
 * src/domain/rules/validation/authored-percentage-pool.test.ts, so only its
 * permutation invariance is added.
 *
 * Nothing here asserts warning ordering, aggregation, deduplication, canonical
 * arrangement or freezing. Those remain unsettled, and a test that assumed one
 * would settle it silently.
 */

type Strategy = ResolvedTopPriorityPlan['strategy'];

/**
 * A generated entry before it becomes a contract value.
 *
 * Ranks are drawn from a narrow band so that duplicates arise often. A wide
 * band would make collisions rare and leave the rejecting branch of the
 * uniqueness property almost never exercised. The unusual rank shapes that a
 * narrow band cannot reach — negative, non-contiguous, not starting at one —
 * are already covered by example beside the validator.
 */
interface EntrySeed {
  readonly rank: number;
  readonly bucket: number;
  readonly ruleVersion: number;
  readonly share: number;
}

const entrySeedArbitrary: fc.Arbitrary<EntrySeed> = fc.record({
  rank: fc.integer({ min: -4, max: 4 }),
  bucket: fc.integer({ min: 0, max: 999 }),
  ruleVersion: fc.integer({ min: 0, max: 999 }),
  share: fc.integer({ min: 0, max: BASIS_POINTS_SCALE }),
});

/**
 * Entry lists reach six, which is above the V1 maximum of three, so the count
 * property exercises both its accepting and its rejecting branch.
 */
const MAX_GENERATED_ENTRIES = 6;

/**
 * The V1 ceiling, restated here on purpose. The production constant is
 * deliberately unexported (Decision 076), so pinning the number independently is
 * what makes the property a check rather than a restatement of the code.
 */
const MAX_TOP_PRIORITIES = 3;

const seedsArbitrary = fc.array(entrySeedArbitrary, { maxLength: MAX_GENERATED_ENTRIES });

const strategyArbitrary: fc.Arbitrary<Strategy> = fc.constantFrom('SEQUENTIAL', 'PERCENTAGE_SPLIT');

/** Builds a rate, failing loudly if the generator produced an invalid one. */
function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

function toEntries(seeds: readonly EntrySeed[]): readonly ResolvedTopPriorityEntry[] {
  return seeds.map((seed) => ({
    bucketId: asEntityId(`bucket-${String(seed.bucket)}`),
    rank: seed.rank,
    ruleVersionIds: [asEntityId(`rule-version-${String(seed.ruleVersion)}`)],
  }));
}

function toShares(seeds: readonly EntrySeed[]): readonly ResolvedTopPriorityShare[] {
  return seeds.map((seed) => ({
    bucketId: asEntityId(`bucket-${String(seed.bucket)}`),
    rank: seed.rank,
    ruleVersionIds: [asEntityId(`rule-version-${String(seed.ruleVersion)}`)],
    shareBasisPoints: rate(seed.share),
  }));
}

/**
 * Shares are generated independently of the 10,000 total. Neither the count
 * validator nor the rank validator reads a share, and requiring a valid pool
 * here would imply a coupling between the rules that Decision 076 keeps apart.
 */
function toPlan(strategy: Strategy, seeds: readonly EntrySeed[]): ResolvedTopPriorityPlan {
  return strategy === 'SEQUENTIAL'
    ? { strategy: 'SEQUENTIAL', entries: toEntries(seeds) }
    : { strategy: 'PERCENTAGE_SPLIT', entries: toShares(seeds) };
}

const planArbitrary: fc.Arbitrary<ResolvedTopPriorityPlan> = fc
  .tuple(strategyArbitrary, seedsArbitrary)
  .map(([strategy, seeds]) => toPlan(strategy, seeds));

/** A plan of an exact length, with every other field left arbitrary. */
const planOfLength = (length: number): fc.Arbitrary<ResolvedTopPriorityPlan> =>
  fc
    .tuple(
      strategyArbitrary,
      fc.array(entrySeedArbitrary, { minLength: length, maxLength: length }),
    )
    .map(([strategy, seeds]) => toPlan(strategy, seeds));

/** Two plans that differ in everything except how many entries they hold. */
const sameLengthPlanPairArbitrary = fc
  .integer({ min: 0, max: MAX_GENERATED_ENTRIES })
  .chain((length) => fc.tuple(planOfLength(length), planOfLength(length)));

/** A plan paired with a full permutation of its own entries. */
const permutedPlanPairArbitrary = fc
  .tuple(strategyArbitrary, seedsArbitrary)
  .chain(([strategy, seeds]) =>
    fc
      .shuffledSubarray(seeds, { minLength: seeds.length, maxLength: seeds.length })
      .map((shuffled): readonly [ResolvedTopPriorityPlan, ResolvedTopPriorityPlan] => [
        toPlan(strategy, seeds),
        toPlan(strategy, shuffled),
      ]),
  );

/** Two plans holding the same ranks in the same order but different identifiers. */
const relabelledPlanPairArbitrary = fc
  .tuple(strategyArbitrary, seedsArbitrary, fc.array(entrySeedArbitrary, { maxLength: 6 }))
  .map(
    ([strategy, seeds, relabels]): readonly [ResolvedTopPriorityPlan, ResolvedTopPriorityPlan] => {
      const relabelled = seeds.map((seed, index) => ({
        ...seed,
        bucket: (relabels[index]?.bucket ?? seed.bucket) + 1000,
        ruleVersion: (relabels[index]?.ruleVersion ?? seed.ruleVersion) + 1000,
      }));

      return [toPlan(strategy, seeds), toPlan(strategy, relabelled)];
    },
  );

describe('validateTopPriorityCount properties', () => {
  /*
   * Decision 076: the count rule is the entry count and nothing else. The
   * generator spans zero to six entries, so both branches are reached.
   */
  it('accepts a plan exactly when it holds no more than the maximum', () => {
    fc.assert(
      fc.property(planArbitrary, (plan) => {
        expect(validateTopPriorityCount(plan).ok).toBe(plan.entries.length <= MAX_TOP_PRIORITIES);
      }),
    );
  });

  /*
   * Two plans of equal length differing in rank, bucket, rule version and
   * strategy must produce the same Result, error text included. This says only
   * that the validator does not inspect those fields; it asserts no meaning for
   * any of them.
   */
  it('reads nothing but the entry count', () => {
    fc.assert(
      fc.property(sameLengthPlanPairArbitrary, ([left, right]) => {
        expect(validateTopPriorityCount(right)).toEqual(validateTopPriorityCount(left));
      }),
    );
  });
});

describe('validateTopPriorityRanks properties', () => {
  /*
   * Decision 076: uniqueness is the only constraint. Nothing below implies
   * positivity, contiguity, a starting value or a relationship to array
   * position.
   */
  it('accepts a plan exactly when its ranks are unique', () => {
    fc.assert(
      fc.property(planArbitrary, (plan) => {
        const ranks = plan.entries.map((entry) => entry.rank);
        const result = validateTopPriorityRanks(plan);

        expect(result.ok).toBe(new Set(ranks).size === ranks.length);

        if (!result.ok) {
          expect(result.error.code).toBe(RULE_ERROR_CODES.RULE_TOP_PRIORITY_DUPLICATE_RANK);
        }
      }),
    );
  });

  /*
   * §26: the outcome must not depend on iteration order. Comparing the whole
   * Result covers the success flag and, on rejection, every field of the error
   * at once — code, category, summary, details and suggestedResolution — so an
   * order-dependent detail added to any of them fails here.
   */
  it('reports an identical result however the entries are arranged', () => {
    fc.assert(
      fc.property(permutedPlanPairArbitrary, ([original, permuted]) => {
        expect(validateTopPriorityRanks(permuted)).toEqual(validateTopPriorityRanks(original));
      }),
    );
  });

  /* §26: the outcome must not depend on identifiers, which are opaque (§14). */
  it('ignores bucket and rule-version identifiers', () => {
    fc.assert(
      fc.property(relabelledPlanPairArbitrary, ([original, relabelled]) => {
        expect(validateTopPriorityRanks(relabelled)).toEqual(validateTopPriorityRanks(original));
      }),
    );
  });
});

describe('produceTopPriorityWarnings properties', () => {
  /*
   * The empty case is generated explicitly as well as arbitrarily. Left to
   * chance the zero-entry SEQUENTIAL plan would be reached too rarely for the
   * producing branch to be meaningfully exercised.
   */
  const warningPlanArbitrary = fc
    .tuple(strategyArbitrary, fc.oneof(fc.constant<readonly EntrySeed[]>([]), seedsArbitrary))
    .map(([strategy, seeds]) => toPlan(strategy, seeds));

  /** The reference result, so the fixed text stays pinned in exactly one place. */
  const referenceWarnings = produceTopPriorityWarnings({ strategy: 'SEQUENTIAL', entries: [] });

  it('warns exactly when a SEQUENTIAL plan holds no entries', () => {
    fc.assert(
      fc.property(warningPlanArbitrary, (plan) => {
        const produces = plan.strategy === 'SEQUENTIAL' && plan.entries.length === 0;

        expect(produceTopPriorityWarnings(plan).length).toBe(produces ? 1 : 0);
      }),
    );
  });

  /*
   * Decision 077 fixes the message and the recommended action as literals
   * carrying no interpolated value, so every producing input yields the same
   * warning. The comparison is against a reference result rather than a
   * restated literal, which keeps the exact wording asserted in exactly one
   * place: the example test beside the producer.
   */
  it('yields the identical warning for every producing input', () => {
    fc.assert(
      fc.property(warningPlanArbitrary, (plan) => {
        const warnings = produceTopPriorityWarnings(plan);

        if (warnings.length > 0) {
          expect(warnings).toEqual(referenceWarnings);
          expect(warnings[0]?.code).toBe(RULE_WARNING_CODES.RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED);
        }
      }),
    );
  });

  it('is unaffected by entry arrangement', () => {
    fc.assert(
      fc.property(permutedPlanPairArbitrary, ([original, permuted]) => {
        expect(produceTopPriorityWarnings(permuted)).toEqual(produceTopPriorityWarnings(original));
      }),
    );
  });

  it('is unaffected by bucket and rule-version identifiers', () => {
    fc.assert(
      fc.property(relabelledPlanPairArbitrary, ([original, relabelled]) => {
        expect(produceTopPriorityWarnings(relabelled)).toEqual(
          produceTopPriorityWarnings(original),
        );
      }),
    );
  });

  /*
   * Decision 075 keeps an empty percentage-split pool a hard validation error
   * reporting RULE_POOL_NOT_EXACTLY_100_PERCENT. This asserts only that the
   * producer does not own that error, not that such a plan is valid overall.
   */
  it('never warns under PERCENTAGE_SPLIT, whatever the entry count', () => {
    fc.assert(
      fc.property(fc.oneof(fc.constant<readonly EntrySeed[]>([]), seedsArbitrary), (seeds) => {
        expect(produceTopPriorityWarnings(toPlan('PERCENTAGE_SPLIT', seeds))).toEqual([]);
      }),
    );
  });
});

/**
 * Pools that total exactly 10,000 by construction, so the permutation property
 * below exercises the accepting branch as well as the rejecting one. Random
 * pools almost never total exactly 10,000 on their own.
 */
const exactPool = fc
  .array(fc.integer({ min: 0, max: BASIS_POINTS_SCALE }), { maxLength: 11 })
  .map((cuts) => {
    const parts: number[] = [];
    let previous = 0;

    for (const bound of [...cuts].sort((left, right) => left - right)) {
      parts.push(bound - previous);
      previous = bound;
    }

    parts.push(BASIS_POINTS_SCALE - previous);
    return parts;
  });

const permutedPoolPairArbitrary = fc
  .oneof(exactPool, fc.array(fc.integer({ min: 0, max: BASIS_POINTS_SCALE }), { maxLength: 12 }))
  .chain((values) =>
    fc
      .shuffledSubarray(values, { minLength: values.length, maxLength: values.length })
      .map((shuffled): readonly [readonly number[], readonly number[]] => [values, shuffled]),
  );

describe('validateAuthoredPoolTotal properties', () => {
  /*
   * Addition is commutative, but the reported error carries the entry count and
   * the running total, so a future change that named a position or an offending
   * entry would become order-dependent. Comparing the whole Result catches that.
   *
   * The accept-only-at-10,000 rule itself is proven beside the validator and is
   * not repeated here.
   */
  it('reports an identical result however the shares are ordered', () => {
    fc.assert(
      fc.property(permutedPoolPairArbitrary, ([original, permuted]) => {
        expect(validateAuthoredPoolTotal(permuted.map(rate))).toEqual(
          validateAuthoredPoolTotal(original.map(rate)),
        );
      }),
    );
  });
});

/** Builds a date, failing loudly if the test supplied an invalid one. */
function date(year: number, month: number, day: number): FinancialDate {
  const result = financialDate(year, month, day);
  if (!result.ok) {
    throw new Error(`Invalid date in test setup: ${result.error.code}`);
  }
  return result.value;
}

/**
 * A date reduced to one comparable integer.
 *
 * This is an independent oracle. Restating `compareFinancialDates` to check code
 * that already calls it would prove nothing, so chronological order is
 * recomputed arithmetically here instead. Every component is bounded — year at
 * most 9999, month at most 12, day at most 31 — so the packing preserves order
 * exactly.
 */
const ordinal = (value: FinancialDate): number =>
  value.year * 10000 + value.month * 100 + value.day;

/**
 * The date pool is deliberately small so that boundary cases arise often. Equal
 * dates are what produce one-day periods and exact-endpoint evaluations, and an
 * inverted period needs two pool dates drawn in the wrong order; a wide random
 * range would make all three vanishingly rare. The pool spans a leap day, month
 * ends and year ends, and a wider generator is mixed in for breadth.
 */
const DATE_POOL: readonly FinancialDate[] = [
  date(2024, 2, 29),
  date(2025, 12, 31),
  date(2026, 1, 1),
  date(2026, 2, 28),
  date(2026, 6, 15),
  date(2026, 12, 31),
  date(2027, 1, 1),
];

const pooledDateArbitrary: fc.Arbitrary<FinancialDate> = fc.constantFrom(...DATE_POOL);

const wideDateArbitrary: fc.Arbitrary<FinancialDate> = fc
  .tuple(
    fc.integer({ min: 2020, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
  )
  .map(([year, month, day]) => date(year, month, day));

const dateArbitrary: fc.Arbitrary<FinancialDate> = fc.oneof(
  { weight: 4, arbitrary: pooledDateArbitrary },
  { weight: 1, arbitrary: wideDateArbitrary },
);

/**
 * A finite period draws its endpoints independently, so inverted periods arise
 * naturally and are never filtered away. Decision 078 makes an inverted period
 * both a validation failure and a predicate that matches nothing; excluding
 * them would delete the rejecting branch from every property below.
 */
const finitePeriodArbitrary: fc.Arbitrary<RuleEffectivePeriod> = fc
  .tuple(dateArbitrary, dateArbitrary)
  .map(([effectiveFrom, effectiveTo]) => ({ effectiveFrom, effectiveTo }));

const openEndedPeriodArbitrary: fc.Arbitrary<RuleEffectivePeriod> = dateArbitrary.map(
  (effectiveFrom) => ({ effectiveFrom }),
);

const periodArbitrary: fc.Arbitrary<RuleEffectivePeriod> = fc.oneof(
  openEndedPeriodArbitrary,
  finitePeriodArbitrary,
);

/** Rebuilds a period from fresh objects, preserving an absent end as absent. */
function copyPeriod(period: RuleEffectivePeriod): RuleEffectivePeriod {
  const effectiveFrom = { ...period.effectiveFrom };

  return period.effectiveTo === undefined
    ? { effectiveFrom }
    : { effectiveFrom, effectiveTo: { ...period.effectiveTo } };
}

/** The accepted interval, expressed independently of the implementation. */
const expectedEffective = (period: RuleEffectivePeriod, evaluationDate: FinancialDate): boolean =>
  ordinal(period.effectiveFrom) <= ordinal(evaluationDate) &&
  (period.effectiveTo === undefined || ordinal(evaluationDate) <= ordinal(period.effectiveTo));

const isInverted = (period: RuleEffectivePeriod): boolean =>
  period.effectiveTo !== undefined && ordinal(period.effectiveTo) < ordinal(period.effectiveFrom);

describe('isEffectiveOn properties', () => {
  it('matches the accepted inclusive interval for any period and date', () => {
    fc.assert(
      fc.property(periodArbitrary, dateArbitrary, (period, evaluationDate) => {
        expect(isEffectiveOn(period, evaluationDate)).toBe(
          expectedEffective(period, evaluationDate),
        );
      }),
    );
  });

  /* Decision 078: an absent end runs indefinitely, so the start is the only boundary. */
  it('is false before the start and true from the start onward when open-ended', () => {
    fc.assert(
      fc.property(dateArbitrary, dateArbitrary, (effectiveFrom, evaluationDate) => {
        expect(isEffectiveOn({ effectiveFrom }, evaluationDate)).toBe(
          ordinal(evaluationDate) >= ordinal(effectiveFrom),
        );
      }),
    );
  });

  /* Decision 078: equal endpoints are in effect on exactly one day. */
  it('matches only its own day when the endpoints are equal', () => {
    fc.assert(
      fc.property(dateArbitrary, dateArbitrary, (day, evaluationDate) => {
        expect(isEffectiveOn({ effectiveFrom: day, effectiveTo: day }, evaluationDate)).toBe(
          ordinal(evaluationDate) === ordinal(day),
        );
      }),
    );
  });

  /*
   * Decision 078 keeps the predicate free of validation. An inverted period is
   * not special-cased and not rejected here; it simply satisfies no date.
   */
  it('matches no date at all when the period is inverted', () => {
    fc.assert(
      fc.property(finitePeriodArbitrary, dateArbitrary, (period, evaluationDate) => {
        fc.pre(isInverted(period));

        expect(isEffectiveOn(period, evaluationDate)).toBe(false);
      }),
    );
  });

  it('agrees for structurally equal periods and dates', () => {
    fc.assert(
      fc.property(periodArbitrary, dateArbitrary, (period, evaluationDate) => {
        expect(isEffectiveOn(copyPeriod(period), { ...evaluationDate })).toBe(
          isEffectiveOn(period, evaluationDate),
        );
      }),
    );
  });
});

describe('validateRuleEffectivePeriod properties', () => {
  /*
   * Decision 078 establishes exactly one period invariant, so acceptance is
   * determined solely by whether the end precedes the start. An absent end and
   * equal endpoints both pass.
   */
  it('accepts a period exactly when its end does not precede its start', () => {
    fc.assert(
      fc.property(periodArbitrary, (period) => {
        const result = validateRuleEffectivePeriod(period);

        expect(result.ok).toBe(!isInverted(period));

        if (!result.ok) {
          expect(result.error.code).toBe(RULE_ERROR_CODES.RULE_EFFECTIVE_PERIOD_INVALID_RANGE);
          expect(result.error.category).toBe(ERROR_CATEGORIES.VALIDATION);
        }
      }),
    );
  });

  it('returns an equal Result for structurally equal periods', () => {
    fc.assert(
      fc.property(periodArbitrary, (period) => {
        expect(validateRuleEffectivePeriod(copyPeriod(period))).toEqual(
          validateRuleEffectivePeriod(period),
        );
      }),
    );
  });
});
