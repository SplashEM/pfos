import { describe, expect, it } from 'vitest';

/**
 * Architecture boundary tests for browser storage (PFOS-ENG-00 §3, §4.1, §44).
 *
 * Storage implementations live in the infrastructure layer. The application
 * layer owns the contract and knows nothing about browsers; the presentation
 * layer calls that contract and never reaches storage itself.
 *
 * ESLint enforces the import direction between layers, but nothing stops a
 * component or a use case from simply typing `localStorage`, which is a global
 * rather than an import. The domain layer is guarded by `no-restricted-globals`
 * in eslint.config.js; that rule is scoped to `src/domain/**`, so the two outer
 * layers are checked here instead.
 *
 * Sources are read as text through Vite's glob import, so the check inspects
 * what is actually written on disk.
 */
const applicationSources = import.meta.glob<string>('../../application/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const presentationSources = import.meta.glob<string>('../../presentation/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const infrastructureSources = import.meta.glob<string>('../../infrastructure/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * Production files only.
 *
 * A test may legitimately reach for storage to arrange or clear a fixture; the
 * rule being enforced is about shipped code.
 */
function productionEntries(
  sources: Record<string, string>,
): readonly (readonly [string, string])[] {
  return Object.entries(sources).filter(([path]) => !path.includes('.test.'));
}

/** Removes block and line comments so prose about storage cannot trip the scan. */
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

const STORAGE_GLOBALS: readonly string[] = ['localStorage', 'sessionStorage', 'indexedDB'];

const applicationFiles = productionEntries(applicationSources);
const presentationFiles = productionEntries(presentationSources);
const infrastructureFiles = productionEntries(infrastructureSources);

describe('the scan reaches real files, so the checks below are not vacuous', () => {
  it('finds application sources', () => {
    expect(applicationFiles.length).toBeGreaterThanOrEqual(3);
  });

  it('finds presentation sources', () => {
    expect(presentationFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('finds infrastructure sources', () => {
    expect(infrastructureFiles.length).toBeGreaterThanOrEqual(1);
  });
});

describe('the application layer owns storage contracts, not storage', () => {
  for (const [path, source] of applicationFiles) {
    it(`${path} touches no browser storage`, () => {
      const code = stripComments(source);

      for (const global of STORAGE_GLOBALS) {
        expect(code).not.toContain(global);
      }
    });
  }
});

describe('the presentation layer calls an application service, not storage', () => {
  for (const [path, source] of presentationFiles) {
    it(`${path} touches no browser storage`, () => {
      const code = stripComments(source);

      for (const global of STORAGE_GLOBALS) {
        expect(code).not.toContain(global);
      }
    });
  }
});

/*
 * The complement. Without this the checks above would pass just as happily if
 * the storage implementation were deleted, so this pins where it does live.
 */
describe('the infrastructure layer is where storage lives', () => {
  it('holds the browser-storage implementation', () => {
    const infrastructureCode = infrastructureFiles
      .map(([, source]) => stripComments(source))
      .join('\n');

    expect(infrastructureCode).toContain('localStorage');
  });
});
