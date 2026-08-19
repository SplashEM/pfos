import type { AllocationExplanationCode } from '@domain/allocation/contracts/allocation-explanation';
import type { AllocationStage } from '@domain/rules/contracts/allocation-stage';
import type { ResolvedRuleSet } from '@domain/rules/contracts/resolved-rule-set';
import type { CurrencyCode } from '@domain/shared/money/currency';

/**
 * The persisted confirmed-paycheck records (Decision 098).
 *
 * These are storage contracts, not runtime ones. They are declared here, in the
 * application layer, because Decision 098 makes the application the owner of
 * the persistence capability, and they are deliberately written in primitives —
 * strings, integers, plain records — rather than in domain value objects. A
 * stored record must keep its meaning after the runtime types around it change,
 * and a persisted contract that reused a branded runtime type would migrate
 * every time that type moved.
 *
 * The one exception is `PlanSnapshotRecord.resolvedRuleSet`. Decision 074
 * stores the complete `ResolvedRuleSet` by value inside a Plan Snapshot and
 * Decision 098 holding 5 repeats it, so the snapshot embeds that contract as it
 * is declared. It is already a persisted contract in its own right, carrying
 * its own `schemaVersion` fixed by Decisions 094 and 095; restating it in a
 * second spelling here would create a stored shape that `schemaVersion` does
 * not name, which is the identification failure Decision 074's rule exists to
 * prevent.
 *
 * Money is integer minor units with an explicit currency on the record
 * (Decision 098 holding 7; PFOS-ENG-00 §10.1). No `Money` object is serialized
 * into these envelopes and no monetary member is a floating-point number. The
 * `Money` values inside the embedded resolved rule set are a different matter:
 * they are part of that contract's own by-value shape, and `{ cents, currency }`
 * is itself integer minor units with an explicit currency.
 *
 * Nothing here moves money. A confirmed record says where a paycheck was
 * planned to go; Constitution Principle 8 keeps physical money and virtual
 * planning apart, and no member of either record describes a transfer, a
 * balance or a posted transaction.
 */

/**
 * The version of the persisted Plan Snapshot envelope (Decision 098 holding 2).
 *
 * It versions the envelope below and nothing else. It is not
 * `ResolvedRuleSet.schemaVersion`, not `ALLOCATION_RECORD_SCHEMA_VERSION`, not
 * the IndexedDB database version, and not the application version. Embedding a
 * resolved rule set whose own version changes does not move this number; only
 * an incompatible change to the envelope does.
 */
export const PLAN_SNAPSHOT_SCHEMA_VERSION = 1;

/**
 * The version of the persisted Allocation envelope (Decision 098 holding 3).
 *
 * Independent of `PLAN_SNAPSHOT_SCHEMA_VERSION`, of
 * `ResolvedRuleSet.schemaVersion` and of the database version, for the same
 * reason and on the same terms.
 */
export const ALLOCATION_RECORD_SCHEMA_VERSION = 1;

/**
 * The kind of financial event a snapshot was taken for.
 *
 * One member today. It is stored rather than assumed because a record that
 * cannot say what kind of event it described would need a migration to answer
 * that question the moment a second kind exists.
 */
export type PersistedEventType = 'PAYCHECK';

/**
 * The state of a stored allocation.
 *
 * One member today. PFOS-ENG-00 §18 distinguishes draft, preview, confirmed and
 * corrected states; only confirmed records are written, and the member is
 * stored so a later state cannot be inferred from silence.
 */
export type PersistedAllocationStatus = 'CONFIRMED';

/** A moment, as stored: epoch milliseconds and the zone it was read in. */
export interface PersistedTimestamp {
  readonly epochMilliseconds: number;
  readonly timeZone: string;
}

/**
 * A Plan Snapshot as stored (Decision 098 holding 5).
 *
 * There is no `effectiveAt` and no `sourceRuleVersionIds` here. PFOS-ENG-02 §56
 * requires the snapshot to contain the resolved rule set, the rounding policy
 * identifier, the evaluation date and the source rule versions, and the
 * embedded resolved set already carries `roundingPolicyId`, `evaluationDate`,
 * `sourceRuleVersionIds` and `planVersionId`. Two members that can disagree
 * about one fact inside an immutable financial record would leave a reader no
 * way to tell which was right.
 *
 * Members PFOS-ENG-01 §20 lists that no shipped behaviour produces — event
 * overrides, bucket balances, goal cycles — are absent rather than present and
 * empty, because an empty shape claims a behaviour exists.
 */
export interface PlanSnapshotRecord {
  readonly id: string;
  readonly schemaVersion: number;
  readonly createdAt: PersistedTimestamp;
  readonly eventType: PersistedEventType;
  readonly eventId: string;
  readonly resolvedRuleSet: ResolvedRuleSet;
}

/**
 * Why one stored allocation line received its amount (Decision 098 holding 6).
 *
 * The same structured facts the engine emits, in the persisted spelling: the
 * requested amount is integer cents here, and the code is the domain's own so
 * there is one explanation vocabulary rather than two that can drift.
 *
 * Facts, never prose. PFOS-ENG-02 §52 places the conversion to text in the
 * presentation layer, and stored prose could never be reworded or translated.
 */
export type PersistedAllocationExplanation =
  | {
      readonly code: Extract<AllocationExplanationCode, 'ALLOCATION_EXPLAIN_OBLIGATION_RATE'>;
      readonly rateBasisPoints: number;
    }
  | {
      readonly code: Extract<
        AllocationExplanationCode,
        'ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL' | 'ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED'
      >;
      readonly rank: number;
      readonly requestedAmountCents: number;
    }
  | {
      readonly code: Extract<AllocationExplanationCode, 'ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER'>;
    };

/**
 * One stored allocation line.
 *
 * `stableOrder` is stored rather than inferred. PFOS-ENG-02 §68 forbids
 * depending on retrieval order and PFOS-ENG-00 §32 Invariant 11 forbids
 * repository ordering from altering results, so the order a person saw is
 * recorded as data.
 *
 * `unmetAmountCents` is absent: PFOS-ENG-02 §41's shortfall behaviour is not
 * implemented, and the shipped explanation contract already declines that
 * member for the same reason. Per-component `ruleVersionIds` are absent because
 * nothing produces them and the snapshot carries the versions.
 */
export interface AllocationComponentRecord {
  readonly destinationBucketId: string;
  readonly stage: AllocationStage;
  readonly amountCents: number;
  readonly stableOrder: number;
  readonly explanation: PersistedAllocationExplanation;
}

/**
 * A confirmed allocation as stored (Decision 098 holding 6).
 *
 * `planSnapshotId` is the whole of its historical fidelity: the record is read
 * against the snapshot named here, never against current rules (holding 4).
 *
 * There is no `evaluationDate` — the referenced snapshot carries it — and no
 * `correctionOfAllocationId`, because no correction behaviour exists.
 *
 * PFOS-ENG-00 §32 Invariant 1 must hold on the stored value:
 * `totalInputCents` equals `totalAllocatedCents` plus `totalUnallocatedCents`.
 */
export interface AllocationRecord {
  readonly id: string;
  readonly schemaVersion: number;
  readonly incomeEventId: string;
  readonly planSnapshotId: string;
  readonly status: PersistedAllocationStatus;
  readonly confirmedAt: PersistedTimestamp;
  readonly currency: CurrencyCode;
  readonly totalInputCents: number;
  readonly totalAllocatedCents: number;
  readonly totalUnallocatedCents: number;
  readonly components: readonly AllocationComponentRecord[];
}

/** One confirmed paycheck: the allocation and the snapshot it was confirmed against. */
export interface ConfirmedPaycheckRecords {
  readonly snapshot: PlanSnapshotRecord;
  readonly allocation: AllocationRecord;
}
