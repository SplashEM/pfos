/**
 * The kind of resolved structure an authored rule contributes to
 * (Decision 081; Decision 074).
 *
 * There is one member per rule-authored `ResolvedRuleSet` structure established
 * by Decision 074, so the vocabulary cannot drift from an accepted contract.
 *
 * Its meaning is deliberately narrow. It is not an exact resolved address: it
 * does not identify a bucket subject for keyed structures, and it establishes no
 * natural key and no uniqueness constraint. Decision 082 completes the authored
 * address by settling granularity — an owner together with a slot kind
 * identifies an authored rule's V1 scope — while the concrete bucket-keyed
 * addresses of a group-owned or global-owned scope default are still derived
 * later, from membership and bucket state supplied in the evaluation context.
 *
 * `stageSequence` has no member. Decision 080 records that no §5 category
 * authors a stage order and that the sequence is Rule Engine output.
 *
 * `TOP_PRIORITIES` and `LOWER_PRIORITY_POOL` are each one member rather than a
 * strategy member and a membership member. Decision 082 chose one Rule per
 * owner carrying the strategy together with its whole member set, so neither
 * splits; Decision 074 makes the entry type a function of the strategy, and
 * splitting either would sever that discriminated union.
 */
export type ResolvedSlotKind =
  | 'ALLOCATION_BASIS'
  | 'GLOBAL_OBLIGATION'
  | 'TOP_PRIORITIES'
  | 'REQUIRED_FUNDING'
  | 'LOWER_PRIORITY_POOL'
  | 'LEFTOVER_POLICY'
  | 'ROLLOVER_POLICY'
  | 'GOAL_POLICY';
