import { compareFinancialDates, type FinancialDate } from '@domain/shared/dates/financial-date';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { ok, err, type Result } from '@domain/shared/errors/result';

import { isEffectiveOn } from '../contracts/rule-effective-period';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { ruleError, type RuleDomainError } from '../errors/rule-error';
import type { RuleVersionEffectivePeriodLike } from '../validation/rule-version-effective-starts';

/**
 * Selects the version of one rule that applies on an evaluation date
 * (Decision 079; PFOS-ENG-01 §18, §19.2, §19.3).
 *
 * Among the versions in effect on that date, the one with the greatest
 * `effectiveFrom` applies. That is the representation of Decision 022's
 * prospectivity: §19.2 changes tithing on April 1, and §19.3 reports the change
 * to the user as taking effect on that date, so from April 1 onward the April
 * version is the one in force.
 *
 * Overlap is expected here rather than exceptional. Decision 078 fixes a
 * version's period at creation and §28 offers no gesture that closes a previous
 * version, so §19.2's open-ended January version is still in effect when the
 * April version begins. Both satisfy `isEffectiveOn`; the later start decides.
 *
 * The greatest `effectiveFrom` is the only thing compared. `ruleVersionId`,
 * `versionNumber`, `supersedesVersionId`, `currentVersionId`, a creation
 * timestamp, array position and repository order are all excluded from
 * selection by Decision 079 — PFOS-ENG-00 §14 keeps an identifier opaque, §32
 * Invariant 11 forbids repository order from changing a result, and authoring
 * sequence is not effective date, since a version authored later may take
 * effect earlier.
 *
 * Zero effective versions is a success carrying `undefined`, not a failure. It
 * says one thing only: this rule contributes no version on this date
 * (Decision 078; Decision 079). What, if anything, then supplies the value — a
 * lower-precedence rule, a group default or the §8.1 product default — is
 * precedence and fallback behavior, which remains Blocker C. Nothing here
 * falls back, chooses a default, resolves precedence, emits a SkippedRule or
 * emits an explanation.
 *
 * This is not the version-history validator. Selection assumes valid input and
 * never scans for duplicates it has no need to compare, so it can succeed for
 * one date while the history holds a duplicate start elsewhere — at a lesser
 * start among the effective candidates, or among versions not in effect at all.
 * A returned version answers for that date and is never a finding that the
 * history is valid. validateDistinctRuleVersionEffectiveStarts remains
 * authoritative for whole-history validity and is deliberately not called from
 * here, keeping the two concerns independent as Decision 079 requires.
 *
 * What it will not do is guess. If more than one currently effective candidate
 * shares the greatest `effectiveFrom`, there is no permitted tie-breaker and
 * the competing versions carry different financial answers, so it fails with
 * RULE_VERSION_DUPLICATE_EFFECTIVE_FROM rather than choosing one. Constitution
 * Principle 4 forbids silently making that decision, including by silently
 * making it zero.
 *
 * Ordering cannot affect the outcome. A candidate replaces the selection only
 * on a strictly greater start, and a tie is recorded only against the selection
 * standing at the time; because the greatest start is never displaced once
 * reached, every candidate sharing it is compared against it whatever order
 * they arrive in. The input is read, never sorted or mutated, so no copy is
 * made and no caller's array is disturbed.
 *
 * The type parameter preserves the caller's own version type. Decision 079
 * needs only `{ ruleVersionId, period }`, and returning the supplied object
 * rather than a projection of it means the caller keeps whatever payload it
 * had — including the `configuration` a future authored `RuleVersion` will
 * carry, which this function neither defines nor reads.
 */
export function selectRuleVersionEffectiveOn<T extends RuleVersionEffectivePeriodLike>(
  versions: readonly T[],
  evaluationDate: FinancialDate,
): Result<T | undefined, RuleDomainError> {
  let selected: T | undefined;
  let ambiguous = false;

  for (const candidate of versions) {
    if (!isEffectiveOn(candidate.period, evaluationDate)) {
      continue;
    }

    if (selected === undefined) {
      selected = candidate;
      continue;
    }

    const comparison = compareStarts(candidate, selected);

    if (comparison > 0) {
      selected = candidate;
      ambiguous = false;
    } else if (comparison === 0) {
      ambiguous = true;
    }
  }

  if (ambiguous) {
    return err(
      ruleError({
        code: RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'Two versions of this rule apply on the same date.',
        details:
          'More than one version in effect on the evaluation date shares the latest effective ' +
          'start date, so no single version applies.',
        suggestedResolution: 'Give each version its own effective start date.',
      }),
    );
  }

  return ok(selected);
}

/** Chronological order of two candidates' starts, using the primitive that owns it. */
function compareStarts(
  candidate: RuleVersionEffectivePeriodLike,
  selected: RuleVersionEffectivePeriodLike,
): -1 | 0 | 1 {
  return compareFinancialDates(candidate.period.effectiveFrom, selected.period.effectiveFrom);
}
