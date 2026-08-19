import { useEffect, useState, type FormEvent, type JSX } from 'react';

import type { EditablePaycheckPlanStorage } from '@application/paycheck/editable-paycheck-plan-storage';
import {
  previewPaycheckAllocation,
  type PaycheckPreview,
} from '@application/paycheck/preview-paycheck-allocation';

import './paycheck-preview-screen.css';

/**
 * The paycheck preview screen.
 *
 * This component performs no financial calculation of any kind. CLAUDE.md
 * forbids it, and there is nothing here to forbid: every amount on screen is a
 * preformatted string the application layer returned, and this file contains no
 * arithmetic, no rounding, no percentage and no comparison of money. Changing
 * the paycheck re-runs the whole domain path rather than adjusting a number
 * here.
 *
 * It resolves nothing either. Which rules apply, which versions are effective
 * and in what order the stages run are all decided by the Rule Engine, one
 * layer in and two layers down.
 *
 * The clock is read here, at the outermost edge, because PFOS-ENG-00 §13.4
 * forbids a deterministic engine function from reading one. The moment and the
 * viewer's time zone are passed inward as ordinary arguments.
 *
 * A preview is a proposal. No allocation is confirmed and no money moves:
 * Constitution Principle 8 keeps physical money and virtual planning apart, and
 * this screen lives entirely on the planning side.
 *
 * The three plan settings are remembered on the device, and nothing else is.
 * They save themselves as they are edited, so there is no Save button — a
 * button would imply a person is committing something, and the only thing kept
 * is the text they typed into three fields.
 *
 * Where they are kept is not this component's business. It calls the
 * application's storage contract, which the composition root supplies, and never
 * touches browser storage itself (PFOS-ENG-00 §4.1).
 */
export interface PaycheckPreviewScreenProps {
  readonly planStorage: EditablePaycheckPlanStorage;
}

export function PaycheckPreviewScreen({ planStorage }: PaycheckPreviewScreenProps): JSX.Element {
  const [amount, setAmount] = useState('2,000.00');
  const [eventDate, setEventDate] = useState(todayIso());
  /*
   * The saved plan is read once, when the screen first mounts. Reading it on
   * every render would fight the person typing.
   */
  const [savedPlan] = useState(() => planStorage.load());
  const [givingPercent, setGivingPercent] = useState(savedPlan.givingPercent);
  const [emergencyFundPerPaycheck, setEmergencyFundPerPaycheck] = useState(
    savedPlan.emergencyFundPerPaycheck,
  );
  const [leftoverLabel, setLeftoverLabel] = useState(savedPlan.leftoverLabel);
  const [preview, setPreview] = useState<PaycheckPreview | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  /*
   * Settings are saved as they are edited, so there is no Save button and no
   * moment where a person has to decide to keep their own preferences. Only
   * these three values are written; a preview is never stored.
   */
  useEffect(() => {
    planStorage.save({ givingPercent, emergencyFundPerPaycheck, leftoverLabel });
  }, [planStorage, givingPercent, emergencyFundPerPaycheck, leftoverLabel]);

  function onPreview(submitEvent: FormEvent<HTMLFormElement>): void {
    submitEvent.preventDefault();

    const result = previewPaycheckAllocation({
      plan: { givingPercent, emergencyFundPerPaycheck, leftoverLabel },
      amount,
      eventDate,
      requestedAt: Date.now(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    if (!result.ok) {
      /*
       * `summary` is the field the domain guarantees is safe to show: it carries
       * no stack trace and no internals. The code and details stay unshown.
       */
      setError(result.error.summary);
      setPreview(undefined);
      return;
    }

    setError(undefined);
    setPreview(result.value);
  }

  return (
    <main className="screen">
      <header>
        <h1>PFOS</h1>
        <p className="tagline">Where should my next paycheck go?</p>
      </header>

      <form onSubmit={onPreview} noValidate>
        <fieldset>
          <legend>Your plan</legend>

          <div className="field">
            <label htmlFor="giving-percent">Giving</label>
            <div className="suffixed">
              <input
                id="giving-percent"
                name="giving-percent"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={givingPercent}
                onChange={(changeEvent) => {
                  setGivingPercent(changeEvent.target.value);
                }}
              />
              <span aria-hidden="true">% of each paycheck</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="emergency-fund-amount">Emergency Fund</label>
            <div className="suffixed">
              <input
                id="emergency-fund-amount"
                name="emergency-fund-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={emergencyFundPerPaycheck}
                onChange={(changeEvent) => {
                  setEmergencyFundPerPaycheck(changeEvent.target.value);
                }}
              />
              <span aria-hidden="true">per paycheck</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="leftover-label">Everything left over goes to</label>
            <input
              id="leftover-label"
              name="leftover-label"
              type="text"
              autoComplete="off"
              value={leftoverLabel}
              onChange={(changeEvent) => {
                setLeftoverLabel(changeEvent.target.value);
              }}
            />
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="paycheck-amount">Paycheck amount</label>
          <input
            id="paycheck-amount"
            name="paycheck-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(changeEvent) => {
              setAmount(changeEvent.target.value);
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="paycheck-date">Paycheck date</label>
          <input
            id="paycheck-date"
            name="paycheck-date"
            type="date"
            value={eventDate}
            onChange={(changeEvent) => {
              setEventDate(changeEvent.target.value);
            }}
          />
        </div>

        <button type="submit">Preview</button>

        <p className="note">Plan settings are saved on this device.</p>
      </form>

      {error !== undefined && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {preview !== undefined && (
        <section aria-labelledby="preview-heading">
          <h2 id="preview-heading">Preview</h2>

          <table>
            <thead>
              <tr>
                <th scope="col">Destination</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {preview.lines.map((line) => (
                <tr key={line.bucketId}>
                  <th scope="row">{line.label}</th>
                  <td className="amount">{line.amount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total allocated</th>
                <td className="amount">{preview.totalAllocated}</td>
              </tr>
              <tr>
                <th scope="row">Unallocated</th>
                <td className="amount">{preview.unallocated}</td>
              </tr>
            </tfoot>
          </table>

          <p className="note">A preview only. Nothing is saved and no money moves.</p>
        </section>
      )}
    </main>
  );
}

/**
 * Today, as the `YYYY-MM-DD` a date input expects.
 *
 * Only a default for an empty form. The date the preview actually uses is
 * whatever the field holds when Preview is pressed.
 */
function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${String(now.getFullYear())}-${month}-${day}`;
}
