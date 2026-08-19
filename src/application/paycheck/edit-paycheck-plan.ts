import {
  MAXIMUM_TOP_PRIORITIES,
  type EditablePaycheckPlan,
  type EditablePriority,
} from './paycheck-plan';

/**
 * The edits a person can make to their priorities.
 *
 * These are pure functions over the plan: each returns a new plan and changes
 * nothing in place, so a screen holds one value and replaces it rather than
 * mutating a list it shares with something else.
 *
 * Ordering lives here rather than in a component. Rank is financially
 * meaningful — Decision 074 orders top-priority entries by ascending rank, and
 * Decision 087 requires it to be authored rather than implied — so moving a
 * priority rewrites explicit rank values, and the array is only ever a way to
 * show them in order. A component reordering an array would be exactly the
 * accidental-position source Decision 080 excludes.
 *
 * Ranks are kept as 1, 2, 3 after every edit. Nothing requires that — Decision
 * 076 records that ranks need not be positive, contiguous or start at one — but
 * a plan a person can read back is worth more than a gap, and renumbering keeps
 * them unique, which is the one constraint that does bind.
 */

/** Priorities in the order they are funded. */
export function orderedPriorities(plan: EditablePaycheckPlan): readonly EditablePriority[] {
  return [...plan.priorities].sort((left, right) => left.rank - right.rank);
}

/** Whether another priority may be added (PFOS-ENG-01 §13.1; Decision 076). */
export function canAddPriority(plan: EditablePaycheckPlan): boolean {
  return plan.priorities.length < MAXIMUM_TOP_PRIORITIES;
}

/**
 * Adds a priority at the end of the order.
 *
 * The plan is returned unchanged once three exist, so a caller that has not
 * hidden the control cannot build a plan the domain will refuse.
 *
 * A new priority starts with no name and no amount rather than a guessed one.
 * A person naming it themselves is the point, and a placeholder amount would be
 * a number nobody chose sitting in a plan that decides money.
 */
export function addPriority(plan: EditablePaycheckPlan): EditablePaycheckPlan {
  if (!canAddPriority(plan)) {
    return plan;
  }

  const added: EditablePriority = {
    id: nextPriorityId(plan),
    label: '',
    amountPerPaycheck: '',
    rank: plan.priorities.length + 1,
  };

  return renumbered({ ...plan, priorities: [...orderedPriorities(plan), added] });
}

/**
 * Removes a priority.
 *
 * Removing the last one is allowed. Decision 075 settles that a plan with zero
 * sequential top priorities is valid rather than a failure, and the resolver
 * carries the warning that says so, so there is nothing to protect a person
 * from here.
 */
export function removePriority(plan: EditablePaycheckPlan, id: string): EditablePaycheckPlan {
  return renumbered({
    ...plan,
    priorities: orderedPriorities(plan).filter((priority) => priority.id !== id),
  });
}

/** Renames a priority, leaving its identity and its place in the order alone. */
export function renamePriority(
  plan: EditablePaycheckPlan,
  id: string,
  label: string,
): EditablePaycheckPlan {
  return updatePriority(plan, id, (priority) => ({ ...priority, label }));
}

/** Changes what a priority asks for each paycheck. */
export function setPriorityAmount(
  plan: EditablePaycheckPlan,
  id: string,
  amountPerPaycheck: string,
): EditablePaycheckPlan {
  return updatePriority(plan, id, (priority) => ({ ...priority, amountPerPaycheck }));
}

/** Moves a priority one place earlier in the funding order. */
export function movePriorityUp(plan: EditablePaycheckPlan, id: string): EditablePaycheckPlan {
  return movedBy(plan, id, -1);
}

/** Moves a priority one place later in the funding order. */
export function movePriorityDown(plan: EditablePaycheckPlan, id: string): EditablePaycheckPlan {
  return movedBy(plan, id, 1);
}

/** Swaps a priority with its neighbour, or returns the plan when there is none. */
function movedBy(plan: EditablePaycheckPlan, id: string, offset: -1 | 1): EditablePaycheckPlan {
  const ordered = orderedPriorities(plan);
  const from = ordered.findIndex((priority) => priority.id === id);
  const to = from + offset;

  if (from === -1 || to < 0 || to >= ordered.length) {
    return plan;
  }

  const moved = [...ordered];
  const subject = moved[from];
  const neighbour = moved[to];

  if (subject === undefined || neighbour === undefined) {
    return plan;
  }

  moved[from] = neighbour;
  moved[to] = subject;

  return renumbered({ ...plan, priorities: moved });
}

/** Replaces one priority, keeping every other value as it was. */
function updatePriority(
  plan: EditablePaycheckPlan,
  id: string,
  change: (priority: EditablePriority) => EditablePriority,
): EditablePaycheckPlan {
  return {
    ...plan,
    priorities: plan.priorities.map((priority) =>
      priority.id === id ? change(priority) : priority,
    ),
  };
}

/**
 * Writes explicit ranks matching the order the collection is in.
 *
 * This is the one place array position turns into rank, and it happens as part
 * of an authoring act — adding, removing or moving — rather than during
 * resolution. What is stored and what reaches the rules afterwards is an
 * explicit number per priority, which is what Decision 087 requires and what
 * keeps Decision 080's exclusion of positional ordering satisfied.
 */
function renumbered(plan: EditablePaycheckPlan): EditablePaycheckPlan {
  return {
    ...plan,
    priorities: plan.priorities.map((priority, index) => ({ ...priority, rank: index + 1 })),
  };
}

/**
 * An identifier no current priority is using.
 *
 * Counting up from the number of priorities keeps it deterministic — no clock
 * and no randomness — and the loop steps past any identifier already taken, so
 * removing the second of three and adding another cannot collide.
 */
function nextPriorityId(plan: EditablePaycheckPlan): string {
  const taken = new Set(plan.priorities.map((priority) => priority.id));

  let candidate = plan.priorities.length + 1;
  while (taken.has(`bucket-priority-${String(candidate)}`)) {
    candidate += 1;
  }

  return `bucket-priority-${String(candidate)}`;
}
