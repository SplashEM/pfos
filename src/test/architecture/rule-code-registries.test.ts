import { describe, expect, it } from 'vitest';

import { RULE_EXPLANATION_CODES } from '@domain/rules/contracts/rule-explanation-codes';
import { RULE_SKIP_REASON_CODES } from '@domain/rules/contracts/rule-skip-reason-codes';
import { RULE_ERROR_CODES } from '@domain/rules/errors/rule-error-codes';
import { ERROR_CODES } from '@domain/shared/errors/error-codes';

/**
 * Architecture tests for the three Rule Engine code registries (Decision 074).
 *
 * Decision 074 gives the Rule Engine three independent closed registries and
 * asks for architecture tests enforcing their distinct prefixes:
 *
 *   RULE_*          errors
 *   RULE_EXPLAIN_*  explanations
 *   RULE_SKIP_*     skip reasons
 *
 * Errors, skip reasons and explanations are different concepts and must not be
 * conflated. Nothing in the type system prevents it — three registries declared
 * separately cannot collide at compile time, and every code shares the RULE_
 * stem — so the separation is enforced here instead.
 *
 * This file complements src/test/architecture/error-code-registries.test.ts,
 * which enforces the shared-versus-engine boundary of Decision 073. That file
 * checks that shared owns no engine code; this one checks that the engine's own
 * registries stay distinct from each other.
 */
const errorCodes: readonly string[] = Object.values(RULE_ERROR_CODES);
const explanationCodes: readonly string[] = Object.values(RULE_EXPLANATION_CODES);
const skipReasonCodes: readonly string[] = Object.values(RULE_SKIP_REASON_CODES);

const RESERVED_PREFIXES: readonly string[] = ['RULE_EXPLAIN_', 'RULE_SKIP_'];

describe('the registries are populated, so the checks below are not vacuous', () => {
  it('finds Rule Engine error codes', () => {
    expect(errorCodes.length).toBeGreaterThanOrEqual(1);
  });

  it('finds Rule Engine explanation codes', () => {
    expect(explanationCodes.length).toBeGreaterThanOrEqual(6);
  });

  it('finds Rule Engine skip-reason codes', () => {
    expect(skipReasonCodes.length).toBeGreaterThanOrEqual(6);
  });
});

describe('each registry carries its own prefix', () => {
  it('prefixes every explanation code and key with RULE_EXPLAIN_', () => {
    for (const code of explanationCodes) {
      expect(code.startsWith('RULE_EXPLAIN_')).toBe(true);
    }

    for (const key of Object.keys(RULE_EXPLANATION_CODES)) {
      expect(key.startsWith('RULE_EXPLAIN_')).toBe(true);
    }
  });

  it('prefixes every skip-reason code and key with RULE_SKIP_', () => {
    for (const code of skipReasonCodes) {
      expect(code.startsWith('RULE_SKIP_')).toBe(true);
    }

    for (const key of Object.keys(RULE_SKIP_REASON_CODES)) {
      expect(key.startsWith('RULE_SKIP_')).toBe(true);
    }
  });

  /*
   * An error code shares the RULE_ stem with the other two registries, so it is
   * identified by exclusion: RULE_ and neither reserved prefix. Without this an
   * explanation code could be added to the error registry unnoticed.
   */
  it('keeps the reserved prefixes out of the error registry', () => {
    for (const code of errorCodes) {
      expect(code.startsWith('RULE_')).toBe(true);

      for (const prefix of RESERVED_PREFIXES) {
        expect(code.startsWith(prefix)).toBe(false);
      }
    }
  });
});

describe('the three registries are disjoint', () => {
  it('holds no duplicate across the combined Rule Engine set', () => {
    const combined = [...errorCodes, ...explanationCodes, ...skipReasonCodes];
    expect(new Set(combined).size).toBe(combined.length);
  });

  it('holds no duplicate once the shared registry joins them', () => {
    const combined = [
      ...Object.values(ERROR_CODES),
      ...errorCodes,
      ...explanationCodes,
      ...skipReasonCodes,
    ];
    expect(new Set(combined).size).toBe(combined.length);
  });
});
