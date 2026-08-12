import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';

import type { ResolvedGoalPolicy } from './resolved-goal-policy';

const POLICY: ResolvedGoalPolicy = {
  bucketId: asEntityId('bucket-1'),
  ruleVersionId: asEntityId('rule-version-1'),
  stopAtTarget: true,
  allowManualExcess: false,
  autoStartNextCycle: false,
  resumeRequiresConfirmation: true,
};

describe('ResolvedGoalPolicy', () => {
  it('carries every field', () => {
    expect(POLICY).toEqual({
      bucketId: 'bucket-1',
      ruleVersionId: 'rule-version-1',
      stopAtTarget: true,
      allowManualExcess: false,
      autoStartNextCycle: false,
      resumeRequiresConfirmation: true,
    });
  });

  /*
   * Decision 074: this is configuration only. The six fields are exactly what a
   * resolved goal policy carries, so a computed balance or funded amount has
   * nowhere to hide in it.
   */
  it('carries exactly the six fields fixed by Decision 074', () => {
    expect(Object.keys(POLICY).sort()).toEqual([
      'allowManualExcess',
      'autoStartNextCycle',
      'bucketId',
      'resumeRequiresConfirmation',
      'ruleVersionId',
      'stopAtTarget',
    ]);
  });

  /*
   * The four flags are independent policy switches. None is derived from
   * another, so every combination must be representable without changing the
   * shape of the contract.
   */
  it('varies each flag independently without changing the contract shape', () => {
    const inverted: ResolvedGoalPolicy = {
      ...POLICY,
      stopAtTarget: false,
      allowManualExcess: true,
      autoStartNextCycle: true,
      resumeRequiresConfirmation: false,
    };

    expect([
      inverted.stopAtTarget,
      inverted.allowManualExcess,
      inverted.autoStartNextCycle,
      inverted.resumeRequiresConfirmation,
    ]).toEqual([false, true, true, false]);
    expect(Object.keys(inverted).sort()).toEqual(Object.keys(POLICY).sort());
  });

  it('accepts every combination of the four flags', () => {
    const combinations: readonly ResolvedGoalPolicy[] = [false, true].flatMap((stopAtTarget) =>
      [false, true].flatMap((allowManualExcess) =>
        [false, true].flatMap((autoStartNextCycle) =>
          [false, true].map((resumeRequiresConfirmation) => ({
            ...POLICY,
            stopAtTarget,
            allowManualExcess,
            autoStartNextCycle,
            resumeRequiresConfirmation,
          })),
        ),
      ),
    );

    expect(combinations).toHaveLength(16);
    expect(new Set(combinations.map((policy) => JSON.stringify(policy))).size).toBe(16);
  });

  it('identifies the bucket and the authored rule version separately', () => {
    const other: ResolvedGoalPolicy = {
      ...POLICY,
      bucketId: asEntityId('bucket-2'),
      ruleVersionId: asEntityId('rule-version-2'),
    };

    expect([other.bucketId, other.ruleVersionId]).toEqual(['bucket-2', 'rule-version-2']);
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 *
 * Each literal below is otherwise complete and valid, so a directive guards the
 * single defect it names rather than an unrelated missing field.
 */
function acceptsPolicy(policy: ResolvedGoalPolicy): ResolvedGoalPolicy {
  return policy;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsPolicy(
    // @ts-expect-error - Decision 074: a resolved goal policy names its bucket.
    {
      ruleVersionId: asEntityId('rule-version-1'),
      stopAtTarget: true,
      allowManualExcess: false,
      autoStartNextCycle: false,
      resumeRequiresConfirmation: true,
    },
  );

  acceptsPolicy(
    // @ts-expect-error - Decision 074: a resolved goal policy names the rule version it came from.
    {
      bucketId: asEntityId('bucket-1'),
      stopAtTarget: true,
      allowManualExcess: false,
      autoStartNextCycle: false,
      resumeRequiresConfirmation: true,
    },
  );

  acceptsPolicy(
    // @ts-expect-error - Decision 074: resumeRequiresConfirmation is required, not optional.
    {
      bucketId: asEntityId('bucket-1'),
      ruleVersionId: asEntityId('rule-version-1'),
      stopAtTarget: true,
      allowManualExcess: false,
      autoStartNextCycle: false,
    },
  );

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    bucketId: 'bucket-1',
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    ruleVersionId: 'rule-version-1',
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 074: stopAtTarget is a boolean.
    stopAtTarget: 'true',
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 074: allowManualExcess is a boolean.
    allowManualExcess: 1,
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 074: autoStartNextCycle is a boolean.
    autoStartNextCycle: null,
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 074: resumeRequiresConfirmation is a boolean.
    resumeRequiresConfirmation: undefined,
  });

  /*
   * Decision 074: the resolved rule set carries no computed goal balance and
   * derives no final funded amount. One speculative field per literal, so each
   * directive guards its own excess-property error.
   */
  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 074: this is configuration only; M2 computes no goal balance.
    currentBalance: 0,
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 074: M2 derives no final funded amount.
    fundedAmount: 0,
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 074: a remaining amount is an M3 calculation.
    remainingAmount: 0,
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 074: a progress percentage is derived, not resolved policy.
    progressBasisPoints: 0,
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 074: target satisfaction is goal state, supplied not resolved.
    targetReached: false,
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 074: current-cycle state is not carried by resolved policy.
    currentCycleIndex: 1,
  });

  // @ts-expect-error - Decision 074: the resolved goal policy is immutable.
  POLICY.bucketId = asEntityId('bucket-2');

  // @ts-expect-error - Decision 074: the resolved goal policy is immutable.
  POLICY.ruleVersionId = asEntityId('rule-version-2');

  // @ts-expect-error - Decision 074: the resolved goal policy is immutable.
  POLICY.stopAtTarget = false;

  // @ts-expect-error - Decision 074: the resolved goal policy is immutable.
  POLICY.allowManualExcess = true;

  // @ts-expect-error - Decision 074: the resolved goal policy is immutable.
  POLICY.autoStartNextCycle = true;

  // @ts-expect-error - Decision 074: the resolved goal policy is immutable.
  POLICY.resumeRequiresConfirmation = false;
}
