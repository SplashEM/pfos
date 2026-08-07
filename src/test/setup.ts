import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * Shared test setup.
 *
 * PFOS-ENG-00 §33 also specifies typed fixtures and builders (money(),
 * bucketBuilder(), planSnapshotBuilder(), ...). Those describe domain entities
 * that do not exist yet and arrive with the milestones that introduce them.
 */
afterEach(() => {
  cleanup();
});
