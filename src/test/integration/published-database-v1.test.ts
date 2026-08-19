import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import type { ConfirmedPaycheckStore } from '@application/persistence/confirmed-paycheck-store';
import { createIndexedDbConfirmedPaycheckStore } from '@infrastructure/persistence/indexed-db-confirmed-paycheck-store';
import { APPLICATION_ERROR_CODES } from '@application/errors/application-error-codes';
import { allocationRecord, planSnapshotRecord } from '@test/builders/confirmed-paycheck';

/**
 * The published database, as devices already have it.
 *
 * PFOS shipped the confirmed-paycheck database at version 1 with two plain
 * object stores keyed on `id` and nothing else. A device that has already
 * opened it will never run the upgrade path again, so anything this build
 * expects to find beyond that shape — another store, an index — is missing
 * exactly where a person's history already lives.
 *
 * These tests build that published shape by hand and then use the shipped store
 * against it. A test that let the adapter create its own database could not
 * catch this: it would build whatever the current code asks for and pass.
 */

/** The version-1 schema exactly as published. Do not add to this. */
const PUBLISHED_STORES = ['plan-snapshots', 'allocations'] as const;
const PUBLISHED_VERSION = 1;

let databaseName: string;
let store: ConfirmedPaycheckStore;
let databaseCounter = 0;

beforeEach(() => {
  databaseCounter += 1;
  databaseName = `pfos-published-v1-${String(databaseCounter)}`;
  store = createIndexedDbConfirmedPaycheckStore(databaseName);
});

/** Creates the database exactly as the published build left it. */
async function createPublishedDatabase(): Promise<void> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, PUBLISHED_VERSION);

    request.onupgradeneeded = () => {
      for (const name of PUBLISHED_STORES) {
        request.result.createObjectStore(name, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('open failed'));
    };
  });

  database.close();
}

/** What the database actually holds, read without the adapter. */
async function inspect(): Promise<{
  version: number;
  stores: readonly string[];
  allocationIndexes: readonly string[];
}> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('open failed'));
    };
  });

  const transaction = database.transaction(['allocations'], 'readonly');
  const allocationIndexes = [...transaction.objectStore('allocations').indexNames];
  const stores = [...database.objectStoreNames];
  const version = database.version;

  transaction.abort();
  database.close();

  return { version, stores, allocationIndexes };
}

describe('the shipped store against the already-published database', () => {
  it('writes and reads a confirmation without changing the schema', async () => {
    await createPublishedDatabase();

    const saved = await store.saveConfirmation({
      snapshot: planSnapshotRecord(),
      allocation: allocationRecord(),
    });
    expect(saved.ok).toBe(true);

    const latest = await store.readLatestConfirmation();

    expect(latest.ok && latest.value?.allocation.id).toBe('allocation-1');
  });

  it('finds the latest confirmation without an index', async () => {
    await createPublishedDatabase();

    await store.saveConfirmation({
      snapshot: planSnapshotRecord(),
      allocation: allocationRecord(),
    });

    const latest = await store.readLatestConfirmation();

    expect(latest.ok).toBe(true);
    expect((await inspect()).allocationIndexes).toEqual([]);
  });

  it('leaves the database at version 1 with the two published stores', async () => {
    await createPublishedDatabase();

    await store.saveConfirmation({
      snapshot: planSnapshotRecord(),
      allocation: allocationRecord(),
    });
    await store.readLatestConfirmation();

    const state = await inspect();

    expect(state.version).toBe(PUBLISHED_VERSION);
    expect([...state.stores].sort()).toEqual(['allocations', 'plan-snapshots']);
  });

  /*
   * The complement: a database this build creates itself must be the published
   * shape too, so the two can never diverge.
   */
  it('creates the published shape and nothing more', async () => {
    await store.saveConfirmation({
      snapshot: planSnapshotRecord(),
      allocation: allocationRecord(),
    });

    const state = await inspect();

    expect(state.version).toBe(PUBLISHED_VERSION);
    expect([...state.stores].sort()).toEqual(['allocations', 'plan-snapshots']);
    expect(state.allocationIndexes).toEqual([]);
  });
});

describe('choosing the latest confirmation', () => {
  /** Stores one confirmation, confirmed at a given moment. */
  async function save(id: string, epochMilliseconds: number): Promise<void> {
    const result = await store.saveConfirmation({
      snapshot: planSnapshotRecord({ id: `snapshot-${id}` }),
      allocation: allocationRecord({
        id,
        planSnapshotId: `snapshot-${id}`,
        confirmedAt: { epochMilliseconds, timeZone: 'America/Los_Angeles' },
      }),
    });

    if (!result.ok) {
      throw new Error(`Expected ${id} to save: ${result.error.code}`);
    }
  }

  /** The identifier the store considers newest. */
  async function latestId(): Promise<string | undefined> {
    const latest = await store.readLatestConfirmation();
    if (!latest.ok) {
      throw new Error(`Read failed: ${latest.error.code}`);
    }
    return latest.value?.allocation.id;
  }

  it('answers with the one confirmed most recently', async () => {
    await createPublishedDatabase();
    await save('allocation-a', 1_000);
    await save('allocation-b', 3_000);
    await save('allocation-c', 2_000);

    expect(await latestId()).toBe('allocation-b');
  });

  /* Insertion order must not decide it: the moment does. */
  it('answers the same whichever order they were written in', async () => {
    await createPublishedDatabase();
    await save('allocation-c', 2_000);
    await save('allocation-b', 3_000);
    await save('allocation-a', 1_000);

    expect(await latestId()).toBe('allocation-b');
  });

  /* Two in the same millisecond still have one answer: the greater identifier. */
  it('breaks a tie on the identifier', async () => {
    await createPublishedDatabase();
    await save('allocation-a', 5_000);
    await save('allocation-b', 5_000);

    expect(await latestId()).toBe('allocation-b');
  });

  it('breaks a tie the same way whichever order they were written in', async () => {
    await createPublishedDatabase();
    await save('allocation-b', 5_000);
    await save('allocation-a', 5_000);

    expect(await latestId()).toBe('allocation-b');
  });

  it('answers with nothing when no paycheck has been confirmed', async () => {
    await createPublishedDatabase();

    expect(await latestId()).toBeUndefined();
  });

  /*
   * A record this build cannot read is a failure rather than something to skip:
   * the one being skipped could be the newest, and answering with an older one
   * would show a person a paycheck that is not their latest.
   */
  it('refuses to answer when a stored record cannot be read', async () => {
    await createPublishedDatabase();
    await save('allocation-a', 1_000);

    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseName);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? new Error('open failed'));
      };
    });

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(['allocations'], 'readwrite');
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(transaction.error ?? new Error('write failed'));
      };
      transaction
        .objectStore('allocations')
        .put({ ...allocationRecord({ id: 'allocation-b' }), schemaVersion: 99 });
    });
    database.close();

    const latest = await store.readLatestConfirmation();

    expect(latest.ok).toBe(false);
  });
});

describe('reading the whole confirmed history', () => {
  /** Stores one confirmation, confirmed at a given moment. */
  async function save(id: string, epochMilliseconds: number): Promise<void> {
    const result = await store.saveConfirmation({
      snapshot: planSnapshotRecord({ id: `snapshot-${id}` }),
      allocation: allocationRecord({
        id,
        planSnapshotId: `snapshot-${id}`,
        confirmedAt: { epochMilliseconds, timeZone: 'America/Los_Angeles' },
      }),
    });

    if (!result.ok) {
      throw new Error(`Expected ${id} to save: ${result.error.code}`);
    }
  }

  /** The identifiers of every confirmation, in the order they are returned. */
  async function historyIds(): Promise<readonly string[]> {
    const history = await store.readConfirmations();
    if (!history.ok) {
      throw new Error(`Read failed: ${history.error.code}`);
    }
    return history.value.map((entry) => entry.allocation.id);
  }

  it('answers with nothing when no paycheck has been confirmed', async () => {
    await createPublishedDatabase();

    expect(await historyIds()).toEqual([]);
  });

  it('returns every confirmed paycheck', async () => {
    await createPublishedDatabase();
    await save('allocation-a', 1_000);
    await save('allocation-b', 2_000);
    await save('allocation-c', 3_000);

    expect(await historyIds()).toHaveLength(3);
  });

  it('returns them newest first', async () => {
    await createPublishedDatabase();
    await save('allocation-a', 1_000);
    await save('allocation-c', 3_000);
    await save('allocation-b', 2_000);

    expect(await historyIds()).toEqual(['allocation-c', 'allocation-b', 'allocation-a']);
  });

  /* Write order must not decide it: the confirmation moment does. */
  it('returns the same order whichever order they were written in', async () => {
    await createPublishedDatabase();
    await save('allocation-c', 3_000);
    await save('allocation-b', 2_000);
    await save('allocation-a', 1_000);

    expect(await historyIds()).toEqual(['allocation-c', 'allocation-b', 'allocation-a']);
  });

  /* Two in the same millisecond still have one order: the greater id first. */
  it('breaks a tie on the identifier', async () => {
    await createPublishedDatabase();
    await save('allocation-a', 5_000);
    await save('allocation-b', 5_000);

    expect(await historyIds()).toEqual(['allocation-b', 'allocation-a']);
  });

  it('breaks a tie the same way whichever order they were written in', async () => {
    await createPublishedDatabase();
    await save('allocation-b', 5_000);
    await save('allocation-a', 5_000);

    expect(await historyIds()).toEqual(['allocation-b', 'allocation-a']);
  });

  /* The head of the list and the latest confirmation are one answer. */
  it('agrees with the latest confirmation', async () => {
    await createPublishedDatabase();
    await save('allocation-a', 1_000);
    await save('allocation-b', 3_000);
    await save('allocation-c', 2_000);

    const latest = await store.readLatestConfirmation();

    expect(latest.ok && latest.value?.allocation.id).toBe((await historyIds())[0]);
  });

  it('pairs each allocation with the snapshot it was confirmed against', async () => {
    await createPublishedDatabase();
    await save('allocation-a', 1_000);
    await save('allocation-b', 2_000);

    const history = await store.readConfirmations();
    if (!history.ok) {
      throw new Error('Expected the history to read.');
    }

    for (const entry of history.value) {
      expect(entry.snapshot.id).toBe(entry.allocation.planSnapshotId);
    }
  });

  it('needs no index to do any of it', async () => {
    await createPublishedDatabase();
    await save('allocation-a', 1_000);
    await save('allocation-b', 2_000);

    await store.readConfirmations();

    const state = await inspect();

    expect(state.version).toBe(PUBLISHED_VERSION);
    expect(state.allocationIndexes).toEqual([]);
  });
});

describe('a history that cannot be read whole', () => {
  /** Writes a value straight into a store, bypassing every check. */
  async function writeRaw(storeName: string, value: unknown): Promise<void> {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseName);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? new Error('open failed'));
      };
    });

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(transaction.error ?? new Error('write failed'));
      };
      transaction.objectStore(storeName).put(value);
    });

    database.close();
  }

  /** Reads a value straight back out, so a test can see the stored bytes. */
  async function readRaw(storeName: string, key: string): Promise<unknown> {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseName);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? new Error('open failed'));
      };
    });

    const value = await new Promise<unknown>((resolve, reject) => {
      const request = database.transaction([storeName], 'readonly').objectStore(storeName).get(key);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? new Error('read failed'));
      };
    });

    database.close();
    return value;
  }

  beforeEach(async () => {
    await createPublishedDatabase();

    const saved = await store.saveConfirmation({
      snapshot: planSnapshotRecord(),
      allocation: allocationRecord(),
    });
    if (!saved.ok) {
      throw new Error('Expected the first confirmation to save.');
    }
  });

  /*
   * A history missing a paycheck is indistinguishable from a history that never
   * had one, so an unreadable record fails the whole read rather than being
   * quietly left out of the list (Decision 098 holding 8).
   */
  it('fails rather than returning a list without the record it could not read', async () => {
    await writeRaw('allocations', {
      ...allocationRecord({ id: 'allocation-2', planSnapshotId: 'plan-snapshot-1' }),
      totalAllocatedCents: 'lots',
    });

    const history = await store.readConfirmations();

    expect(history.ok).toBe(false);
    if (!history.ok) {
      expect(history.error.code).toBe(
        APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
      );
    }
  });

  it('fails when a record was written by a version this build does not read', async () => {
    await writeRaw('allocations', {
      ...allocationRecord({ id: 'allocation-2', planSnapshotId: 'plan-snapshot-1' }),
      schemaVersion: 99,
    });

    const history = await store.readConfirmations();

    expect(history.ok).toBe(false);
    if (!history.ok) {
      expect(history.error.code).toBe(
        APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_UNSUPPORTED_SCHEMA_VERSION,
      );
    }
  });

  it('fails when a paycheck names a plan that is not stored', async () => {
    await writeRaw('allocations', {
      ...allocationRecord({ id: 'allocation-2', planSnapshotId: 'plan-snapshot-missing' }),
    });

    const history = await store.readConfirmations();

    expect(history.ok).toBe(false);
    if (!history.ok) {
      expect(history.error.code).toBe(
        APPLICATION_ERROR_CODES.APPLICATION_CONFIRMATION_SNAPSHOT_MISSING,
      );
    }
  });

  it('fails when a stored plan cannot be read', async () => {
    const damaged = { ...planSnapshotRecord(), schemaVersion: 99 };
    await writeRaw('plan-snapshots', damaged);

    const history = await store.readConfirmations();

    expect(history.ok).toBe(false);
  });

  /* Nothing on a read path writes: the bad record is exactly where it was. */
  it('leaves the unreadable record untouched', async () => {
    const damaged = {
      ...allocationRecord({ id: 'allocation-2', planSnapshotId: 'plan-snapshot-1' }),
      totalAllocatedCents: 'lots',
    };
    await writeRaw('allocations', damaged);

    await store.readConfirmations();

    expect(await readRaw('allocations', 'allocation-2')).toEqual(damaged);
    expect(await readRaw('allocations', 'allocation-1')).toEqual(allocationRecord());
  });
});
