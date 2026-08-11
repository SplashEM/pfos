import { describe, expect, it } from 'vitest';

import type { Recurrence } from './recurrence';

/** See ./allocation-basis.test.ts for why the list is declared in the test. */
const RECURRENCES: readonly Recurrence[] = ['MONTHLY'];

describe('Recurrence', () => {
  /* Decision 074: V1 supports only MONTHLY. */
  it('holds exactly the value fixed by Decision 074', () => {
    expect(RECURRENCES).toEqual(['MONTHLY']);
  });

  it('accepts every value', () => {
    for (const recurrence of RECURRENCES) {
      const supported: Recurrence = recurrence;
      expect(supported).toBe(recurrence);
    }
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsRecurrence(recurrence: Recurrence): Recurrence {
  return recurrence;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsRecurrence(
    /*
     * Decision 074: no additional recurrence may be introduced without an
     * accepted specification.
     */
    // @ts-expect-error - not a supported recurrence.
    'WEEKLY',
  );

  // @ts-expect-error - Decision 074: no additional recurrence without an accepted specification.
  acceptsRecurrence('BIWEEKLY');
}
