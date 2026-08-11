import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';
import { basisPoints, type BasisPoints } from '@domain/shared/percentages/basis-points';

import type { ResolvedGlobalObligation } from './resolved-global-obligation';

/** Builds a rate, failing loudly if the test supplied an invalid one. */
function rate(value: number): BasisPoints {
  const result = basisPoints(value);
  if (!result.ok) {
    throw new Error(`Invalid rate in test setup: ${result.error.code}`);
  }
  return result.value;
}

const OBLIGATION: ResolvedGlobalObligation = {
  obligationId: asEntityId('obligation-1'),
  ruleVersionId: asEntityId('rule-version-1'),
  destinationBucketId: asEntityId('bucket-1'),
  rateBasisPoints: rate(1000),
  incomeBasis: 'NET_DEPOSITED',
  sequence: 1,
};

describe('ResolvedGlobalObligation', () => {
  it('carries every required field', () => {
    expect(OBLIGATION).toEqual({
      obligationId: 'obligation-1',
      ruleVersionId: 'rule-version-1',
      destinationBucketId: 'bucket-1',
      rateBasisPoints: 1000,
      incomeBasis: 'NET_DEPOSITED',
      sequence: 1,
    });
  });

  it('omits maximumAmount entirely when it is not supplied', () => {
    expect(Object.keys(OBLIGATION).sort()).toEqual([
      'destinationBucketId',
      'incomeBasis',
      'obligationId',
      'rateBasisPoints',
      'ruleVersionId',
      'sequence',
    ]);
  });

  it('carries an optional maximum amount', () => {
    const capped: ResolvedGlobalObligation = { ...OBLIGATION, maximumAmount: money(50_000) };
    expect(capped.maximumAmount).toEqual({ cents: 50_000, currency: 'USD' });
  });

  /*
   * Decision 074: separately authored obligations remain independent and are
   * not collapsed into one N-way percentage split. This asserts only that the
   * contract can represent them separately; it executes nothing.
   */
  it('represents separately authored obligations as independent values', () => {
    const second: ResolvedGlobalObligation = {
      ...OBLIGATION,
      obligationId: asEntityId('obligation-2'),
      ruleVersionId: asEntityId('rule-version-2'),
      rateBasisPoints: rate(500),
      sequence: 2,
    };

    expect([OBLIGATION, second].map((obligation) => obligation.rateBasisPoints)).toEqual([
      1000, 500,
    ]);
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsObligation(obligation: ResolvedGlobalObligation): ResolvedGlobalObligation {
  return obligation;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsObligation({
    ...OBLIGATION,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    obligationId: 'obligation-1',
  });

  acceptsObligation({
    ...OBLIGATION,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    destinationBucketId: 'bucket-1',
  });

  acceptsObligation({
    ...OBLIGATION,
    // @ts-expect-error - Decision 071: a rate is branded BasisPoints, never a bare number.
    rateBasisPoints: 1000,
  });

  acceptsObligation({
    ...OBLIGATION,
    // @ts-expect-error - Decision 074: V1 exposes only NET_DEPOSITED.
    incomeBasis: 'GROSS_DEPOSITED',
  });

  acceptsObligation({
    ...OBLIGATION,
    // @ts-expect-error - PFOS-ENG-00 §10.4: money is never floating-point dollars.
    maximumAmount: 500,
  });

  acceptsObligation({
    ...OBLIGATION,
    // @ts-expect-error - Decision 074: no per-rule rounding field exists.
    roundingPolicyId: 'nearest-cent',
  });

  // @ts-expect-error - Decision 074: the resolved obligation is immutable.
  OBLIGATION.sequence = 2;
}
