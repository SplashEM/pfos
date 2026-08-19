import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import type { ConfirmedPaycheckStore } from '@application/persistence/confirmed-paycheck-store';
import { createIndexedDbConfirmedPaycheckStore } from '@infrastructure/persistence/indexed-db-confirmed-paycheck-store';
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
