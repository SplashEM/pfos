/**
 * The rounding policy this build implements (Decision 071).
 *
 * Every Plan Snapshot records this identifier alongside the resolved rules so
 * a historical allocation remains reproducible even if the policy is later
 * replaced (PFOS-00 Principle 11; PFOS-ENG-02 §56).
 *
 * Changing the division algorithm requires a new identifier, never a silent
 * edit of this value.
 */
export const ROUNDING_POLICY_ID = 'PFOS-ROUND-071-V1';
