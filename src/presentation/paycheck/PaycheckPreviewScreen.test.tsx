import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PaycheckPreviewScreen } from './PaycheckPreviewScreen';

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
    render(<PaycheckPreviewScreen />);

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
    render(<PaycheckPreviewScreen />);
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
    render(<PaycheckPreviewScreen />);

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
    render(<PaycheckPreviewScreen />);
    enterPaycheck('2000');

    expect(within(screen.getByRole('table')).getByText('Emergency Fund')).toBeInTheDocument();
    expect(screen.queryByText(/bucket-/)).not.toBeInTheDocument();
  });

  it('shows the message the domain supplied when the amount is not a number', () => {
    render(<PaycheckPreviewScreen />);
    enterPaycheck('two thousand');

    expect(screen.getByRole('alert')).toHaveTextContent('That is not a valid dollar amount.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('refuses a paycheck of zero', () => {
    render(<PaycheckPreviewScreen />);
    enterPaycheck('0');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a paycheck amount greater than zero.',
    );
  });

  it('clears a previous error once a valid paycheck is previewed', () => {
    render(<PaycheckPreviewScreen />);

    enterPaycheck('nonsense');
    expect(screen.getByRole('alert')).toBeInTheDocument();

    enterPaycheck('2000');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('replaces a stale preview with the error when input becomes invalid', () => {
    render(<PaycheckPreviewScreen />);

    enterPaycheck('2000');
    expect(screen.getByRole('table')).toBeInTheDocument();

    enterPaycheck('-1');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  /* A preview proposes; it does not save. There is nothing to press that would. */
  it('offers nothing that claims to save or move money', () => {
    render(<PaycheckPreviewScreen />);
    enterPaycheck('2000');

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Preview']);
    expect(screen.getByText(/Nothing is saved and no money moves/)).toBeInTheDocument();
  });

  it('says plainly that the settings do not survive a reload', () => {
    render(<PaycheckPreviewScreen />);

    expect(
      screen.getByText('Preview settings reset when you reload the page.'),
    ).toBeInTheDocument();
  });
});

describe('editing the plan', () => {
  it('offers the three plan controls with their starting values', () => {
    render(<PaycheckPreviewScreen />);

    expect(screen.getByLabelText('Giving')).toHaveValue('10');
    expect(screen.getByLabelText('Emergency Fund')).toHaveValue('500.00');
    expect(screen.getByLabelText('Everything left over goes to')).toHaveValue('Spending');
  });

  /*
   * The whole point of the slice: a changed plan produces a changed answer, and
   * it can only do so by reaching the authored rules, because nothing on this
   * screen can multiply.
   */
  it('changes the preview when the giving percentage changes', () => {
    render(<PaycheckPreviewScreen />);

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
    render(<PaycheckPreviewScreen />);

    editPlan('Giving', '12');
    editPlan('Emergency Fund', '600');
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
    render(<PaycheckPreviewScreen />);

    editPlan('Everything left over goes to', 'Everyday spending');
    enterPaycheck('2000');

    expect(renderedRows()).toContainEqual(['Everyday spending', '$1,300.00']);
    expect(renderedRows()).not.toContainEqual(['Spending', '$1,300.00']);
  });

  it('explains a percentage it cannot use', () => {
    render(<PaycheckPreviewScreen />);

    editPlan('Giving', 'lots');
    enterPaycheck('2000');

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a percentage such as 10 or 12.5.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  /* The 0%-to-100% bound belongs to the domain, and its wording reaches the screen. */
  it('explains a percentage above 100', () => {
    render(<PaycheckPreviewScreen />);

    editPlan('Giving', '150');
    enterPaycheck('2000');

    expect(screen.getByRole('alert')).toHaveTextContent('A rate must be between 0% and 100%.');
  });

  it('explains a negative funding amount', () => {
    render(<PaycheckPreviewScreen />);

    editPlan('Emergency Fund', '-100');
    enterPaycheck('2000');

    expect(screen.getByRole('alert')).toHaveTextContent('A funding amount cannot be negative.');
  });

  it('explains a blank destination name', () => {
    render(<PaycheckPreviewScreen />);

    editPlan('Everything left over goes to', '  ');
    enterPaycheck('2000');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Name the destination that receives what is left.',
    );
  });
});
