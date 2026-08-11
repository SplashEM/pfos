import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';

import { RULE_SKIP_REASON_CODES } from './rule-skip-reason-codes';

import type { SkippedRule } from './skipped-rule';

const SKIPPED: SkippedRule = {
  ruleId: asEntityId('rule-1'),
  reasonCode: RULE_SKIP_REASON_CODES.RULE_SKIP_DESTINATION_ARCHIVED,
  affectedEntityIds: [asEntityId('bucket-1')],
};

describe('SkippedRule', () => {
  it('carries every field', () => {
    const skipped: SkippedRule = {
      ...SKIPPED,
      ruleVersionId: asEntityId('rule-version-1'),
    };

    expect(skipped).toEqual({
      ruleId: 'rule-1',
      ruleVersionId: 'rule-version-1',
      reasonCode: 'RULE_SKIP_DESTINATION_ARCHIVED',
      affectedEntityIds: ['bucket-1'],
    });
  });

  /* Decision 074 defines `ruleVersionId` as optional. */
  it('omits ruleVersionId entirely when it is not supplied', () => {
    expect(Object.keys(SKIPPED).sort()).toEqual(['affectedEntityIds', 'reasonCode', 'ruleId']);
  });

  it('accepts a skip that affects no entity', () => {
    const skipped: SkippedRule = { ...SKIPPED, affectedEntityIds: [] };
    expect(skipped.affectedEntityIds).toEqual([]);
  });

  /*
   * Every code in the registry must be usable in the structure that carries
   * it. Decision 074 fixes both halves, so a registered code that could not be
   * constructed here would leave a skip unreportable.
   */
  it('accepts every registered skip reason code', () => {
    for (const reasonCode of Object.values(RULE_SKIP_REASON_CODES)) {
      const skipped: SkippedRule = { ...SKIPPED, reasonCode };
      expect(skipped.reasonCode).toBe(reasonCode);
    }
  });
});

/**
 * Never executed; see the equivalent block in ./rule-skip-reason-codes.test.ts.
 * tsc fails if a directive below is unused, which is what asserts that the line
 * it guards does not compile. Nothing invalid is constructed at run time.
 */
function acceptsSkippedRule(skipped: SkippedRule): SkippedRule {
  return skipped;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsSkippedRule({
    ...SKIPPED,
    // @ts-expect-error - Decision 074: an unregistered code is not a RuleSkipReasonCode.
    reasonCode: 'RULE_SKIP_NOT_REGISTERED',
  });

  acceptsSkippedRule({
    ...SKIPPED,
    // @ts-expect-error - Decision 074: an explanation code is not a skip reason.
    reasonCode: 'RULE_EXPLAIN_RULE_SKIPPED',
  });

  acceptsSkippedRule({
    ...SKIPPED,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    ruleId: 'rule-1',
  });

  acceptsSkippedRule({
    ...SKIPPED,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    ruleVersionId: 'rule-version-1',
  });

  acceptsSkippedRule({
    ...SKIPPED,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    affectedEntityIds: ['bucket-1'],
  });

  // @ts-expect-error - Decision 074: the structure is immutable.
  SKIPPED.reasonCode = RULE_SKIP_REASON_CODES.RULE_SKIP_EVENT_OVERRIDE_SKIPPED;

  // @ts-expect-error - Decision 074: the affected-entity list is immutable.
  SKIPPED.affectedEntityIds.push(asEntityId('bucket-2'));
}
