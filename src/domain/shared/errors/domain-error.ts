import type { ErrorCategory } from './error-category';

/**
 * A typed, stable domain failure (PFOS-ENG-00 §22).
 *
 * Expected failures are returned as values through `Result`, not thrown
 * (§23). Raw stack traces must never reach the UI, so a DomainError carries a
 * user-safe summary separately from optional technical detail.
 *
 * The code is a type parameter (Decision 073). Each engine owns the registry
 * of the codes it introduces and keeps its own closed literal union, while
 * this envelope stays free of every engine-specific type. Shared primitives
 * pass `ErrorCode` from ./error-codes; an engine passes its own union. The
 * default of `string` is what lets a caller name this type without an argument
 * and still describe any well-formed domain failure.
 *
 * Categories are deliberately not parameterised. Decision 073 changes code
 * ownership only: ERROR_CATEGORIES stays shared, closed and authoritative, and
 * an engine maps its failures onto the existing categories rather than adding
 * new ones.
 */
export interface DomainError<TCode extends string = string> {
  readonly code: TCode;
  readonly category: ErrorCategory;
  /** Safe to display to the user. Contains no stack trace and no internals. */
  readonly summary: string;
  /** Technical context for logs and tests. May name fields and bounds. */
  readonly details?: string;
  readonly affectedEntityIds?: readonly string[];
  readonly suggestedResolution?: string;
}

export interface DomainErrorInput<TCode extends string = string> {
  readonly code: TCode;
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
 *
 * `TCode` is inferred from the supplied code, so a caller passing a value from
 * a closed registry receives an error narrowed to that registry rather than to
 * bare `string`.
 */
export function domainError<TCode extends string>(
  input: DomainErrorInput<TCode>,
): DomainError<TCode> {
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
