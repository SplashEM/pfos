import { describe, expect, it } from 'vitest';

import type { AllocationBasis } from './allocation-basis';

/**
 * The exhaustive list is declared here rather than in the production module.
 * AllocationBasis is not a Rule Engine code registry, so it stays a bare union,
 * matching ExplanationSeverity in src/domain/shared/explanations/explanation.ts.
 */
const BASES: readonly AllocationBasis[] = ['NET_AMOUNT', 'ELIGIBLE_AMOUNT'];

describe('AllocationBasis', () => {
  it('holds exactly the values fixed by Decision 074', () => {
    expect(BASES).toEqual(['NET_AMOUNT', 'ELIGIBLE_AMOUNT']);
  });

  it('accepts every value', () => {
    for (const basis of BASES) {
      const allocationBasis: AllocationBasis = basis;
      expect(allocationBasis).toBe(basis);
    }
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsAllocationBasis(basis: AllocationBasis): AllocationBasis {
  return basis;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsAllocationBasis(
    // @ts-expect-error - Decision 074 fixes two values, and this is not one of them.
    'GROSS_AMOUNT',
  );

  acceptsAllocationBasis(
    // @ts-expect-error - Decision 074: a value is spelled exactly as fixed.
    'net_amount',
  );
}
