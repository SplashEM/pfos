import type { AllocationLine } from '@domain/allocation/contracts/allocation-result';
import type { DomainError } from '@domain/shared/errors/domain-error';
import { ok, type Result } from '@domain/shared/errors/result';
import type { IdGenerator } from '@domain/shared/ids/id-generator';

import type {
  AllocationComponentRecord,
  AllocationRecord,
  ConfirmedPaycheckRecords,
  PersistedTimestamp,
  PlanSnapshotRecord,
} from '../persistence/confirmed-paycheck-records';
import {
  ALLOCATION_RECORD_SCHEMA_VERSION,
  PLAN_SNAPSHOT_SCHEMA_VERSION,
} from '../persistence/confirmed-paycheck-records';
import type { ConfirmedPaycheckStore } from '../persistence/confirmed-paycheck-store';
import { toPersistedExplanation } from './allocation-explanation-text';
import type { ConfirmablePaycheck } from './preview-paycheck-allocation';

/**
 * Confirming one previewed paycheck (PFOS-ENG-02 §57; Decision 098).
 *
 * This records what a person was actually looking at. The proposal arrives from
 * the preview that produced it — the same resolved rule set, the same
 * allocation, the same income event — and nothing is resolved or allocated
 * again here. Re-resolving at the moment of the click would record an
 * allocation nobody saw, because the plan on screen may have changed since.
 *
 * No financial arithmetic happens in this file. Every amount written is one the
 * Allocation Engine produced, carried across in the integer cents it already
 * holds; the only work is choosing which of those facts a confirmed record
 * keeps, which Decision 098 holdings 5 and 6 answer.
 *
 * The clock and identifier generation both come from outside. PFOS-ENG-00 §13.4
 * forbids a deterministic engine from reading a clock and §4.5 puts identifier
 * generation in infrastructure, so the confirmation moment and the two new
 * identifiers arrive as arguments.
 *
 * Nothing moves money. A confirmed paycheck records where money was planned to
 * go; Constitution Principle 8 keeps physical money and virtual planning apart,
 * and this writes only to PFOS's own store.
 */
export interface ConfirmPaycheckRequest {
  /** The proposal to record, exactly as previewed. */
  readonly proposal: ConfirmablePaycheck;
  /** The moment of confirmation, in epoch milliseconds, read outside the domain. */
  readonly confirmedAt: number;
  /** The viewer's IANA time zone, paired with `confirmedAt`. */
  readonly timeZone: string;
  readonly ids: IdGenerator;
  readonly store: ConfirmedPaycheckStore;
}

/**
 * Records a previewed paycheck as a confirmed one.
 *
 * Returns the records that were written, so a caller can show the confirmation
 * without reading it back.
 *
 * Every failure is the store's own: the records are built from values the
 * engine produced, and the store validates and writes them atomically, so a
 * failure here means nothing was stored.
 */
export async function confirmPaycheck(
  request: ConfirmPaycheckRequest,
): Promise<Result<ConfirmedPaycheckRecords, DomainError>> {
  const confirmedAt: PersistedTimestamp = {
    epochMilliseconds: request.confirmedAt,
    timeZone: request.timeZone,
  };

  const snapshot: PlanSnapshotRecord = {
    id: request.ids.next(),
    schemaVersion: PLAN_SNAPSHOT_SCHEMA_VERSION,
    createdAt: confirmedAt,
    eventType: 'PAYCHECK',
    eventId: request.proposal.incomeEvent.incomeEventId,
    resolvedRuleSet: request.proposal.resolvedRuleSet,
  };

  const allocation: AllocationRecord = {
    id: request.ids.next(),
    schemaVersion: ALLOCATION_RECORD_SCHEMA_VERSION,
    incomeEventId: request.proposal.incomeEvent.incomeEventId,
    planSnapshotId: snapshot.id,
    status: 'CONFIRMED',
    confirmedAt,
    currency: request.proposal.incomeEvent.netAmount.currency,
    totalInputCents: request.proposal.incomeEvent.netAmount.cents,
    totalAllocatedCents: request.proposal.allocation.totalAllocated.cents,
    totalUnallocatedCents: request.proposal.allocation.unallocated.cents,
    components: request.proposal.allocation.lines.map(toComponent),
  };

  const written = await request.store.saveConfirmation({ snapshot, allocation });

  return written.ok ? ok({ snapshot, allocation }) : written;
}

/**
 * One allocated line, as a stored component.
 *
 * `stableOrder` is the position the engine emitted, recorded so the order a
 * person saw survives storage: PFOS-ENG-02 §68 forbids depending on retrieval
 * order and Invariant 11 forbids repository ordering from altering results.
 */
function toComponent(line: AllocationLine, index: number): AllocationComponentRecord {
  return {
    destinationBucketId: line.bucketId,
    stage: line.stage,
    amountCents: line.amount.cents,
    stableOrder: index,
    explanation: toPersistedExplanation(line.explanation),
  };
}
