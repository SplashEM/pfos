import {
  domainError,
  type DomainError,
  type DomainErrorInput,
} from '@domain/shared/errors/domain-error';

import type { AllocationErrorCode } from './allocation-error-codes';

/**
 * A domain failure raised by the Allocation Engine (Decision 073).
 *
 * This mirrors the Rule Engine's `RuleDomainError` exactly. The shared envelope
 * carries the code as a type parameter, so the Allocation Engine keeps a closed
 * union of its own codes without the shared layer importing anything from here.
 * The dependency runs one way only: allocation may read shared, shared may
 * never read allocation (PFOS-ENG-00 §44).
 */
export type AllocationDomainError = DomainError<AllocationErrorCode>;

/**
 * Builds an Allocation Engine error.
 *
 * The input is narrowed to `AllocationErrorCode`, so a code from another
 * registry — including a valid shared MONEY_* code or a Rule Engine RULE_* code
 * — is a compile-time error here. That is what stops the engine widening its
 * own failures to arbitrary strings.
 *
 * The category stays shared and closed. Allocation failures map onto the
 * existing ERROR_CATEGORIES values; Decision 073 does not authorise a new
 * category.
 */
export function allocationError(
  input: DomainErrorInput<AllocationErrorCode>,
): AllocationDomainError {
  return domainError(input);
}
