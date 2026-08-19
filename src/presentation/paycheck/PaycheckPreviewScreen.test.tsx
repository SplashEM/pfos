import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { EditablePaycheckPlanStorage } from '@application/paycheck/editable-paycheck-plan-storage';
import {
  DEFAULT_PAYCHECK_PLAN,
  type EditablePaycheckPlan,
} from '@application/paycheck/paycheck-plan';

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

let planStorage: EditablePaycheckPlanStorage;

beforeEach(() => {
  planStorage = createMemoryPlanStorage();
});

/** Renders the screen against the current storage stand-in. */
function renderScreen(): void {
  render(<PaycheckPreviewScreen planStorage={planStorage} />);
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

/** The rendered rows as [label, amount] pairs, in display order. */
function renderedRows(): readonly (readonly string[])[] {
  return screen.getAllByRole('row').flatMap((row) => {
    const scope = within(row);
    const cells = [...scope.queryAllByRole('rowheader'), ...scope.queryAllByRole('cell')];

    /* The heading row carries column headers rather than a label and an amount. */
    return cells.length === 2 ? [cells.map((cell) => cell.textContent ?? '')] : [];
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
   * A preview proposes; it does not save. Plan settings are kept, but no button
   * claims to commit an allocation, confirm a paycheck or move money.
   */
  it('offers nothing that claims to save or move money', () => {
    renderScreen();
    enterPaycheck('2000');

    const labels = screen.getAllByRole('button').map((button) => button.textContent ?? '');

    expect(labels).toContain('Preview');
    for (const label of labels) {
      expect(label).not.toMatch(/save|confirm|commit|transfer|send/i);
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
