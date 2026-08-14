import { compareFinancialDates } from '@domain/shared/dates/financial-date';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { ok, err, type Result } from '@domain/shared/errors/result';

import type { RuleEffectivePeriod } from '../contracts/rule-effective-period';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { ruleError, type RuleDomainError } from '../errors/rule-error';

/**
 * Validates that a rule version's effective period does not end before it
 * starts (Decision 078; PFOS-ENG-01 §18, §21.1, §43.3).
 *
 * This is the only period invariant Decision 078 establishes, and it is the only
 * rule checked here. An absent `effectiveTo` describes an open-ended period and
 * passes; endpoints that are equal describe a one-day period and pass; an
 * `effectiveFrom` in the past or in the future passes, because §28 permits a
 * rule to take effect immediately or on a future date.
 *
 * Nothing about how two periods relate is checked. Decision 078 introduces no
 * overlap rule, no contiguity rule and no restriction on the number of
 * open-ended versions, and it defers selection across simultaneously effective
 * versions entirely. A validator that inspected a second period would be
 * settling a question the decision deliberately left open.
 *
 * This is the counterpart to the `isEffectiveOn` predicate that sits beside the
 * contract, which asks a different question and is not a validator. An inverted
 * period satisfies no date there and is rejected here; neither function calls
 * the other, so the two concerns stay independent.
 *
 * The error text is fixed and interpolates nothing. Every inverted period yields
 * byte-identical text, which is the property the existing top-priority
 * validators hold for the same reason. Formatting a date for display is a
 * presentation concern and the domain layer owns no date formatter.
 *
 * The error names no entity. This function receives a period, not a rule or a
 * version, so there is no identifier to report and `affectedEntityIds` is
 * omitted rather than guessed.
 */
export function validateRuleEffectivePeriod(
  period: RuleEffectivePeriod,
): Result<void, RuleDomainError> {
  const { effectiveFrom, effectiveTo } = period;

  if (effectiveTo !== undefined && compareFinancialDates(effectiveTo, effectiveFrom) < 0) {
    return err(
      ruleError({
        code: RULE_ERROR_CODES.RULE_EFFECTIVE_PERIOD_INVALID_RANGE,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'An end date must fall on or after the start date.',
        details: 'The supplied effective period ends before it begins.',
        suggestedResolution: 'Set the end date on or after the start date, or leave it empty.',
      }),
    );
  }

  return ok(undefined);
}
