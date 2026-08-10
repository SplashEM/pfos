import { domainError, type DomainError } from '../errors/domain-error';
import { ERROR_CATEGORIES } from '../errors/error-category';
import { ERROR_CODES } from '../errors/error-codes';
import { err, ok, type Result } from '../errors/result';

/**
 * A timezone-aware instant (PFOS-ENG-00 §13.2).
 *
 * Used for created-at, updated-at, audit events, import time and confirmation
 * time — moments that genuinely happened at a point on the clock, as opposed
 * to the date-only concepts covered by FinancialDate (§13.1).
 *
 * The zone travels with the instant rather than being assumed, because §13.3
 * forbids assuming UTC for month boundaries and effective-date calculations.
 */
export interface Timestamp {
  readonly epochMilliseconds: number;
  readonly timeZone: string;
}

/**
 * Constructs an instant.
 *
 * The zone is checked for presence but not for membership of the IANA
 * database: verifying that requires Intl, which would make the domain layer
 * depend on host locale data and its ICU version. Infrastructure validates
 * the zone when it supplies one (§4.5).
 */
export function timestamp(
  epochMilliseconds: number,
  timeZone: string,
): Result<Timestamp, DomainError> {
  if (!Number.isSafeInteger(epochMilliseconds)) {
    return err(
      domainError({
        code: ERROR_CODES.DATE_INVALID_TIMESTAMP,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'That moment cannot be represented exactly.',
        details: `Received ${String(epochMilliseconds)} milliseconds since the epoch.`,
      }),
    );
  }

  if (timeZone.trim() === '') {
    return err(
      domainError({
        code: ERROR_CODES.DATE_INVALID_TIME_ZONE,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'A timestamp must carry a time zone.',
        details: 'Received an empty time zone identifier.',
        suggestedResolution: 'Supply an IANA identifier such as America/Los_Angeles.',
      }),
    );
  }

  return ok(Object.freeze({ epochMilliseconds, timeZone }));
}
