import { describe, expect, it } from 'vitest';

import type { IncomeBasis } from './income-basis';

/** See ./allocation-basis.test.ts for why the list is declared in the test. */
const BASES: readonly IncomeBasis[] = ['NET_DEPOSITED'];

describe('IncomeBasis', () => {
  /* Decision 074: V1 exposes only NET_DEPOSITED. */
  it('holds exactly the value fixed by Decision 074', () => {
    expect(BASES).toEqual(['NET_DEPOSITED']);
  });

  it('accepts every value', () => {
    for (const basis of BASES) {
      const incomeBasis: IncomeBasis = basis;
      expect(incomeBasis).toBe(basis);
    }
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsIncomeBasis(basis: IncomeBasis): IncomeBasis {
  return basis;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsIncomeBasis(
    // @ts-expect-error - Decision 074: V1 exposes only NET_DEPOSITED.
    'GROSS_DEPOSITED',
  );

  acceptsIncomeBasis(
    // @ts-expect-error - Decision 074: an allocation basis is not an income basis.
    'NET_AMOUNT',
  );
}
