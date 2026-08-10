/**
 * Currency codes (PFOS-ENG-00 §9; Decision 058).
 *
 * Version 1 is USD-only. The type is a union rather than a bare string so
 * that adding a currency later is a compile-time change with a visible blast
 * radius, per PFOS-01 §54: the architecture should not unnecessarily prevent
 * future multi-currency support.
 */
export type CurrencyCode = 'USD';
