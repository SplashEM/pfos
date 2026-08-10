import type { ErrorCategory } from './error-category';
import type { ErrorCode } from './error-codes';

/**
 * A typed, stable domain failure (PFOS-ENG-00 §22).
 *
 * Expected failures are returned as values through `Result`, not thrown
 * (§23). Raw stack traces must never reach the UI, so a DomainError carries a
 * user-safe summary separately from optional technical detail.
 */
export interface DomainError {
  readonly code: ErrorCode;
  readonly category: ErrorCategory;
  /** Safe to display to the user. Contains no stack trace and no internals. */
  readonly summary: string;
  /** Technical context for logs and tests. May name fields and bounds. */
  readonly details?: string;
  readonly affectedEntityIds?: readonly string[];
  readonly suggestedResolution?: string;
}

export interface DomainErrorInput {
  readonly code: ErrorCode;
  readonly category: ErrorCategory;
  readonly summary: string;
  readonly details?: string;
  readonly affectedEntityIds?: readonly string[];
  readonly suggestedResolution?: string;
}

/**
 * Builds a frozen DomainError.
 *
 * Optional properties are omitted rather than set to `undefined` so the result
 * satisfies `exactOptionalPropertyTypes` and compares cleanly in tests.
 */
export function domainError(input: DomainErrorInput): DomainError {
  return Object.freeze({
    code: input.code,
    category: input.category,
    summary: input.summary,
    ...(input.details === undefined ? {} : { details: input.details }),
    ...(input.affectedEntityIds === undefined
      ? {}
      : { affectedEntityIds: Object.freeze([...input.affectedEntityIds]) }),
    ...(input.suggestedResolution === undefined
      ? {}
      : { suggestedResolution: input.suggestedResolution }),
  });
}
