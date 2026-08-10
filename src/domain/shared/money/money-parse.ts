import { domainError, type DomainError } from '../errors/domain-error';
import { ERROR_CATEGORIES } from '../errors/error-category';
import { ERROR_CODES } from '../errors/error-codes';
import { err, type Result } from '../errors/result';
import { fromCents, type Money } from './money';

/**
 * Accepted shapes: an optional minus sign, an optional dollar sign, digits
 * either ungrouped or grouped in threes, and at most two decimal places.
 *
 * Digits are matched with an explicit ASCII range, so non-Latin digit forms
 * are rejected rather than silently reinterpreted. Scientific notation,
 * whitespace inside the number and more than two decimal places all fail to
 * match.
 */
const MONEY_PATTERN = /^(-)?[$]?([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:[.]([0-9]{1,2}))?$/;

/**
 * Parses untrusted user input into Money (PFOS-ENG-00 §10.3, §29.1).
 *
 * Conversion runs entirely on integers. `parseFloat` is never used, and the
 * decimal portion is padded rather than multiplied, so no binary
 * floating-point rounding can enter a monetary value (§10.4).
 */
export function parseUsd(input: string): Result<Money, DomainError> {
  const match = MONEY_PATTERN.exec(input.trim());

  if (match === null) {
    return err(
      domainError({
        code: ERROR_CODES.MONEY_PARSE_INVALID_FORMAT,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'That is not a valid dollar amount.',
        details: `Received ${JSON.stringify(input)}.`,
        suggestedResolution: 'Enter an amount such as 1,234.56 with at most two decimal places.',
      }),
    );
  }

  const wholeDigits = (match[2] ?? '').replace(/,/g, '');
  const fractionDigits = (match[3] ?? '').padEnd(2, '0');
  const whole = Number(wholeDigits);
  const fraction = Number(fractionDigits);

  if (!Number.isSafeInteger(whole)) {
    return err(
      domainError({
        code: ERROR_CODES.MONEY_PARSE_UNSAFE_AMOUNT,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'That amount is too large to represent exactly.',
        details: `Received ${JSON.stringify(input)}.`,
      }),
    );
  }

  const magnitude = whole * 100 + fraction;

  if (!Number.isSafeInteger(magnitude)) {
    return err(
      domainError({
        code: ERROR_CODES.MONEY_PARSE_UNSAFE_AMOUNT,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'That amount is too large to represent exactly.',
        details: `Received ${JSON.stringify(input)}.`,
      }),
    );
  }

  /* Normalising zero keeps "-0.00" from producing a negative zero. */
  const cents = magnitude === 0 || match[1] !== '-' ? magnitude : -magnitude;

  return fromCents(cents, 'USD');
}
