import type { EntityId } from '../ids/entity-id';

/**
 * An engine-agnostic explanation envelope (Decision 074).
 *
 * Decision 007 requires an important engine output to travel with the reasoning
 * behind it, and PFOS-ENG-01 §24 fixes what a resolved rule set must explain.
 * An explanation is neither a failure nor a caution: it accompanies a
 * successful result and describes how that result came about. DomainError
 * (§22) reports a failure and DomainWarning (§21) reports a valid but
 * questionable outcome; this is the third, separate channel.
 *
 * Ownership follows the pattern Decision 073 established for errors. The shared
 * layer owns the envelope; each engine owns its own closed vocabulary of codes
 * and narrows the envelope to it. The dependency runs one way only: an engine
 * may read shared, and shared may never import an engine explanation type
 * (PFOS-ENG-00 §44). The `= string` default exists so a caller can name this
 * type without an argument.
 *
 * `TDetail` carries structured detail entries. It defaults to `never`, which
 * makes `details` unusable rather than merely unused: a consumer that has no
 * accepted detail vocabulary cannot invent one. Decision 074 leaves Rule Engine
 * explanations on that default for V1.
 *
 * `affectedEntityIds` uses the same name as the error and warning channels, so
 * all three describe the entities they concern with one term. It is required
 * here — an explanation that names nothing explains nothing — while the
 * provenance and severity fields are optional.
 *
 * Explanations are persisted inside a Plan Snapshot (Decision 023), so the
 * shape is a contract: a change to it is a change to historical records.
 */
export interface Explanation<TCode extends string = string, TDetail = never> {
  readonly code: TCode;
  /** A short label. Safe to display to the user. */
  readonly title: string;
  /** The reasoning in prose. Safe to display to the user. */
  readonly summary: string;
  readonly affectedEntityIds: readonly EntityId[];
  readonly details?: readonly TDetail[];
  /** Provenance: the authored versions this explanation was derived from. */
  readonly ruleVersionIds?: readonly EntityId[];
  readonly severity?: ExplanationSeverity;
}

/**
 * How an explanation should be presented (Decision 074).
 *
 * This grades presentation only. It never grades a financial outcome, and
 * `WARNING` here does not replace DomainWarning: a warning that must be visible
 * under PFOS-ENG-01 §21.2 travels on the warning channel, whether or not an
 * explanation happens to mention it.
 */
export type ExplanationSeverity = 'INFO' | 'SUCCESS' | 'WARNING';
