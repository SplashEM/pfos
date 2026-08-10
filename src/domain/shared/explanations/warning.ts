/**
 * A domain warning (PFOS-ENG-00 §21).
 *
 * A warning is not an error. It says the action is valid, the result may be
 * undesirable or unusual, and the user should look at it — for example that
 * lower priorities received no funding, that a goal is projected late, or
 * that fixed commitments exceed normal income.
 *
 * Warnings do not block a preview (PFOS-ENG-02 §62). They travel alongside a
 * successful result rather than replacing it, which is why this is a plain
 * structure and not a variant of DomainError.
 *
 * The shape is taken verbatim from §21, including `affectedEntityIds` being
 * plain strings rather than branded EntityId values: the specification says
 * strings, and DomainError carries them the same way.
 */
export interface DomainWarning {
  readonly code: string;
  readonly message: string;
  readonly affectedEntityIds: readonly string[];
  readonly recommendedAction?: string;
}
