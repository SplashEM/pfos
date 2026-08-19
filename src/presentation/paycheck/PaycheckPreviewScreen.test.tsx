import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { EditablePaycheckPlanStorage } from '@application/paycheck/editable-paycheck-plan-storage';
import {
  DEFAULT_PAYCHECK_PLAN,
  type EditablePaycheckPlan,
} from '@application/paycheck/paycheck-plan';
import type {
  AllocationRecord,
  PlanSnapshotRecord,
} from '@application/persistence/confirmed-paycheck-records';
import type { ConfirmedPaycheckStore } from '@application/persistence/confirmed-paycheck-store';
import { domainError } from '@domain/shared/errors/domain-error';
import { err, ok } from '@domain/shared/errors/result';
import { asEntityId } from '@domain/shared/ids/entity-id';
import type { IdGenerator } from '@domain/shared/ids/id-generator';

import { PaycheckPreviewScreen } from './PaycheckPreviewScreen';

/*
 * An in-memory stand-in for the storage port.
 *
 * The presentation layer must not reach infrastructure (PFOS-ENG-00 §4.1), and
 * these tests are about what the screen does with the contract rather than
 * where a browser keeps the bytes. The real adapter has its own tests, and the
 * end-to-end suite proves the two together in a real browser.
 */
function createMemoryPlanStorage(): EditablePaycheckPlanStorage {
  let saved: EditablePaycheckPlan | undefined;

  return {
    load: () => saved ?? DEFAULT_PAYCHECK_PLAN,
    save: (plan) => {
      saved = plan;
    },
    clear: () => {
      saved = undefined;
    },
  };
}

/**
 * An in-memory stand-in for the confirmed-paycheck store.
 *
 * It keeps whole records the way the real adapter does, and refuses to overwrite
 * an identifier for the same reason, but it is not the adapter: validation,
 * atomicity and IndexedDB itself are proved against the real implementation in
 * its own tests and in the browser suite. What these tests are about is what
 * the screen does with the contract.
 */
function createMemoryConfirmedPaycheckStore(): ConfirmedPaycheckStore & {
  fail: (summary?: string) => void;
  saved: () => number;
} {
  const snapshots = new Map<string, PlanSnapshotRecord>();
  const allocations: AllocationRecord[] = [];
  let failure: string | undefined;

  function refuse(summary: string) {
    return err(
      domainError({
        code: 'APPLICATION_CONFIRMATION_WRITE_FAILED',
        category: 'PERSISTENCE',
        summary,
      }),
    );
  }

  return {
    fail: (summary = 'This paycheck was not saved. Nothing was recorded.') => {
      failure = summary;
    },
    saved: () => allocations.length,
    saveConfirmation: (records) => {
      if (failure !== undefined) {
        return Promise.resolve(refuse(failure));
      }
      if (allocations.some((entry) => entry.id === records.allocation.id)) {
        return Promise.resolve(refuse('This paycheck was not saved. Nothing was recorded.'));
      }

      snapshots.set(records.snapshot.id, records.snapshot);
      allocations.push(records.allocation);

      return Promise.resolve(ok(undefined));
    },
    readConfirmation: (allocationId) => {
      const allocation = allocations.find((entry) => entry.id === allocationId);
      const snapshot =
        allocation === undefined ? undefined : snapshots.get(allocation.planSnapshotId);

      return Promise.resolve(
        ok(
          allocation === undefined || snapshot === undefined ? undefined : { snapshot, allocation },
        ),
      );
    },
    readLatestConfirmation: () => {
      const allocation = [...allocations].sort(
        (a, b) =>
          a.confirmedAt.epochMilliseconds - b.confirmedAt.epochMilliseconds ||
          a.id.localeCompare(b.id),
      )[allocations.length - 1];
      const snapshot =
        allocation === undefined ? undefined : snapshots.get(allocation.planSnapshotId);

      return Promise.resolve(
        ok(
          allocation === undefined || snapshot === undefined ? undefined : { snapshot, allocation },
        ),
      );
    },
    readPlanSnapshot: (snapshotId) => Promise.resolve(ok(snapshots.get(snapshotId))),
  };
}

/** Identifiers in order, so a test can name the record it expects. */
function createSequentialIdGenerator(): IdGenerator {
  let issued = 0;

  return {
    next: () => {
      issued += 1;
      return asEntityId(`record-${String(issued)}`);
    },
  };
}

let planStorage: EditablePaycheckPlanStorage;
let confirmedPaychecks: ReturnType<typeof createMemoryConfirmedPaycheckStore>;
let ids: IdGenerator;

beforeEach(() => {
  planStorage = createMemoryPlanStorage();
  confirmedPaychecks = createMemoryConfirmedPaycheckStore();
  ids = createSequentialIdGenerator();
});

/** Renders the screen against the current stand-ins. */
function renderScreen(): void {
  render(
    <PaycheckPreviewScreen
      planStorage={planStorage}
      confirmedPaychecks={confirmedPaychecks}
      ids={ids}
    />,
  );
}

/** Presses Confirm and lets the write settle. */
async function confirmPaycheckOnScreen(): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: 'Confirm paycheck' }));
  await screen.findByText('Paycheck confirmed and saved on this device.');
}

/*
 * `fireEvent` rather than user-event: the repository configures
 * @testing-library/react and no user-event package, and this screen has two
 * inputs and one button, so nothing here needs the richer interaction model.
 */
function enterPaycheck(amount: string, eventDate = '2026-01-15'): void {
  fireEvent.change(screen.getByLabelText('Paycheck amount'), { target: { value: amount } });
  fireEvent.change(screen.getByLabelText('Paycheck date'), { target: { value: eventDate } });
  fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
}

/** Edits one plan field without pressing Preview. */
function editPlan(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

/**
 * The rendered rows as [label, amount] pairs, in display order.
 *
 * A row header carries the destination name and, under it, the reason the line
 * received what it did. Only the name is read here; the explanations have their
 * own tests, and folding them into every row assertion would make each one
 * restate text it is not about.
 */
function renderedRows(): readonly (readonly string[])[] {
  return screen.getAllByRole('row').flatMap((row) => {
    const scope = within(row);
    const cells = [...scope.queryAllByRole('rowheader'), ...scope.queryAllByRole('cell')];

    /* The heading row carries column headers rather than a label and an amount. */
    if (cells.length !== 2) {
      return [];
    }

    return [
      cells.map((cell) => {
        const label = cell.querySelector('.destination');
        return (label ?? cell).textContent ?? '';
      }),
    ];
  });
}

describe('the paycheck preview screen', () => {
  it('shows the form before anything is previewed', () => {
    renderScreen();

    expect(screen.getByLabelText('Paycheck amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Paycheck date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  /*
   * The product target on screen. Every figure below is produced by the real
   * authored-rules path and formatted by the domain, so this fails if the
   * resolver or the executor changes an answer.
   */
  it('shows where a $2,000 paycheck goes', () => {
    renderScreen();
    enterPaycheck('2000');

    expect(renderedRows()).toEqual([
      ['Giving', '$200.00'],
      ['Emergency Fund', '$500.00'],
      ['Spending', '$1,300.00'],
      ['Total allocated', '$2,000.00'],
      ['Unallocated', '$0.00'],
    ]);
  });

  /*
   * Proves the screen is not holding a computed answer: a different paycheck
   * re-runs the domain, so the 10% obligation moves while the fixed $500
   * requirement does not.
   */
  it('recomputes through the domain when the amount changes', () => {
    renderScreen();

    enterPaycheck('2000');
    expect(renderedRows()).toContainEqual(['Giving', '$200.00']);

    enterPaycheck('1000');
    expect(renderedRows()).toEqual([
      ['Giving', '$100.00'],
      ['Emergency Fund', '$500.00'],
      ['Spending', '$400.00'],
      ['Total allocated', '$1,000.00'],
      ['Unallocated', '$0.00'],
    ]);
  });

  it('names destinations rather than showing bucket identifiers', () => {
    renderScreen();
    enterPaycheck('2000');

    expect(within(screen.getByRole('table')).getByText('Emergency Fund')).toBeInTheDocument();
    expect(screen.queryByText(/bucket-/)).not.toBeInTheDocument();
  });

  it('shows the message the domain supplied when the amount is not a number', () => {
    renderScreen();
    enterPaycheck('two thousand');

    expect(screen.getByRole('alert')).toHaveTextContent('That is not a valid dollar amount.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('refuses a paycheck of zero', () => {
    renderScreen();
    enterPaycheck('0');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a paycheck amount greater than zero.',
    );
  });

  it('clears a previous error once a valid paycheck is previewed', () => {
    renderScreen();

    enterPaycheck('nonsense');
    expect(screen.getByRole('alert')).toBeInTheDocument();

    enterPaycheck('2000');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('replaces a stale preview with the error when input becomes invalid', () => {
    renderScreen();

    enterPaycheck('2000');
    expect(screen.getByRole('table')).toBeInTheDocument();

    enterPaycheck('-1');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  /*
   * A preview proposes, and confirming records that proposal in PFOS. Neither
   * moves money, and no button may suggest otherwise: Constitution Principle 8
   * keeps physical money and virtual planning apart.
   *
   * This once asserted that no button mentioned confirming at all, which was
   * true while confirming did not exist. Decision 098 and the confirmation
   * slice make it a feature rather than a hazard, so what is checked now is the
   * part that has not changed.
   */
  it('offers nothing that claims to move money', () => {
    renderScreen();
    enterPaycheck('2000');

    const labels = screen.getAllByRole('button').map((button) => button.textContent ?? '');

    expect(labels).toContain('Preview');
    for (const label of labels) {
      expect(label).not.toMatch(/transfer|send money|pay |withdraw|deposit/i);
    }

    expect(screen.getByText(/Nothing is saved and no money moves/)).toBeInTheDocument();
  });

  it('says plainly where the plan settings are kept', () => {
    renderScreen();

    expect(screen.getByText('Plan settings are saved on this device.')).toBeInTheDocument();
    expect(
      screen.queryByText('Preview settings reset when you reload the page.'),
    ).not.toBeInTheDocument();
  });
});

describe('editing the plan', () => {
  it('offers the three plan controls with their starting values', () => {
    renderScreen();

    expect(screen.getByLabelText('Giving')).toHaveValue('10');
    expect(screen.getByLabelText('Priority 1 name')).toHaveValue('Emergency Fund');
    expect(screen.getByLabelText('Priority 1 amount')).toHaveValue('500.00');
    expect(screen.getByLabelText('Everything left over goes to')).toHaveValue('Spending');
  });

  /*
   * The whole point of the slice: a changed plan produces a changed answer, and
   * it can only do so by reaching the authored rules, because nothing on this
   * screen can multiply.
   */
  it('changes the preview when the giving percentage changes', () => {
    renderScreen();

    enterPaycheck('2000');
    expect(renderedRows()).toContainEqual(['Giving', '$200.00']);

    editPlan('Giving', '12');
    enterPaycheck('2000');

    expect(renderedRows()).toEqual([
      ['Giving', '$240.00'],
      ['Emergency Fund', '$500.00'],
      ['Spending', '$1,260.00'],
      ['Total allocated', '$2,000.00'],
      ['Unallocated', '$0.00'],
    ]);
  });

  it('changes the preview when the emergency-fund amount changes', () => {
    renderScreen();

    editPlan('Giving', '12');
    editPlan('Priority 1 amount', '600');
    enterPaycheck('2000');

    expect(renderedRows()).toEqual([
      ['Giving', '$240.00'],
      ['Emergency Fund', '$600.00'],
      ['Spending', '$1,160.00'],
      ['Total allocated', '$2,000.00'],
      ['Unallocated', '$0.00'],
    ]);
  });

  it('renames the leftover destination in the result', () => {
    renderScreen();

    editPlan('Everything left over goes to', 'Everyday spending');
    enterPaycheck('2000');

    expect(renderedRows()).toContainEqual(['Everyday spending', '$1,300.00']);
    expect(renderedRows()).not.toContainEqual(['Spending', '$1,300.00']);
  });

  it('explains a percentage it cannot use', () => {
    renderScreen();

    editPlan('Giving', 'lots');
    enterPaycheck('2000');

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a percentage such as 10 or 12.5.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  /* The 0%-to-100% bound belongs to the domain, and its wording reaches the screen. */
  it('explains a percentage above 100', () => {
    renderScreen();

    editPlan('Giving', '150');
    enterPaycheck('2000');

    expect(screen.getByRole('alert')).toHaveTextContent('A rate must be between 0% and 100%.');
  });

  it('explains a negative funding amount', () => {
    renderScreen();

    editPlan('Priority 1 amount', '-100');
    enterPaycheck('2000');

    expect(screen.getByRole('alert')).toHaveTextContent('A funding amount cannot be negative.');
  });

  it('explains a blank destination name', () => {
    renderScreen();

    editPlan('Everything left over goes to', '  ');
    enterPaycheck('2000');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Name the destination that receives what is left.',
    );
  });
});

describe('managing top priorities', () => {
  /** Presses a button by its exact name. */
  function press(name: string, nth = 0): void {
    const buttons = screen.getAllByRole('button', { name });
    const button = buttons[nth];
    if (button === undefined) {
      throw new Error(`No button named ${name} at position ${String(nth)}.`);
    }
    fireEvent.click(button);
  }

  it('starts with one priority', () => {
    renderScreen();

    expect(screen.getByLabelText('Priority 1 name')).toHaveValue('Emergency Fund');
    expect(screen.queryByLabelText('Priority 2 name')).not.toBeInTheDocument();
  });

  it('adds a second priority and funds it', () => {
    renderScreen();

    press('Add priority');
    fireEvent.change(screen.getByLabelText('Priority 2 name'), { target: { value: 'Laptop' } });
    fireEvent.change(screen.getByLabelText('Priority 2 amount'), { target: { value: '300' } });
    enterPaycheck('2000');

    expect(renderedRows()).toEqual([
      ['Giving', '$200.00'],
      ['Emergency Fund', '$500.00'],
      ['Laptop', '$300.00'],
      ['Spending', '$1,000.00'],
      ['Total allocated', '$2,000.00'],
      ['Unallocated', '$0.00'],
    ]);
  });

  /* Ordering only shows when the paycheck cannot cover both requirements. */
  it('funds the top-ranked priority first when money runs short', () => {
    renderScreen();

    fireEvent.change(screen.getByLabelText('Priority 1 amount'), { target: { value: '1000' } });
    press('Add priority');
    fireEvent.change(screen.getByLabelText('Priority 2 name'), { target: { value: 'Laptop' } });
    fireEvent.change(screen.getByLabelText('Priority 2 amount'), { target: { value: '300' } });
    enterPaycheck('1200');

    expect(renderedRows()).toContainEqual(['Emergency Fund', '$1,000.00']);
    expect(renderedRows()).toContainEqual(['Laptop', '$80.00']);

    press('Move up', 1);
    enterPaycheck('1200');

    expect(renderedRows()).toContainEqual(['Laptop', '$300.00']);
    expect(renderedRows()).toContainEqual(['Emergency Fund', '$780.00']);
  });

  it('reorders the rows on screen when a priority moves', () => {
    renderScreen();

    press('Add priority');
    fireEvent.change(screen.getByLabelText('Priority 2 name'), { target: { value: 'Laptop' } });

    press('Move up', 1);

    expect(screen.getByLabelText('Priority 1 name')).toHaveValue('Laptop');
    expect(screen.getByLabelText('Priority 2 name')).toHaveValue('Emergency Fund');
  });

  it('removes a priority', () => {
    renderScreen();

    press('Add priority');
    fireEvent.change(screen.getByLabelText('Priority 2 name'), { target: { value: 'Laptop' } });
    press('Remove', 0);

    expect(screen.getByLabelText('Priority 1 name')).toHaveValue('Laptop');
    expect(screen.queryByLabelText('Priority 2 name')).not.toBeInTheDocument();
  });

  /* PFOS-ENG-01 §13.1: three is the most, so the control stops being offered. */
  it('stops offering Add priority at three', () => {
    renderScreen();

    press('Add priority');
    press('Add priority');

    expect(screen.queryByRole('button', { name: 'Add priority' })).not.toBeInTheDocument();
    expect(
      screen.getByText('Three top priorities is the most a plan can have.'),
    ).toBeInTheDocument();
  });

  it('disables moving beyond the ends of the list', () => {
    renderScreen();
    press('Add priority');

    const moveUp = screen.getAllByRole('button', { name: 'Move up' });
    const moveDown = screen.getAllByRole('button', { name: 'Move down' });

    expect(moveUp[0]).toBeDisabled();
    expect(moveDown[1]).toBeDisabled();
  });

  it('explains a priority left without a name', () => {
    renderScreen();

    press('Add priority');
    fireEvent.change(screen.getByLabelText('Priority 2 amount'), { target: { value: '300' } });
    enterPaycheck('2000');

    expect(screen.getByRole('alert')).toHaveTextContent('Give every priority a name.');
  });

  /* Decision 075: a plan with no top priorities is valid, so this is allowed. */
  it('allows removing the last priority', () => {
    renderScreen();

    press('Remove', 0);
    enterPaycheck('2000');

    expect(renderedRows()).toEqual([
      ['Giving', '$200.00'],
      ['Spending', '$1,800.00'],
      ['Total allocated', '$2,000.00'],
      ['Unallocated', '$0.00'],
    ]);
  });
});

describe('explaining the preview', () => {
  function press(name: string, nth = 0): void {
    const button = screen.getAllByRole('button', { name })[nth];
    if (button === undefined) {
      throw new Error(`No button named ${name} at position ${String(nth)}.`);
    }
    fireEvent.click(button);
  }

  /** Builds the constrained plan: Laptop $300 first, Emergency Fund $1,000 second. */
  function constrainedPlan(): void {
    fireEvent.change(screen.getByLabelText('Priority 1 amount'), { target: { value: '1000' } });
    press('Add priority');
    fireEvent.change(screen.getByLabelText('Priority 2 name'), { target: { value: 'Laptop' } });
    fireEvent.change(screen.getByLabelText('Priority 2 amount'), { target: { value: '300' } });
    press('Move up', 1);
  }

  it('says why the obligation took what it did', () => {
    renderScreen();
    enterPaycheck('2000');

    expect(screen.getByText('10% of this paycheck.')).toBeInTheDocument();
  });

  it('says a priority was funded in full', () => {
    renderScreen();
    enterPaycheck('2000');

    expect(
      screen.getByText('Priority 1 · Requested $500.00 · Funded in full.'),
    ).toBeInTheDocument();
  });

  it('says why a priority received less than it asked for', () => {
    renderScreen();
    constrainedPlan();
    enterPaycheck('1200');

    expect(
      screen.getByText(
        'Priority 2 · Requested $1,000.00 · Only $780.00 remained when this priority was reached.',
      ),
    ).toBeInTheDocument();
  });

  /* The explanation shown must match the amount beside it, whatever the order. */
  it('moves the explanation with the order', () => {
    renderScreen();
    constrainedPlan();
    press('Move up', 1);
    enterPaycheck('1200');

    expect(renderedRows()).toContainEqual(['Emergency Fund', '$1,000.00']);
    expect(
      screen.getByText('Priority 1 · Requested $1,000.00 · Funded in full.'),
    ).toBeInTheDocument();
  });

  it('explains the leftover destination', () => {
    renderScreen();
    enterPaycheck('2000');

    expect(
      screen.getByText('Receives whatever remains after everything above.'),
    ).toBeInTheDocument();
  });
});

describe('summarizing the whole plan', () => {
  function press(name: string, nth = 0): void {
    const button = screen.getAllByRole('button', { name })[nth];
    if (button === undefined) {
      throw new Error(`No button named ${name} at position ${String(nth)}.`);
    }
    fireEvent.click(button);
  }

  /** The constrained plan again: Laptop $300 first, Emergency Fund $1,000 second. */
  function constrainedPlan(): void {
    fireEvent.change(screen.getByLabelText('Priority 1 amount'), { target: { value: '1000' } });
    press('Add priority');
    fireEvent.change(screen.getByLabelText('Priority 2 name'), { target: { value: 'Laptop' } });
    fireEvent.change(screen.getByLabelText('Priority 2 amount'), { target: { value: '300' } });
    press('Move up', 1);
  }

  const SUMMARY =
    'Not every top priority could be fully funded from this paycheck: they requested ' +
    '$1,300.00 in total and received $1,080.00.';

  it('says the plan did not fit before the rows that show it', () => {
    renderScreen();
    constrainedPlan();
    enterPaycheck('1200');

    expect(screen.getByText(SUMMARY)).toBeInTheDocument();
  });

  /* The summary is the plan-level view; the row still says why that row is short. */
  it('keeps the per-line reason underneath it', () => {
    renderScreen();
    constrainedPlan();
    enterPaycheck('1200');

    expect(screen.getByText(SUMMARY)).toBeInTheDocument();
    expect(
      screen.getByText(
        'Priority 2 · Requested $1,000.00 · Only $780.00 remained when this priority was reached.',
      ),
    ).toBeInTheDocument();
  });

  /* Information, not a validation failure: it must not be announced as an alert. */
  it('does not present the summary as an error', () => {
    renderScreen();
    constrainedPlan();
    enterPaycheck('1200');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows nothing when every priority was funded in full', () => {
    renderScreen();
    constrainedPlan();
    enterPaycheck('2000');

    expect(screen.queryByText(/could be fully funded/)).not.toBeInTheDocument();
  });

  /* A bigger paycheck removes the summary without the plan changing. */
  it('drops the summary once the paycheck covers everything', () => {
    renderScreen();
    constrainedPlan();
    enterPaycheck('1200');

    expect(screen.getByText(SUMMARY)).toBeInTheDocument();

    enterPaycheck('2000');

    expect(screen.queryByText(SUMMARY)).not.toBeInTheDocument();
  });
});

describe('confirming a paycheck', () => {
  function press(name: string, nth = 0): void {
    const button = screen.getAllByRole('button', { name })[nth];
    if (button === undefined) {
      throw new Error(`No button named ${name} at position ${String(nth)}.`);
    }
    fireEvent.click(button);
  }

  /** The plan the fidelity test uses: Emergency Fund $500, then Laptop $300. */
  function twoPriorityPlan(): void {
    press('Add priority');
    fireEvent.change(screen.getByLabelText('Priority 2 name'), { target: { value: 'Laptop' } });
    fireEvent.change(screen.getByLabelText('Priority 2 amount'), { target: { value: '300' } });
  }

  /** The allocation rows of one section, as [label, amount] pairs. */
  function rowsUnder(heading: string): readonly (readonly string[])[] {
    const section = screen.getByRole('region', { name: heading });

    return [...section.querySelectorAll('tbody tr')].map((row) =>
      [...row.querySelectorAll('th, td')].map((cell) => {
        const label = cell.querySelector('.destination');
        return (label ?? cell).textContent ?? '';
      }),
    );
  }

  it('offers no way to confirm before a preview exists', () => {
    renderScreen();

    expect(screen.queryByRole('button', { name: 'Confirm paycheck' })).not.toBeInTheDocument();
  });

  /* A preview is a proposal: looking at one must record nothing. */
  it('records nothing when a paycheck is only previewed', () => {
    renderScreen();
    enterPaycheck('2000');

    expect(confirmedPaychecks.saved()).toBe(0);
    expect(
      screen.queryByRole('region', { name: 'Latest confirmed paycheck' }),
    ).not.toBeInTheDocument();
  });

  it('offers to confirm once a preview is on screen', () => {
    renderScreen();
    enterPaycheck('2000');

    expect(screen.getByRole('button', { name: 'Confirm paycheck' })).toBeInTheDocument();
  });

  it('records one confirmation when a person confirms', async () => {
    renderScreen();
    enterPaycheck('2000');
    await confirmPaycheckOnScreen();

    expect(confirmedPaychecks.saved()).toBe(1);
  });

  it('shows the saved paycheck after confirming', async () => {
    renderScreen();
    enterPaycheck('2000');
    await confirmPaycheckOnScreen();

    expect(rowsUnder('Latest confirmed paycheck')).toEqual([
      ['Giving', '$200.00'],
      ['Emergency Fund', '$500.00'],
      ['Spending', '$1,300.00'],
    ]);
  });

  it('keeps the reason under each saved line', async () => {
    renderScreen();
    enterPaycheck('2000');
    await confirmPaycheckOnScreen();

    const saved = screen.getByRole('region', { name: 'Latest confirmed paycheck' });

    expect(
      within(saved).getByText('Priority 1 · Requested $500.00 · Funded in full.'),
    ).toBeInTheDocument();
    expect(within(saved).getByText('10% of this paycheck.')).toBeInTheDocument();
  });

  it('shows the paycheck amount and date it was confirmed for', async () => {
    renderScreen();
    enterPaycheck('2000');
    await confirmPaycheckOnScreen();

    const saved = screen.getByRole('region', { name: 'Latest confirmed paycheck' });

    expect(within(saved).getByText(/\$2,000\.00 on 2026-01-15/)).toBeInTheDocument();
  });

  it('shows the totals from the stored record', async () => {
    renderScreen();
    enterPaycheck('2000');
    await confirmPaycheckOnScreen();

    const saved = screen.getByRole('region', { name: 'Latest confirmed paycheck' });

    expect(within(saved).getByText('Total allocated').closest('tr')).toHaveTextContent('$2,000.00');
    expect(within(saved).getByText('Unallocated').closest('tr')).toHaveTextContent('$0.00');
  });

  /*
   * The mandatory historical-fidelity case. A confirmed paycheck is recorded,
   * the plan behind it is then changed beyond recognition, and the saved
   * paycheck must still be the one that was confirmed.
   */
  it('leaves the confirmed paycheck alone when the plan changes afterwards', async () => {
    renderScreen();
    twoPriorityPlan();
    enterPaycheck('2000');

    expect(rowsUnder('Preview')).toEqual([
      ['Giving', '$200.00'],
      ['Emergency Fund', '$500.00'],
      ['Laptop', '$300.00'],
      ['Spending', '$1,000.00'],
    ]);

    await confirmPaycheckOnScreen();

    editPlan('Giving', '20');
    editPlan('Priority 1 amount', '900');
    editPlan('Priority 2 name', 'Camera');
    press('Move up', 1);

    expect(rowsUnder('Latest confirmed paycheck')).toEqual([
      ['Giving', '$200.00'],
      ['Emergency Fund', '$500.00'],
      ['Camera', '$300.00'],
      ['Spending', '$1,000.00'],
    ]);
  });

  /* The stored record survives the screen being thrown away and rebuilt. */
  it('shows the confirmed paycheck again after a reload', async () => {
    renderScreen();
    enterPaycheck('2000');
    await confirmPaycheckOnScreen();

    cleanup();
    renderScreen();

    await screen.findByRole('region', { name: 'Latest confirmed paycheck' });

    expect(rowsUnder('Latest confirmed paycheck')).toEqual([
      ['Giving', '$200.00'],
      ['Emergency Fund', '$500.00'],
      ['Spending', '$1,300.00'],
    ]);
  });

  /*
   * A proposal may only be confirmed while it is still the one on screen.
   * Changing the plan withdraws the offer until Preview is pressed again.
   */
  it('withdraws the offer to confirm when the plan changes', () => {
    renderScreen();
    enterPaycheck('2000');

    expect(screen.getByRole('button', { name: 'Confirm paycheck' })).toBeInTheDocument();

    editPlan('Giving', '15');

    expect(screen.queryByRole('button', { name: 'Confirm paycheck' })).not.toBeInTheDocument();
    expect(
      screen.getByText('The plan or paycheck changed. Preview again to confirm what you see now.'),
    ).toBeInTheDocument();
  });

  it('withdraws the offer to confirm when the paycheck amount changes', () => {
    renderScreen();
    enterPaycheck('2000');

    fireEvent.change(screen.getByLabelText('Paycheck amount'), { target: { value: '2500' } });

    expect(screen.queryByRole('button', { name: 'Confirm paycheck' })).not.toBeInTheDocument();
  });

  it('offers to confirm again once the preview is refreshed', () => {
    renderScreen();
    enterPaycheck('2000');
    editPlan('Giving', '15');
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));

    expect(screen.getByRole('button', { name: 'Confirm paycheck' })).toBeInTheDocument();
  });

  /* Ordinary double-click safety, not financial deduplication. */
  it('disables the button while the confirmation is being written', () => {
    renderScreen();
    enterPaycheck('2000');

    fireEvent.click(screen.getByRole('button', { name: 'Confirm paycheck' }));

    expect(screen.getByRole('button', { name: 'Confirming…' })).toBeDisabled();
  });

  it('records one paycheck when the button is clicked twice', async () => {
    renderScreen();
    enterPaycheck('2000');

    const button = screen.getByRole('button', { name: 'Confirm paycheck' });
    fireEvent.click(button);
    fireEvent.click(button);

    await screen.findByText('Paycheck confirmed and saved on this device.');

    expect(confirmedPaychecks.saved()).toBe(1);
  });

  /* A failed write is reported, and nothing claims a paycheck was saved. */
  it('says nothing was saved when the write fails', async () => {
    renderScreen();
    enterPaycheck('2000');
    confirmedPaychecks.fail();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm paycheck' }));

    await screen.findByRole('alert');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This paycheck was not saved. Nothing was recorded.',
    );
    expect(
      screen.queryByText('Paycheck confirmed and saved on this device.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Latest confirmed paycheck' }),
    ).not.toBeInTheDocument();
  });

  /* Constitution Principle 8: planning is not payment. */
  it('never says that money moved', async () => {
    renderScreen();
    enterPaycheck('2000');
    await confirmPaycheckOnScreen();

    expect(document.body.textContent).not.toMatch(
      /transferred|funds moved|transaction complete|bank updated|payment sent/i,
    );
    expect(screen.getAllByText(/PFOS does not move money/).length).toBeGreaterThan(0);
  });
});

describe('remembering the plan', () => {
  /** Throws the screen away and builds a new one, as a reload would. */
  function reload(): void {
    cleanup();
    renderScreen();
  }

  it('brings the edited plan back on a fresh visit', () => {
    renderScreen();

    editPlan('Giving', '12');
    editPlan('Priority 1 amount', '600');
    editPlan('Everything left over goes to', 'Everyday spending');

    reload();

    expect(screen.getByLabelText('Giving')).toHaveValue('12');
    expect(screen.getByLabelText('Priority 1 amount')).toHaveValue('600');
    expect(screen.getByLabelText('Everything left over goes to')).toHaveValue('Everyday spending');
  });

  /*
   * The restored values are authored rules again on the next preview, not a
   * remembered answer: nothing about the previous result was stored.
   */
  it('previews the remembered plan through the whole domain path', () => {
    renderScreen();

    editPlan('Giving', '12');
    editPlan('Priority 1 amount', '600');
    editPlan('Everything left over goes to', 'Everyday spending');

    reload();
    enterPaycheck('2000');

    expect(renderedRows()).toEqual([
      ['Giving', '$240.00'],
      ['Emergency Fund', '$600.00'],
      ['Everyday spending', '$1,160.00'],
      ['Total allocated', '$2,000.00'],
      ['Unallocated', '$0.00'],
    ]);
  });

  it('returns to the starting plan once the device forgets it', () => {
    renderScreen();
    editPlan('Giving', '12');

    planStorage.clear();
    reload();

    expect(screen.getByLabelText('Giving')).toHaveValue('10');
    expect(screen.getByLabelText('Priority 1 amount')).toHaveValue('500.00');
    expect(screen.getByLabelText('Everything left over goes to')).toHaveValue('Spending');
  });

  it('brings back a second priority and its order', () => {
    renderScreen();

    fireEvent.click(screen.getByRole('button', { name: 'Add priority' }));
    fireEvent.change(screen.getByLabelText('Priority 2 name'), { target: { value: 'Laptop' } });
    fireEvent.change(screen.getByLabelText('Priority 2 amount'), { target: { value: '300' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Move up' })[1] as HTMLElement);

    reload();

    expect(screen.getByLabelText('Priority 1 name')).toHaveValue('Laptop');
    expect(screen.getByLabelText('Priority 2 name')).toHaveValue('Emergency Fund');
    expect(screen.getByLabelText('Priority 1 amount')).toHaveValue('300');
  });

  it('remembers nothing about the paycheck or its preview', () => {
    renderScreen();
    enterPaycheck('1234');

    reload();

    expect(screen.getByLabelText('Paycheck amount')).toHaveValue('2,000.00');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
