import type { DomainError } from '@domain/shared/errors/domain-error';
import type { Result } from '@domain/shared/errors/result';

import type { ConfirmedPaycheckRecords, PlanSnapshotRecord } from './confirmed-paycheck-records';

/**
 * Somewhere durable to keep confirmed paychecks (Decision 098 holding 9).
 *
 * The application owns this contract because the application owns the
 * capability; PFOS-ENG-00 §3 and §25.2 put the implementation in the
 * infrastructure layer, and the IndexedDB adapter lives there. Nothing above or
 * below this interface knows about databases, object stores or key paths.
 *
 * It is deliberately not a repository framework. There is no `Repository<T>`,
 * no query language, no unit-of-work abstraction and no second record type:
 * Decision 098 authorises one bounded foundation for the two records a
 * confirmation writes, and a third kind of stored data gets its own narrow
 * contract when something needs one.
 *
 * What travels through here is a financial record, and the difference from the
 * preview-settings contract beside it is the whole point. Every method returns
 * a `Result`, because losing or misreading a confirmed paycheck is worth
 * interrupting someone over, while losing three typed settings is not.
 *
 * Reading is narrow on purpose. There is no listing, no paging, no date range
 * and no latest-confirmed query; those belong to the slice that shows a person
 * their history, and none of them is needed to prove a record survives.
 *
 * Nothing here moves money. A confirmed record says where a paycheck was
 * planned to go (Constitution Principle 8).
 */
export interface ConfirmedPaycheckStore {
  /**
   * Writes one confirmation: a Plan Snapshot and the allocation that references
   * it, atomically (Decision 098 holding 1).
   *
   * Both records are committed or neither is. A caller that receives a failure
   * knows nothing was stored, and never has to inspect the database to find out
   * whether half a confirmation survived.
   *
   * Records are validated before they are written, so a value that could not be
   * read back is never stored. An allocation that already exists is refused
   * rather than overwritten: a confirmed record is immutable, and silently
   * replacing one would destroy financial history (§26).
   */
  saveConfirmation(records: ConfirmedPaycheckRecords): Promise<Result<void, DomainError>>;

  /**
   * Reads one confirmed paycheck: the allocation and the snapshot it names.
   *
   * A missing allocation is `undefined` rather than a failure — nothing is
   * wrong with a database that has never stored one. A stored record that
   * cannot be read is a failure, and the stored data is left untouched
   * (holding 8).
   *
   * The snapshot is returned with the allocation because the allocation is
   * meaningless without it: holding 4 forbids interpreting a confirmed
   * allocation against current rules, so the record and its historical context
   * travel together.
   */
  readConfirmation(
    allocationId: string,
  ): Promise<Result<ConfirmedPaycheckRecords | undefined, DomainError>>;

  /**
   * Reads every confirmed paycheck, newest first.
   *
   * "Newest" is the greatest `confirmedAt` with the record identifier breaking
   * a tie, the same total order `readLatestConfirmation` answers with, so the
   * head of this list and the latest confirmation cannot disagree.
   *
   * A stored record that cannot be read fails the whole list rather than being
   * left out of it: a history missing a paycheck looks exactly like a history
   * that never had one (Decision 098 holding 8).
   *
   * This is a screen's question, not a history API. There is no paging, no date
   * range and no filter behind it.
   */
  readConfirmations(): Promise<Result<readonly ConfirmedPaycheckRecords[], DomainError>>;

  /**
   * Reads the most recently confirmed paycheck, if there is one.
   *
   * "Most recent" is the greatest `confirmedAt`, with the record identifier
   * breaking a tie, so the answer is a total order rather than whatever order
   * the database happens to return — PFOS-ENG-02 §68 forbids depending on
   * retrieval order and PFOS-ENG-00 §32 Invariant 11 forbids storage ordering
   * from altering a result.
   *
   * This is a screen's question, not a history API. It returns one confirmation
   * or none, and there is deliberately no listing, paging or date range behind
   * it.
   */
  readLatestConfirmation(): Promise<Result<ConfirmedPaycheckRecords | undefined, DomainError>>;

  /**
   * Reads one Plan Snapshot on its own.
   *
   * Present so that the atomicity of `saveConfirmation` is observable: after a
   * refused write, a caller can confirm the snapshot did not survive alone.
   */
  readPlanSnapshot(
    snapshotId: string,
  ): Promise<Result<PlanSnapshotRecord | undefined, DomainError>>;
}
