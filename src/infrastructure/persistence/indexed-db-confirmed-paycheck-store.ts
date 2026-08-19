import {
  parseAllocationRecord,
  parsePlanSnapshotRecord,
} from '@application/persistence/confirmed-paycheck-record-parsing';
import type {
  AllocationRecord,
  ConfirmedPaycheckRecords,
  PlanSnapshotRecord,
} from '@application/persistence/confirmed-paycheck-records';
import type { ConfirmedPaycheckStore } from '@application/persistence/confirmed-paycheck-store';
import { APPLICATION_ERROR_CODES } from '@application/errors/application-error-codes';
import { domainError, type DomainError } from '@domain/shared/errors/domain-error';
import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { err, ok, type Result } from '@domain/shared/errors/result';

/**
 * Confirmed paychecks in IndexedDB (Decision 056; Decision 098 holding 9).
 *
 * This is the infrastructure half of `ConfirmedPaycheckStore`, and the only
 * place in PFOS that names a database, an object store or a transaction.
 * Decision 056 chose IndexedDB over local storage for exactly this class of
 * data, and PFOS-ENG-00 §25.1 lists Plan Snapshots and Allocations among what
 * it holds. The disposable preview settings stay where they are, in their own
 * local-storage adapter: nothing financial has ever been written there and
 * nothing financial may be.
 *
 * The bounded foundation Decision 098 authorises is exactly what is here: one
 * database at version 1, two object stores, one atomic write and the narrowest
 * reads that prove a record survived. There is no migration engine, no
 * compatibility reader, no repository framework, no unit-of-work abstraction
 * and no query surface, and none may be added without the decision that gives
 * it meaning.
 *
 * Records are written with `add` rather than `put`. A confirmed record is
 * immutable, so an identifier that already exists is a failure rather than an
 * instruction to overwrite: §26 forbids silently destroying user financial
 * data, and a `put` would do exactly that.
 *
 * Nothing is migrated and nothing is repaired. A stored record this build
 * cannot read is reported and left alone (Decision 098 holding 8), which is why
 * every read parses rather than casts, and why no read path writes.
 */

/** The one database this build opens. */
export const CONFIRMED_PAYCHECK_DATABASE_NAME = 'pfos-confirmed-paychecks';

/**
 * The IndexedDB schema version (PFOS-ENG-00 §26).
 *
 * The database's own version and nothing else. It is not
 * `PLAN_SNAPSHOT_SCHEMA_VERSION`, not `ALLOCATION_RECORD_SCHEMA_VERSION` and
 * not `ResolvedRuleSet.schemaVersion`; Decision 098 holdings 2 and 3 keep all
 * four independent, and §40 forbids conflating version classes.
 */
export const CONFIRMED_PAYCHECK_DATABASE_VERSION = 1;

const PLAN_SNAPSHOT_STORE = 'plan-snapshots';
const ALLOCATION_STORE = 'allocations';

/**
 * Orders confirmations by when they were confirmed, then by identifier.
 *
 * The identifier is part of the key so the order is total: two confirmations
 * recorded in the same millisecond still have one answer to which is later, and
 * that answer does not depend on how the database returns rows (PFOS-ENG-02
 * §68; PFOS-ENG-00 §32 Invariant 11).
 */
const CONFIRMED_AT_INDEX = 'by-confirmed-at';

/**
 * Builds the IndexedDB implementation of the confirmed-paycheck port.
 *
 * A factory rather than a class: it holds no state, and it exists to name the
 * dependency at the composition root and stay swappable in a test.
 */
export function createIndexedDbConfirmedPaycheckStore(
  databaseName: string = CONFIRMED_PAYCHECK_DATABASE_NAME,
): ConfirmedPaycheckStore {
  return {
    saveConfirmation: (records) => saveConfirmation(databaseName, records),
    readConfirmation: (allocationId) => readConfirmation(databaseName, allocationId),
    readLatestConfirmation: () => readLatestConfirmation(databaseName),
    readPlanSnapshot: (snapshotId) => readPlanSnapshot(databaseName, snapshotId),
  };
}

/**
 * Writes a snapshot and its allocation inside one read-write transaction.
 *
 * Both records are validated first, so a value that could not be read back is
 * never stored, and the allocation must name the snapshot it is written beside
 * — PFOS-ENG-00 §32 Invariant 12 requires a reference in a confirmed record to
 * resolve, and a pair that disagreed would be unreadable the moment it landed.
 *
 * Atomicity is IndexedDB's own: both `add` calls join one transaction, a failed
 * request aborts it, and the promise resolves only when the transaction
 * commits. If the second write fails, the first is rolled back with it, so a
 * caller that sees a failure knows nothing was stored.
 */
async function saveConfirmation(
  databaseName: string,
  records: ConfirmedPaycheckRecords,
): Promise<Result<void, DomainError>> {
  const snapshot = parsePlanSnapshotRecord(records.snapshot);
  if (!snapshot.ok) {
    return snapshot;
  }

  const allocation = parseAllocationRecord(records.allocation);
  if (!allocation.ok) {
    return allocation;
  }

  if (allocation.value.planSnapshotId !== snapshot.value.id) {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_CONFIRMATION_SNAPSHOT_MISSING,
        category: ERROR_CATEGORIES.MISSING_REFERENCE,
        summary: 'A paycheck could not be saved because its plan record did not match.',
        details:
          `Allocation ${allocation.value.id} names snapshot ${allocation.value.planSnapshotId}, ` +
          `but it was written with snapshot ${snapshot.value.id}.`,
        affectedEntityIds: [allocation.value.id, snapshot.value.id],
      }),
    );
  }

  try {
    const database = await openDatabase(databaseName);

    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(
          [PLAN_SNAPSHOT_STORE, ALLOCATION_STORE],
          'readwrite',
        );

        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onabort = () => {
          reject(transaction.error ?? new Error('The confirmation transaction was aborted.'));
        };
        transaction.onerror = () => {
          reject(transaction.error ?? new Error('The confirmation transaction failed.'));
        };

        /*
         * Both writes are issued against the same transaction. A rejected
         * request aborts it, which is what makes the pair atomic without any
         * unit-of-work machinery of ours.
         */
        transaction.objectStore(PLAN_SNAPSHOT_STORE).add(snapshot.value);
        transaction.objectStore(ALLOCATION_STORE).add(allocation.value);
      });
    } finally {
      database.close();
    }

    return ok(undefined);
  } catch (cause) {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_CONFIRMATION_WRITE_FAILED,
        category: ERROR_CATEGORIES.PERSISTENCE,
        summary: 'This paycheck was not saved. Nothing was recorded.',
        details: describe(cause),
        affectedEntityIds: [records.allocation.id, records.snapshot.id],
      }),
    );
  }
}

/** Reads one allocation and the snapshot it names. */
async function readConfirmation(
  databaseName: string,
  allocationId: string,
): Promise<Result<ConfirmedPaycheckRecords | undefined, DomainError>> {
  const stored = await readStored(databaseName, ALLOCATION_STORE, allocationId);
  if (!stored.ok) {
    return stored;
  }

  if (stored.value === undefined) {
    return ok(undefined);
  }

  const allocation: Result<AllocationRecord, DomainError> = parseAllocationRecord(stored.value);
  if (!allocation.ok) {
    return allocation;
  }

  const snapshot = await readPlanSnapshot(databaseName, allocation.value.planSnapshotId);
  if (!snapshot.ok) {
    return snapshot;
  }

  /*
   * A confirmed allocation whose snapshot is gone cannot be read at all.
   * Invariant 9 ties it to that snapshot and Decision 098 holding 4 forbids
   * falling back to current rules, so this is a failure rather than a partial
   * answer.
   */
  if (snapshot.value === undefined) {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_CONFIRMATION_SNAPSHOT_MISSING,
        category: ERROR_CATEGORIES.MISSING_REFERENCE,
        summary: 'A saved paycheck is missing the plan it was confirmed against.',
        details: `Allocation ${allocationId} names snapshot ${allocation.value.planSnapshotId}, which is not stored.`,
        affectedEntityIds: [allocationId, allocation.value.planSnapshotId],
      }),
    );
  }

  return ok({ snapshot: snapshot.value, allocation: allocation.value });
}

/**
 * Reads the most recently confirmed paycheck.
 *
 * The cursor walks the confirmation index backwards and stops at the first
 * entry, so the newest record is found without loading the others. A database
 * that has never stored a confirmation answers `undefined`, which is not a
 * failure.
 */
async function readLatestConfirmation(
  databaseName: string,
): Promise<Result<ConfirmedPaycheckRecords | undefined, DomainError>> {
  let latestId: string | undefined;

  try {
    const database = await openDatabase(databaseName);

    try {
      latestId = await new Promise<string | undefined>((resolve, reject) => {
        const request = database
          .transaction([ALLOCATION_STORE], 'readonly')
          .objectStore(ALLOCATION_STORE)
          .index(CONFIRMED_AT_INDEX)
          .openCursor(null, 'prev');

        request.onsuccess = () => {
          const cursor = request.result;
          resolve(cursor === null ? undefined : String(cursor.primaryKey));
        };
        request.onerror = () => {
          reject(request.error ?? new Error('The read failed.'));
        };
      });
    } finally {
      database.close();
    }
  } catch (cause) {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_CONFIRMATION_READ_FAILED,
        category: ERROR_CATEGORIES.PERSISTENCE,
        summary: 'Saved paychecks could not be reached.',
        details: describe(cause),
      }),
    );
  }

  return latestId === undefined ? ok(undefined) : readConfirmation(databaseName, latestId);
}

/** Reads one Plan Snapshot. */
async function readPlanSnapshot(
  databaseName: string,
  snapshotId: string,
): Promise<Result<PlanSnapshotRecord | undefined, DomainError>> {
  const stored = await readStored(databaseName, PLAN_SNAPSHOT_STORE, snapshotId);
  if (!stored.ok) {
    return stored;
  }

  return stored.value === undefined ? ok(undefined) : parsePlanSnapshotRecord(stored.value);
}

/**
 * Fetches one stored value by key, without interpreting it.
 *
 * A key that is not present answers `undefined`: an empty database is not a
 * failure. A database that refuses the read is, and it is reported as reaching
 * the store rather than as anything about a record's contents.
 */
async function readStored(
  databaseName: string,
  storeName: string,
  key: string,
): Promise<Result<unknown, DomainError>> {
  try {
    const database = await openDatabase(databaseName);

    try {
      const value = await new Promise<unknown>((resolve, reject) => {
        const request = database
          .transaction([storeName], 'readonly')
          .objectStore(storeName)
          .get(key);

        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = () => {
          reject(request.error ?? new Error('The read failed.'));
        };
      });

      return ok(value ?? undefined);
    } finally {
      database.close();
    }
  } catch (cause) {
    return err(
      domainError({
        code: APPLICATION_ERROR_CODES.APPLICATION_CONFIRMATION_READ_FAILED,
        category: ERROR_CATEGORIES.PERSISTENCE,
        summary: 'Saved paychecks could not be reached.',
        details: describe(cause),
      }),
    );
  }
}

/**
 * Opens the database, creating the two stores on first use.
 *
 * `onupgradeneeded` fires only when the stored version is below the requested
 * one, which for version 1 means the first open on a device. There is no
 * migration path because there is no earlier version to migrate from; when one
 * exists, §26's migration rules govern it and this function is not the place to
 * improvise them.
 *
 * Both stores key on the record's own opaque identifier (§14), so no key is
 * derived from a date, a name or an amount.
 */
function openDatabase(databaseName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, CONFIRMED_PAYCHECK_DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(PLAN_SNAPSHOT_STORE)) {
        database.createObjectStore(PLAN_SNAPSHOT_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(ALLOCATION_STORE)) {
        const allocations = database.createObjectStore(ALLOCATION_STORE, { keyPath: 'id' });
        allocations.createIndex(CONFIRMED_AT_INDEX, ['confirmedAt.epochMilliseconds', 'id']);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('The database could not be opened.'));
    };
    request.onblocked = () => {
      reject(new Error('The database is open in another tab and could not be upgraded.'));
    };
  });
}

/** Technical detail for logs and tests. Never shown to a person. */
function describe(cause: unknown): string {
  return cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause);
}
