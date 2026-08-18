import { money } from '@test/builders/money';
import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';

import type {
  ResolvedRolloverPolicy,
  RolloverPolicyConfig,
  RolloverPolicyProvenance,
} from './resolved-rollover-policy';

const CARRY_ALL: RolloverPolicyConfig = { policyType: 'CARRY_ALL' };

const AUTHORED: RolloverPolicyProvenance = {
  kind: 'AUTHORED',
  ruleVersionId: asEntityId('rule-version-1'),
};

const PRODUCT_DEFAULT: RolloverPolicyProvenance = { kind: 'PRODUCT_DEFAULT' };

const POLICY: ResolvedRolloverPolicy = {
  bucketId: asEntityId('bucket-1'),
  provenance: AUTHORED,
  policy: CARRY_ALL,
};

describe('ResolvedRolloverPolicy', () => {
  it('carries every field', () => {
    expect(POLICY).toEqual({
      bucketId: 'bucket-1',
      provenance: { kind: 'AUTHORED', ruleVersionId: 'rule-version-1' },
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
      provenance: { kind: 'AUTHORED', ruleVersionId: 'rule-version-1' },
      policy: { policyType: 'CARRY_TO_CAP', capAmount: { cents: 100_000, currency: 'USD' } },
    });
  });

  /*
   * Decision 028 and PFOS-ENG-01 §17.1 make CARRY_ALL the product default, and
   * Decision 081 records that most buckets author no rollover rule, so a
   * product-default entry is the ordinary case rather than the exceptional one.
   * Before Decision 094 it could not be represented truthfully at all.
   */
  it('carries a product-default entry with no rule version', () => {
    const defaulted: ResolvedRolloverPolicy = {
      ...POLICY,
      provenance: PRODUCT_DEFAULT,
    };

    expect(defaulted).toEqual({
      bucketId: 'bucket-1',
      provenance: { kind: 'PRODUCT_DEFAULT' },
      policy: { policyType: 'CARRY_ALL' },
    });
  });
});

describe('RolloverPolicyProvenance', () => {
  /* Decision 094 fixes exactly two states, and Decision 093 makes them mutually exclusive. */
  it('expresses exactly the two provenance kinds fixed by Decision 094', () => {
    const STATES: readonly RolloverPolicyProvenance[] = [AUTHORED, PRODUCT_DEFAULT];

    expect(STATES.map((state) => state.kind)).toEqual(['AUTHORED', 'PRODUCT_DEFAULT']);
  });

  /*
   * Decision 093: authored provenance carries exactly one genuine RuleVersionId,
   * being the exact version that produced the value, which PFOS-ENG-01 §19.1
   * requires to remain reconstructable.
   */
  it('carries exactly the discriminant and the rule version on the authored arm', () => {
    expect(Object.keys(AUTHORED)).toEqual(['kind', 'ruleVersionId']);
  });

  /*
   * Decision 093: product-default provenance carries no RuleVersionId, no
   * sentinel and no fabricated identifier. Decision 094 adds nothing beside the
   * discriminant, which is what leaves product-default identity genuinely open.
   */
  it('carries nothing but the discriminant on the product-default arm', () => {
    expect(Object.keys(PRODUCT_DEFAULT)).toEqual(['kind']);
  });

  it('narrows on the kind discriminator', () => {
    const versionOf = (provenance: RolloverPolicyProvenance): string | undefined =>
      provenance.kind === 'AUTHORED' ? provenance.ruleVersionId : undefined;

    expect(versionOf(AUTHORED)).toBe('rule-version-1');
    expect(versionOf(PRODUCT_DEFAULT)).toBeUndefined();
  });

  /*
   * Decision 094: policy and provenance are independent dimensions, which is why
   * they are composed rather than multiplied. Nothing in accepted authority ties
   * a provenance state to a policy variant, so every combination is expressible.
   */
  it('composes with every policy variant independently', () => {
    const POLICIES: readonly RolloverPolicyConfig[] = [
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

    const composed: readonly ResolvedRolloverPolicy[] = POLICIES.flatMap((policy) =>
      [AUTHORED, PRODUCT_DEFAULT].map((provenance) => ({
        bucketId: asEntityId('bucket-1'),
        provenance,
        policy,
      })),
    );

    expect(composed).toHaveLength(10);
    expect(composed.map((entry) => entry.provenance.kind)).toEqual([
      'AUTHORED',
      'PRODUCT_DEFAULT',
      'AUTHORED',
      'PRODUCT_DEFAULT',
      'AUTHORED',
      'PRODUCT_DEFAULT',
      'AUTHORED',
      'PRODUCT_DEFAULT',
      'AUTHORED',
      'PRODUCT_DEFAULT',
    ]);
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
 *
 * Each directive is built from a known-good fixture with exactly one defect
 * introduced, and is attached to the offending member rather than to an
 * enclosing call, so the intended diagnostic is the only one available.
 */
function acceptsPolicy(policy: ResolvedRolloverPolicy): ResolvedRolloverPolicy {
  return policy;
}

function acceptsConfig(config: RolloverPolicyConfig): RolloverPolicyConfig {
  return config;
}

function acceptsProvenance(provenance: RolloverPolicyProvenance): RolloverPolicyProvenance {
  return provenance;
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

  acceptsProvenance(
    // @ts-expect-error - Decision 094 fixes two provenance kinds, and this is not one of them.
    { kind: 'SYSTEM' },
  );

  acceptsProvenance(
    // @ts-expect-error - Decision 093: authored provenance carries exactly one rule version.
    { kind: 'AUTHORED' },
  );

  acceptsProvenance({
    kind: 'PRODUCT_DEFAULT',
    // @ts-expect-error - Decision 093: product-default provenance carries no rule version.
    ruleVersionId: asEntityId('rule-version-1'),
  });

  acceptsProvenance({
    kind: 'AUTHORED',
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    ruleVersionId: 'rule-version-1',
  });

  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    bucketId: 'bucket-1',
  });

  acceptsPolicy(
    // @ts-expect-error - Decision 074: a resolved rollover policy carries its configuration.
    { bucketId: asEntityId('bucket-1'), provenance: AUTHORED },
  );

  acceptsPolicy(
    // @ts-expect-error - Decision 094: a resolved rollover policy carries its provenance.
    { bucketId: asEntityId('bucket-1'), policy: CARRY_ALL },
  );

  /*
   * Decisions 094 and 095 retired the top-level ruleVersionId. The directive
   * supplies a type-correct value, so the only diagnostic available is the
   * excess property itself rather than a branding error that would pass for the
   * wrong reason.
   */
  acceptsPolicy({
    ...POLICY,
    // @ts-expect-error - Decision 094: the rule version lives on the AUTHORED provenance arm.
    ruleVersionId: asEntityId('rule-version-1'),
  });

  // @ts-expect-error - Decision 074: the resolved rollover policy is immutable.
  POLICY.bucketId = asEntityId('bucket-2');

  // @ts-expect-error - Decision 074: the resolved rollover policy is immutable.
  POLICY.policy = CARRY_ALL;

  // @ts-expect-error - Decision 094: the resolved provenance is immutable.
  POLICY.provenance = PRODUCT_DEFAULT;

  // @ts-expect-error - Decision 094: the provenance discriminant is immutable.
  AUTHORED.kind = 'PRODUCT_DEFAULT';

  if (AUTHORED.kind === 'AUTHORED') {
    // @ts-expect-error - Decision 094: the authored rule version is immutable.
    AUTHORED.ruleVersionId = asEntityId('rule-version-2');
  }

  // @ts-expect-error - Decision 074: the authored configuration is immutable.
  CARRY_ALL.policyType = 'RESET';
}
