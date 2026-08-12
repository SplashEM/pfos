import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';

import type { ResolvedRolloverPolicy, RolloverPolicyConfig } from './resolved-rollover-policy';

const CARRY_ALL: RolloverPolicyConfig = { policyType: 'CARRY_ALL' };

const POLICY: ResolvedRolloverPolicy = {
  bucketId: asEntityId('bucket-1'),
  ruleVersionId: asEntityId('rule-version-1'),
  policy: CARRY_ALL,
};

describe('ResolvedRolloverPolicy', () => {
  it('carries every field', () => {
    expect(POLICY).toEqual({
      bucketId: 'bucket-1',
      ruleVersionId: 'rule-version-1',
      policy: { policyType: 'CARRY_ALL' },
    });
  });

  it('carries a different configuration for a different bucket', () => {
    const capped: ResolvedRolloverPolicy = {
      ...POLICY,
      bucketId: asEntityId('bucket-2'),
      policy: { policyType: 'CARRY_TO_CAP', capAmount: money(100_000) },
    };

    expect(capped).toEqual({
      bucketId: 'bucket-2',
      ruleVersionId: 'rule-version-1',
      policy: { policyType: 'CARRY_TO_CAP', capAmount: { cents: 100_000, currency: 'USD' } },
    });
  });
});

describe('RolloverPolicyConfig', () => {
  /*
   * Every variant fixed by Decision 074 must be constructible. A variant that
   * could not be expressed would leave an authored policy unresolvable.
   */
  const VARIANTS: readonly RolloverPolicyConfig[] = [
    CARRY_ALL,
    { policyType: 'RESET' },
    { policyType: 'CARRY_TO_CAP', capAmount: money(100_000) },
    {
      policyType: 'REDIRECT_EXCESS',
      capAmount: money(100_000),
      destinationBucketId: asEntityId('bucket-2'),
    },
    { policyType: 'APPLY_LEFTOVER_POLICY', capAmount: money(100_000) },
  ];

  it('expresses exactly the five policy types fixed by Decision 074', () => {
    expect(VARIANTS.map((variant) => variant.policyType)).toEqual([
      'CARRY_ALL',
      'RESET',
      'CARRY_TO_CAP',
      'REDIRECT_EXCESS',
      'APPLY_LEFTOVER_POLICY',
    ]);
  });

  /* Decision 074: the two uncapped variants carry nothing but their discriminator. */
  it('carries nothing but the discriminator on the uncapped variants', () => {
    const reset: RolloverPolicyConfig = { policyType: 'RESET' };

    expect(Object.keys(CARRY_ALL)).toEqual(['policyType']);
    expect(Object.keys(reset)).toEqual(['policyType']);
  });

  it('narrows on the policyType discriminator', () => {
    const capOf = (policy: RolloverPolicyConfig): number | undefined =>
      policy.policyType === 'CARRY_ALL' || policy.policyType === 'RESET'
        ? undefined
        : policy.capAmount.cents;

    expect(capOf({ policyType: 'CARRY_TO_CAP', capAmount: money(100_000) })).toBe(100_000);
    expect(capOf(CARRY_ALL)).toBeUndefined();
  });

  /*
   * CARRY_TO_CAP and APPLY_LEFTOVER_POLICY carry identical fields and differ
   * only by discriminator, so narrowing must distinguish them by policyType
   * alone rather than by shape.
   */
  it('distinguishes the two capped variants that share a shape', () => {
    const redirectsToLeftover = (policy: RolloverPolicyConfig): boolean =>
      policy.policyType === 'APPLY_LEFTOVER_POLICY';

    expect(redirectsToLeftover({ policyType: 'APPLY_LEFTOVER_POLICY', capAmount: money(1) })).toBe(
      true,
    );
    expect(redirectsToLeftover({ policyType: 'CARRY_TO_CAP', capAmount: money(1) })).toBe(false);
  });

  it('carries the destination only on the redirecting variant', () => {
    const redirect: RolloverPolicyConfig = {
      policyType: 'REDIRECT_EXCESS',
      capAmount: money(100_000),
      destinationBucketId: asEntityId('bucket-2'),
    };

    expect(redirect).toEqual({
      policyType: 'REDIRECT_EXCESS',
      capAmount: { cents: 100_000, currency: 'USD' },
      destinationBucketId: 'bucket-2',
    });
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsPolicy(policy: ResolvedRolloverPolicy): ResolvedRolloverPolicy {
  return policy;
}

function acceptsConfig(config: RolloverPolicyConfig): RolloverPolicyConfig {
  return config;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsConfig(
    // @ts-expect-error - Decision 074 fixes five policy types, and this is not one of them.
    { policyType: 'CARRY_FORWARD' },
  );

  acceptsConfig(
    // @ts-expect-error - Decision 074: CARRY_TO_CAP carries its cap.
    { policyType: 'CARRY_TO_CAP' },
  );

  acceptsConfig(
    // @ts-expect-error - Decision 074: REDIRECT_EXCESS carries both the cap and the destination.
    { policyType: 'REDIRECT_EXCESS', capAmount: money(100_000) },
  );

  acceptsConfig(
    // @ts-expect-error - Decision 074: APPLY_LEFTOVER_POLICY carries its cap.
    { policyType: 'APPLY_LEFTOVER_POLICY' },
  );

  acceptsConfig({
    policyType: 'CARRY_ALL',
    // @ts-expect-error - Decision 074: CARRY_ALL carries no cap.
    capAmount: money(100_000),
  });

  acceptsConfig({
    policyType: 'RESET',
    // @ts-expect-error - Decision 074: RESET carries no cap.
    capAmount: money(100_000),
  });

  acceptsConfig({
    policyType: 'CARRY_TO_CAP',
    capAmount: money(100_000),
    // @ts-expect-error - Decision 074: only REDIRECT_EXCESS names a destination.
    destinationBucketId: asEntityId('bucket-2'),
  });

  acceptsConfig({
    policyType: 'CARRY_TO_CAP',
    // @ts-expect-error - PFOS-ENG-00 §10.4: money is never floating-point dollars.
    capAmount: 1000,
  });

  acceptsConfig({
    policyType: 'REDIRECT_EXCESS',
    capAmount: money(100_000),
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    destinationBucketId: 'bucket-2',
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    bucketId: 'bucket-1',
  });

  acceptsPolicy(
    // @ts-expect-error - Decision 074: a resolved rollover policy carries its configuration.
    { bucketId: asEntityId('bucket-1'), ruleVersionId: asEntityId('rule-version-1') },
  );

  // @ts-expect-error - Decision 074: the resolved rollover policy is immutable.
  POLICY.bucketId = asEntityId('bucket-2');

  // @ts-expect-error - Decision 074: the resolved rollover policy is immutable.
  POLICY.policy = CARRY_ALL;

  // @ts-expect-error - Decision 074: the authored configuration is immutable.
  CARRY_ALL.policyType = 'RESET';
}
