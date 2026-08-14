import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import type {
  ResolvedTopPriorityEntry,
  ResolvedTopPriorityPlan,
  ResolvedTopPriorityShare,
} from '@domain/rules/contracts/resolved-top-priority-plan';
import { RULE_WARNING_CODES } from '@domain/rules/contracts/rule-warning-codes';
import { RULE_ERROR_CODES } from '@domain/rules/errors/rule-error-codes';
import { validateAuthoredPoolTotal } from '@domain/rules/validation/authored-percentage-pool';
import { validateTopPriorityCount } from '@domain/rules/validation/top-priority-count';
import { validateTopPriorityRanks } from '@domain/rules/validation/top-priority-ranks';
import { produceTopPriorityWarnings } from '@domain/rules/warnings/top-priority-warnings';
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
 * input produce identical output. The four functions exercised below are the
 * only Rule Engine behavior accepted so far (Decisions 071, 075, 076, 077), so
 * they are the only place those requirements can be tested today.
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
