import { compareFinancialDates, type FinancialDate } from '@domain/shared/dates/financial-date';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { ok, err, type Result } from '@domain/shared/errors/result';

import type { RuleEffectivePeriod } from '../contracts/rule-effective-period';
import type { RuleVersionId } from '../contracts/rule-identifiers';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { ruleError, type RuleDomainError } from '../errors/rule-error';

/**
 * One version of a rule, reduced to the two fields Decision 079 names.
 *
 * This is deliberately not a `RuleVersion`, and deliberately not a member of
 * ../contracts. The authored `RuleVersion` payload — `configuration`,
 * `versionNumber`, `supersedesVersionId`, `changeReason` — remains open, and
 * introducing a public contract here would pre-empt it. Decision 079 records
 * that the work it unblocks operates over `{ ruleVersionId, period }`, so this
 * names exactly that and nothing more. A future `RuleVersion` will satisfy it
 * structurally without either type changing.
 *
 * `ruleVersionId` is not read by the validator below. It is carried so the
 * argument is a collection of versions rather than of bare periods, and so the
 * signature already fits should the reported error later name the colliding
 * versions; see the note on `affectedEntityIds` below.
 */
export interface RuleVersionEffectivePeriodLike {
  readonly ruleVersionId: RuleVersionId;
  readonly period: RuleEffectivePeriod;
}

/**
 * Validates that no two versions of one rule start on the same date
 * (Decision 079; PFOS-ENG-01 §7, §21.1).
 *
 * This is a question about a version history, not about a date. Decision 079
 * makes a collection holding a duplicate `effectiveFrom` invalid regardless of
 * the evaluation date — including a date on which the duplicate has no effect,
 * and including every date before either version begins — so this function
 * accepts no evaluation date and could not consult one.
 *
 * A shared start is exactly the wrong shape and the only wrong shape. Both
 * periods include their own start (Decision 078), and the range validator
 * beside this one already guarantees that a present end never precedes its
 * start, so two versions sharing a start are in effect together on at least
 * that day. Decision 079 permits nothing to break that tie: an identifier, a
 * version number, a creation time and storage order are all excluded from
 * selection. Conversely, distinct starts leave the latest-start rule a unique
 * answer on every date, which is why nothing narrower would do and nothing
 * wider is needed.
 *
 * What this does not reject, all of it permitted by Decision 079:
 *
 *   - overlapping periods, which §19.2's prospective change requires, since an
 *     open-ended earlier version cannot be closed after creation
 *   - several open-ended versions, provided their starts differ
 *   - a mix of finite and open-ended periods
 *   - gaps between periods; contiguity is not required
 *
 * An inverted period is not this function's concern either. Period validity
 * belongs to validateRuleEffectivePeriod in ./rule-effective-period, and
 * Decision 076's independent-validator pattern keeps each rule in its own
 * bounded function so that no decision is forced about how simultaneous
 * failures are ordered or aggregated.
 *
 * This validator is independent of version selection. It does not call
 * `isEffectiveOn`, does not select anything, and returning `ok` says only that
 * the history is well formed. Decision 079 keeps the converse separate too: a
 * selection that returns a version answers for one date and is never a finding
 * that the history is valid.
 *
 * Grouping is the caller's responsibility. The argument is one rule's versions;
 * this function reads no `ruleId` and cannot tell whether two versions belong
 * to the same rule.
 *
 * Detection sorts the starts and compares neighbours. Sorting normalises the
 * input, so the outcome is permutation-invariant by construction rather than by
 * accident, and a duplicate is found wherever it sits — the first and last
 * entries of a long history collide just as reliably as adjacent ones. What is
 * sorted is dates, using the primitive that owns date order; no identifier is
 * sorted, compared or read, which PFOS-ENG-00 §14 requires.
 *
 * The error names no entity. Both versions carrying a repeated start are
 * equally part of the collision, and every existing domain error in this
 * codebase omits `affectedEntityIds` — validateTopPriorityRanks faces the
 * identical question and records that no accepted source says which party of a
 * collision is at fault. Populating the field here would establish the first
 * ordering convention for the error channel, which no accepted decision
 * supplies, so the text is fixed and interpolates nothing: every rejected
 * history yields byte-identical output, whatever arrangement produced it.
 */
export function validateDistinctRuleVersionEffectiveStarts(
  versions: readonly RuleVersionEffectivePeriodLike[],
): Result<void, RuleDomainError> {
  const starts = versions
    .map((version) => version.period.effectiveFrom)
    .sort(compareFinancialDates);

  let previous: FinancialDate | undefined;

  for (const start of starts) {
    if (previous !== undefined && compareFinancialDates(previous, start) === 0) {
      return err(
        ruleError({
          code: RULE_ERROR_CODES.RULE_VERSION_DUPLICATE_EFFECTIVE_FROM,
          category: ERROR_CATEGORIES.VALIDATION,
          summary: 'Each version of a rule must start on a different date.',
          details: 'Two or more versions of this rule share the same effective start date.',
          suggestedResolution: 'Give each version its own effective start date.',
        }),
      );
    }

    previous = start;
  }

  return ok(undefined);
}
