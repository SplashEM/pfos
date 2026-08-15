import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';

import type { Rule } from './rule';
import { precedenceLevelOf } from './rule-owner';

const BUCKET_FUNDING_RULE: Rule = {
  ruleId: asEntityId('rule-1'),
  owner: { ownerType: 'BUCKET', ownerId: asEntityId('bucket-1') },
  slotKind: 'REQUIRED_FUNDING',
};

describe('Rule', () => {
  it('carries exactly the three stable fields fixed by Decision 081', () => {
    expect(Object.keys(BUCKET_FUNDING_RULE)).toEqual(['ruleId', 'owner', 'slotKind']);
  });

  /*
   * The Record is over `keyof Rule`, which the compiler requires to hold exactly
   * one key per field: a fourth field would leave a key missing here and a
   * removed one would leave a key excess. This states the shape of the type
   * rather than of the value above, without inspecting source text.
   */
  it('names no field beyond those three in its type', () => {
    const fields: Record<keyof Rule, true> = { ruleId: true, owner: true, slotKind: true };
    expect(Object.keys(fields).sort()).toEqual(['owner', 'ruleId', 'slotKind']);
  });

  /*
   * Decision 082: TOP_PRIORITIES is authored as one global Rule whose member
   * buckets, ranks and shares are RuleVersion configuration, so the Rule itself
   * names no bucket.
   */
  it('addresses a plan-level kind with a global owner and no bucket', () => {
    const rule: Rule = {
      ruleId: asEntityId('rule-2'),
      owner: { ownerType: 'GLOBAL' },
      slotKind: 'TOP_PRIORITIES',
    };

    expect(rule).toEqual({
      ruleId: 'rule-2',
      owner: { ownerType: 'GLOBAL' },
      slotKind: 'TOP_PRIORITIES',
    });
  });

  /*
   * Decision 082: a bucket identifier is stable addressing only where it is the
   * rule's owner. REQUIRED_FUNDING is bucket-owned in V1, so `ownerId` is the
   * target and no separate target field exists.
   */
  it('addresses a bucket-owned kind through its owner identifier', () => {
    expect(BUCKET_FUNDING_RULE.owner).toEqual({ ownerType: 'BUCKET', ownerId: 'bucket-1' });
    expect(BUCKET_FUNDING_RULE.slotKind).toBe('REQUIRED_FUNDING');
  });

  /*
   * Decision 082: an income-source pool rule carries a whole pool in its
   * configuration rather than a per-bucket override, so the Rule names only the
   * income source it is attached to.
   */
  it('addresses an income-source pool override without naming a destination', () => {
    const rule: Rule = {
      ruleId: asEntityId('rule-3'),
      owner: { ownerType: 'INCOME_SOURCE', ownerId: asEntityId('income-1') },
      slotKind: 'LOWER_PRIORITY_POOL',
    };

    expect(Object.keys(rule)).toEqual(['ruleId', 'owner', 'slotKind']);
  });

  /*
   * §43.2's worked precedence chain is directly representable: three rules on
   * one slot kind, owned by bucket, group and global. This asserts
   * representability and the §6 ordering of their derived levels only. Nothing
   * is resolved, no winner is chosen, and the product default that completes
   * §43.2's chain is absent because it is not an authored rule.
   */
  it('represents the §43.2 rollover chain as three rules at three levels', () => {
    const chain: readonly Rule[] = [
      {
        ruleId: asEntityId('rule-bucket'),
        owner: { ownerType: 'BUCKET', ownerId: asEntityId('bucket-1') },
        slotKind: 'ROLLOVER_POLICY',
      },
      {
        ruleId: asEntityId('rule-group'),
        owner: { ownerType: 'GROUP', ownerId: asEntityId('group-1') },
        slotKind: 'ROLLOVER_POLICY',
      },
      {
        ruleId: asEntityId('rule-global'),
        owner: { ownerType: 'GLOBAL' },
        slotKind: 'ROLLOVER_POLICY',
      },
    ];

    expect(chain.map((rule) => precedenceLevelOf(rule.owner))).toEqual([6, 7, 8]);
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsRule(rule: Rule): Rule {
  return rule;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsRule(
    // @ts-expect-error - Decision 081: a rule names the kind of structure it contributes to.
    { ruleId: asEntityId('rule-1'), owner: { ownerType: 'GLOBAL' } },
  );

  acceptsRule(
    // @ts-expect-error - Decision 081: a rule names its owner.
    { ruleId: asEntityId('rule-1'), slotKind: 'LEFTOVER_POLICY' },
  );

  acceptsRule({
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    ruleId: 'rule-1',
    owner: { ownerType: 'GLOBAL' },
    slotKind: 'LEFTOVER_POLICY',
  });

  acceptsRule({
    ...BUCKET_FUNDING_RULE,
    // @ts-expect-error - Decision 081: a §5 category cannot name a slot kind and is not stored.
    ruleCategory: 'BUCKET_RULE',
  });

  acceptsRule({
    ...BUCKET_FUNDING_RULE,
    // @ts-expect-error - Decision 081: a funding or policy type is versioned configuration.
    ruleType: 'FIXED_MONTHLY',
  });

  acceptsRule({
    ...BUCKET_FUNDING_RULE,
    // @ts-expect-error - Decision 081: the §6 level is derived from the owner, never stored.
    precedenceLevel: 6,
  });

  acceptsRule({
    ...BUCKET_FUNDING_RULE,
    // @ts-expect-error - Decision 082: a bucket is addressing only where it is the owner.
    targetBucketIds: [asEntityId('bucket-2')],
  });

  acceptsRule({
    ...BUCKET_FUNDING_RULE,
    // @ts-expect-error - Decision 081: no exact resolved address or subject is established.
    subject: asEntityId('bucket-2'),
  });

  acceptsRule({
    ...BUCKET_FUNDING_RULE,
    // @ts-expect-error - Decision 082: Rule.status and lifecycle are deliberately not introduced.
    status: 'ACTIVE',
  });

  acceptsRule({
    ...BUCKET_FUNDING_RULE,
    // @ts-expect-error - Decision 081: currentVersionId is deferred.
    currentVersionId: asEntityId('rule-version-1'),
  });

  acceptsRule({
    ...BUCKET_FUNDING_RULE,
    // @ts-expect-error - Decision 078: the effective period belongs to the version, not the rule.
    effectiveFrom: '2026-01-01',
  });

  acceptsRule({
    ...BUCKET_FUNDING_RULE,
    // @ts-expect-error - Decision 081: no RuleVersion configuration payload is designed here.
    configuration: {},
  });

  const rule: Rule = { ...BUCKET_FUNDING_RULE };

  // @ts-expect-error - Decision 081: identity is stable across every version of a rule.
  rule.ruleId = asEntityId('rule-2');

  // @ts-expect-error - Decision 081: changing a slot kind is a different logical rule.
  rule.slotKind = 'GOAL_POLICY';
}
