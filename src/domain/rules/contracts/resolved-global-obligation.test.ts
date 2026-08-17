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

/*
 * Decision 078 makes RuleId and RuleVersionId semantic aliases of EntityId
 * rather than second brands, so both are constructed through asEntityId.
 */
const OBLIGATION: ResolvedGlobalObligation = {
  ruleId: asEntityId('rule-1'),
  ruleVersionId: asEntityId('rule-version-1'),
  destinationBucketId: asEntityId('bucket-1'),
  rateBasisPoints: rate(1000),
  incomeBasis: 'NET_DEPOSITED',
};

describe('ResolvedGlobalObligation', () => {
  it('carries every required field', () => {
    expect(OBLIGATION).toEqual({
      ruleId: 'rule-1',
      ruleVersionId: 'rule-version-1',
      destinationBucketId: 'bucket-1',
      rateBasisPoints: 1000,
      incomeBasis: 'NET_DEPOSITED',
    });
  });

  it('omits maximumAmount entirely when it is not supplied', () => {
    expect(Object.keys(OBLIGATION).sort()).toEqual([
      'destinationBucketId',
      'incomeBasis',
      'rateBasisPoints',
      'ruleId',
      'ruleVersionId',
    ]);
  });

  it('carries an optional maximum amount', () => {
    const capped: ResolvedGlobalObligation = { ...OBLIGATION, maximumAmount: money(50_000) };
    expect(capped.maximumAmount).toEqual({ cents: 50_000, currency: 'USD' });
  });

  /*
   * Decision 090 removed `sequence` and Decision 091 retired `obligationId`, so
   * the resolved obligation carries six members. This asserts the decided shape;
   * the compile-time block below asserts the retired members cannot return.
   */
  it('carries exactly the six decided members when a maximum is supplied', () => {
    const capped: ResolvedGlobalObligation = { ...OBLIGATION, maximumAmount: money(50_000) };
    expect(Object.keys(capped).sort()).toEqual([
      'destinationBucketId',
      'incomeBasis',
      'maximumAmount',
      'rateBasisPoints',
      'ruleId',
      'ruleVersionId',
    ]);
  });

  /*
   * Decision 091: one selected rule version contributes at most one resolved
   * obligation, so two obligations carry distinct ruleIds and distinct
   * ruleVersionIds. Decision 074 keeps separately authored obligations
   * independent rather than collapsing them into one N-way percentage split.
   * This asserts only that the contract can represent them separately; it
   * executes nothing.
   */
  it('represents separately authored obligations as independent values', () => {
    const second: ResolvedGlobalObligation = {
      ...OBLIGATION,
      ruleId: asEntityId('rule-2'),
      ruleVersionId: asEntityId('rule-version-2'),
      rateBasisPoints: rate(500),
    };

    expect([OBLIGATION, second].map((obligation) => obligation.rateBasisPoints)).toEqual([
      1000, 500,
    ]);
    expect([OBLIGATION, second].map((obligation) => obligation.ruleId)).toEqual([
      'rule-1',
      'rule-2',
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
    ruleId: 'rule-1',
  });

  acceptsObligation({
    ...OBLIGATION,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    ruleVersionId: 'rule-version-1',
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

  /*
   * The two directives below guard the retired members. Each supplies a
   * type-correct value, so the only diagnostic available is the excess property
   * itself rather than a branding or arity error that would pass for the wrong
   * reason.
   */
  acceptsObligation({
    ...OBLIGATION,
    // @ts-expect-error - Decision 090: sequence is removed from the resolved obligation.
    sequence: 1,
  });

  acceptsObligation({
    ...OBLIGATION,
    // @ts-expect-error - Decision 091: obligationId is retired; the stable identity is ruleId.
    obligationId: asEntityId('obligation-1'),
  });

  // @ts-expect-error - Decision 074: the resolved obligation is immutable.
  OBLIGATION.incomeBasis = 'NET_DEPOSITED';
}
