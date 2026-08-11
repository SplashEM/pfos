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

/**
 * A declaration an accepted decision places inside a shared type even though it
 * contains a forbidden term.
 *
 * Decision 074 gives the shared layer an engine-agnostic explanation envelope
 * carrying one optional `ruleVersionIds` provenance list. The field is a plain
 * list of EntityId values and imports nothing from an engine, so the envelope
 * stays engine-agnostic in substance, and an accepted decision outranks this
 * file under Decision 068.
 *
 * An allowance is kept as narrow as the decision that grants it. It names one
 * file and one exact declaration, so it cannot spread: a second rule-version
 * field, a wider identifier such as `sourceRuleVersionIds`, and the same field
 * in any other shared source all still fail the scan below. A new allowance
 * must cite the decision that authorises it.
 *
 * Matching the whole declaration couples this file to how the field is
 * written. That is the intended trade. A reformat fails a test that names the
 * decision and is then updated deliberately, whereas an allowance that quietly
 * widened to cover identifiers no decision authorises would not be noticed.
 */
interface AuthorisedDeclaration {
  /** Path suffix identifying the single file the decision authorises. */
  readonly path: string;
  /** The exact declaration, as it reads once comments are stripped and lowercased. */
  readonly declaration: string;
  /** The accepted decision that grants the allowance. */
  readonly decision: string;
}

const DECISION_AUTHORISED_DECLARATIONS: readonly AuthorisedDeclaration[] = [
  {
    path: '/domain/shared/explanations/explanation.ts',
    declaration: 'readonly ruleversionids?: readonly entityid[];',
    decision: 'Decision 074',
  },
];

function authorisedDeclarationsFor(path: string): readonly AuthorisedDeclaration[] {
  return DECISION_AUTHORISED_DECLARATIONS.filter((allowance) => path.endsWith(allowance.path));
}

/** Counts how often an authorised declaration appears in a prepared source. */
function countOccurrences(code: string, declaration: string): number {
  return code.split(declaration).length - 1;
}

/** Excises the declarations authorised for one file, and nothing else. */
function withoutAuthorisedDeclarations(path: string, code: string): string {
  return authorisedDeclarationsFor(path).reduce(
    (text, allowance) => text.split(allowance.declaration).join(' '),
    code,
  );
}

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

describe('decision-authorised declarations stay live and singular', () => {
  for (const allowance of DECISION_AUTHORISED_DECLARATIONS) {
    describe(allowance.path, () => {
      const matches = productionEntries.filter(([path]) => path.endsWith(allowance.path));

      it('names exactly one production source', () => {
        expect(matches).toHaveLength(1);
      });

      it(`declares what ${allowance.decision} authorises exactly once`, () => {
        const source = matches[0]?.[1] ?? '';
        const code = stripComments(source).toLowerCase();
        expect(countOccurrences(code, allowance.declaration)).toBe(1);
      });
    });
  }
});

describe('shared primitives use no engine vocabulary', () => {
  for (const [path, source] of productionEntries) {
    describe(path, () => {
      /*
       * Money receives no allowance, and needs no special case to be refused
       * one: an allowance names the single file its decision authorises, and
       * no monetary primitive is among them. Decision 071's isolation clause
       * names Money specifically, and no accepted decision puts an
       * engine-adjacent identifier inside a monetary primitive.
       */
      const stripped = stripComments(source).toLowerCase();
      const code = withoutAuthorisedDeclarations(path, stripped);

      for (const term of FORBIDDEN_TERMS) {
        it(`contains no reference to ${term} outside comments`, () => {
          expect(code.includes(term)).toBe(false);
        });
      }
    });
  }
});
