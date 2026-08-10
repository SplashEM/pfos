import { describe, expect, it } from 'vitest';

import { RULE_ERROR_CODES } from '@domain/rules/errors/rule-error-codes';
import { ERROR_CODES } from '@domain/shared/errors/error-codes';

/**
 * Architecture tests for engine-owned error-code registries (Decision 073).
 *
 * Decision 073 moves engine-specific codes out of the shared registry and into
 * the engine that introduces them. That removes the compiler's guarantee that
 * every code in the system is unique, because two registries declared
 * separately can no longer collide at the type level. These tests restore the
 * guarantee at build time: distinct prefixes, no engine code in shared, and
 * disjoint value sets.
 *
 * The final case complements
 * src/test/architecture/domain-shared-boundaries.test.ts. That file checks the
 * shared *vocabulary*; this one checks shared *imports*, so a shared primitive
 * cannot acquire Rule Engine knowledge by either route.
 */
const ENGINE_PREFIXES: readonly string[] = ['RULE_', 'ALLOCATION_', 'GOAL_'];

const sharedCodes: readonly string[] = Object.values(ERROR_CODES);
const ruleCodes: readonly string[] = Object.values(RULE_ERROR_CODES);

describe('registries are populated, so the checks below are not vacuous', () => {
  it('finds shared codes', () => {
    expect(sharedCodes.length).toBeGreaterThanOrEqual(15);
  });

  it('finds Rule Engine codes', () => {
    expect(ruleCodes.length).toBeGreaterThanOrEqual(1);
  });
});

describe('the Rule Engine registry', () => {
  it('prefixes every code with RULE_', () => {
    for (const code of ruleCodes) {
      expect(code.startsWith('RULE_')).toBe(true);
    }
  });

  it('prefixes every key with RULE_', () => {
    for (const key of Object.keys(RULE_ERROR_CODES)) {
      expect(key.startsWith('RULE_')).toBe(true);
    }
  });

  it('names every key exactly as its value', () => {
    for (const [key, value] of Object.entries(RULE_ERROR_CODES)) {
      expect(value).toBe(key);
    }
  });

  it('contributes no code to the shared registry', () => {
    for (const code of ruleCodes) {
      expect(sharedCodes).not.toContain(code);
    }
  });
});

describe('the shared registry', () => {
  it('carries no engine-prefixed code', () => {
    for (const code of sharedCodes) {
      for (const prefix of ENGINE_PREFIXES) {
        expect(code.startsWith(prefix)).toBe(false);
      }
    }
  });

  it('carries no engine-prefixed key', () => {
    for (const key of Object.keys(ERROR_CODES)) {
      for (const prefix of ENGINE_PREFIXES) {
        expect(key.startsWith(prefix)).toBe(false);
      }
    }
  });

  it('holds only the shared primitive families', () => {
    for (const code of sharedCodes) {
      expect(/^(MONEY|BASIS_POINTS|DATE)_/.test(code)).toBe(true);
    }
  });
});

describe('the registries are disjoint', () => {
  it('shares no value between them', () => {
    const overlap = ruleCodes.filter((code) => sharedCodes.includes(code));
    expect(overlap).toEqual([]);
  });

  it('holds no duplicate across the combined set', () => {
    const combined = [...sharedCodes, ...ruleCodes];
    expect(new Set(combined).size).toBe(combined.length);
  });
});

/**
 * Shared sources are read as text so the check inspects what is written on
 * disk rather than what the module system resolves.
 */
const sharedSources = import.meta.glob<string>('../../domain/shared/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const sharedProductionEntries = Object.entries(sharedSources).filter(
  ([path]) => !path.endsWith('.test.ts'),
);

/** Extracts every module specifier appearing in an import statement. */
function importSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  const pattern = /from\s+'([^']+)'/g;

  let match = pattern.exec(source);
  while (match !== null) {
    const specifier = match[1];
    if (specifier !== undefined) {
      specifiers.push(specifier);
    }
    match = pattern.exec(source);
  }

  return specifiers;
}

describe('shared production sources import nothing from an engine', () => {
  it('finds the shared production sources', () => {
    expect(sharedProductionEntries.length).toBeGreaterThanOrEqual(15);
  });

  for (const [path, source] of sharedProductionEntries) {
    it(`${path} imports no engine module`, () => {
      for (const specifier of importSpecifiers(source)) {
        expect(specifier.includes('rules')).toBe(false);
        expect(specifier.includes('allocations')).toBe(false);
        expect(specifier.includes('goals')).toBe(false);
      }
    });
  }
});
