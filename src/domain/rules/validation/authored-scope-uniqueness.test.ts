import { describe, expect, it } from 'vitest';

import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import type { Result } from '@domain/shared/errors/result';
import { asEntityId } from '@domain/shared/ids/entity-id';

import type { ResolvedSlotKind } from '../contracts/resolved-slot-kind';
import type { RuleOwner } from '../contracts/rule-owner';
import type { RuleStatus } from '../contracts/rule-status';
import type { Rule } from '../contracts/rule';
import type { RuleDomainError } from '../errors/rule-error';
import { RULE_ERROR_CODES } from '../errors/rule-error-codes';
import { validateDistinctAuthoredScopes } from './authored-scope-uniqueness';

/**
 * The seven replacing slot kinds, restated here from Decision 084 rather than
 * derived from the production module. GLOBAL_OBLIGATION is deliberately absent:
 * it is additive under Decision 080 and exempt, and it is exercised separately.
 */
const REPLACING_SLOT_KINDS: readonly ResolvedSlotKind[] = [
  'ALLOCATION_BASIS',
  'TOP_PRIORITIES',
  'REQUIRED_FUNDING',
  'LOWER_PRIORITY_POOL',
  'LEFTOVER_POLICY',
  'ROLLOVER_POLICY',
  'GOAL_POLICY',
];

/**
 * Builds a rule. Every fixture that shares a scope is given a distinct ruleId,
 * which is what makes these tests statements about the authored scope rather
 * than about identity.
 */
function rule(
  ruleId: string,
  owner: RuleOwner,
  slotKind: ResolvedSlotKind,
  status: RuleStatus = 'ACTIVE',
): Rule {
  return { ruleId: asEntityId(ruleId), owner, slotKind, status };
}

const global: RuleOwner = { ownerType: 'GLOBAL' };
const bucket = (id: string): RuleOwner => ({ ownerType: 'BUCKET', ownerId: asEntityId(id) });
const group = (id: string): RuleOwner => ({ ownerType: 'GROUP', ownerId: asEntityId(id) });
const incomeSource = (id: string): RuleOwner => ({
  ownerType: 'INCOME_SOURCE',
  ownerId: asEntityId(id),
});

/** Asserts the single failure this validator reports. */
function expectDuplicateScope(result: Result<void, RuleDomainError>): void {
  expect(result.ok).toBe(false);

  if (result.ok) {
    return;
  }

  expect(result.error.code).toBe(RULE_ERROR_CODES.RULE_DUPLICATE_AUTHORED_SCOPE);
  expect(result.error.category).toBe(ERROR_CATEGORIES.VALIDATION);
}

describe('validateDistinctAuthoredScopes', () => {
  it('accepts an empty collection', () => {
    expect(validateDistinctAuthoredScopes([]).ok).toBe(true);
  });

  it('accepts one active rule at each replacing scope', () => {
    for (const slotKind of REPLACING_SLOT_KINDS) {
      expect(validateDistinctAuthoredScopes([rule('rule-1', global, slotKind)]).ok).toBe(true);
      expect(validateDistinctAuthoredScopes([rule('rule-1', bucket('b-1'), slotKind)]).ok).toBe(
        true,
      );
    }
  });

  /*
   * Decision 082: a given owner has at most one setting of a replacing kind, so
   * two rules at one owner and kind claim one setting rather than addressing
   * different subjects.
   */
  it('rejects two active global rules at one replacing scope', () => {
    for (const slotKind of REPLACING_SLOT_KINDS) {
      expectDuplicateScope(
        validateDistinctAuthoredScopes([
          rule('rule-1', global, slotKind),
          rule('rule-2', global, slotKind),
        ]),
      );
    }
  });

  it('rejects two active bucket rules on one bucket at one replacing scope', () => {
    expectDuplicateScope(
      validateDistinctAuthoredScopes([
        rule('rule-1', bucket('bucket-1'), 'REQUIRED_FUNDING'),
        rule('rule-2', bucket('bucket-1'), 'REQUIRED_FUNDING'),
      ]),
    );
  });

  it('rejects two active group rules on one group at one replacing scope', () => {
    expectDuplicateScope(
      validateDistinctAuthoredScopes([
        rule('rule-1', group('group-1'), 'ROLLOVER_POLICY'),
        rule('rule-2', group('group-1'), 'ROLLOVER_POLICY'),
      ]),
    );
  });

  it('rejects two active income-source rules on one source at one replacing scope', () => {
    expectDuplicateScope(
      validateDistinctAuthoredScopes([
        rule('rule-1', incomeSource('income-1'), 'LOWER_PRIORITY_POOL'),
        rule('rule-2', incomeSource('income-1'), 'LOWER_PRIORITY_POOL'),
      ]),
    );
  });

  /*
   * Decision 083: the domain is the ACTIVE rules of the current authored plan,
   * so a retired rule is retained history and never blocks its replacement.
   */
  it('accepts an active rule sharing a scope with the retired rule it replaced', () => {
    expect(
      validateDistinctAuthoredScopes([
        rule('rule-old', global, 'ROLLOVER_POLICY', 'RETIRED'),
        rule('rule-new', global, 'ROLLOVER_POLICY', 'ACTIVE'),
      ]).ok,
    ).toBe(true);
  });

  it('accepts two retired rules at one scope', () => {
    expect(
      validateDistinctAuthoredScopes([
        rule('rule-1', global, 'ROLLOVER_POLICY', 'RETIRED'),
        rule('rule-2', global, 'ROLLOVER_POLICY', 'RETIRED'),
      ]).ok,
    ).toBe(true);
  });

  it('accepts a long retired history beneath one active rule', () => {
    expect(
      validateDistinctAuthoredScopes([
        rule('rule-1', bucket('bucket-1'), 'REQUIRED_FUNDING', 'RETIRED'),
        rule('rule-2', bucket('bucket-1'), 'REQUIRED_FUNDING', 'RETIRED'),
        rule('rule-3', bucket('bucket-1'), 'REQUIRED_FUNDING', 'RETIRED'),
        rule('rule-4', bucket('bucket-1'), 'REQUIRED_FUNDING', 'ACTIVE'),
      ]).ok,
    ).toBe(true);
  });

  /* Decision 080: separately authored obligations accumulate, so the kind is exempt. */
  it('accepts several active global obligations at a global owner', () => {
    expect(
      validateDistinctAuthoredScopes([
        rule('rule-1', global, 'GLOBAL_OBLIGATION'),
        rule('rule-2', global, 'GLOBAL_OBLIGATION'),
        rule('rule-3', global, 'GLOBAL_OBLIGATION'),
      ]).ok,
    ).toBe(true);
  });

  /* Decision 084: the exemption belongs to the kind, so it holds at every owner. */
  it('accepts several active global obligations at each attached owner type', () => {
    for (const owner of [incomeSource('id-1'), bucket('id-1'), group('id-1')]) {
      expect(
        validateDistinctAuthoredScopes([
          rule('rule-1', owner, 'GLOBAL_OBLIGATION'),
          rule('rule-2', owner, 'GLOBAL_OBLIGATION'),
        ]).ok,
      ).toBe(true);
    }
  });

  it('accepts one replacing scope per owner identifier', () => {
    expect(
      validateDistinctAuthoredScopes([
        rule('rule-1', bucket('bucket-1'), 'REQUIRED_FUNDING'),
        rule('rule-2', bucket('bucket-2'), 'REQUIRED_FUNDING'),
        rule('rule-3', bucket('bucket-3'), 'REQUIRED_FUNDING'),
      ]).ok,
    ).toBe(true);
  });

  /*
   * §43.2's chain is three rules on one slot kind at three owner types. It must
   * remain expressible: precedence resolves it, and this structural invariant
   * has nothing to say about it.
   */
  it('accepts one replacing slot kind at each owner type', () => {
    expect(
      validateDistinctAuthoredScopes([
        rule('rule-1', bucket('id-1'), 'ROLLOVER_POLICY'),
        rule('rule-2', group('id-1'), 'ROLLOVER_POLICY'),
        rule('rule-3', incomeSource('id-1'), 'ROLLOVER_POLICY'),
        rule('rule-4', global, 'ROLLOVER_POLICY'),
      ]).ok,
    ).toBe(true);
  });

  /* Decision 084: owner types are never compared across each other. */
  it('does not conflate one identifier value across owner types', () => {
    expect(
      validateDistinctAuthoredScopes([
        rule('rule-1', bucket('shared-id'), 'GOAL_POLICY'),
        rule('rule-2', group('shared-id'), 'GOAL_POLICY'),
        rule('rule-3', incomeSource('shared-id'), 'GOAL_POLICY'),
      ]).ok,
    ).toBe(true);
  });

  it('accepts one owner holding several different replacing kinds', () => {
    expect(
      validateDistinctAuthoredScopes(
        REPLACING_SLOT_KINDS.map((slotKind, index) =>
          rule(`rule-${String(index)}`, bucket('bucket-1'), slotKind),
        ),
      ).ok,
    ).toBe(true);
  });

  it('finds a collision separated by many unrelated rules', () => {
    expectDuplicateScope(
      validateDistinctAuthoredScopes([
        rule('rule-1', bucket('bucket-1'), 'REQUIRED_FUNDING'),
        rule('rule-2', bucket('bucket-2'), 'REQUIRED_FUNDING'),
        rule('rule-3', group('group-1'), 'ROLLOVER_POLICY'),
        rule('rule-4', global, 'TOP_PRIORITIES'),
        rule('rule-5', global, 'GLOBAL_OBLIGATION'),
        rule('rule-6', bucket('bucket-1'), 'REQUIRED_FUNDING'),
      ]),
    );
  });

  /*
   * A collision is symmetric, so no arrangement of one collection can change the
   * verdict, and the error interpolates nothing, so a rejected outcome is
   * identical value-for-value however it was reached.
   */
  it('returns an identical result however a rejected collection is arranged', () => {
    const rules: readonly Rule[] = [
      rule('rule-1', bucket('bucket-1'), 'REQUIRED_FUNDING'),
      rule('rule-2', global, 'ROLLOVER_POLICY', 'RETIRED'),
      rule('rule-3', bucket('bucket-1'), 'REQUIRED_FUNDING'),
      rule('rule-4', global, 'GLOBAL_OBLIGATION'),
    ];

    const forward = validateDistinctAuthoredScopes(rules);
    const reversed = validateDistinctAuthoredScopes([...rules].reverse());

    expectDuplicateScope(forward);
    expect(reversed).toEqual(forward);
  });

  it('returns an identical result however an accepted collection is arranged', () => {
    const rules: readonly Rule[] = [
      rule('rule-1', bucket('bucket-1'), 'REQUIRED_FUNDING'),
      rule('rule-2', bucket('bucket-2'), 'REQUIRED_FUNDING'),
      rule('rule-3', global, 'ROLLOVER_POLICY', 'RETIRED'),
      rule('rule-4', global, 'ROLLOVER_POLICY'),
    ];

    expect(validateDistinctAuthoredScopes([...rules].reverse())).toEqual(
      validateDistinctAuthoredScopes(rules),
    );
  });

  it('reads no rule identity: renaming every rule changes nothing', () => {
    const scoped = (prefix: string): readonly Rule[] => [
      rule(`${prefix}-1`, global, 'LEFTOVER_POLICY'),
      rule(`${prefix}-2`, global, 'LEFTOVER_POLICY'),
    ];

    expect(validateDistinctAuthoredScopes(scoped('zzz'))).toEqual(
      validateDistinctAuthoredScopes(scoped('aaa')),
    );
  });

  it('does not mutate or reorder the supplied collection', () => {
    const rules: readonly Rule[] = [
      rule('rule-1', bucket('bucket-1'), 'REQUIRED_FUNDING'),
      rule('rule-2', bucket('bucket-2'), 'REQUIRED_FUNDING'),
    ];
    const snapshot = [...rules];

    validateDistinctAuthoredScopes(rules);

    expect(rules).toEqual(snapshot);
  });

  it('omits affectedEntityIds from every rejection', () => {
    const result = validateDistinctAuthoredScopes([
      rule('rule-1', group('group-1'), 'GOAL_POLICY'),
      rule('rule-2', group('group-1'), 'GOAL_POLICY'),
    ]);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.affectedEntityIds).toBeUndefined();
    }
  });

  /*
   * Decision 084: the error names no entity and interpolates nothing, so a
   * collision at one owner and kind is reported identically to a collision at
   * any other.
   */
  it('reports every collision with the same value whichever scope collided', () => {
    const first = validateDistinctAuthoredScopes([
      rule('rule-1', global, 'TOP_PRIORITIES'),
      rule('rule-2', global, 'TOP_PRIORITIES'),
    ]);
    const second = validateDistinctAuthoredScopes([
      rule('rule-9', bucket('bucket-7'), 'GOAL_POLICY'),
      rule('rule-8', bucket('bucket-7'), 'GOAL_POLICY'),
    ]);
    const third = validateDistinctAuthoredScopes([
      rule('rule-4', incomeSource('income-3'), 'ALLOCATION_BASIS'),
      rule('rule-5', incomeSource('income-3'), 'ALLOCATION_BASIS'),
    ]);

    expect(second).toEqual(first);
    expect(third).toEqual(first);
    expectDuplicateScope(first);
  });
});
