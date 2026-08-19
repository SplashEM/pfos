import type { AllocationExplanation } from '@domain/allocation/contracts/allocation-explanation';
import { ALLOCATION_EXPLANATION_CODES } from '@domain/allocation/contracts/allocation-explanation';
import type { PersistedAllocationExplanation } from '@application/persistence/confirmed-paycheck-records';
import { formatUsd } from '@domain/shared/money/money-format';
import { fromCents } from '@domain/shared/money/money';

/**
 * Turning explanation facts into a sentence, in one place.
 *
 * PFOS-ENG-02 §52 keeps explanations as structured facts and records that "the
 * presentation layer may convert these facts into natural-language text". This
 * is that conversion, and it is the only copy: a previewed line and a confirmed
 * line describe the same event, so they must not be able to describe it in two
 * different ways.
 *
 * The facts arrive in the persisted spelling because that is the shape both
 * callers can produce — a preview converts its domain explanation on the way in,
 * and a stored record already is one. Nothing is recomputed: every figure comes
 * from the facts or from the amount already on the line.
 *
 * Nothing is promised. No sentence says what a later paycheck will do, what is
 * still owed, or what a person should change.
 */

/** The persisted facts behind one allocated line, from the engine's own. */
export function toPersistedExplanation(
  explanation: AllocationExplanation,
): PersistedAllocationExplanation {
  switch (explanation.code) {
    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_OBLIGATION_RATE:
      return { code: explanation.code, rateBasisPoints: explanation.rateBasisPoints };

    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL:
    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED:
      return {
        code: explanation.code,
        rank: explanation.rank,
        requestedAmountCents: explanation.requestedAmount.cents,
      };

    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER:
      return { code: explanation.code };
  }
}

/**
 * Why this line received this amount, in words a screen can show as-is.
 *
 * `allocatedCents` is the amount on the line being explained, used only by the
 * partial-funding sentence, which reports what remained when the priority was
 * reached.
 */
export function explanationText(
  explanation: PersistedAllocationExplanation,
  allocatedCents: number,
): string {
  switch (explanation.code) {
    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_OBLIGATION_RATE:
      return `${formatPercent(explanation.rateBasisPoints)} of this paycheck.`;

    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL:
      return (
        `Priority ${String(explanation.rank)} · ` +
        `Requested ${usd(explanation.requestedAmountCents)} · Funded in full.`
      );

    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED:
      return (
        `Priority ${String(explanation.rank)} · ` +
        `Requested ${usd(explanation.requestedAmountCents)} · ` +
        `Only ${usd(allocatedCents)} remained when this priority was reached.`
      );

    case ALLOCATION_EXPLANATION_CODES.ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER:
      return 'Receives whatever remains after everything above.';
  }
}

/**
 * An amount of cents, for reading.
 *
 * The cents come from a record that was already validated as exact integers, so
 * a value the Money constructor refuses can only mean a caller passed something
 * that never came from one. That is a programming fault rather than a financial
 * one, and it shows as an unformatted figure rather than crashing a screen.
 */
export function usd(cents: number): string {
  const amount = fromCents(cents, 'USD');

  return amount.ok ? formatUsd(amount.value) : String(cents);
}

/**
 * A rate as a percentage, for reading.
 *
 * The arithmetic is on integers: basis points split into whole percent and
 * hundredths, so no binary fraction reaches the text. Trailing zeros are
 * dropped, which is why 1,000 basis points reads as 10% rather than 10.00%.
 */
function formatPercent(rateBasisPoints: number): string {
  const whole = Math.trunc(rateBasisPoints / 100);
  const hundredths = rateBasisPoints % 100;

  if (hundredths === 0) {
    return `${String(whole)}%`;
  }

  const padded = String(hundredths).padStart(2, '0');
  const trimmed = padded.endsWith('0') ? padded.slice(0, 1) : padded;

  return `${String(whole)}.${trimmed}%`;
}
