import type { JSX } from 'react';

/**
 * Application shell.
 *
 * Milestone 0 scope: prove the toolchain builds, renders, and tests.
 *
 * This component holds no financial logic and must never acquire any.
 * CLAUDE.md: "Do not place financial calculations in React components."
 */
export function App(): JSX.Element {
  return (
    <main>
      <h1>PFOS</h1>
      <p>Personal Financial Operating System</p>
      <p>Plan first. Spend with confidence.</p>
      <p>Milestone 0 - Repository Foundation. No financial functionality is implemented yet.</p>
    </main>
  );
}
