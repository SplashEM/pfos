/**
 * Rule Engine error codes (Decision 073; PFOS-ENG-01 §39).
 *
 * Decision 073 places engine-specific codes inside the engine that introduces
 * them. Shared ERROR_CODES keeps only the shared-primitive families — MONEY_*,
 * BASIS_POINTS_* and DATE_* — and never learns about an engine.
 *
 * Every code here begins with RULE_ so that engine registries stay disjoint by
 * construction. The Allocation Engine and Goal Engine will own ALLOCATION_* and
 * GOAL_* under the same convention. src/test/architecture enforces both the
 * prefix and the disjointness, because the type system no longer can once each
 * registry is declared separately.
 *
 * Codes are part of the domain contract: they are matched by tests, surfaced to
 * the presentation layer, and must not change meaning once released (§39).
 *
 * This registry is deliberately minimal. It holds only the codes whose meaning
 * is already settled by an accepted decision — the two authored-percentage-pool
 * failures assigned to the Rule Engine by Decision 071 "Validation ownership",
 * the two top-priority failures named by Decision 076, the effective-period
 * range failure named by Decision 078, the duplicate effective start named by
 * Decision 079, the duplicate authored scope authorised by Decision 084, and
 * the duplicate funding sequence whose behaviour Decision 097 specified.
 * The remaining hard-validation codes in PFOS-ENG-01 §21.1 arrive with the
 * milestone phase that implements the validation behind them, so that no code
 * is published before the rule it reports is specified.
 *
 * One code reports capability rather than a rule. RULE_RESOLUTION_NOT_SUPPORTED
 * refuses an input whose resolution would require answering a question no
 * accepted source has settled, following the treatment the Allocation Engine
 * already established for stages and strategies it cannot yet execute.
 */
export const RULE_ERROR_CODES = {
  /*
   * An authored percentage pool must total exactly 10,000 basis points
   * (Decision 071; PFOS-ENG-00 §11; PFOS-ENG-01 §13.3, §14.3, §16.4, §21.1).
   *
   * This applies to authored pools only. Weights derived during allocation
   * legitimately total less once a destination is removed, and Money performs
   * no sum check of any kind.
   */
  RULE_POOL_NOT_EXACTLY_100_PERCENT: 'RULE_POOL_NOT_EXACTLY_100_PERCENT',

  /*
   * An individual pool entry must be between 0 and 10,000 basis points
   * (Decision 071; PFOS-ENG-01 §21.1). A single rate carries no sum
   * requirement and is validated separately (§15.1).
   */
  RULE_POOL_ENTRY_OUT_OF_RANGE: 'RULE_POOL_ENTRY_OUT_OF_RANGE',

  /*
   * A top-priority plan must hold no more than the V1 maximum of three entries
   * (Decision 076; PFOS-ENG-01 §13.1, §21.1). The limit applies under either
   * strategy, because §13.1 limits top priorities as such rather than limiting a
   * particular strategy.
   *
   * The number three is deliberately absent from the name: the V1 limit may
   * change, the meaning "more than the allowed maximum" does not.
   */
  RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM: 'RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM',

  /*
   * Two top-priority entries must not share a rank (Decision 076;
   * PFOS-ENG-01 §13.1, §21.1). Uniqueness is the only constraint on rank —
   * ranks need not be positive, contiguous, start at one, or match array
   * position, because no accepted source requires any of those.
   */
  RULE_TOP_PRIORITY_DUPLICATE_RANK: 'RULE_TOP_PRIORITY_DUPLICATE_RANK',

  /*
   * A rule version's effective period ends before it starts (Decision 078;
   * PFOS-ENG-01 §18, §21.1, §43.3).
   *
   * This reports one condition and only one: `effectiveTo` is present and falls
   * strictly before `effectiveFrom`. An absent `effectiveTo` is an open-ended
   * period and is valid, and endpoints that are equal describe a valid one-day
   * period, so neither is reported here.
   *
   * It says nothing about how two periods relate. Decision 078 introduces no
   * overlap rule, no contiguity rule and no restriction on the number of
   * open-ended versions, so no code is registered for any of them.
   *
   * The shared DATE_RANGE_INVALID_ORDER is not reused. It belongs to the shared
   * DateRange primitive, which requires both endpoints, while Decision 073
   * confines shared codes to the shared primitive families.
   */
  RULE_EFFECTIVE_PERIOD_INVALID_RANGE: 'RULE_EFFECTIVE_PERIOD_INVALID_RANGE',

  /*
   * Two versions of one rule claim the same effective start (Decision 079;
   * PFOS-ENG-01 §7, §21.1).
   *
   * A collection of one rule's versions holding a duplicate `effectiveFrom` is
   * invalid regardless of the evaluation date, including a date on which the
   * duplicate has no effect. Both periods include their shared start, so the two
   * versions are in effect together on at least that day, and Decision 079
   * permits nothing to break the tie: an identifier, a version number, a
   * creation time and storage order are all excluded from selection.
   *
   * The same code reports the defensive case. Selection assumes valid input and
   * is not a validator, but where malformed input leaves more than one currently
   * effective candidate sharing the greatest `effectiveFrom`, it returns this
   * rather than choosing one. A selection that returns a version answers only
   * for that date; it is never a finding that the rest of the history is valid.
   *
   * Overlap is not what this reports. Decision 079 permits two versions of a
   * rule to be in effect at once — §19.2's prospective change requires it, since
   * an open-ended earlier version cannot be closed after creation — and only a
   * shared start is rejected.
   */
  RULE_VERSION_DUPLICATE_EFFECTIVE_FROM: 'RULE_VERSION_DUPLICATE_EFFECTIVE_FROM',

  /*
   * Two active rules claim the same authored scope (Decision 084;
   * Decision 082; Decision 083; PFOS-ENG-01 §21.1).
   *
   * An authored scope is a rule's owner together with its slot kind. Decision
   * 082 establishes that for the seven replacing slot kinds a given owner has
   * at most one such setting, so two rules sharing that scope claim one setting
   * rather than addressing different subjects. Decision 083 supplies the set
   * the invariant ranges over — the ACTIVE rules of the current authored plan —
   * and Decision 084 authorises this code.
   *
   * `GLOBAL_OBLIGATION` cannot produce this failure. Decision 080 accepts that
   * separately authored obligations accumulate, and the exemption is a property
   * of the kind rather than of the owner, so it holds at every owner.
   *
   * It reports a structural defect in the current plan, not a dated one. No
   * evaluation date, rule version or effective period is consulted, and a
   * retired rule sharing a scope with the rule that replaced it is valid rather
   * than reportable.
   */
  RULE_DUPLICATE_AUTHORED_SCOPE: 'RULE_DUPLICATE_AUTHORED_SCOPE',

  /*
   * Two funding rules resolved together claim the same `sequence`
   * (Decision 097; Decision 074; Decision 080).
   *
   * `ResolvedFundingRule.sequence` is the competition order of distinct buckets
   * for the same money, and Decision 074 classifies it as a financially
   * meaningful ordering that Decision 090 expressly preserved. Decision 097
   * supplies its authored source and requires values to be distinct across the
   * funding rules resolved into one `ResolvedRuleSet`.
   *
   * Uniqueness is forced rather than chosen. Equal values leave the order
   * between two buckets undetermined, and every tie-break that could settle it
   * is already excluded — an identifier is opaque under PFOS-ENG-00 §14, and
   * Decision 080 forbids array position, repository order and storage order —
   * so a duplicate makes the resolved ordering non-deterministic against
   * Constitution Principle 18 and PFOS-ENG-01 §26. Decision 076 reached the
   * identical conclusion for top-priority rank.
   *
   * Uniqueness is the only constraint. Sequences need not be positive,
   * contiguous or start at one, and gaps carry no meaning and are not defects.
   *
   * Decision 097 registered no code and left the check to the unit where it
   * becomes executable, which is resolution: this is the first place a set of
   * funding rules is assembled and ordered. Decision 073's convention is
   * satisfied because Decision 097 specified the behaviour being reported.
   */
  RULE_FUNDING_DUPLICATE_SEQUENCE: 'RULE_FUNDING_DUPLICATE_SEQUENCE',

  /*
   * Resolution requires behaviour this slice does not implement.
   *
   * This reports an unimplemented capability, not invalid data, so its category
   * is UNSUPPORTED_STATE. It follows the Allocation Engine's established
   * treatment: `ALLOCATION_STAGE_NOT_SUPPORTED` refuses a stage the executor
   * recognises but cannot run, for the reason that silently skipping it would
   * drop money and produce a confidently wrong answer.
   *
   * The same reasoning applies here, one engine earlier. Where an input would
   * require the resolver to answer a question no accepted source has settled,
   * refusing is the only alternative to inventing the answer, which Constitution
   * Principle 4 forbids. The two conditions it currently reports are:
   *
   * - two effective configurations competing for one replacing slot kind at
   *   different owners, which is precedence and fallback behaviour and remains
   *   Blocker C; and
   * - a funding requirement no emitted stage would fund, which would require
   *   sequencing REQUIRED_RECURRING and answering the duplicate-destination
   *   question PFOS-ENG-02 §48 leaves open.
   *
   * It never reports an authored defect. A plan that trips it is a real plan
   * this engine cannot yet resolve, and the fix is a later decision or a later
   * slice rather than an edit by the user.
   */
  RULE_RESOLUTION_NOT_SUPPORTED: 'RULE_RESOLUTION_NOT_SUPPORTED',
} as const;

export type RuleErrorCode = (typeof RULE_ERROR_CODES)[keyof typeof RULE_ERROR_CODES];
