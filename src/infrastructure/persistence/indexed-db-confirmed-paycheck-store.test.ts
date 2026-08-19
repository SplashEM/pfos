import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import { APPLICATION_ERROR_CODES } from '@application/errors/application-error-codes';
import type { ConfirmedPaycheckStore } from '@application/persistence/confirmed-paycheck-store';
import {
  allocationRecord,
  planSnapshotRecord,
  resolvedRuleSetFor,
} from '@test/builders/confirmed-paycheck';

import {
  CONFIRMED_PAYCHECK_DATABASE_VERSION,
  createIndexedDbConfirmedPaycheckStore,
} from './indexed-db-confirmed-paycheck-store';

/*
 * A real IndexedDB implementation, in memory. jsdom ships no IndexedDB, and the
 * behaviour under test here — that a failed second write rolls back the first —
 * is the database's own, so a hand-written stand-in would prove nothing about
 * it.
 */

/** A fresh database per test, so nothing leaks between them. */
let databaseName: string;
let store: ConfirmedPaycheckStore;
let databaseCounter = 0;

beforeEach(() => {
  databaseCounter += 1;
  databaseName = `pfos-test-${String(databaseCounter)}`;
  store = createIndexedDbConfirmedPaycheckStore(databaseName);
});

/** Writes a value straight into a store, bypassing every check the adapter makes. */
async function writeRaw(storeName: string, value: unknown): Promise<void> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, CONFIRMED_PAYCHECK_DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const opened = request.result;
      if (!opened.objectStoreNames.contains('plan-snapshots')) {
        opened.createObjectStore('plan-snapshots', { keyPath: 'id' });
      }
      if (!opened.objectStoreNames.contains('allocations')) {
        opened.createObjectStore('allocations', { keyPath: 'id' });
      }
    };
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
    const request = indexedDB.open(databaseName, CONFIRMED_PAYCHECK_DATABASE_VERSION);
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

/** Saves a confirmation that must succeed. */
async function saveOrThrow(
  records = { snapshot: planSnapshotRecord(), allocation: allocationRecord() },
) {
  const result = await store.saveConfirmation(records);
  if (!result.ok) {
    throw new Error(`Expected the confirmation to save: ${result.error.code}`);
  }
}

/** Reads a confirmation that must be readable. */
async function readOrThrow(allocationId = 'allocation-1') {
  const result = await store.readConfirmation(allocationId);
  if (!result.ok) {
    throw new Error(`Expected the confirmation to read: ${result.error.code}`);
  }
  return result.value;
}

describe('writing and reading one confirmed paycheck', () => {
  it('stores nothing before a confirmation is saved', async () => {
    expect(await readOrThrow()).toBeUndefined();
  });

  it('reads back the allocation that was saved', async () => {
    await saveOrThrow();

    expect(await readOrThrow()).toEqual({
      snapshot: planSnapshotRecord(),
      allocation: allocationRecord(),
    });
  });

  /* Decision 098 holding 5: the plan travels with the record, by value. */
  it('reads back the resolved rule set the paycheck was confirmed against', async () => {
    await saveOrThrow();

    const confirmation = await readOrThrow();

    expect(confirmation?.snapshot.resolvedRuleSet).toEqual(resolvedRuleSetFor());
  });

  it('reads back every cent exactly', async () => {
    await saveOrThrow();

    const allocation = (await readOrThrow())?.allocation;

    expect(allocation?.totalInputCents).toBe(200_000);
    expect(allocation?.components.map((component) => component.amountCents)).toEqual([
      20_000, 50_000, 130_000,
    ]);
  });

  it('reads back the structured explanation facts', async () => {
    await saveOrThrow();

    expect((await readOrThrow())?.allocation.components[1]?.explanation).toEqual({
      code: 'ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL',
      rank: 1,
      requestedAmountCents: 50_000,
    });
  });

  it('reads back the lines in the order they were confirmed', async () => {
    await saveOrThrow();

    expect((await readOrThrow())?.allocation.components.map((line) => line.stableOrder)).toEqual([
      0, 1, 2,
    ]);
  });

  it('reads one snapshot on its own', async () => {
    await saveOrThrow();

    const result = await store.readPlanSnapshot('plan-snapshot-1');

    expect(result.ok && result.value?.id).toBe('plan-snapshot-1');
  });
});

describe('writing a confirmation is one atomic operation', () => {
  /*
   * Decision 098 holding 1. The second write fails because the allocation
   * identifier is already taken, and the snapshot written beside it in the same
   * transaction must go with it.
   */
  it('commits neither record when the second write fails', async () => {
    await saveOrThrow();

    const result = await store.saveConfirmation({
      snapshot: planSnapshotRecord({ id: 'plan-snapshot-2' }),
      allocation: allocationRecord({ planSnapshotId: 'plan-snapshot-2' }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(APPLICATION_ERROR_CODES.APPLICATION_CONFIRMATION_WRITE_FAILED);
    }

    const orphan = await store.readPlanSnapshot('plan-snapshot-2');
    expect(orphan.ok && orphan.value).toBeUndefined();
  });

  /* A confirmed record is immutable: the first one is still the stored one. */
  it('leaves the original confirmation intact after a refused write', async () => {
    await saveOrThrow();

    await store.saveConfirmation({
      snapshot: planSnapshotRecord({ id: 'plan-snapshot-2' }),
      allocation: allocationRecord({ planSnapshotId: 'plan-snapshot-2' }),
    });

    expect((await readOrThrow())?.allocation.planSnapshotId).toBe('plan-snapshot-1');
  });

  it('writes nothing when the allocation would not conserve the paycheck', async () => {
    const result = await store.saveConfirmation({
      snapshot: planSnapshotRecord(),
      allocation: allocationRecord({ totalAllocatedCents: 1 }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(
        APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_CONSERVATION_VIOLATED,
      );
    }

    const snapshot = await store.readPlanSnapshot('plan-snapshot-1');
    expect(snapshot.ok && snapshot.value).toBeUndefined();
  });

  it('refuses a pair whose allocation names a different snapshot', async () => {
    const result = await store.saveConfirmation({
      snapshot: planSnapshotRecord({ id: 'plan-snapshot-9' }),
      allocation: allocationRecord({ planSnapshotId: 'plan-snapshot-1' }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(
        APPLICATION_ERROR_CODES.APPLICATION_CONFIRMATION_SNAPSHOT_MISSING,
      );
    }
  });
});

describe('a stored record this build cannot read', () => {
  /* Decision 098 holding 8: report it, and leave it exactly where it is. */
  it('fails the read and does not delete the record', async () => {
    const damaged = { ...allocationRecord(), totalAllocatedCents: 'lots' };
    await writeRaw('allocations', damaged);

    const result = await store.readConfirmation('allocation-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(
        APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_MALFORMED,
      );
    }

    expect(await readRaw('allocations', 'allocation-1')).toEqual(damaged);
  });

  it('fails the read and does not repair the record', async () => {
    const fromAnotherVersion = { ...allocationRecord(), schemaVersion: 2 };
    await writeRaw('allocations', fromAnotherVersion);

    const result = await store.readConfirmation('allocation-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(
        APPLICATION_ERROR_CODES.APPLICATION_CONFIRMED_RECORD_UNSUPPORTED_SCHEMA_VERSION,
      );
    }

    expect(await readRaw('allocations', 'allocation-1')).toEqual(fromAnotherVersion);
  });

  it('fails the read when a snapshot was written under another version', async () => {
    await writeRaw('plan-snapshots', { ...planSnapshotRecord(), schemaVersion: 2 });
    await writeRaw('allocations', allocationRecord());

    const result = await store.readConfirmation('allocation-1');

    expect(result.ok).toBe(false);
  });

  /*
   * An allocation with no snapshot cannot be read against current rules, so it
   * is not read at all (holding 4; Invariants 9 and 12).
   */
  it('refuses an allocation whose snapshot is not stored', async () => {
    await writeRaw('allocations', allocationRecord());

    const result = await store.readConfirmation('allocation-1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(
        APPLICATION_ERROR_CODES.APPLICATION_CONFIRMATION_SNAPSHOT_MISSING,
      );
    }
  });
});

describe('historical fidelity', () => {
  /*
   * The property the whole record exists for, proved at the persistence layer:
   * a confirmed paycheck keeps the plan it was confirmed against, whatever the
   * current plan becomes afterwards.
   *
   * Nothing here re-resolves anything. The stored snapshot is compared with the
   * resolved set that was confirmed, and the current plan is resolved
   * separately only to show the two genuinely differ.
   */
  it('keeps the confirmed plan after the current plan changes', async () => {
    const confirmedPlan = resolvedRuleSetFor();
    await saveOrThrow({
      snapshot: planSnapshotRecord({ resolvedRuleSet: confirmedPlan }),
      allocation: allocationRecord(),
    });

    const changedPlan = resolvedRuleSetFor({
      givingPercent: '20',
      priorities: [
        { id: 'bucket-emergency-fund', label: 'Emergency Fund', amountPerPaycheck: '900', rank: 1 },
      ],
      leftoverLabel: 'Everyday spending',
    });

    const stored = (await readOrThrow())?.snapshot.resolvedRuleSet;

    expect(stored).toEqual(confirmedPlan);
    expect(stored).not.toEqual(changedPlan);
  });

  it('keeps the confirmed amounts after the current plan changes', async () => {
    await saveOrThrow();

    resolvedRuleSetFor({
      givingPercent: '20',
      priorities: [
        { id: 'bucket-emergency-fund', label: 'Emergency Fund', amountPerPaycheck: '900', rank: 1 },
      ],
      leftoverLabel: 'Everyday spending',
    });

    expect((await readOrThrow())?.allocation.components.map((line) => line.amountCents)).toEqual([
      20_000, 50_000, 130_000,
    ]);
  });

  /* The obligation rate stored inside the snapshot is the one that applied. */
  it('keeps the rate the confirmed paycheck was allocated under', async () => {
    await saveOrThrow();

    const stored = (await readOrThrow())?.snapshot.resolvedRuleSet;

    expect(stored?.globalObligations[0]?.rateBasisPoints).toBe(1_000);
  });
});
