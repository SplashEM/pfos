import { describe, expect, it } from 'vitest';

import type { ResolvedSlotKind } from './resolved-slot-kind';

/**
 * The exhaustive list is declared here rather than in the production module.
 * ResolvedSlotKind is not a Rule Engine code registry, so it stays a bare union,
 * matching ResolutionMode in ./resolution-mode.ts.
 */
const SLOT_KINDS: readonly ResolvedSlotKind[] = [
  'ALLOCATION_BASIS',
  'GLOBAL_OBLIGATION',
  'TOP_PRIORITIES',
  'REQUIRED_FUNDING',
  'LOWER_PRIORITY_POOL',
  'LEFTOVER_POLICY',
  'ROLLOVER_POLICY',
  'GOAL_POLICY',
];

/**
 * A Record over the union, which the compiler requires to hold exactly one key
 * per member. A ninth member would leave a key missing here and a removed member
 * would leave one excess, so comparing its keys to the list above turns that
 * list into a statement about the type rather than about itself.
 */
const EVERY_SLOT_KIND: Record<ResolvedSlotKind, true> = {
  ALLOCATION_BASIS: true,
  GLOBAL_OBLIGATION: true,
  TOP_PRIORITIES: true,
  REQUIRED_FUNDING: true,
  LOWER_PRIORITY_POOL: true,
  LEFTOVER_POLICY: true,
  ROLLOVER_POLICY: true,
  GOAL_POLICY: true,
};

describe('ResolvedSlotKind', () => {
  it('holds exactly the eight members fixed by Decision 081', () => {
    expect(SLOT_KINDS).toHaveLength(8);
    expect([...SLOT_KINDS].sort()).toEqual(Object.keys(EVERY_SLOT_KIND).sort());
  });

  it('accepts every member', () => {
    for (const kind of SLOT_KINDS) {
      const slotKind: ResolvedSlotKind = kind;
      expect(slotKind).toBe(kind);
    }
  });

  /*
   * Decision 074 establishes one rule-authored structure per member, so the
   * vocabulary cannot drift from the accepted resolved contract.
   */
  it('names one member for each rule-authored resolved structure', () => {
    expect(SLOT_KINDS).toEqual([
      'ALLOCATION_BASIS',
      'GLOBAL_OBLIGATION',
      'TOP_PRIORITIES',
      'REQUIRED_FUNDING',
      'LOWER_PRIORITY_POOL',
      'LEFTOVER_POLICY',
      'ROLLOVER_POLICY',
      'GOAL_POLICY',
    ]);
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsSlotKind(slotKind: ResolvedSlotKind): ResolvedSlotKind {
  return slotKind;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsSlotKind(
    /*
     * Decision 080: no §5 category authors a stage order, and the sequence is
     * Rule Engine output rather than a slot a rule contributes to.
     */
    // @ts-expect-error - not a resolved slot kind.
    'STAGE_SEQUENCE',
  );

  acceptsSlotKind(
    /*
     * Decision 082: top priorities are authored as one Rule per owner carrying
     * strategy and membership together, so neither member splits.
     */
    // @ts-expect-error - not a resolved slot kind.
    'TOP_PRIORITY_MEMBERSHIP',
  );

  acceptsSlotKind(
    // @ts-expect-error - Decision 081: a member is spelled exactly as fixed.
    'required_funding',
  );
}
