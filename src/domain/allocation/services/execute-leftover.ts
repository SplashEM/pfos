import type { ResolvedLeftoverPolicy } from '@domain/rules/contracts/resolved-leftover-policy';
import type { DomainError } from '@domain/shared/errors/domain-error';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { err, ok, type Result } from '@domain/shared/errors/result';
import { zero } from '@domain/shared/money/money';
import type { Money } from '@domain/shared/money/money';

import { ALLOCATION_EXPLANATION_CODES } from '../contracts/allocation-explanation';
import type { AllocationLine } from '../contracts/allocation-result';
import { ALLOCATION_ERROR_CODES } from '../errors/allocation-error-codes';
import { allocationError } from '../errors/allocation-error';
import type { StageOutcome } from './execute-global-obligations';

/**
 * Executes the leftover policy stage (PFOS-ENG-02 §31, §33).
 *
 * `SINGLE_DESTINATION` sends everything the earlier stages did not consume to
 * one bucket (§33), so the pool becomes zero and one line carries the whole
 * remainder.
 *
 * §33 adds that the engine allocates "up to the destination's capacity" and
 * that any unacceptable remainder stays unallocated. No capacity is applied
 * here: capacity is a bucket-state behaviour (§19, §7) that this slice does not
 * supply, and every destination is therefore treated as able to accept the
 * remainder. That is the same simplification the top-priority stage makes, and
 * it is why the slice uses an ordinary spending destination rather than a
 * capped one.
 *
 * A zero remainder still produces no line. Emitting a $0.00 allocation would
 * report a movement of money that did not occur, which reads as noise in a
 * preview whose purpose is to explain where money went.
 *
 * `LEAVE_UNALLOCATED` is the product default Decision 093 designated, and §32
 * defines it as leaving the remainder available with no bucket receiving it. It
 * is not implemented here only because the first slice does not exercise it;
 * it is the natural next variant, and it needs no new arithmetic — the
 * remainder simply stays in the pool.
 */
export function executeLeftover(
  policy: ResolvedLeftoverPolicy,
  remainingPool: Money,
): Result<StageOutcome, DomainError> {
  if (policy.policyType !== 'SINGLE_DESTINATION') {
    return err(
      allocationError({
        code: ALLOCATION_ERROR_CODES.ALLOCATION_STRATEGY_NOT_SUPPORTED,
        category: ERROR_CATEGORIES.UNSUPPORTED_STATE,
        summary: 'That leftover policy cannot be allocated yet.',
        details: `Received policy ${policy.policyType}; this executor implements SINGLE_DESTINATION only.`,
      }),
    );
  }

  if (remainingPool.cents === 0) {
    return ok({ lines: [], remainingPool });
  }

  const lines: readonly AllocationLine[] = [
    {
      bucketId: policy.destinationBucketId,
      stage: 'LEFTOVER_POLICY',
      amount: remainingPool,
      explanation: {
        code: ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER,
      },
    },
  ];

  return ok({ lines, remainingPool: zero(remainingPool.currency) });
}
