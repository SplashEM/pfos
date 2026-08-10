import { describe, expect, it } from 'vitest';

import { RULE_EXPLANATION_CODES, type RuleExplanationCode } from './rule-explanation-codes';

/**
 * Decision 074: the explanation registry is closed.
 *
 * This block is never executed. TypeScript still checks it, so the
 * `@ts-expect-error` asserts that the line beneath it does not compile: tsc
 * fails with "Unused '@ts-expect-error' directive" if the value it guards turns
 * out to be assignable. `npm run typecheck` is therefore the assertion.
 *
 * The guard is annotated `boolean` rather than written as a literal `false`,
 * because tsconfig sets `allowUnreachableCode: false`.
 */
function acceptsExplanationCode(code: RuleExplanationCode): RuleExplanationCode {
  return code;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsExplanationCode(
    // @ts-expect-error - Decision 074: an unregistered code is not a RuleExplanationCode.
    'RULE_EXPLAIN_NOT_REGISTERED',
  );

  acceptsExplanationCode(
    // @ts-expect-error - Decision 074: a skip reason is not an explanation code.
    'RULE_SKIP_DESTINATION_ARCHIVED',
  );
}

describe('RULE_EXPLANATION_CODES', () => {
  /*
   * Explanations are persisted inside a Plan Snapshot, so this list is a
   * contract rather than an implementation detail. Asserting the exact set
   * makes any addition, removal or rename a deliberate change that must cite
   * an accepted decision.
   */
  it('holds exactly the vocabulary fixed by Decision 074', () => {
    expect(Object.values(RULE_EXPLANATION_CODES)).toEqual([
      'RULE_EXPLAIN_RESOLUTION_CONTEXT',
      'RULE_EXPLAIN_RULE_APPLIED',
      'RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY',
      'RULE_EXPLAIN_RULE_OVERRIDDEN',
      'RULE_EXPLAIN_DEFAULT_INHERITED',
      'RULE_EXPLAIN_RULE_SKIPPED',
    ]);
  });

  it('names every key exactly as its value', () => {
    for (const [key, value] of Object.entries(RULE_EXPLANATION_CODES)) {
      expect(value).toBe(key);
    }
  });

  it('accepts every registered code as a RuleExplanationCode', () => {
    for (const code of Object.values(RULE_EXPLANATION_CODES)) {
      expect(acceptsExplanationCode(code)).toBe(code);
    }
  });
});
