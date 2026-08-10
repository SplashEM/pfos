import { domainError, type DomainError } from '../errors/domain-error';
import { ERROR_CATEGORIES } from '../errors/error-category';
import { ERROR_CODES } from '../errors/error-codes';
import { err, ok, type Result } from '../errors/result';

/**
 * One hundred percent, expressed in basis points (PFOS-ENG-00 §11).
 *
 * This is the scale of a rate, not a requirement placed on monetary weights.
 * An authored percentage pool must total this value, and the Rule Engine
 * enforces that. Weights passed to monetary division carry no such
 * requirement (Decision 071).
 */
export const BASIS_POINTS_SCALE = 10_000;

/**
 * An exact percentage rate (PFOS-ENG-00 §11).
 *
 * 10% is 1,000 basis points; 100% is 10,000. Integer basis points keep rates
 * exact, which is why no rate is ever stored as a decimal fraction.
 */
export type BasisPoints = number & { readonly __brand: 'BasisPoints' };

/** Constructs a rate from integer basis points, bounded to 0 through 10,000. */
export function basisPoints(value: number): Result<BasisPoints, DomainError> {
  if (!Number.isInteger(value)) {
    return err(
      domainError({
        code: ERROR_CODES.BASIS_POINTS_NOT_INTEGER,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'A rate must be a whole number of basis points.',
        details: `Received ${String(value)}.`,
        suggestedResolution: 'Express the rate in basis points, where 10% is 1,000.',
      }),
    );
  }

  if (value < 0 || value > BASIS_POINTS_SCALE) {
    return err(
      domainError({
        code: ERROR_CODES.BASIS_POINTS_OUT_OF_RANGE,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'A rate must be between 0% and 100%.',
        details: `Received ${String(value)} basis points.`,
      }),
    );
  }

  return ok(value as BasisPoints);
}

/**
 * Converts a percentage to basis points.
 *
 * The multiplication below is the one place a percentage touches binary
 * floating point, and it is guarded: anything that does not land cleanly on a
 * whole basis point is rejected rather than silently rounded. The result is an
 * exact integer, so no imprecision reaches a monetary calculation.
 */
export function fromPercent(percent: number): Result<BasisPoints, DomainError> {
  if (!Number.isFinite(percent)) {
    return err(
      domainError({
        code: ERROR_CODES.BASIS_POINTS_NOT_REPRESENTABLE,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'That percentage cannot be represented exactly.',
        details: `Received ${String(percent)}.`,
      }),
    );
  }

  const scaled = percent * 100;
  const rounded = Math.round(scaled);

  if (Math.abs(scaled - rounded) > 1e-9) {
    return err(
      domainError({
        code: ERROR_CODES.BASIS_POINTS_NOT_REPRESENTABLE,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'A percentage may use at most two decimal places.',
        details: `Received ${String(percent)}, which is finer than one basis point.`,
        suggestedResolution: 'Round the percentage to two decimal places.',
      }),
    );
  }

  return basisPoints(rounded);
}

/**
 * The rate as a decimal fraction, for display and analytics only.
 *
 * This returns binary floating point and is therefore NOT permitted for
 * monetary allocation or Money arithmetic. Money calculations use integer
 * basis points and integer weights through the division primitive described
 * by Decision 071. Nothing in the weighted-division or single-obligation path
 * calls this function.
 */
export function toRatio(value: BasisPoints): number {
  return value / BASIS_POINTS_SCALE;
}
