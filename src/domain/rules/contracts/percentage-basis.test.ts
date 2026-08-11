import { describe, expect, it } from 'vitest';

import type { PercentageBasis } from './percentage-basis';

/** See ./allocation-basis.test.ts for why the list is declared in the test. */
const BASES: readonly PercentageBasis[] = ['PERCENT_OF_TOTAL_INCOME', 'PERCENT_OF_REMAINING_POOL'];

describe('PercentageBasis', () => {
  /*
   * Decision 074 keeps percent-of-total-income and percent-of-remaining-pool as
   * explicit, distinct concepts, so both must remain separately expressible.
   */
  it('holds exactly the values fixed by Decision 074', () => {
    expect(BASES).toEqual(['PERCENT_OF_TOTAL_INCOME', 'PERCENT_OF_REMAINING_POOL']);
  });

  it('accepts every value', () => {
    for (const basis of BASES) {
      const percentageBasis: PercentageBasis = basis;
      expect(percentageBasis).toBe(basis);
    }
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsPercentageBasis(basis: PercentageBasis): PercentageBasis {
  return basis;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsPercentageBasis(
    // @ts-expect-error - Decision 074 fixes two values, and this is not one of them.
    'PERCENT_OF_ELIGIBLE_INCOME',
  );

  acceptsPercentageBasis(
    // @ts-expect-error - Decision 074: the two concepts stay explicit and distinct.
    'PERCENT',
  );
}
