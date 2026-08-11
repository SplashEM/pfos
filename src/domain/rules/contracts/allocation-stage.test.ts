import { describe, expect, it } from 'vitest';

import type { AllocationStage } from './allocation-stage';

/**
 * See ./allocation-basis.test.ts for why the list is declared in the test.
 *
 * This is the stage vocabulary, not an execution sequence. Decision 074 places
 * the order a resolution actually uses on `ResolvedRuleSet.stageSequence`.
 */
const STAGES: readonly AllocationStage[] = [
  'GLOBAL_OBLIGATION',
  'TOP_PRIORITY',
  'REQUIRED_RECURRING',
  'GOAL_FUNDING',
  'LOWER_PRIORITY',
  'EVERYDAY_SPENDING',
  'LEFTOVER_POLICY',
  'EVENT_OVERRIDE',
];

describe('AllocationStage', () => {
  it('holds exactly the stages fixed by Decision 074', () => {
    expect(STAGES).toEqual([
      'GLOBAL_OBLIGATION',
      'TOP_PRIORITY',
      'REQUIRED_RECURRING',
      'GOAL_FUNDING',
      'LOWER_PRIORITY',
      'EVERYDAY_SPENDING',
      'LEFTOVER_POLICY',
      'EVENT_OVERRIDE',
    ]);
  });

  it('accepts every stage', () => {
    for (const stage of STAGES) {
      const allocationStage: AllocationStage = stage;
      expect(allocationStage).toBe(stage);
    }
  });

  /*
   * Decision 074: EVERYDAY_SPENDING remains part of the documented stage
   * vocabulary despite having no V1 producer, so the type must still express
   * it. Its absence from V1 output is not enforced here.
   */
  it('expresses EVERYDAY_SPENDING', () => {
    const stage: AllocationStage = 'EVERYDAY_SPENDING';
    expect(STAGES).toContain(stage);
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsAllocationStage(stage: AllocationStage): AllocationStage {
  return stage;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsAllocationStage(
    // @ts-expect-error - Decision 074 fixes eight stages, and this is not one of them.
    'ROLLOVER',
  );

  acceptsAllocationStage(
    // @ts-expect-error - Decision 074: a stage is spelled exactly as fixed.
    'TOP_PRIORITIES',
  );
}
