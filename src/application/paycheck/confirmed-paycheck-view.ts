import type { ConfirmedPaycheckRecords } from '../persistence/confirmed-paycheck-records';
import { explanationText, usd } from './allocation-explanation-text';

/**
 * A stored confirmation, formatted for reading.
 *
 * Every figure comes from the confirmed record itself. Nothing is resolved,
 * allocated or recalculated here: Decision 098 holding 4 says a confirmed
 * allocation is interpreted through the snapshot recorded with it, never
 * against current rules, so this reads the record and formats it and does
 * nothing else.
 *
 * Destinations read as the name stored with the record, never as a name from
 * the plan being edited now (Decision 099).
 *
 * The label was written at confirmation, so renaming a priority afterwards
 * changes nothing here: a paycheck confirmed against "Laptop" still reads
 * "Laptop" once that priority becomes "Vacation". A record written before
 * destination names were stored has none, and shows its identifier instead,
 * which is what it honestly contains.
 */
export interface ConfirmedPaycheckLineView {
  readonly bucketId: string;
  readonly label: string;
  readonly amount: string;
  readonly explanation: string;
}

export interface ConfirmedPaycheckView {
  readonly allocationId: string;
  /** The date the paycheck was allocated against, as `YYYY-MM-DD`. */
  readonly paycheckDate: string;
  readonly paycheckAmount: string;
  readonly confirmedAt: string;
  readonly lines: readonly ConfirmedPaycheckLineView[];
  readonly totalAllocated: string;
  readonly unallocated: string;
}

/** Formats one stored confirmation for the screen, from the record alone. */
export function toConfirmedPaycheckView(records: ConfirmedPaycheckRecords): ConfirmedPaycheckView {
  const { allocation, snapshot } = records;

  /*
   * The lines are sorted by the order stored with them rather than by the order
   * the database returned. PFOS-ENG-02 §68 forbids depending on retrieval
   * order, and this is the point where that would otherwise happen.
   */
  const ordered = [...allocation.components].sort((a, b) => a.stableOrder - b.stableOrder);

  return {
    allocationId: allocation.id,
    paycheckDate: isoDate(snapshot.resolvedRuleSet.evaluationDate),
    paycheckAmount: usd(allocation.totalInputCents),
    confirmedAt: readableMoment(allocation.confirmedAt),
    lines: ordered.map((component) => ({
      bucketId: component.destinationBucketId,
      label: component.destinationLabel ?? component.destinationBucketId,
      amount: usd(component.amountCents),
      explanation: explanationText(component.explanation, component.amountCents),
    })),
    totalAllocated: usd(allocation.totalAllocatedCents),
    unallocated: usd(allocation.totalUnallocatedCents),
  };
}

/** A calendar date as `YYYY-MM-DD`, the shape the paycheck field uses. */
function isoDate(date: { readonly year: number; readonly month: number; readonly day: number }) {
  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');

  return `${String(date.year)}-${month}-${day}`;
}

/**
 * The moment of confirmation, in the zone it was confirmed in.
 *
 * The stored zone is used rather than the reader's, so a confirmation does not
 * appear to have happened at a different time after travelling. A zone the
 * platform does not know falls back to the reader's, which is a display detail
 * rather than a change to what was recorded.
 */
function readableMoment(moment: { readonly epochMilliseconds: number; readonly timeZone: string }) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: moment.timeZone,
    }).format(new Date(moment.epochMilliseconds));
  } catch {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(moment.epochMilliseconds));
  }
}
