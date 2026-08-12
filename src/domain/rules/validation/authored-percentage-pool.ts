import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { ok, err, type Result } from '@domain/shared/errors/result';
import { BASIS_POINTS_SCALE, type BasisPoints } from '@domain/shared/percentages/basis-points';

import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { ruleError, type RuleDomainError } from '../errors/rule-error';

/**
 * Validates that an authored percentage pool totals exactly 100%
 * (Decision 071 "Validation ownership"; PFOS-ENG-01 §13.3, §14.3, §16.4).
 *
 * This is the cross-entry invariant, and it is the only rule checked here. A
 * single share cannot express it: the requirement is a property of the
 * collection, which is why Decision 071 assigns it to the Rule Engine rather
 * than to the shared percentage primitive.
 *
 * The per-entry range is already enforced by `basisPoints`, which admits no
 * value outside 0 to 10,000 through any supported construction path. This
 * function therefore does not re-check it, and does not produce
 * `RULE_POOL_ENTRY_OUT_OF_RANGE`: that code reports authored input before it
 * becomes a `BasisPoints`, and the boundary at which such raw input enters the
 * Rule Engine is not yet fixed by an accepted decision. Decision 073 registers
 * a code ahead of the behavior that reports it, so the code remains without a
 * producer until that behavior is specified.
 *
 * The requirement applies to the authored pool only. Weights derived during
 * allocation legitimately total less once a destination is removed by capacity
 * (Decision 071; Decision 072), and are never checked against 10,000.
 *
 * An empty pool totals zero and so fails the same comparison. Decision 075
 * fixes that outcome as a hard validation error reporting this code, and it
 * needs no separate branch.
 */
export function validateAuthoredPoolTotal(
  shares: readonly BasisPoints[],
): Result<void, RuleDomainError> {
  const total = shares.reduce<number>((running, share) => running + share, 0);

  if (total !== BASIS_POINTS_SCALE) {
    return err(
      ruleError({
        code: RULE_ERROR_CODES.RULE_POOL_NOT_EXACTLY_100_PERCENT,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'The percentages in this group must add up to exactly 100%.',
        details: `Received ${String(shares.length)} entries totalling ${String(total)} basis points, where ${String(BASIS_POINTS_SCALE)} is required.`,
        suggestedResolution: 'Adjust the percentages so they total exactly 100%.',
      }),
    );
  }

  return ok(undefined);
}
