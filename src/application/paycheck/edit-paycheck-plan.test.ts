import { describe, expect, it } from 'vitest';

import {
  addPriority,
  canAddPriority,
  movePriorityDown,
  movePriorityUp,
  orderedPriorities,
  removePriority,
  renamePriority,
  setPriorityAmount,
} from './edit-paycheck-plan';
import {
  DEFAULT_PAYCHECK_PLAN,
  type EditablePaycheckPlan,
  type EditablePriority,
} from './paycheck-plan';

function priority(id: string, label: string, rank: number): EditablePriority {
  return { id, label, amountPerPaycheck: '100', rank };
}

function planOf(...priorities: readonly EditablePriority[]): EditablePaycheckPlan {
  return { ...DEFAULT_PAYCHECK_PLAN, priorities };
}

/** The order a person sees, as [label, rank] pairs. */
function order(plan: EditablePaycheckPlan): readonly (readonly [string, number])[] {
  return orderedPriorities(plan).map((entry) => [entry.label, entry.rank]);
}

const TWO = planOf(priority('a', 'Emergency Fund', 1), priority('b', 'Laptop', 2));

describe('reading the order', () => {
  it('orders by rank rather than by position', () => {
    const shuffled = planOf(priority('b', 'Laptop', 2), priority('a', 'Emergency Fund', 1));

    expect(order(shuffled)).toEqual([
      ['Emergency Fund', 1],
      ['Laptop', 2],
    ]);
  });

  it('does not disturb the caller collection', () => {
    const plan = planOf(priority('b', 'Laptop', 2), priority('a', 'Emergency Fund', 1));
    const snapshot = [...plan.priorities];

    orderedPriorities(plan);

    expect(plan.priorities).toEqual(snapshot);
  });
});

describe('adding a priority', () => {
  it('adds it last, with an explicit rank', () => {
    expect(order(addPriority(TWO))).toEqual([
      ['Emergency Fund', 1],
      ['Laptop', 2],
      ['', 3],
    ]);
  });

  /* A guessed name or amount would be a value nobody chose deciding money. */
  it('leaves the new priority empty for a person to fill in', () => {
    const added = orderedPriorities(addPriority(TWO))[2];

    expect(added?.label).toBe('');
    expect(added?.amountPerPaycheck).toBe('');
  });

  it('gives it an identity no other priority is using', () => {
    const ids = orderedPriorities(addPriority(TWO)).map((entry) => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  /* Removing the middle of three and adding again must not reuse a live id. */
  it('avoids an identity that is still in use', () => {
    const three = addPriority(TWO);
    const withoutSecond = removePriority(three, 'b');
    const ids = orderedPriorities(addPriority(withoutSecond)).map((entry) => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  /* PFOS-ENG-01 §13.1 and Decision 076: three is the most a plan may have. */
  it('stops at three', () => {
    const three = addPriority(TWO);

    expect(canAddPriority(three)).toBe(false);
    expect(orderedPriorities(addPriority(three))).toHaveLength(3);
  });

  it('allows another while there is room', () => {
    expect(canAddPriority(TWO)).toBe(true);
  });
});

describe('removing a priority', () => {
  it('closes the gap in the ranks', () => {
    expect(order(removePriority(addPriority(TWO), 'a'))).toEqual([
      ['Laptop', 1],
      ['', 2],
    ]);
  });

  /* Decision 075 makes a plan with no top priorities valid rather than a failure. */
  it('allows removing the last one', () => {
    const empty = removePriority(removePriority(TWO, 'a'), 'b');

    expect(orderedPriorities(empty)).toEqual([]);
  });

  it('ignores an identity that is not there', () => {
    expect(order(removePriority(TWO, 'missing'))).toEqual(order(TWO));
  });
});

describe('moving a priority', () => {
  it('swaps ranks with the one above', () => {
    expect(order(movePriorityUp(TWO, 'b'))).toEqual([
      ['Laptop', 1],
      ['Emergency Fund', 2],
    ]);
  });

  it('swaps ranks with the one below', () => {
    expect(order(movePriorityDown(TWO, 'a'))).toEqual([
      ['Laptop', 1],
      ['Emergency Fund', 2],
    ]);
  });

  it('does nothing at the top', () => {
    expect(order(movePriorityUp(TWO, 'a'))).toEqual(order(TWO));
  });

  it('does nothing at the bottom', () => {
    expect(order(movePriorityDown(TWO, 'b'))).toEqual(order(TWO));
  });

  /* Every edit leaves ranks unique, which is the one constraint that binds. */
  it('keeps ranks unique through a sequence of moves', () => {
    const three = addPriority(TWO);
    const moved = movePriorityUp(movePriorityDown(movePriorityUp(three, 'b'), 'a'), 'b');
    const ranks = orderedPriorities(moved).map((entry) => entry.rank);

    expect(new Set(ranks).size).toBe(ranks.length);
    expect(ranks).toEqual([1, 2, 3]);
  });
});

describe('editing a priority', () => {
  it('renames without touching identity or order', () => {
    const renamed = renamePriority(TWO, 'a', 'Rainy day');
    const first = orderedPriorities(renamed)[0];

    expect(first?.id).toBe('a');
    expect(first?.label).toBe('Rainy day');
    expect(first?.rank).toBe(1);
  });

  it('changes the amount and nothing else', () => {
    const changed = setPriorityAmount(TWO, 'b', '300');
    const second = orderedPriorities(changed)[1];

    expect(second?.amountPerPaycheck).toBe('300');
    expect(second?.label).toBe('Laptop');
    expect(second?.rank).toBe(2);
  });

  it('leaves the other priorities alone', () => {
    const changed = setPriorityAmount(TWO, 'b', '300');

    expect(orderedPriorities(changed)[0]).toEqual(orderedPriorities(TWO)[0]);
  });
});

describe('every edit returns a new plan', () => {
  it('never mutates the plan it was given', () => {
    const before = JSON.stringify(TWO);

    addPriority(TWO);
    removePriority(TWO, 'a');
    movePriorityUp(TWO, 'b');
    movePriorityDown(TWO, 'a');
    renamePriority(TWO, 'a', 'Changed');
    setPriorityAmount(TWO, 'a', '999');

    expect(JSON.stringify(TWO)).toBe(before);
  });
});
