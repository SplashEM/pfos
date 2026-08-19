import type { JSX } from 'react';

import { PaycheckPreviewScreen } from '@presentation/paycheck/PaycheckPreviewScreen';

/**
 * Application shell and composition root.
 *
 * It renders the one screen PFOS currently has. It holds no financial logic and
 * must never acquire any: CLAUDE.md, "Do not place financial calculations in
 * React components."
 */
export function App(): JSX.Element {
  return <PaycheckPreviewScreen />;
}
