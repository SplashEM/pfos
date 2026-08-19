import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';
import type { IdGenerator } from '@domain/shared/ids/id-generator';
import { createIndexedDbConfirmedPaycheckStore } from '@infrastructure/persistence/indexed-db-confirmed-paycheck-store';

import { confirmPaycheck } from '@application/paycheck/confirm-paycheck';
import { toConfirmedPaycheckView } from '@application/paycheck/confirmed-paycheck-view';
import {
  DEFAULT_PAYCHECK_PLAN,
  type EditablePaycheckPlan,
  type EditablePriority,
} from '@application/paycheck/paycheck-plan';
import {
  previewPaycheckAllocation,
  type PaycheckPreviewRequest,
} from '@application/paycheck/preview-paycheck-allocation';
import type { ConfirmedPaycheckStore } from '@application/persistence/confirmed-paycheck-store';

/*
 * The confirmation path end to end (PFOS-ENG-00 §31.2): the engine produces a
 * proposal, the application records it, the real IndexedDB store keeps it, and
 * the record is read back and formatted — the same journey the screen makes.
 *
 * It lives here rather than beside the use case because it reaches across
 * layers on purpose. §44 keeps the application layer from importing
 * infrastructure, and an integration test is where the two are allowed to meet.
 */

/* Fixed moments, so nothing here reads a clock. */
const REQUESTED_AT = 1_767_225_600_000;
const CONFIRMED_AT = 1_767_225_660_000;

let store: ConfirmedPaycheckStore;
let ids: IdGenerator;
let databaseCounter = 0;

beforeEach(() => {
  databaseCounter += 1;
  store = createIndexedDbConfirmedPaycheckStore(`pfos-confirm-test-${String(databaseCounter)}`);

  let issued = 0;
  ids = {
    next: () => {
      issued += 1;
      return asEntityId(`record-${String(issued)}`);
    },
  };
});

function priority(
  id: string,
  label: string,
  amountPerPaycheck: string,
  rank: number,
): EditablePriority {
  return { id, label, amountPerPaycheck, rank };
}

/** The plan the fidelity case uses: Emergency Fund $500, then Laptop $300. */
const TWO_PRIORITY_PLAN: EditablePaycheckPlan = {
  ...DEFAULT_PAYCHECK_PLAN,
  priorities: [
    priority('bucket-emergency-fund', 'Emergency Fund', '500', 1),
    priority('bucket-laptop', 'Laptop', '300', 2),
  ],
};

function request(overrides: Partial<PaycheckPreviewRequest> = {}): PaycheckPreviewRequest {
  return {
    plan: TWO_PRIORITY_PLAN,
    amount: '2000',
    eventDate: '2026-01-15',
    requestedAt: REQUESTED_AT,
    timeZone: 'America/Los_Angeles',
    ...overrides,
  };
}

/** Previews a paycheck, failing loudly if the plan cannot be previewed. */
function preview(input: PaycheckPreviewRequest = request()) {
  const result = previewPaycheckAllocation(input);
  if (!result.ok) {
    throw new Error(`Preview failed: ${result.error.code}`);
  }
  return result.value;
}

/** Previews and confirms, failing loudly if either step fails. */
async function confirm(input: PaycheckPreviewRequest = request()) {
  const result = await confirmPaycheck({
    proposal: preview(input).confirmable,
    confirmedAt: CONFIRMED_AT,
    timeZone: 'America/Los_Angeles',
    ids,
    store,
  });

  if (!result.ok) {
    throw new Error(`Confirmation failed: ${result.error.code} — ${result.error.details}`);
  }

  return result.value;
}

/** Reads the stored confirmation back, failing loudly if there is none. */
async function readBack() {
  const latest = await store.readLatestConfirmation();
  if (!latest.ok) {
    throw new Error(`Read failed: ${latest.error.code}`);
  }
  if (latest.value === undefined) {
    throw new Error('Expected a stored confirmation.');
  }
  return latest.value;
}

describe('confirming a previewed paycheck', () => {
  it('stores nothing until a paycheck is confirmed', async () => {
    preview();

    const latest = await store.readLatestConfirmation();

    expect(latest.ok && latest.value).toBeUndefined();
  });

  it('records the allocation that was previewed', async () => {
    await confirm();

    const stored = await readBack();

    expect(stored.allocation.components.map((line) => line.amountCents)).toEqual([
      20_000, 50_000, 30_000, 100_000,
    ]);
  });

  it('records the totals the engine produced', async () => {
    await confirm();

    const stored = await readBack();

    expect(stored.allocation.totalInputCents).toBe(200_000);
    expect(stored.allocation.totalAllocatedCents).toBe(200_000);
    expect(stored.allocation.totalUnallocatedCents).toBe(0);
  });

  it('records the plan the paycheck was allocated against', async () => {
    const confirmed = await confirm();

    const stored = await readBack();

    expect(stored.snapshot.resolvedRuleSet).toEqual(confirmed.snapshot.resolvedRuleSet);
    expect(stored.snapshot.resolvedRuleSet.globalObligations[0]?.rateBasisPoints).toBe(1_000);
  });

  it('records the structured reason for each line', async () => {
    await confirm();

    const stored = await readBack();

    expect(stored.allocation.components[2]?.explanation).toEqual({
      code: 'ALLOCATION_EXPLAIN_PRIORITY_FUNDED_IN_FULL',
      rank: 2,
      requestedAmountCents: 30_000,
    });
  });

  it('records the order the lines were allocated in', async () => {
    await confirm();

    expect((await readBack()).allocation.components.map((line) => line.stableOrder)).toEqual([
      0, 1, 2, 3,
    ]);
  });

  /* The moment comes from the caller: no domain function reads a clock. */
  it('records the confirmation moment it was given', async () => {
    await confirm();

    expect((await readBack()).allocation.confirmedAt).toEqual({
      epochMilliseconds: CONFIRMED_AT,
      timeZone: 'America/Los_Angeles',
    });
  });

  it('ties the allocation to the snapshot written with it', async () => {
    await confirm();

    const stored = await readBack();

    expect(stored.allocation.planSnapshotId).toBe(stored.snapshot.id);
  });

  it('gives each record an identifier from the generator it was handed', async () => {
    const confirmed = await confirm();

    expect(confirmed.snapshot.id).toBe('record-1');
    expect(confirmed.allocation.id).toBe('record-2');
  });

  it('records a partial funding exactly as it was previewed', async () => {
    const constrained = request({
      plan: {
        ...DEFAULT_PAYCHECK_PLAN,
        priorities: [
          priority('bucket-laptop', 'Laptop', '300', 1),
          priority('bucket-emergency-fund', 'Emergency Fund', '1000', 2),
        ],
      },
      amount: '1200',
    });

    await confirm(constrained);

    const stored = await readBack();

    expect(stored.allocation.components.map((line) => line.amountCents)).toEqual([
      12_000, 30_000, 78_000,
    ]);
    expect(stored.allocation.components[2]?.explanation).toEqual({
      code: 'ALLOCATION_EXPLAIN_PRIORITY_POOL_EXHAUSTED',
      rank: 2,
      requestedAmountCents: 100_000,
    });
  });
});

describe('a confirmed paycheck after the plan changes', () => {
  /* The mandatory case: history is read from the record, never re-resolved. */
  it('still reads as the allocation that was confirmed', async () => {
    await confirm();

    /* The plan changes completely, and is even previewed again. */
    const changed = request({
      plan: {
        givingPercent: '20',
        priorities: [
          priority('bucket-laptop', 'Laptop', '900', 1),
          priority('bucket-emergency-fund', 'Emergency Fund', '100', 2),
        ],
        leftoverLabel: 'Everyday spending',
      },
      amount: '3000',
    });
    preview(changed);

    const view = toConfirmedPaycheckView(await readBack());

    expect(view.lines.map((line) => line.amount)).toEqual([
      '$200.00',
      '$500.00',
      '$300.00',
      '$1,000.00',
    ]);
    expect(view.paycheckAmount).toBe('$2,000.00');
    expect(view.totalAllocated).toBe('$2,000.00');
    expect(view.unallocated).toBe('$0.00');
  });

  it('still reads the reasons it was confirmed with', async () => {
    await confirm();

    const view = toConfirmedPaycheckView(await readBack());

    expect(view.lines.map((line) => line.explanation)).toEqual([
      '10% of this paycheck.',
      'Priority 1 · Requested $500.00 · Funded in full.',
      'Priority 2 · Requested $300.00 · Funded in full.',
      'Receives whatever remains after everything above.',
    ]);
  });

  it('still reads the date the paycheck was allocated against', async () => {
    await confirm();

    expect(toConfirmedPaycheckView(await readBack()).paycheckDate).toBe('2026-01-15');
  });

  /* Destinations read as the names the person confirmed against (Decision 099). */
  it('names each destination as it was named at confirmation', async () => {
    await confirm();

    const view = toConfirmedPaycheckView(await readBack());

    expect(view.lines.map((line) => line.label)).toEqual([
      'Giving',
      'Emergency Fund',
      'Laptop',
      'Spending',
    ]);
  });

  it('stores the name beside each component rather than only on screen', async () => {
    await confirm();

    expect((await readBack()).allocation.components.map((line) => line.destinationLabel)).toEqual([
      'Giving',
      'Emergency Fund',
      'Laptop',
      'Spending',
    ]);
  });
});

describe('renaming a destination after confirming', () => {
  /** The plan with the second priority renamed, as a person would rename it. */
  const RENAMED_PLAN: EditablePaycheckPlan = {
    ...TWO_PRIORITY_PLAN,
    priorities: [
      priority('bucket-emergency-fund', 'Emergency Fund', '500', 1),
      priority('bucket-laptop', 'Vacation', '300', 2),
    ],
  };

  /*
   * The case this must never get wrong: a paycheck confirmed against Laptop
   * must not start reading as Vacation because the plan being edited now says
   * so. Names are not in the record, so the record's own identifier is shown.
   */
  it('does not put the new name inside the paycheck already confirmed', async () => {
    await confirm();

    /* The plan is renamed and previewed again, as a person would. */
    preview(request({ plan: RENAMED_PLAN }));

    const view = toConfirmedPaycheckView(await readBack());

    expect(view.lines.map((line) => line.label)).not.toContain('Vacation');
    expect(view.lines.map((line) => line.label)).toEqual([
      'Giving',
      'Emergency Fund',
      'Laptop',
      'Spending',
    ]);
  });

  /* And the record itself is untouched: the rename wrote nothing. */
  it('leaves the stored record exactly as it was', async () => {
    await confirm();
    const before = await readBack();

    preview(request({ plan: RENAMED_PLAN }));

    expect(await readBack()).toEqual(before);
  });

  it('leaves the confirmed amounts and reasons as they were', async () => {
    await confirm();

    preview(request({ plan: RENAMED_PLAN, amount: '5000' }));

    const view = toConfirmedPaycheckView(await readBack());

    expect(view.lines.map((line) => line.amount)).toEqual([
      '$200.00',
      '$500.00',
      '$300.00',
      '$1,000.00',
    ]);
    expect(view.lines[2]?.explanation).toBe('Priority 2 · Requested $300.00 · Funded in full.');
  });
});

describe('what is confirmed is what was previewed', () => {
  /*
   * Nothing is resolved or allocated a second time at confirmation. The record
   * is built from the proposal the preview carried, so every stored line must
   * match that proposal value for value rather than merely happening to agree
   * with a fresh calculation.
   */
  it('stores the allocation the preview carried', async () => {
    const proposal = preview().confirmable;

    await confirmPaycheck({
      proposal,
      confirmedAt: CONFIRMED_AT,
      timeZone: 'America/Los_Angeles',
      ids,
      store,
    });

    const stored = await readBack();

    expect(stored.allocation.components.map((line) => line.amountCents)).toEqual(
      proposal.allocation.lines.map((line) => line.amount.cents),
    );
    expect(stored.allocation.components.map((line) => line.destinationBucketId)).toEqual(
      proposal.allocation.lines.map((line) => line.bucketId),
    );
    expect(stored.allocation.totalInputCents).toBe(proposal.incomeEvent.netAmount.cents);
  });

  it('stores the plan the preview resolved, not one resolved again', async () => {
    const proposal = preview().confirmable;

    await confirmPaycheck({
      proposal,
      confirmedAt: CONFIRMED_AT,
      timeZone: 'America/Los_Angeles',
      ids,
      store,
    });

    expect((await readBack()).snapshot.resolvedRuleSet).toEqual(proposal.resolvedRuleSet);
  });

  /*
   * A proposal previewed under one plan keeps its own answer even if a
   * different plan is previewed before it is confirmed. The application layer
   * holds the proposal; nothing consults the current plan on the way to
   * storage.
   */
  it('confirms the proposal it was handed, whatever was previewed since', async () => {
    const proposal = preview().confirmable;

    preview(
      request({
        plan: { ...TWO_PRIORITY_PLAN, givingPercent: '40' },
        amount: '9000',
      }),
    );

    await confirmPaycheck({
      proposal,
      confirmedAt: CONFIRMED_AT,
      timeZone: 'America/Los_Angeles',
      ids,
      store,
    });

    const stored = await readBack();

    expect(stored.allocation.totalInputCents).toBe(200_000);
    expect(stored.allocation.components[0]?.amountCents).toBe(20_000);
  });
});

describe('when a confirmation cannot be written', () => {
  it('reports the failure and stores nothing', async () => {
    const proposal = preview().confirmable;

    const first = await confirmPaycheck({
      proposal,
      confirmedAt: CONFIRMED_AT,
      timeZone: 'America/Los_Angeles',
      ids,
      store,
    });
    expect(first.ok).toBe(true);

    /* The same identifiers again: the store refuses to overwrite a record. */
    let reissued = 0;
    const repeatedIds: IdGenerator = {
      next: () => {
        reissued += 1;
        return asEntityId(`record-${String(reissued)}`);
      },
    };

    const second = await confirmPaycheck({
      proposal,
      confirmedAt: CONFIRMED_AT + 1_000,
      timeZone: 'America/Los_Angeles',
      ids: repeatedIds,
      store,
    });

    expect(second.ok).toBe(false);

    /* The first confirmation is untouched. */
    expect((await readBack()).allocation.confirmedAt.epochMilliseconds).toBe(CONFIRMED_AT);
  });
});
