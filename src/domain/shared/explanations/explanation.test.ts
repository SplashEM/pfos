import { describe, expect, it } from 'vitest';

import { asEntityId } from '../ids/entity-id';

import type { Explanation, ExplanationSeverity } from './explanation';

/**
 * A neutral closed registry, standing in for an engine-owned one.
 *
 * `domain/shared` must stay free of engine knowledge, so these cases prove the
 * parameterisation without naming an engine. The real Rule Engine vocabulary is
 * checked in src/domain/rules/contracts/rule-explanation.test.ts.
 */
type DemoCode = 'DEMO_ALPHA' | 'DEMO_BETA';

const REQUIRED: Explanation<DemoCode> = {
  code: 'DEMO_ALPHA',
  title: 'A default was inherited',
  summary: 'No override existed, so the applicable default was used.',
  affectedEntityIds: [asEntityId('entity-1')],
};

const SEVERITIES: readonly ExplanationSeverity[] = ['INFO', 'SUCCESS', 'WARNING'];

describe('Explanation', () => {
  describe('required properties', () => {
    it('carries the code, title, summary and affected entity ids', () => {
      expect(REQUIRED).toEqual({
        code: 'DEMO_ALPHA',
        title: 'A default was inherited',
        summary: 'No override existed, so the applicable default was used.',
        affectedEntityIds: ['entity-1'],
      });
    });

    it('accepts an explanation that affects no entity', () => {
      const explanation: Explanation<DemoCode> = { ...REQUIRED, affectedEntityIds: [] };
      expect(explanation.affectedEntityIds).toEqual([]);
    });
  });

  describe('optional properties', () => {
    it('omits them entirely when they are not supplied', () => {
      expect(Object.keys(REQUIRED).sort()).toEqual([
        'affectedEntityIds',
        'code',
        'summary',
        'title',
      ]);
    });

    it('carries rule-version provenance', () => {
      const explanation: Explanation<DemoCode> = {
        ...REQUIRED,
        ruleVersionIds: [asEntityId('version-1'), asEntityId('version-2')],
      };

      expect(explanation.ruleVersionIds).toEqual(['version-1', 'version-2']);
    });

    it('accepts every defined severity', () => {
      for (const severity of SEVERITIES) {
        const explanation: Explanation<DemoCode> = { ...REQUIRED, severity };
        expect(explanation.severity).toBe(severity);
      }
    });
  });

  /*
   * Decision 074 leaves the detail parameter at `never` for V1 consumers, which
   * permits the empty list and nothing else. The rejection of a populated list
   * is asserted at compile time below.
   */
  describe('structured details', () => {
    it('accepts an empty detail list under the never default', () => {
      const explanation: Explanation<DemoCode> = { ...REQUIRED, details: [] };
      expect(explanation.details).toEqual([]);
    });

    it('carries details once a detail vocabulary is supplied', () => {
      const explanation: Explanation<DemoCode, string> = {
        ...REQUIRED,
        details: ['a supplied detail'],
      };

      expect(explanation.details).toEqual(['a supplied detail']);
    });
  });
});

/**
 * Never executed; see the equivalent block in
 * src/domain/shared/errors/domain-error.test.ts. TypeScript still checks it, so
 * a `@ts-expect-error` directive asserts that the line beneath it does not
 * compile: tsc fails with "Unused '@ts-expect-error' directive" if the code it
 * guards turns out to be valid. `npm run typecheck` is the assertion.
 *
 * The guard is annotated `boolean` rather than written as a literal `false`,
 * because tsconfig sets `allowUnreachableCode: false`.
 */
function acceptsDemoExplanation(explanation: Explanation<DemoCode>): Explanation<DemoCode> {
  return explanation;
}

const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  acceptsDemoExplanation({
    ...REQUIRED,
    // @ts-expect-error - Decision 074: a supplied code union stays closed.
    code: 'DEMO_GAMMA',
  });

  acceptsDemoExplanation(
    // @ts-expect-error - Decision 074: title, summary and affected entity ids are required.
    {
      code: 'DEMO_ALPHA',
      summary: 'Missing a title.',
      affectedEntityIds: [],
    },
  );

  acceptsDemoExplanation({
    ...REQUIRED,
    // @ts-expect-error - Decision 074: severity is closed to INFO, SUCCESS and WARNING.
    severity: 'CRITICAL',
  });

  acceptsDemoExplanation({
    ...REQUIRED,
    // @ts-expect-error - Decision 074: the never default makes details unavailable, not merely unused.
    details: ['a detail with no accepted vocabulary'],
  });

  acceptsDemoExplanation({
    ...REQUIRED,
    // @ts-expect-error - PFOS-ENG-00 §14: an identifier is opaque and branded, never a bare string.
    affectedEntityIds: ['entity-1'],
  });

  // @ts-expect-error - the envelope is immutable.
  REQUIRED.title = 'Reassigned';
}
