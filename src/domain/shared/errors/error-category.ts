/**
 * Domain error categories (PFOS-ENG-00 §22).
 *
 * The category classifies *why* an operation failed, independently of which
 * primitive or engine raised it. The list is fixed by the specification;
 * milestones add error codes within these categories, not new categories.
 */
export const ERROR_CATEGORIES = {
  VALIDATION: 'VALIDATION',
  MISSING_REFERENCE: 'MISSING_REFERENCE',
  CONFLICT: 'CONFLICT',
  INVARIANT_VIOLATION: 'INVARIANT_VIOLATION',
  PERSISTENCE: 'PERSISTENCE',
  IMPORT: 'IMPORT',
  MIGRATION: 'MIGRATION',
  UNSUPPORTED_STATE: 'UNSUPPORTED_STATE',
  SECURITY: 'SECURITY',
  CONCURRENCY: 'CONCURRENCY',
} as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[keyof typeof ERROR_CATEGORIES];
