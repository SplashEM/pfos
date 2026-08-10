import {
  domainError,
  type DomainError,
  type DomainErrorInput,
} from '@domain/shared/errors/domain-error';

import type { RuleErrorCode } from './rule-error-codes';

/**
 * A domain failure raised by the Rule Engine (Decision 073).
 *
 * The shared envelope carries the code as a type parameter, so the Rule Engine
 * keeps a closed union of its own codes without the shared layer importing
 * anything from here. The dependency runs one way only: rules may read shared,
 * shared may never read rules (PFOS-ENG-00 §44; Decision 071).
 *
 * The type argument is always supplied explicitly. The `= string` default on
 * the shared envelope exists for callers that name the type without an
 * argument; it never applies here, so no Rule Engine error can widen to an
 * arbitrary string.
 */
export type RuleDomainError = DomainError<RuleErrorCode>;

/**
 * Builds a Rule Engine error.
 *
 * The input is narrowed to RuleErrorCode, so a code from another registry —
 * including a valid shared MONEY_* or DATE_* code — is a compile-time error
 * here. That is the point of the constructor: it stops the engine widening its
 * own failures to arbitrary strings, which is what Decision 073 asks each
 * engine to preserve.
 *
 * The category stays shared and closed. Rule Engine failures map onto the
 * existing ERROR_CATEGORIES values (VALIDATION, MISSING_REFERENCE, CONFLICT,
 * INVARIANT_VIOLATION, UNSUPPORTED_STATE); Decision 073 does not authorise a
 * new category.
 */
export function ruleError(input: DomainErrorInput<RuleErrorCode>): RuleDomainError {
  return domainError(input);
}
