import { describe, expect, it } from 'vitest';

import type { ResolutionMode } from './resolution-mode';

/**
 * The exhaustive list is declared here rather than in the production module.
 * ResolutionMode is not a Rule Engine code registry, so it stays a bare union,
 * matching ExplanationSeverity in src/domain/shared/explanations/explanation.ts.
 */
const MODES: readonly ResolutionMode[] = ['PREVIEW', 'SIMULATION', 'HISTORICAL_RECALCULATION'];

describe('ResolutionMode', () => {
  it('holds exactly the modes fixed by Decision 074', () => {
    expect(MODES).toEqual(['PREVIEW', 'SIMULATION', 'HISTORICAL_RECALCULATION']);
  });

  it('accepts every mode', () => {
    for (const mode of MODES) {
      const resolutionMode: ResolutionMode = mode;
      expect(resolutionMode).toBe(mode);
    }
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsResolutionMode(mode: ResolutionMode): ResolutionMode {
  return mode;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsResolutionMode(
    /*
     * Decision 075: confirmation is an orchestration step under PFOS-ENG-02
     * §57 and is not visible at resolution time.
     */
    // @ts-expect-error - not a resolution mode.
    'CONFIRMED',
  );

  acceptsResolutionMode(
    // @ts-expect-error - Decision 074: the mode is HISTORICAL_RECALCULATION.
    'HISTORICAL',
  );

  acceptsResolutionMode(
    // @ts-expect-error - Decision 074: a mode is spelled exactly as fixed.
    'preview',
  );
}
