import { describe, expect, it } from 'vitest';

import { ERROR_CATEGORIES } from '@domain/shared/errors/error-category';
import { ERROR_CODES } from '@domain/shared/errors/error-codes';

import { ruleError } from './rule-error';
import { RULE_ERROR_CODES } from './rule-error-codes';

/**
 * Decision 073: the Rule Engine registry is closed.
 *
 * This block is never executed. TypeScript still checks it, so each
 * `@ts-expect-error` asserts that the line beneath it does not compile: tsc
 * fails with "Unused '@ts-expect-error' directive" if a call it guards turns
 * out to be legal. `npm run typecheck` is therefore the assertion, and no
 * invalid error object is ever constructed at runtime.
 *
 * Each directive sits on the `code` property rather than on the call, because
 * that is where the assignability failure is reported.
 *
 * The guard is annotated `boolean` rather than written as a literal `false`.
 * tsconfig sets `allowUnreachableCode: false`, which rejects a block guarded by
 * a literal false; an opaque boolean keeps the block reachable to that analysis
 * while remaining unreachable in fact.
 */
const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  ruleError({
    // @ts-expect-error - Decision 073: shared MONEY_* codes are not Rule Engine codes.
    code: ERROR_CODES.MONEY_NOT_INTEGER,
    category: ERROR_CATEGORIES.VALIDATION,
    summary: 'A shared code cannot describe a Rule Engine failure.',
  });

  ruleError({
    // @ts-expect-error - Decision 073: arbitrary strings are not RuleErrorCode.
    code: 'NOT_A_REGISTERED_CODE',
    category: ERROR_CATEGORIES.VALIDATION,
    summary: 'An unregistered code cannot be constructed.',
  });
}

describe('ruleError', () => {
  const REQUIRED = {
    code: RULE_ERROR_CODES.RULE_POOL_NOT_EXACTLY_100_PERCENT,
    category: ERROR_CATEGORIES.VALIDATION,
    summary: 'An authored percentage pool must total exactly 100%.',
  } as const;

  it('carries the Rule Engine code', () => {
    expect(ruleError(REQUIRED).code).toBe('RULE_POOL_NOT_EXACTLY_100_PERCENT');
  });

  it('maps onto a shared category', () => {
    expect(ruleError(REQUIRED).category).toBe(ERROR_CATEGORIES.VALIDATION);
  });

  it('freezes the result, as the shared constructor does', () => {
    expect(Object.isFrozen(ruleError(REQUIRED))).toBe(true);
  });

  it('omits optional properties that were not supplied', () => {
    expect(Object.keys(ruleError(REQUIRED)).sort()).toEqual(['category', 'code', 'summary']);
  });

  it('carries affected rule ids and a suggested resolution (PFOS-ENG-01 §39)', () => {
    const error = ruleError({
      ...REQUIRED,
      details: 'The supplied pool totals 9,999 basis points.',
      affectedEntityIds: ['rule-1'],
      suggestedResolution: 'Adjust the pool so the entries total exactly 10,000 basis points.',
    });

    expect(error.affectedEntityIds).toEqual(['rule-1']);
    expect(error.suggestedResolution).toBe(
      'Adjust the pool so the entries total exactly 10,000 basis points.',
    );
  });

  it('accepts every code in the registry', () => {
    for (const code of Object.values(RULE_ERROR_CODES)) {
      expect(ruleError({ ...REQUIRED, code }).code).toBe(code);
    }
  });
});
