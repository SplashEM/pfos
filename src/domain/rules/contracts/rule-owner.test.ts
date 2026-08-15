import { describe, expect, it } from 'vitest';

import { asEntityId, type EntityId } from '@domain/shared/ids/entity-id';

import { precedenceLevelOf, type RuleOwner } from './rule-owner';

/**
 * The §6 level of each owner type, restated here from Decision 081 rather than
 * imported. The production table is unexported, so pinning the numbers
 * independently is what makes this a check rather than a restatement of the
 * code.
 *
 * It is declared as a Record over the union so the compiler requires exactly one
 * key per variant: a fifth owner would leave a key missing here, and a removed
 * one would leave a key excess. That is what makes the vocabulary test below a
 * statement about the type rather than about this array.
 */
const PRECEDENCE_BY_OWNER_TYPE: Record<RuleOwner['ownerType'], number> = {
  INCOME_SOURCE: 5,
  BUCKET: 6,
  GROUP: 7,
  GLOBAL: 8,
};

const OWNER_TYPES: readonly RuleOwner['ownerType'][] = [
  'INCOME_SOURCE',
  'BUCKET',
  'GROUP',
  'GLOBAL',
];

const ATTACHED_OWNER_TYPES = ['INCOME_SOURCE', 'BUCKET', 'GROUP'] as const;

/** Builds the accepted shape for an owner type: GLOBAL alone carries no ownerId. */
function ownerOf(ownerType: RuleOwner['ownerType'], ownerId: EntityId): RuleOwner {
  return ownerType === 'GLOBAL' ? { ownerType } : { ownerType, ownerId };
}

describe('RuleOwner', () => {
  it('holds exactly the four owner types accepted by Decision 081', () => {
    expect(OWNER_TYPES).toEqual(['INCOME_SOURCE', 'BUCKET', 'GROUP', 'GLOBAL']);
    expect(OWNER_TYPES).toEqual(Object.keys(PRECEDENCE_BY_OWNER_TYPE));
  });

  /*
   * Decision 081: a global rule owns no entity, so the variant carries nothing
   * but its discriminator rather than an optional identifier (§47.8).
   */
  it('carries a global owner with nothing but its discriminator', () => {
    const owner: RuleOwner = { ownerType: 'GLOBAL' };
    expect(Object.keys(owner)).toEqual(['ownerType']);
  });

  it('carries an owner identifier on each of the three attached owners', () => {
    for (const ownerType of ATTACHED_OWNER_TYPES) {
      const owner: RuleOwner = { ownerType, ownerId: asEntityId('owner-1') };
      expect(Object.keys(owner)).toEqual(['ownerType', 'ownerId']);
      expect(owner).toEqual({ ownerType, ownerId: 'owner-1' });
    }
  });

  it('narrows on the ownerType discriminator', () => {
    const identifierOf = (owner: RuleOwner): string | undefined =>
      owner.ownerType === 'GLOBAL' ? undefined : owner.ownerId;

    expect(identifierOf({ ownerType: 'BUCKET', ownerId: asEntityId('bucket-1') })).toBe('bucket-1');
    expect(identifierOf({ ownerType: 'GLOBAL' })).toBeUndefined();
  });
});

describe('precedenceLevelOf', () => {
  it('projects each owner type to its §6 level', () => {
    for (const ownerType of OWNER_TYPES) {
      expect(precedenceLevelOf(ownerOf(ownerType, asEntityId('owner-1')))).toBe(
        PRECEDENCE_BY_OWNER_TYPE[ownerType],
      );
    }
  });

  it('projects the four levels fixed by Decision 081 and no others', () => {
    const levels = OWNER_TYPES.map((ownerType) =>
      precedenceLevelOf(ownerOf(ownerType, asEntityId('owner-1'))),
    );

    expect(levels).toEqual([5, 6, 7, 8]);
  });

  /*
   * §6: a lower-numbered level has higher precedence. This asserts the ordering
   * of the four authored levels and nothing else — no rule is compared to
   * another, nothing is selected, and level 9 is absent because a product
   * default is not an authored rule.
   */
  it('orders the authored levels from income source down to global', () => {
    const income = precedenceLevelOf({ ownerType: 'INCOME_SOURCE', ownerId: asEntityId('src-1') });
    const bucket = precedenceLevelOf({ ownerType: 'BUCKET', ownerId: asEntityId('bucket-1') });
    const group = precedenceLevelOf({ ownerType: 'GROUP', ownerId: asEntityId('group-1') });
    const global = precedenceLevelOf({ ownerType: 'GLOBAL' });

    expect(income).toBeLessThan(bucket);
    expect(bucket).toBeLessThan(group);
    expect(group).toBeLessThan(global);
  });

  it('returns the same level for the same owner every time', () => {
    const owner: RuleOwner = { ownerType: 'GROUP', ownerId: asEntityId('group-1') };
    expect(precedenceLevelOf(owner)).toBe(precedenceLevelOf(owner));
  });

  /*
   * PFOS-ENG-00 §14 keeps an identifier opaque, and Decision 081 derives the
   * level from the owner alone. Two rules attached to different entities of one
   * type therefore compete at the same level. The property test in
   * src/test/properties/rule-engine.property.test.ts states this over arbitrary
   * identifiers.
   */
  it('reads the owner type and never the owner identifier', () => {
    for (const ownerType of ATTACHED_OWNER_TYPES) {
      expect(precedenceLevelOf(ownerOf(ownerType, asEntityId('owner-1')))).toBe(
        precedenceLevelOf(ownerOf(ownerType, asEntityId('owner-2'))),
      );
    }
  });
});

/**
 * Never executed; see the equivalent block in ./skipped-rule.test.ts. tsc fails
 * if a directive below is unused, which is what asserts that the line it guards
 * does not compile. Nothing invalid is constructed at run time.
 */
function acceptsOwner(owner: RuleOwner): RuleOwner {
  return owner;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsOwner({
    // @ts-expect-error - Decision 081: §6 level 9 is a resolver fallback, not a fifth owner.
    ownerType: 'PRODUCT_DEFAULT',
  });

  acceptsOwner({
    ownerType: 'GLOBAL',
    // @ts-expect-error - Decision 081: a global rule owns no entity, so it carries no ownerId.
    ownerId: asEntityId('owner-1'),
  });

  acceptsOwner(
    // @ts-expect-error - Decision 081: an income-source rule is attached to an income source.
    { ownerType: 'INCOME_SOURCE' },
  );

  acceptsOwner(
    // @ts-expect-error - Decision 081: a bucket rule is attached to a bucket.
    { ownerType: 'BUCKET' },
  );

  acceptsOwner(
    // @ts-expect-error - Decision 081: a group rule is attached to a bucket group.
    { ownerType: 'GROUP' },
  );

  acceptsOwner({
    ownerType: 'BUCKET',
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    ownerId: 'bucket-1',
  });

  acceptsOwner({
    ownerType: 'GLOBAL',
    // @ts-expect-error - Decision 081: the §6 level is derived from the owner, never stored.
    precedenceLevel: 8,
  });

  const owner: RuleOwner = { ownerType: 'BUCKET', ownerId: asEntityId('bucket-1') };

  // @ts-expect-error - Decision 081: ownership is stable; changing it is a different logical rule.
  owner.ownerType = 'GROUP';
}
