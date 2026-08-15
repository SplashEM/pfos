/**
 * Whether an authored rule belongs to the current plan or is retained as
 * history (Decision 083; PFOS-ENG-01 §18, §41).
 *
 * This answers one question and only one: is this logical rule part of the
 * user's current authored plan, or retained only as historical and audit state?
 *
 * It does not answer which version is effective on a date — `RuleEffectivePeriod`
 * with Decision 079 owns that — and it does not answer whether a selected
 * version contributes financial configuration, which a terminating
 * representation will answer once the `RuleVersion` payload decision defines
 * one. Decision 083 keeps those three questions apart: a status carries no date,
 * an effective period carries no lifecycle.
 *
 * A status is therefore never a resolution input. Current status is not
 * historical financial truth: a rule that is `RETIRED` today may be the rule
 * that applied in March, and excluding it from resolution for an earlier
 * evaluation date would rewrite the past, which Constitution Principle 11
 * forbids and PFOS-ENG-00 §32 Invariant 10 states as a global invariant.
 * Decision 083 states the consequence directly — changing a rule's status must
 * not change the resolved value for any date.
 *
 * `RETIRED` is terminal. The lifecycle admits one transition, from `ACTIVE` to
 * `RETIRED`, and no return; a replacement is a new logical rule. Decision 083
 * records lifecycle semantics rather than persistence mechanics, so nothing here
 * says how that transition is stored.
 *
 * Two members, not more. `DISABLED` and `INACTIVE` were rejected because an
 * undated flag cannot express a stop dated in the future, which §28 and
 * Decision 022 require, and would leave an open-ended version appearing to have
 * applied throughout a period the rule was off. `ARCHIVED` was rejected because
 * bucket, group and goal archival already carry allocation meaning
 * (PFOS-ENG-00 §32 Invariant 7; §21.1; RULE_SKIP_DESTINATION_ARCHIVED).
 * `DRAFT` was rejected as unsupported: §21 describes validation before
 * activation, not a persisted pre-active rule.
 */
export type RuleStatus = 'ACTIVE' | 'RETIRED';
