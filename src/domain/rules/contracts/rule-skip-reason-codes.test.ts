import { describe, expect, it } from 'vitest';

import { RULE_SKIP_REASON_CODES, type RuleSkipReasonCode } from './rule-skip-reason-codes';

/**
 * Decision 074: the skip-reason registry is closed.
 *
 * The block never runs; tsc checks it. See the sibling explanation-code test
 * for why the guard is an opaque boolean rather than a literal `false`.
 */
function acceptsSkipReasonCode(code: RuleSkipReasonCode): RuleSkipReasonCode {
  return code;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsSkipReasonCode(
    // @ts-expect-error - Decision 074: an unregistered code is not a RuleSkipReasonCode.
    'RULE_SKIP_NOT_REGISTERED',
  );

  acceptsSkipReasonCode(
    /*
     * Decision 074: an allocation-time condition is Milestone 3 runtime
     * reporting, not a Rule Engine skip reason.
     */
    // @ts-expect-error - not a Rule Engine skip reason.
    'RULE_SKIP_NO_REMAINING_INCOME',
  );

  acceptsSkipReasonCode(
    // @ts-expect-error - Decision 074: an explanation code is not a skip reason.
    'RULE_EXPLAIN_RULE_SKIPPED',
  );
}

describe('RULE_SKIP_REASON_CODES', () => {
  /*
   * Skip reasons are persisted inside a Plan Snapshot, so this list is a
   * contract rather than an implementation detail. Asserting the exact set
   * makes any addition, removal or rename a deliberate change that must cite
   * an accepted decision.
   */
  it('holds exactly the vocabulary fixed by Decision 074', () => {
    expect(Object.values(RULE_SKIP_REASON_CODES)).toEqual([
      'RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE',
      'RULE_SKIP_SUPERSEDED_BY_HIGHER_PRECEDENCE',
      'RULE_SKIP_INCOME_SOURCE_EXCLUDED',
      'RULE_SKIP_DESTINATION_ARCHIVED',
      'RULE_SKIP_GOAL_FUNDED_ALLOCATION_PAUSED',
      'RULE_SKIP_EVENT_OVERRIDE_SKIPPED',
    ]);
  });

  it('names every key exactly as its value', () => {
    for (const [key, value] of Object.entries(RULE_SKIP_REASON_CODES)) {
      expect(value).toBe(key);
    }
  });

  it('accepts every registered code as a RuleSkipReasonCode', () => {
    for (const code of Object.values(RULE_SKIP_REASON_CODES)) {
      expect(acceptsSkipReasonCode(code)).toBe(code);
    }
  });
});
