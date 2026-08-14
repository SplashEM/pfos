import { describe, expect, it } from 'vitest';

import { RULE_EXPLANATION_CODES } from '@domain/rules/contracts/rule-explanation-codes';
import { RULE_SKIP_REASON_CODES } from '@domain/rules/contracts/rule-skip-reason-codes';
import { RULE_WARNING_CODES } from '@domain/rules/contracts/rule-warning-codes';
import { RULE_ERROR_CODES } from '@domain/rules/errors/rule-error-codes';
import { ERROR_CODES } from '@domain/shared/errors/error-codes';

/**
 * Architecture tests for the four Rule Engine code registries (Decision 074;
 * Decision 077).
 *
 * Decision 074 gives the Rule Engine three independent closed registries and
 * asks for architecture tests enforcing their distinct prefixes. Decision 077
 * adds the fourth:
 *
 *   RULE_*          errors
 *   RULE_EXPLAIN_*  explanations
 *   RULE_SKIP_*     skip reasons
 *   RULE_WARN_*     warnings
 *
 * Errors, skip reasons, explanations and warnings are different concepts and
 * must not be conflated. Nothing in the type system prevents it — registries
 * declared separately cannot collide at compile time, and every code shares the
 * RULE_ stem — so the separation is enforced here instead.
 *
 * This file complements src/test/architecture/error-code-registries.test.ts,
 * which enforces the shared-versus-engine boundary of Decision 073. That file
 * checks that shared owns no engine code; this one checks that the engine's own
 * registries stay distinct from each other.
 */
const errorCodes: readonly string[] = Object.values(RULE_ERROR_CODES);
const explanationCodes: readonly string[] = Object.values(RULE_EXPLANATION_CODES);
const skipReasonCodes: readonly string[] = Object.values(RULE_SKIP_REASON_CODES);
const warningCodes: readonly string[] = Object.values(RULE_WARNING_CODES);

const RESERVED_PREFIXES: readonly string[] = ['RULE_EXPLAIN_', 'RULE_SKIP_', 'RULE_WARN_'];

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

  it('finds Rule Engine warning codes', () => {
    expect(warningCodes.length).toBeGreaterThanOrEqual(1);
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

  it('prefixes every warning code and key with RULE_WARN_', () => {
    for (const code of warningCodes) {
      expect(code.startsWith('RULE_WARN_')).toBe(true);
    }

    for (const key of Object.keys(RULE_WARNING_CODES)) {
      expect(key.startsWith('RULE_WARN_')).toBe(true);
    }
  });

  /*
   * An error code shares the RULE_ stem with the other three registries, so it
   * is identified by exclusion: RULE_ and no reserved prefix. Without this an
   * explanation or warning code could be added to the error registry unnoticed.
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

/*
 * Decision 073 requires that every registry key is identical to its value. A
 * key that drifted from its value would let a call site name a code that no
 * longer matches the string persisted inside a Plan Snapshot, so the invariant
 * is checked rather than assumed. The error registry's equivalent case lives in
 * src/test/architecture/error-code-registries.test.ts.
 */
describe('each registry names every key exactly as its value', () => {
  it('names every explanation key exactly as its value', () => {
    for (const [key, value] of Object.entries(RULE_EXPLANATION_CODES)) {
      expect(value).toBe(key);
    }
  });

  it('names every skip-reason key exactly as its value', () => {
    for (const [key, value] of Object.entries(RULE_SKIP_REASON_CODES)) {
      expect(value).toBe(key);
    }
  });

  it('names every warning key exactly as its value', () => {
    for (const [key, value] of Object.entries(RULE_WARNING_CODES)) {
      expect(value).toBe(key);
    }
  });
});

describe('the four registries are disjoint', () => {
  it('holds no duplicate across the combined Rule Engine set', () => {
    const combined = [...errorCodes, ...explanationCodes, ...skipReasonCodes, ...warningCodes];
    expect(new Set(combined).size).toBe(combined.length);
  });

  it('holds no duplicate once the shared registry joins them', () => {
    const combined = [
      ...Object.values(ERROR_CODES),
      ...errorCodes,
      ...explanationCodes,
      ...skipReasonCodes,
      ...warningCodes,
    ];
    expect(new Set(combined).size).toBe(combined.length);
  });
});
