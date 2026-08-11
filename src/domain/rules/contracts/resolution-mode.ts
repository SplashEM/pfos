/**
 * The context in which a rule set was resolved (Decision 074).
 *
 * `resolutionMode` records the resolution context so simulated or historical
 * results cannot be mistaken for ordinary preview resolution.
 *
 * Decision 074 fixes these three modes. Confirmation is not among them:
 * Decision 075 records that confirmation is an orchestration step under
 * PFOS-ENG-02 §57 and is not visible at resolution time.
 */
export type ResolutionMode = 'PREVIEW' | 'SIMULATION' | 'HISTORICAL_RECALCULATION';
