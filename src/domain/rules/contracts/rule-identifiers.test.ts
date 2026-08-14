import { describe, expect, it } from 'vitest';

import { asEntityId, type EntityId } from '@domain/shared/ids/entity-id';

import type { PlanVersionId } from './plan-version-id';
import type { RuleId, RuleVersionId } from './rule-identifiers';

const RULE: RuleId = asEntityId('rule-1');
const RULE_VERSION: RuleVersionId = asEntityId('rule-version-1');

describe('RuleId', () => {
  it('carries an entity identifier', () => {
    expect(RULE).toBe('rule-1');
  });

  /*
   * Decision 078: a semantic alias, semantically distinct but not type-distinct
   * from another EntityId. No second brand is introduced, so assignment runs
   * both ways, exactly as Decision 074 settled for PlanVersionId.
   */
  it('is mutually assignable with EntityId', () => {
    const entityId: EntityId = RULE;
    const ruleId: RuleId = entityId;

    expect(ruleId).toBe(RULE);
  });
});

describe('RuleVersionId', () => {
  it('carries an entity identifier', () => {
    expect(RULE_VERSION).toBe('rule-version-1');
  });

  it('is mutually assignable with EntityId', () => {
    const entityId: EntityId = RULE_VERSION;
    const ruleVersionId: RuleVersionId = entityId;

    expect(ruleVersionId).toBe(RULE_VERSION);
  });
});

/**
 * The aliases do not separate at compile time, and recording that is the point.
 *
 * Decision 078 chose semantic aliases over new brands, so nothing stops a rule
 * identifier being passed where a version identifier is expected. A later
 * reader must not assume a guarantee the compiler does not give. If branded
 * identifiers are ever introduced, these cases fail and force the change to be
 * deliberate.
 */
describe('the rule identifier aliases', () => {
  it('are not type-distinct from each other', () => {
    const ruleId: RuleId = RULE_VERSION;
    const ruleVersionId: RuleVersionId = RULE;

    expect(ruleId).toBe(RULE_VERSION);
    expect(ruleVersionId).toBe(RULE);
  });

  it('are not type-distinct from PlanVersionId', () => {
    const planVersionId: PlanVersionId = RULE_VERSION;

    expect(planVersionId).toBe(RULE_VERSION);
  });
});

/**
 * Never executed; see the equivalent block in ./plan-version-id.test.ts. tsc
 * fails if a directive below is unused, which is what asserts that the line it
 * guards does not compile. Nothing invalid is constructed at run time.
 */
function acceptsRuleId(ruleId: RuleId): RuleId {
  return ruleId;
}

function acceptsRuleVersionId(ruleVersionId: RuleVersionId): RuleVersionId {
  return ruleVersionId;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsRuleId(
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    'rule-1',
  );

  acceptsRuleVersionId(
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    'rule-version-1',
  );
}
