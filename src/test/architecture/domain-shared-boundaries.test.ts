import { describe, expect, it } from 'vitest';

/**
 * Architecture boundary tests for the shared domain primitives.
 *
 * Decision 071 requires Money to remain unaware of buckets, priorities,
 * capacities, eligibility, rules and every Allocation Engine type. The ESLint
 * rule in eslint.config.js enforces the import direction; these tests enforce
 * the vocabulary, and give the isolation clause an executable form rather than
 * leaving it as a comment nobody runs.
 *
 * Sources are read as text through Vite's glob import so the check inspects
 * what is actually written on disk, not what the module system resolves.
 */
const sharedSources = import.meta.glob<string>('../../domain/shared/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * Production files only. Test files legitimately import test builders from
 * outside domain/shared, so they are held to a different standard.
 */
const productionEntries = Object.entries(sharedSources).filter(
  ([path]) => !path.endsWith('.test.ts'),
);

const moneyEntries = productionEntries.filter(([path]) => path.includes('/money/'));

/** Removes block and line comments so prose cannot trip the term scan. */
function stripComments(source: string): string {
  const withoutBlocks = source
    .split('/*')
    .map((segment, index) => {
      if (index === 0) {
        return segment;
      }
      const end = segment.indexOf('*/');
      return end === -1 ? '' : segment.slice(end + 2);
    })
    .join(' ');

  return withoutBlocks
    .split('\n')
    .map((line) => {
      const comment = line.indexOf('//');
      return comment === -1 ? line : line.slice(0, comment);
    })
    .join('\n');
}

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

/**
 * Vocabulary owned by the Allocation Engine and the Rule Engine. None of it
 * belongs in a shared primitive (Decision 071; PFOS-ENG-00 §10.3).
 */
const FORBIDDEN_TERMS: readonly string[] = [
  'bucket',
  'priorityrank',
  'stableorder',
  'capacity',
  'eligib',
  'rule',
];

describe('shared domain sources are discoverable', () => {
  it('finds the production sources, so the checks below are not vacuous', () => {
    expect(productionEntries.length).toBeGreaterThanOrEqual(15);
  });

  it('finds the money sources', () => {
    expect(moneyEntries.length).toBeGreaterThanOrEqual(8);
  });
});

describe('money imports nothing outside domain/shared', () => {
  for (const [path, source] of moneyEntries) {
    describe(path, () => {
      const specifiers = importSpecifiers(source);

      it('uses only relative imports', () => {
        for (const specifier of specifiers) {
          expect(specifier.startsWith('.')).toBe(true);
        }
      });

      it('does not reach above the shared directory', () => {
        for (const specifier of specifiers) {
          expect(specifier.includes('../../')).toBe(false);
        }
      });
    });
  }
});

describe('shared primitives use no engine vocabulary', () => {
  for (const [path, source] of productionEntries) {
    describe(path, () => {
      const code = stripComments(source).toLowerCase();

      for (const term of FORBIDDEN_TERMS) {
        it(`contains no reference to ${term} outside comments`, () => {
          expect(code.includes(term)).toBe(false);
        });
      }
    });
  }
});
