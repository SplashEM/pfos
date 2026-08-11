import { describe, expect, it } from 'vitest';

import { asEntityId } from '@domain/shared/ids/entity-id';

import { RULE_EXPLANATION_CODES } from './rule-explanation-codes';

import type { RuleExplanation } from './rule-explanation';

const RESOLUTION_CONTEXT: RuleExplanation = {
  code: RULE_EXPLANATION_CODES.RULE_EXPLAIN_RESOLUTION_CONTEXT,
  title: 'How this paycheck was resolved',
  summary: 'The global plan applied because the income source defines no override.',
  affectedEntityIds: [asEntityId('income-source-1')],
};

describe('RuleExplanation', () => {
  it('carries a registered code with its user-facing text', () => {
    expect(RESOLUTION_CONTEXT).toEqual({
      code: 'RULE_EXPLAIN_RESOLUTION_CONTEXT',
      title: 'How this paycheck was resolved',
      summary: 'The global plan applied because the income source defines no override.',
      affectedEntityIds: ['income-source-1'],
    });
  });

  /*
   * Every code in the registry must be usable in the envelope. Decision 074
   * fixes both halves — the vocabulary and the shape that carries it — so a
   * code that cannot be constructed here would leave a registered outcome
   * unreportable.
   */
  it('accepts every registered explanation code', () => {
    for (const code of Object.values(RULE_EXPLANATION_CODES)) {
      const explanation: RuleExplanation = { ...RESOLUTION_CONTEXT, code };
      expect(explanation.code).toBe(code);
    }
  });

  it('carries the rule versions the explanation was derived from', () => {
    const explanation: RuleExplanation = {
      ...RESOLUTION_CONTEXT,
      code: RULE_EXPLANATION_CODES.RULE_EXPLAIN_RULE_OVERRIDDEN,
      ruleVersionIds: [asEntityId('rule-version-1')],
    };

    expect(explanation.ruleVersionIds).toEqual(['rule-version-1']);
  });

  it('carries a presentation severity', () => {
    const explanation: RuleExplanation = { ...RESOLUTION_CONTEXT, severity: 'INFO' };
    expect(explanation.severity).toBe('INFO');
  });
});

/**
 * Never executed; see the equivalent block in ./rule-explanation-codes.test.ts.
 * tsc fails if a directive below is unused, which is what asserts that the line
 * it guards does not compile. Nothing invalid is constructed at run time.
 */
function acceptsRuleExplanation(explanation: RuleExplanation): RuleExplanation {
  return explanation;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsRuleExplanation({
    ...RESOLUTION_CONTEXT,
    // @ts-expect-error - Decision 074: an unregistered code is not a RuleExplanationCode.
    code: 'RULE_EXPLAIN_NOT_REGISTERED',
  });

  acceptsRuleExplanation({
    ...RESOLUTION_CONTEXT,
    // @ts-expect-error - Decision 074: a skip reason is not an explanation code.
    code: 'RULE_SKIP_DESTINATION_ARCHIVED',
  });

  acceptsRuleExplanation({
    ...RESOLUTION_CONTEXT,
    // @ts-expect-error - Decision 074: an error code is not an explanation code.
    code: 'RULE_POOL_NOT_EXACTLY_100_PERCENT',
  });

  acceptsRuleExplanation({
    ...RESOLUTION_CONTEXT,
    // @ts-expect-error - Decision 074: no Rule Engine detail vocabulary exists in V1.
    details: ['a detail with no accepted vocabulary'],
  });
}
