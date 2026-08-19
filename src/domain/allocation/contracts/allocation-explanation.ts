import type { Money } from '@domain/shared/money/money';
import type { BasisPoints } from '@domain/shared/percentages/basis-points';

/**
 * Allocation Engine explanation codes (Decision 073; PFOS-ENG-02 §52).
 *
 * Decision 073 places engine-specific codes inside the engine that introduces
 * them, and the Allocation Engine already owns `ALLOCATION_*` for its errors.
 * This registry takes the `ALLOCATION_EXPLAIN_` prefix, mirroring the Rule
 * Engine's `RULE_EXPLAIN_` split, so an explanation code can never be confused
 * with a failure.
 *
 * Every key is identical to its value, as every other registry requires.
 *
 * A code names something that happened during one execution. None of them
 * grades a plan, recommends a change, or describes a state that outlives the
 * allocation being explained.
 */
export const ALLOCATION_EXPLANATION_CODES = {
  /*
   * A global obligation took its authored share of the paycheck.
   *
   * The rate is the one the resolved obligation carried, so the explanation
   * reports the rule that ran rather than a rate re-derived from the amounts.
   */
  ALLOCATION_EXPLAIN_OBLIGATION_RATE: 'ALLOCATION_EXPLAIN_OBLIGATION_RATE',

  /*
   * A top priority received everything it asked for.
   *
   * This says the requested amount was available when this priority was
   * reached, and nothing about later paychecks or later priorities.
   */
  ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL: 'ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL',

  /*
   * A top priority received less than it asked for, because the pool ran out.
   *
   * PFOS-ENG-01 §13.2 funds priorities in rank order and stops when the money
   * is exhausted, and the executor already computes the allocation as the
   * smaller of the requirement and what remained. This reports that arithmetic
   * as it happened.
   *
   * It is not a shortfall record. Nothing here carries forward, accrues, or
   * marks the requirement as owed: PFOS-ENG-02 §41's shortfall behaviour is not
   * implemented, and this code must never be read as standing in for it.
   */
  ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED: 'ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED',

  /*
   * A leftover policy sent the remainder to its destination.
   *
   * The amount is whatever survived every earlier stage, so the explanation
   * names the policy rather than a figure it would have to re-derive.
   */
  ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER: 'ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER',
} as const;

export type AllocationExplanationCode =
  (typeof ALLOCATION_EXPLANATION_CODES)[keyof typeof ALLOCATION_EXPLANATION_CODES];

/**
 * Why one allocation line received what it did (PFOS-ENG-02 §52).
 *
 * §52 asks explanations to carry "stable structured facts" — a code, the stage,
 * the amounts involved — and records that "the presentation layer may convert
 * these facts into natural-language text". This is that shape, narrowed to the
 * facts the current executors actually know.
 *
 * There is no prose here. A sentence in the domain would be one the
 * presentation layer could not reword, translate or shorten, and Constitution
 * Principle 9 asks that an allocation be explainable rather than that the
 * engine write the explanation. The shared `Explanation` envelope is
 * deliberately not reused for the same reason: it requires a title and a
 * summary in prose, and it is persisted inside a Plan Snapshot, which this is
 * not.
 *
 * There is no `stage` member. `AllocationLine.stage` already carries it, and
 * two fields that can disagree is the hazard this codebase has refused
 * repeatedly.
 *
 * `unmetAmount` is deliberately absent, though §52 lists it. What a requirement
 * did not receive is a shortfall concept, and PFOS-ENG-02 §41's shortfall
 * behaviour is not implemented; the requested and allocated amounts are both
 * present, so nothing is hidden, and a reader is not handed a figure that looks
 * like an obligation carried forward. It arrives with shortfall reporting.
 *
 * Every variant describes one executed allocation. None describes what should
 * happen next, what a person ought to change, or what a future paycheck will
 * do — that is Funding Advisor and Coaching Engine territory, and none of it
 * exists.
 */
export type AllocationExplanation =
  | {
      readonly code: typeof ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_OBLIGATION_RATE;
      /** The authored rate the obligation applied, in basis points. */
      readonly rateBasisPoints: BasisPoints;
    }
  | {
      readonly code: typeof ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL;
      /** The authored rank that decided when this priority was funded. */
      readonly rank: number;
      /** What the bucket's funding rule asked for. */
      readonly requestedAmount: Money;
    }
  | {
      readonly code: typeof ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED;
      readonly rank: number;
      readonly requestedAmount: Money;
    }
  | {
      readonly code: typeof ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER;
    };
