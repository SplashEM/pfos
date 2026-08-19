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

    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
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
});
