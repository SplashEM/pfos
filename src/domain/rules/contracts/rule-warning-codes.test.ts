import { describe, expect, it } from 'vitest';

import { RULE_WARNING_CODES, type RuleWarningCode } from './rule-warning-codes';

/**
 * Decision 077: the warning registry is closed.
 *
 * This block is never executed. TypeScript still checks it, so the
 * `@ts-expect-error` asserts that the line beneath it does not compile. See the
 * sibling explanation-code test for why the guard is an opaque boolean rather
 * than a literal `false`.
 */
function acceptsWarningCode(code: RuleWarningCode): RuleWarningCode {
  return code;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsWarningCode(
    // @ts-expect-error - Decision 077: an unregistered code is not a RuleWarningCode.
    'RULE_WARN_NOT_REGISTERED',
  );

  acceptsWarningCode(
    /*
     * The unregistered placeholder that preceded this registry. Decision 077
     * names RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED instead, and the earlier
     * spelling does not become a code by having been written down.
     */
    // @ts-expect-error - not a registered warning code.
    'RULE_NO_TOP_PRIORITIES_CONFIGURED',
  );

  acceptsWarningCode(
    // @ts-expect-error - Decision 077: an explanation code is not a warning code.
    'RULE_EXPLAIN_RULE_SKIPPED',
  );
}

describe('RULE_WARNING_CODES', () => {
  /*
   * Warnings are persisted inside a Plan Snapshot, so this list is a contract
   * rather than an implementation detail. Asserting the exact set makes any
   * addition, removal or rename a deliberate change that must cite an accepted
   * decision — including the PFOS-ENG-01 §21.2 examples that Decision 077
   * deliberately left unregistered.
   */
  it('holds exactly the vocabulary fixed by Decision 077', () => {
    expect(Object.values(RULE_WARNING_CODES)).toEqual(['RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED']);
  });

  it('names every key exactly as its value', () => {
    for (const [key, value] of Object.entries(RULE_WARNING_CODES)) {
      expect(value).toBe(key);
    }
  });

  it('accepts every registered code as a RuleWarningCode', () => {
    for (const code of Object.values(RULE_WARNING_CODES)) {
      expect(acceptsWarningCode(code)).toBe(code);
    }
  });
});
