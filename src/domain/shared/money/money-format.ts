import type { Money } from './money';

/**
 * Inserts thousands separators into a run of digits.
 *
 * Written out by hand rather than delegating to Intl: Intl output varies with
 * host locale and ICU version, which would make a domain function
 * nondeterministic (PFOS-00 Principle 18).
 */
function groupDigits(digits: string): string {
  let grouped = '';

  for (let index = 0; index < digits.length; index += 1) {
    const positionFromRight = digits.length - index;
    grouped += digits.charAt(index);
    if (positionFromRight > 1 && positionFromRight % 3 === 1) {
      grouped += ',';
    }
  }

  return grouped;
}

/**
 * Formats an amount for display (PFOS-ENG-00 §10.3).
 *
 * Output is fixed and locale-independent: `$1,234.56`, or `-$1,234.56` when
 * negative. Formatted money is a presentation value only; §10.4 forbids
 * storing it in the domain.
 */
export function formatUsd(value: Money): string {
  const magnitude = Math.abs(value.cents);
  const dollars = Math.floor(magnitude / 100);
  const cents = magnitude % 100;
  const centsText = cents < 10 ? `0${String(cents)}` : String(cents);
  const formatted = `$${groupDigits(String(dollars))}.${centsText}`;

  return value.cents < 0 ? `-${formatted}` : formatted;
}
