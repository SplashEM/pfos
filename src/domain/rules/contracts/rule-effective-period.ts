import { compareFinancialDates, type FinancialDate } from '@domain/shared/dates/financial-date';

/**
 * The period during which one authored rule version is in effect
 * (Decision 078; PFOS-ENG-01 §18, §41).
 *
 * Decision 078 places the effective period on the rule version rather than on
 * the stable Rule. A Rule persists across edits, while each edit creates a new
 * version whose historical meaning must remain reconstructable (§19.1).
 *
 * The end is optional. An absent `effectiveTo` means the version is in effect
 * indefinitely from `effectiveFrom` onward, which is the ordinary case rather
 * than an exception. `exactOptionalPropertyTypes` is enabled, so the property is
 * absent rather than explicitly `undefined`.
 *
 * The shared `DateRange` is deliberately not reused: it requires both endpoints
 * and §18 makes the end optional. A sentinel far-future end would invent a magic
 * date and misreport every open-ended rule to the user. The inclusive-both-ends
 * convention is shared with `DateRange` all the same (PFOS-ENG-00 §9).
 */
export interface RuleEffectivePeriod {
  readonly effectiveFrom: FinancialDate;
  readonly effectiveTo?: FinancialDate;
}

/**
 * Whether the period covers the evaluation date, counting both endpoints
 * (Decision 078).
 *
 * Both boundaries are inclusive. §19.2's "effective April 1" means the version
 * applies on April 1, and §19.3 reports that change to the user as happening on
 * that date; a FinancialDate carries no clock time that would make a half-open
 * boundary natural. A period whose endpoints are equal is therefore in effect on
 * exactly one day.
 *
 * This is a predicate, not a validator. It does not reject an inverted period,
 * throw, or return a `Result`. It evaluates the two inequalities and nothing
 * else, so an inverted period simply satisfies no date and yields false for
 * every evaluation date rather than reporting a problem. Rejecting one is the
 * separate concern of period validation, to which Decision 078 assigns its own
 * error code.
 */
export function isEffectiveOn(period: RuleEffectivePeriod, evaluationDate: FinancialDate): boolean {
  const startedOnOrBefore = compareFinancialDates(period.effectiveFrom, evaluationDate) <= 0;

  const endsOnOrAfter =
    period.effectiveTo === undefined ||
    compareFinancialDates(evaluationDate, period.effectiveTo) <= 0;

  return startedOnOrBefore && endsOnOrAfter;
}
