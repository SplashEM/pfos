import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

/**
 * PFOS-ENG-00 §44 - Import Boundary Enforcement.
 *
 * Dependencies point inward (§3):
 *
 *   Presentation -> Application -> Domain -> Repository Interfaces -> Infrastructure
 *
 * `src/app/` is deliberately unrestricted. It is the composition root: the one
 * place permitted to import infrastructure in order to wire concrete
 * implementations to the interfaces the inner layers declare. Restricting it
 * would make dependency injection impossible at Milestone 4.
 */
const outerLayerImports = (layers) => [
  ...layers.map((layer) => `@${layer}/*`),
  ...layers.map((layer) => `**/${layer}/**`),
];

const INWARD_DEPENDENCY_MESSAGE =
  'PFOS-ENG-00 §3/§44: dependencies must point inward. This layer may not import from an outer layer.';

const NO_REACT_MESSAGE =
  'PFOS-ENG-00 §3 and CLAUDE.md: React must not reach this layer. Financial calculations do not belong in components.';

const SHARED_PRIMITIVE_MESSAGE =
  'Decision 071: shared primitives must not depend on an engine. Money, BasisPoints and the ' +
  'other shared value objects know nothing about buckets, capacity, priorities, eligibility or rules.';

export default tseslint.config(
  {
    ignores: ['dist/', 'coverage/', 'playwright-report/', 'test-results/', 'node_modules/'],
  },

  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.ts'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      /* PFOS-ENG-00 §42: no unchecked `any` in domain logic. */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  /* Domain: the innermost layer. Pure, deterministic, storage-free. */
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: outerLayerImports(['app', 'application', 'infrastructure', 'presentation']),
              message: INWARD_DEPENDENCY_MESSAGE,
            },
            {
              group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
              message: NO_REACT_MESSAGE,
            },
          ],
        },
      ],

      /* PFOS-ENG-00 §3, §49.5 and CLAUDE.md: no browser or storage access. */
      'no-restricted-globals': [
        'error',
        {
          name: 'indexedDB',
          message:
            'PFOS-ENG-00 §4.4: domain engines must not access IndexedDB. Receive evaluation context instead.',
        },
        { name: 'localStorage', message: 'PFOS-ENG-00 §3: no storage access in the domain layer.' },
        {
          name: 'sessionStorage',
          message: 'PFOS-ENG-00 §3: no storage access in the domain layer.',
        },
        { name: 'window', message: 'PFOS-ENG-00 §3: no browser APIs in the domain layer.' },
        { name: 'document', message: 'PFOS-ENG-00 §3: no browser APIs in the domain layer.' },
        { name: 'fetch', message: 'PFOS-ENG-00 §3: no network APIs in the domain layer.' },
      ],

      /* PFOS-ENG-00 §13.4, §18 and §42: determinism. No hidden clock or randomness. */
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date']",
          message:
            'PFOS-ENG-00 §13.4: inject the evaluation date or a clock abstraction. Deterministic engines must not read the current time.',
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message:
            'PFOS-ENG-00 §13.4: inject the evaluation date or a clock abstraction. Deterministic engines must not read the current time.',
        },
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message:
            'PFOS-00 Principle 18: financial engines must be deterministic. No randomness is permitted.',
        },
      ],
    },
  },

  /*
   * Shared primitives: the innermost part of the inner layer (Decision 071).
   *
   * Money and the other shared value objects are consumed by every engine, so
   * they must not depend on an engine in return. Allocation and rule concepts
   * are therefore unreachable from here.
   *
   * The outer-layer and React groups are repeated from the domain block above
   * because ESLint replaces a rule's options rather than merging them: a
   * second `no-restricted-imports` entry that omitted them would silently
   * disable those restrictions for domain/shared. `no-restricted-globals` and
   * `no-restricted-syntax` are not redefined here, so the domain block's
   * storage, browser and determinism guards continue to apply.
   *
   * Sibling imports within domain/shared remain permitted.
   */
  {
    files: ['src/domain/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: outerLayerImports(['app', 'application', 'infrastructure', 'presentation']),
              message: INWARD_DEPENDENCY_MESSAGE,
            },
            {
              group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
              message: NO_REACT_MESSAGE,
            },
            {
              group: [
                '@domain/allocations',
                '@domain/allocations/*',
                '@domain/rules',
                '@domain/rules/*',
              ],
              message: SHARED_PRIMITIVE_MESSAGE,
            },
            {
              regex: '^([.][.]/)+(allocations|rules)(/|$)',
              message: SHARED_PRIMITIVE_MESSAGE,
            },
          ],
        },
      ],
    },
  },

  /* Application: orchestrates workflows. May import domain only. */
  {
    files: ['src/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: outerLayerImports(['app', 'infrastructure', 'presentation']),
              message: INWARD_DEPENDENCY_MESSAGE,
            },
            {
              group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
              message: NO_REACT_MESSAGE,
            },
          ],
        },
      ],
    },
  },

  /* Infrastructure: implements inner-layer interfaces. No UI. */
  {
    files: ['src/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: outerLayerImports(['app', 'presentation']),
              message: INWARD_DEPENDENCY_MESSAGE,
            },
            {
              group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
              message: NO_REACT_MESSAGE,
            },
          ],
        },
      ],
    },
  },

  /* Presentation: may call application services, never infrastructure (§4.1). */
  {
    files: ['src/presentation/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: outerLayerImports(['infrastructure']),
              message:
                'PFOS-ENG-00 §4.1: the presentation layer must not touch storage directly. Call an application service.',
            },
          ],
        },
      ],
    },
  },

  prettier,
);
