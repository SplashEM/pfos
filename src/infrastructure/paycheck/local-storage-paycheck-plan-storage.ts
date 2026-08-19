import type { EditablePaycheckPlanStorage } from '@application/paycheck/editable-paycheck-plan-storage';
import {
  DEFAULT_PAYCHECK_PLAN,
  type EditablePaycheckPlan,
} from '@application/paycheck/paycheck-plan';

/**
 * Keeps the three preview plan settings in browser local storage.
 *
 * This is the infrastructure half of `EditablePaycheckPlanStorage`: every call
 * to `localStorage` and every line of JSON handling in PFOS lives here, which is
 * where PFOS-ENG-00 §3 puts a storage implementation. The application layer
 * holds the contract and knows nothing about browsers; the presentation layer
 * calls the contract and never touches storage itself (§4.1).
 *
 * It is preference storage, not PFOS financial persistence. What it holds is the
 * text a person typed into the plan controls — nothing resolved, allocated or
 * confirmed. No `ResolvedRuleSet`, `AllocationResult`, `PlanSnapshot`, rule
 * version, paycheck or audit record is stored, and none may be added here: the
 * moment a financial record needs to survive a reload it belongs in its own
 * contract, with the snapshot and migration semantics that decision brings.
 *
 * Nothing migrates. A record this build does not recognise is discarded, which
 * is the only handling a disposable preference needs, and is why there is no
 * migration path, no compatibility reader and no version negotiation here.
 */

/** The one key this slice owns, namespaced so nothing else collides with it. */
export const PAYCHECK_PLAN_STORAGE_KEY = 'pfos.preview-plan';

/**
 * The version of this saved settings record, and of nothing else.
 *
 * It exists so a record written by an older build can be recognised and
 * discarded rather than misread. It is not `ResolvedRuleSet.schemaVersion`, not
 * `PlanSnapshot.schemaVersion`, and not a domain persistence version: no
 * accepted contract is versioned here and no financial document is stored.
 */
export const PAYCHECK_PLAN_SETTINGS_VERSION = 1;

/** The record as written to storage. */
interface StoredPaycheckPlan {
  readonly schemaVersion: number;
  readonly givingPercent: string;
  readonly emergencyFundPerPaycheck: string;
  readonly leftoverLabel: string;
}

/**
 * Builds the browser-storage implementation of the plan-settings port.
 *
 * A factory rather than a class: there is no state to hold and nothing to
 * configure, so this exists only to name the dependency at the composition root
 * and to keep the contract swappable in a test.
 */
export function createLocalStoragePaycheckPlanStorage(): EditablePaycheckPlanStorage {
  return {
    load: loadEditablePaycheckPlan,
    save: saveEditablePaycheckPlan,
    clear: clearEditablePaycheckPlan,
  };
}

/**
 * Reads the saved settings, falling back to the default plan.
 *
 * Validity is judged whole-record. A record missing a field, carrying a
 * non-string, or written by a different version is discarded entirely rather
 * than merged with defaults: a half-restored plan would show a person values
 * they never chose beside values they did, and there is no way for them to tell
 * which is which.
 *
 * Nothing financial happens here. The stored strings are not parsed as money or
 * as a rate, and no rule is built; that all happens through the existing
 * pipeline when Preview is pressed, so a stored value that is no longer valid
 * gets the same explanation a freshly typed one would.
 *
 * Every failure path ends at the default plan. Unreadable storage, bad JSON and
 * a stale record are all the same answer to the only question being asked: is
 * there a usable saved plan?
 */
function loadEditablePaycheckPlan(): EditablePaycheckPlan {
  const raw = readRaw();
  if (raw === undefined) {
    return DEFAULT_PAYCHECK_PLAN;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_PAYCHECK_PLAN;
  }

  return toStoredPlan(parsed) ?? DEFAULT_PAYCHECK_PLAN;
}

/**
 * Saves the three settings.
 *
 * A failure is swallowed. Storage can be unavailable or full — a private window
 * refuses writes entirely — and a person editing a preview should not be
 * interrupted by a warning about a convenience that failed. The settings stay
 * correct for the rest of the session either way, and the next reload simply
 * starts from the defaults.
 */
function saveEditablePaycheckPlan(plan: EditablePaycheckPlan): void {
  const record: StoredPaycheckPlan = {
    schemaVersion: PAYCHECK_PLAN_SETTINGS_VERSION,
    givingPercent: plan.givingPercent,
    emergencyFundPerPaycheck: plan.emergencyFundPerPaycheck,
    leftoverLabel: plan.leftoverLabel,
  };

  try {
    localStorage.setItem(PAYCHECK_PLAN_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* Storage is a convenience here. Losing it costs a reload, not an answer. */
  }
}

/** Forgets the saved settings, so the next load starts from the defaults. */
function clearEditablePaycheckPlan(): void {
  try {
    localStorage.removeItem(PAYCHECK_PLAN_STORAGE_KEY);
  } catch {
    /* Nothing to do: the caller wanted it gone, and it is unreadable anyway. */
  }
}

/** The stored string, or `undefined` if storage holds nothing or cannot be read. */
function readRaw(): string | undefined {
  try {
    return localStorage.getItem(PAYCHECK_PLAN_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Narrows untrusted parsed JSON to a saved plan, or `undefined`.
 *
 * PFOS-ENG-00 §29.1 treats stored and imported content as untrusted, so every
 * field is checked rather than assumed. The record is read as a whole: one bad
 * field discards all of it.
 */
function toStoredPlan(value: unknown): EditablePaycheckPlan | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  if (record['schemaVersion'] !== PAYCHECK_PLAN_SETTINGS_VERSION) {
    return undefined;
  }

  const givingPercent = record['givingPercent'];
  const emergencyFundPerPaycheck = record['emergencyFundPerPaycheck'];
  const leftoverLabel = record['leftoverLabel'];

  if (
    typeof givingPercent !== 'string' ||
    typeof emergencyFundPerPaycheck !== 'string' ||
    typeof leftoverLabel !== 'string'
  ) {
    return undefined;
  }

  return { givingPercent, emergencyFundPerPaycheck, leftoverLabel };
}
