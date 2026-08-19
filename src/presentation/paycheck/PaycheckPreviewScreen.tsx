import { useEffect, useState, type FormEvent, type JSX } from 'react';

import type { EditablePaycheckPlanStorage } from '@application/paycheck/editable-paycheck-plan-storage';
import {
  addPriority,
  canAddPriority,
  movePriorityDown,
  movePriorityUp,
  orderedPriorities,
  removePriority,
  renamePriority,
  setPriorityAmount,
} from '@application/paycheck/edit-paycheck-plan';
import { confirmPaycheck } from '@application/paycheck/confirm-paycheck';
import { toConfirmedPaycheckView } from '@application/paycheck/confirmed-paycheck-view';
import type { EditablePaycheckPlan } from '@application/paycheck/paycheck-plan';
import type { ConfirmedPaycheckRecords } from '@application/persistence/confirmed-paycheck-records';
import {
  previewPaycheckAllocation,
  type PaycheckPreview,
} from '@application/paycheck/preview-paycheck-allocation';
import type { ConfirmedPaycheckStore } from '@application/persistence/confirmed-paycheck-store';
import type { IdGenerator } from '@domain/shared/ids/id-generator';

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
  /** Where confirmed paychecks are kept. Supplied by the composition root. */
  readonly confirmedPaychecks: ConfirmedPaycheckStore;
  /** Identifiers for the records a confirmation writes (PFOS-ENG-00 §4.5). */
  readonly ids: IdGenerator;
}

export function PaycheckPreviewScreen({
  planStorage,
  confirmedPaychecks,
  ids,
}: PaycheckPreviewScreenProps): JSX.Element {
  const [amount, setAmount] = useState('2,000.00');
  const [eventDate, setEventDate] = useState(todayIso());
  /*
   * The saved plan is read once, when the screen first mounts. Reading it on
   * every render would fight the person typing.
   */
  const [plan, setPlan] = useState<EditablePaycheckPlan>(() => planStorage.load());
  const [preview, setPreview] = useState<PaycheckPreview | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  /*
   * What the preview on screen was built from.
   *
   * A proposal may only be confirmed while it still describes what a person is
   * looking at. Comparing this with the current inputs is how the Confirm
   * button disappears the moment the plan, the amount or the date changes: the
   * preview is not silently recalculated, and a visibly stale proposal cannot
   * be recorded. Pressing Preview again produces a fresh one.
   */
  const [previewedFrom, setPreviewedFrom] = useState<string | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);
  /*
   * The stored records, newest first. Everything shown for a confirmed paycheck
   * is read from them and from nothing else — not the plan being edited above —
   * so renaming a priority cannot change what a saved paycheck says (Decision
   * 098 holding 4).
   */
  const [confirmed, setConfirmed] = useState<readonly ConfirmedPaycheckRecords[]>([]);
  /*
   * Which one is open. Unset means the newest, so a fresh confirmation is the
   * one on screen without anything having to choose it.
   */
  const [openedId, setOpenedId] = useState<string | undefined>(undefined);
  const [justConfirmed, setJustConfirmed] = useState(false);

  const priorities = orderedPriorities(plan);
  const history = confirmed.map(toConfirmedPaycheckView);
  const opened = history.find((entry) => entry.allocationId === openedId) ?? history[0];
  const currentInputs = JSON.stringify({ plan, amount, eventDate });
  const confirmable = preview !== undefined && previewedFrom === currentInputs;

  /*
   * Settings are saved as they are edited, so there is no Save button and no
   * moment where a person has to decide to keep their own preferences. Only
   * these three values are written; a preview is never stored.
   */
  useEffect(() => {
    planStorage.save(plan);
  }, [planStorage, plan]);

  /*
   * The saved paycheck is read once, when the screen mounts, so a person coming
   * back sees what they confirmed. It is read again after a confirmation, and
   * at no other time: the stored record does not change on its own.
   */
  useEffect(() => {
    let cancelled = false;

    void confirmedPaychecks.readConfirmations().then((stored) => {
      if (cancelled) {
        return;
      }

      if (stored.ok) {
        setConfirmed(stored.value);
        return;
      }

      /*
       * A stored record that cannot be read is reported rather than hidden, and
       * no part of the history is shown in its place: a list missing a paycheck
       * looks exactly like a list that never had one. Decision 098 holding 8
       * leaves the stored data untouched, so nothing here retries or repairs.
       */
      setConfirmed([]);
      setError(stored.error.summary);
    });

    return () => {
      cancelled = true;
    };
  }, [confirmedPaychecks]);

  function onPreview(submitEvent: FormEvent<HTMLFormElement>): void {
    submitEvent.preventDefault();

    const result = previewPaycheckAllocation({
      plan,
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
    setPreviewedFrom(currentInputs);
    setJustConfirmed(false);
  }

  /**
   * Records the proposal on screen.
   *
   * The preview's own `confirmable` payload is handed back untouched, so what
   * is stored is the allocation a person was looking at rather than one
   * recalculated at the moment of the click.
   *
   * The button is disabled while the write is in flight, which is ordinary
   * double-click safety and nothing more: no request is deduplicated, no key is
   * assigned, and pressing Confirm on a fresh preview later records a second
   * paycheck as it should.
   */
  async function onConfirm(): Promise<void> {
    if (preview === undefined || confirming) {
      return;
    }

    setConfirming(true);

    const result = await confirmPaycheck({
      proposal: preview.confirmable,
      confirmedAt: Date.now(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ids,
      store: confirmedPaychecks,
    });

    setConfirming(false);

    if (!result.ok) {
      setError(result.error.summary);
      setJustConfirmed(false);
      return;
    }

    setError(undefined);
    setJustConfirmed(true);
    await showConfirmedPaychecks();
  }

  /**
   * Reloads the saved paychecks from storage.
   *
   * Reading them back rather than rendering what was just written keeps one
   * path to the screen: what a person sees after confirming is the stored
   * record, the same one they will see after a reload.
   */
  async function showConfirmedPaychecks(): Promise<void> {
    const stored = await confirmedPaychecks.readConfirmations();

    if (stored.ok) {
      setConfirmed(stored.value);
      /* The one just confirmed is the newest, so nothing needs choosing. */
      setOpenedId(undefined);
      return;
    }

    /*
     * A stored record that cannot be read is reported rather than hidden, and
     * nothing is shown in its place. Decision 098 holding 8 leaves the stored
     * data untouched, so nothing here retries, repairs or clears it.
     */
    setConfirmed([]);
    setError(stored.error.summary);
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
                value={plan.givingPercent}
                onChange={(changeEvent) => {
                  setPlan({ ...plan, givingPercent: changeEvent.target.value });
                }}
              />
              <span aria-hidden="true">% of each paycheck</span>
            </div>
          </div>

          <div className="priorities">
            <h2>Top priorities</h2>
            <p className="hint">Funded in this order, before anything left over.</p>

            {priorities.length === 0 && <p className="hint">No top priorities yet.</p>}

            <ol>
              {priorities.map((priority, index) => (
                <li key={priority.id}>
                  <div className="field">
                    <label htmlFor={`priority-name-${priority.id}`}>
                      Priority {index + 1} name
                    </label>
                    <input
                      id={`priority-name-${priority.id}`}
                      type="text"
                      autoComplete="off"
                      value={priority.label}
                      onChange={(changeEvent) => {
                        setPlan(renamePriority(plan, priority.id, changeEvent.target.value));
                      }}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor={`priority-amount-${priority.id}`}>
                      Priority {index + 1} amount
                    </label>
                    <div className="suffixed">
                      <input
                        id={`priority-amount-${priority.id}`}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={priority.amountPerPaycheck}
                        onChange={(changeEvent) => {
                          setPlan(setPriorityAmount(plan, priority.id, changeEvent.target.value));
                        }}
                      />
                      <span aria-hidden="true">per paycheck</span>
                    </div>
                  </div>

                  <div className="row-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        setPlan(movePriorityUp(plan, priority.id));
                      }}
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      disabled={index === priorities.length - 1}
                      onClick={() => {
                        setPlan(movePriorityDown(plan, priority.id));
                      }}
                    >
                      Move down
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPlan(removePriority(plan, priority.id));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ol>

            {canAddPriority(plan) ? (
              <button
                type="button"
                onClick={() => {
                  setPlan(addPriority(plan));
                }}
              >
                Add priority
              </button>
            ) : (
              <p className="hint">Three top priorities is the most a plan can have.</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="leftover-label">Everything left over goes to</label>
            <input
              id="leftover-label"
              name="leftover-label"
              type="text"
              autoComplete="off"
              value={plan.leftoverLabel}
              onChange={(changeEvent) => {
                setPlan({ ...plan, leftoverLabel: changeEvent.target.value });
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

          {/*
           * The plan-level answer, above the rows it summarizes: whether the
           * priorities as a group fit inside this paycheck. It is information
           * rather than a validation failure, so it is neither an alert nor
           * styled as an error, and it is absent when everything fit.
           */}
          {preview.priorityFundingSummary !== undefined && (
            <p className="summary">{preview.priorityFundingSummary}</p>
          )}

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
                  <th scope="row">
                    <span className="destination">{line.label}</span>
                    <span className="why">{line.explanation}</span>
                  </th>
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

          {/*
           * Confirming records this proposal in PFOS. It is offered only while
           * the preview still matches what is on screen: change the plan, the
           * amount or the date and it disappears until Preview is pressed
           * again, so a proposal a person can no longer see cannot be saved.
           */}
          {confirmable && (
            <div className="confirm">
              <button type="button" onClick={() => void onConfirm()} disabled={confirming}>
                {confirming ? 'Confirming…' : 'Confirm paycheck'}
              </button>
              <p className="note">
                Confirming records this paycheck in PFOS. PFOS does not move money, and a confirmed
                paycheck cannot yet be changed or removed.
              </p>
            </div>
          )}

          {preview !== undefined && !confirmable && (
            <p className="note">
              The plan or paycheck changed. Preview again to confirm what you see now.
            </p>
          )}

          {justConfirmed && (
            <p className="confirmed" role="status">
              Paycheck confirmed and saved on this device.
            </p>
          )}
        </section>
      )}

      {opened !== undefined && (
        <section aria-labelledby="confirmed-heading">
          <h2 id="confirmed-heading">Confirmed paychecks</h2>

          {/*
           * One row per confirmed paycheck, newest first, in the order the
           * store returned them. Nothing is sorted here: the order is a
           * property of the records, decided once where they are read.
           */}
          <ul className="history">
            {history.map((entry) => (
              <li key={entry.allocationId}>
                <button
                  type="button"
                  aria-current={entry.allocationId === opened.allocationId}
                  onClick={() => {
                    setOpenedId(entry.allocationId);
                  }}
                >
                  <span className="history-date">{entry.paycheckDate}</span>
                  <span className="amount">{entry.paycheckAmount}</span>
                </button>
              </li>
            ))}
          </ul>

          <p className="note">
            {opened.paycheckAmount} on {opened.paycheckDate} · Confirmed {opened.confirmedAt}
          </p>

          <table>
            <thead>
              <tr>
                <th scope="col">Destination</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {opened.lines.map((line) => (
                <tr key={line.bucketId}>
                  <th scope="row">
                    <span className="destination">{line.label}</span>
                    <span className="why">{line.explanation}</span>
                  </th>
                  <td className="amount">{line.amount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total allocated</th>
                <td className="amount">{opened.totalAllocated}</td>
              </tr>
              <tr>
                <th scope="row">Unallocated</th>
                <td className="amount">{opened.unallocated}</td>
              </tr>
            </tfoot>
          </table>

          {/*
           * The plan may have changed since. Each paycheck shows what was
           * confirmed at the time and is not recalculated (Decision 098
           * holding 4).
           */}
          <p className="note">
            Saved on this device as it was confirmed. Changing your plan does not change it, and
            PFOS does not move money.
          </p>
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
