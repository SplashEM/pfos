import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import type { ResolvedLeftoverPolicy } from '@domain/rules/contracts/resolved-leftover-policy';
import { asEntityId } from '@domain/shared/ids/entity-id';

import { ALLOCATION_ERROR_CODES } from '../errors/allocation-error-codes';
import { executeLeftover } from './execute-leftover';

const SPENDING = asEntityId('bucket-spending');

const TO_SPENDING: ResolvedLeftoverPolicy = {
  policyType: 'SINGLE_DESTINATION',
  destinationBucketId: SPENDING,
};

describe('executeLeftover', () => {
  it('sends the whole remainder to the single destination', () => {
    const result = executeLeftover(TO_SPENDING, money(130_000));

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines).toEqual([
      {
        bucketId: SPENDING,
        stage: 'LEFTOVER_POLICY',
        amount: money(130_000),
        explanation: { code: 'ALLOCATION_EXPLAIN_LEFTOVER_REMAINDER' },
      },
    ]);
    expect(result.value.remainingPool).toEqual(money(0));
  });

  /* A zero line would report a movement of money that did not occur. */
  it('emits no line when nothing is left over', () => {
    const result = executeLeftover(TO_SPENDING, money(0));

    if (!result.ok) {
      throw new Error(`Unexpected failure: ${result.error.code}`);
    }

    expect(result.value.lines).toEqual([]);
    expect(result.value.remainingPool).toEqual(money(0));
  });

  it('refuses a leftover policy this slice does not implement', () => {
    const leaveUnallocated: ResolvedLeftoverPolicy = { policyType: 'LEAVE_UNALLOCATED' };

    const result = executeLeftover(leaveUnallocated, money(130_000));

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe(ALLOCATION_ERROR_CODES.ALLOCATION_STRATEGY_NOT_SUPPORTED);
  });
});
