import { useState, type JSX } from 'react';

import { createCryptoIdGenerator } from '@infrastructure/ids/crypto-id-generator';
import { createLocalStoragePaycheckPlanStorage } from '@infrastructure/paycheck/local-storage-paycheck-plan-storage';
import { createIndexedDbConfirmedPaycheckStore } from '@infrastructure/persistence/indexed-db-confirmed-paycheck-store';
import { PaycheckPreviewScreen } from '@presentation/paycheck/PaycheckPreviewScreen';

/**
 * Application shell and composition root.
 *
 * This is the one place permitted to name a concrete implementation and hand it
 * to an inner layer (PFOS-ENG-00 §44). The screen asks for somewhere to keep
 * plan settings; browser local storage is what it gets here, and swapping that
 * is a one-line change confined to this file.
 *
 * It holds no financial logic and must never acquire any: CLAUDE.md, "Do not
 * place financial calculations in React components."
 */
export function App(): JSX.Element {
  /* Built once. A new instance on every render would restart the effects below. */
  const [planStorage] = useState(createLocalStoragePaycheckPlanStorage);
  const [confirmedPaychecks] = useState(createIndexedDbConfirmedPaycheckStore);
  const [ids] = useState(createCryptoIdGenerator);

  return (
    <PaycheckPreviewScreen
      planStorage={planStorage}
      confirmedPaychecks={confirmedPaychecks}
      ids={ids}
    />
  );
}
