import { describe, expect, it } from 'vitest';

import type { DomainWarning } from '@domain/shared/explanations/warning';

import { RULE_WARNING_CODES } from './rule-warning-codes';

import type { RuleDomainWarning } from './rule-warning';

/*
 * A fixture, not a producer. Decision 077 fixes the code; the wording of the
 * message and the recommended action belongs to the Decision 075 producer,
 * which is not implemented yet.
 */
const NO_TOP_PRIORITIES: RuleDomainWarning = {
  code: RULE_WARNING_CODES.RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED,
  message: 'No top priorities are configured.',
  affectedEntityIds: [],
};

describe('RuleDomainWarning', () => {
  it('carries a registered code with its user-facing text', () => {
    expect(NO_TOP_PRIORITIES).toEqual({
      code: 'RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED',
      message: 'No top priorities are configured.',
      affectedEntityIds: [],
    });
  });

  it('carries an optional recommended action', () => {
    const warning: RuleDomainWarning = {
      ...NO_TOP_PRIORITIES,
      recommendedAction: 'Add a top priority.',
    };

    expect(warning.recommendedAction).toBe('Add a top priority.');
  });

  /*
   * Decision 077: the intersection narrows `code` and changes nothing else, so
   * a Rule Engine warning still satisfies the shared contract and can be placed
   * in ResolvedRuleSet.warnings — which stays readonly DomainWarning[] —
   * without a cast.
   */
  it('remains assignable to the shared DomainWarning', () => {
    const shared: DomainWarning = NO_TOP_PRIORITIES;
    expect(shared.code).toBe('RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED');
  });

  it('accepts every registered warning code', () => {
    for (const code of Object.values(RULE_WARNING_CODES)) {
      const warning: RuleDomainWarning = { ...NO_TOP_PRIORITIES, code };
      expect(warning.code).toBe(code);
    }
  });
});

/**
 * Never executed; see the equivalent block in ./rule-warning-codes.test.ts.
 * tsc fails if a directive below is unused, which is what asserts that the line
 * it guards does not compile. Nothing invalid is constructed at run time.
 */
function acceptsRuleDomainWarning(warning: RuleDomainWarning): RuleDomainWarning {
  return warning;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsRuleDomainWarning({
    ...NO_TOP_PRIORITIES,
    // @ts-expect-error - Decision 077: an unregistered code is not a RuleWarningCode.
    code: 'RULE_WARN_NOT_REGISTERED',
  });

  acceptsRuleDomainWarning({
    ...NO_TOP_PRIORITIES,
    // @ts-expect-error - Decision 077: an error code is not a warning code.
    code: 'RULE_POOL_NOT_EXACTLY_100_PERCENT',
  });
}
