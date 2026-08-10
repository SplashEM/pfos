import { describe, expect, it } from 'vitest';

import { domainError, type DomainError, type DomainErrorInput } from './domain-error';
import { ERROR_CATEGORIES } from './error-category';
import { ERROR_CODES } from './error-codes';

/** The minimum valid input, reused across cases. */
const REQUIRED = {
  code: ERROR_CODES.MONEY_NOT_INTEGER,
  category: ERROR_CATEGORIES.VALIDATION,
  summary: 'A monetary amount must be a whole number of cents.',
} as const;

describe('domainError', () => {
  describe('required properties', () => {
    it('carries the code, category and summary', () => {
      expect(domainError(REQUIRED)).toEqual({
        code: ERROR_CODES.MONEY_NOT_INTEGER,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'A monetary amount must be a whole number of cents.',
      });
    });

    it('accepts any of the defined categories', () => {
      const error = domainError({
        ...REQUIRED,
        category: ERROR_CATEGORIES.INVARIANT_VIOLATION,
      });
      expect(error.category).toBe(ERROR_CATEGORIES.INVARIANT_VIOLATION);
    });

    it('freezes the result', () => {
      expect(Object.isFrozen(domainError(REQUIRED))).toBe(true);
    });
  });

  describe('omitted optional properties', () => {
    it('has exactly the required keys when nothing optional is supplied', () => {
      expect(Object.keys(domainError(REQUIRED)).sort()).toEqual(['category', 'code', 'summary']);
    });

    it('does not define details as undefined', () => {
      expect('details' in domainError(REQUIRED)).toBe(false);
    });

    it('does not define affectedEntityIds as undefined', () => {
      expect('affectedEntityIds' in domainError(REQUIRED)).toBe(false);
    });

    it('does not define suggestedResolution as undefined', () => {
      expect('suggestedResolution' in domainError(REQUIRED)).toBe(false);
    });
  });

  describe('supplied optional properties', () => {
    it('carries details', () => {
      const error = domainError({ ...REQUIRED, details: 'Received 12.34.' });
      expect(error.details).toBe('Received 12.34.');
    });

    it('carries a suggested resolution', () => {
      const error = domainError({ ...REQUIRED, suggestedResolution: 'Use integer cents.' });
      expect(error.suggestedResolution).toBe('Use integer cents.');
    });

    it('carries affected entity ids', () => {
      const error = domainError({ ...REQUIRED, affectedEntityIds: ['entity-1', 'entity-2'] });
      expect(error.affectedEntityIds).toEqual(['entity-1', 'entity-2']);
    });

    it('carries every optional property at once', () => {
      const error = domainError({
        ...REQUIRED,
        details: 'Received 12.34.',
        affectedEntityIds: ['entity-1'],
        suggestedResolution: 'Use integer cents.',
      });

      expect(error).toEqual({
        code: ERROR_CODES.MONEY_NOT_INTEGER,
        category: ERROR_CATEGORIES.VALIDATION,
        summary: 'A monetary amount must be a whole number of cents.',
        details: 'Received 12.34.',
        affectedEntityIds: ['entity-1'],
        suggestedResolution: 'Use integer cents.',
      });
    });

    it('accepts an empty list of affected entity ids', () => {
      const error = domainError({ ...REQUIRED, affectedEntityIds: [] });
      expect(error.affectedEntityIds).toEqual([]);
    });
  });

  describe('affected entity ids are isolated from the caller', () => {
    it('copies the supplied array', () => {
      const supplied = ['entity-1', 'entity-2'];
      const error = domainError({ ...REQUIRED, affectedEntityIds: supplied });

      supplied.push('entity-3');

      expect(error.affectedEntityIds).toEqual(['entity-1', 'entity-2']);
    });

    it('freezes the stored array', () => {
      const error = domainError({ ...REQUIRED, affectedEntityIds: ['entity-1'] });
      expect(Object.isFrozen(error.affectedEntityIds)).toBe(true);
    });
  });
});

/** A neutral closed registry, standing in for an engine-owned one. */
type DemoCode = 'DEMO_ALPHA' | 'DEMO_BETA';

/**
 * Decision 073: the code travels as a type parameter.
 *
 * These cases prove the parameterisation from the shared side without naming
 * any engine. `domain/shared` must stay free of engine knowledge, so the closed
 * union above is a neutral stand-in for whatever registry an engine owns; the
 * real registries are checked in
 * src/test/architecture/error-code-registries.test.ts.
 *
 * The runtime behaviour asserted above is unchanged by Decision 073. That suite
 * passing untouched is the evidence.
 */
describe('generic error codes (Decision 073)', () => {
  it('carries a shared error code unchanged', () => {
    const error = domainError({
      code: ERROR_CODES.MONEY_UNSAFE_INTEGER,
      category: ERROR_CATEGORIES.VALIDATION,
      summary: 'That amount is too large to represent exactly.',
    });

    expect(error.code).toBe('MONEY_UNSAFE_INTEGER');
  });

  it('carries a caller-supplied closed union', () => {
    const input: DomainErrorInput<DemoCode> = {
      code: 'DEMO_ALPHA',
      category: ERROR_CATEGORIES.CONFLICT,
      summary: 'A caller-owned registry supplies its own code.',
    };
    const error: DomainError<DemoCode> = domainError(input);

    expect(error.code).toBe('DEMO_ALPHA');
  });

  it('narrows the result to the supplied code', () => {
    const error = domainError({
      code: ERROR_CODES.DATE_INVALID_TIME_ZONE,
      category: ERROR_CATEGORIES.VALIDATION,
      summary: 'A timestamp must carry a time zone.',
    });

    expect(error.code).toBe('DATE_INVALID_TIME_ZONE');
  });
});

/**
 * Never executed; see the equivalent block in
 * src/domain/rules/errors/rule-error.test.ts. tsc fails if the directive below
 * is unused, which asserts that a code outside the supplied union does not
 * compile. Nothing invalid is constructed at runtime.
 */
const COMPILE_TIME_ONLY: boolean = false;

if (COMPILE_TIME_ONLY) {
  const outsideTheUnion: DomainErrorInput<DemoCode> = {
    // @ts-expect-error - Decision 073: a supplied union stays closed to its own codes.
    code: 'DEMO_GAMMA',
    category: ERROR_CATEGORIES.CONFLICT,
    summary: 'Outside the supplied union.',
  };

  domainError(outsideTheUnion);
}
