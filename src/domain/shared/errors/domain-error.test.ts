import { describe, expect, it } from 'vitest';

import { domainError } from './domain-error';
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
