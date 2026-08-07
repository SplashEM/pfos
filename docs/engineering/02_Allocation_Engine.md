# Personal Financial Operating System

## Allocation Engine Specification

**Document ID:** PFOS-ENG-02
**Status:** Draft for Review
**Target Release:** Version 1 Beta
**Primary Consumers:** Paycheck workflows, Dashboard, Funding Advisor, Coaching Engine, Decision Simulator, Insight Engine
**Dependencies:**

* PFOS-00 Product Constitution
* PFOS-01 Product Vision & Version 1 PRD
* PFOS-02 Product Decision Log
* PFOS-ENG-00 Core Architecture & Project Setup
* PFOS-ENG-01 Rule Engine Specification

---

# 1. Purpose

The Allocation Engine is the authoritative owner of calculations that determine how available income should be distributed among virtual financial buckets.

Its purpose is to answer:

> Given this money, this financial state, and these resolved rules, exactly where should every cent go—and why?

The Allocation Engine converts a resolved financial plan into a deterministic Allocation Preview.

It must:

* Allocate money according to resolved rules
* Respect user priorities
* Prevent money from appearing or disappearing
* Identify unmet or partially funded obligations
* Apply leftover policies
* Produce traceable explanations
* Support preview, confirmation, history, and simulation
* Return the same output for the same inputs

The Allocation Engine calculates virtual allocations only.

It does not move physical money.

---

# 2. Core Principle

The Allocation Engine follows:

> **Every cent must have one mathematically traceable outcome.**

For any allocation run:

```text
Total Eligible Input
=
Total Proposed Allocations
+
Total Remaining Unallocated
```

This equality must hold exactly to the cent.

The engine may not:

* Lose cents through rounding
* Create extra cents
* Allocate the same cent twice
* Depend on UI order or database retrieval order
* Silently override rules
* Modify confirmed financial state during calculation

---

# 3. Responsibilities

The Allocation Engine is responsible for:

1. Receiving a resolved rule set from the Rule Engine.
2. Receiving current financial planning state.
3. Calculating global obligations.
4. Calculating top-priority allocations.
5. Calculating required recurring funding.
6. Calculating goal and bucket funding.
7. Calculating lower-priority distributions.
8. Calculating everyday spending allocations.
9. Applying leftover allocation policies.
10. Applying deterministic rounding.
11. Preventing over-allocation.
12. Producing partial-funding results.
13. Identifying underfunded requirements.
14. Calculating available-to-allocate amounts.
15. Producing structured explanations.
16. Producing warnings and shortfall information.
17. Supporting event-level overrides.
18. Supporting Decision Simulator scenarios.
19. Producing immutable Allocation Previews.
20. Producing data needed for confirmed Allocation Snapshots.

---

# 4. Non-Responsibilities

The Allocation Engine must not:

* Resolve rule precedence.
* Decide which permanent rules apply.
* Create or edit permanent rules.
* Determine whether a goal is Active, Funded, Completed, or Archived.
* Post transactions.
* Update account balances.
* Update bucket balances directly.
* Calculate net worth.
* Calculate Planning Scores.
* Calculate Goal Confidence Scores.
* Categorize transactions.
* Reconcile physical accounts.
* Read directly from IndexedDB.
* Render UI.
* Use AI or machine learning.
* Move physical money.
* Decide whether a user’s priorities are financially or morally correct.
* Rewrite historical allocations using current rules.

The Rule Engine tells the Allocation Engine what rules apply.

The Goal Engine supplies goal status and funding constraints.

The orchestration layer persists confirmed results.

---

# 5. Allocation Context

Every allocation calculation must receive a complete explicit context.

Conceptual input:

```typescript
interface AllocationContext {
  readonly allocationRunId: string;
  readonly evaluationDate: FinancialDate;
  readonly currency: "USD";

  readonly incomeEvent: AllocationIncomeEvent;
  readonly resolvedRules: ResolvedRuleSet;

  readonly bucketStates: readonly AllocationBucketState[];
  readonly groupStates: readonly AllocationGroupState[];
  readonly goalStates: readonly AllocationGoalState[];

  readonly periodState: AllocationPeriodState;
  readonly cashState?: AllocationCashState;

  readonly eventOverrides: readonly AllocationOverride[];
  readonly mode: "PREVIEW" | "SIMULATION" | "HISTORICAL_RECALCULATION";
}
```

The engine must not fetch missing context from persistence.

Missing required information must produce a typed error.

---

# 6. Income Event

A normal paycheck allocation input should include:

```typescript
interface AllocationIncomeEvent {
  readonly id: string;
  readonly incomeSourceId: string;
  readonly eventDate: FinancialDate;
  readonly netAmount: Money;
  readonly eligibleAmount: Money;
  readonly eventType:
    | "PAYCHECK"
    | "BONUS"
    | "TAX_REFUND"
    | "GIFT"
    | "SIDE_INCOME"
    | "INVESTMENT_INCOME"
    | "CUSTOM";
}
```

The Rule Engine determines eligible rule treatment.

The Allocation Engine must not infer whether an income event is tithing-eligible.

---

# 7. Bucket State Input

Each bucket supplied to the Allocation Engine should include only the state needed for allocation.

Conceptual structure:

```typescript
interface AllocationBucketState {
  readonly bucketId: string;
  readonly bucketType: BucketType;
  readonly status: "ACTIVE" | "PAUSED" | "FUNDED" | "COMPLETED" | "ARCHIVED";

  readonly currentVirtualBalance: Money;
  readonly currentPeriodAllocated: Money;

  readonly targetAmount?: Money;
  readonly remainingToTarget?: Money;
  readonly remainingPeriodRequirement?: Money;

  readonly automaticAllocationAllowed: boolean;
  readonly manualAllocationAllowed: boolean;

  readonly priorityRank?: number;
  readonly stableOrder: number;
}
```

The Goal Engine or orchestration layer prepares goal-related values such as `remainingToTarget`.

The Allocation Engine must not recreate goal lifecycle calculations independently.

---

# 8. Allocation Run States

An allocation workflow moves through:

```text
Draft Income
      ↓
Rule Resolution
      ↓
Allocation Preview
      ↓
User Review
      ↓
Confirmed Allocation
```

## Draft

Income information may be incomplete or editable.

## Preview

A fully calculated proposed allocation.

No confirmed financial state changes.

## Confirmed

The orchestrator atomically records:

* Income event
* Allocation record
* Allocation lines
* Plan Snapshot
* Bucket effects
* Audit entries

The Allocation Engine itself returns data but does not commit it.

---

# 9. Allocation Stages

A standard V1 allocation run should conceptually follow these stages:

1. Validate inputs.
2. Establish allocatable income pool.
3. Apply global percentage obligations.
4. Apply event-level fixed overrides where ordered.
5. Fund top priorities.
6. Fund required recurring obligations.
7. Fund other eligible bucket requirements.
8. Allocate lower-priority spending pool.
9. Apply leftover allocation policy.
10. Calculate remaining unallocated money.
11. Verify financial invariants.
12. Generate explanations and warnings.

The exact stage ordering comes from the resolved rule set.

The Allocation Engine must not hard-code policy that contradicts Rule Engine output.

---

# 10. Allocation Pool

The Allocation Engine begins with:

```text
Initial Pool = Income Event Net Amount
```

Some workflows may use:

```text
Initial Pool = Eligible Allocatable Amount
```

if the income event includes money excluded from planning.

The resolved rule set must identify the correct starting amount.

Every allocation decreases the remaining pool exactly once.

Conceptually:

```text
Remaining Pool
=
Initial Pool
-
Sum of Proposed Allocation Lines
```

---

# 11. Allocation Line

Each proposed allocation is represented as a line.

Conceptual structure:

```typescript
interface AllocationLine {
  readonly id: string;
  readonly destinationBucketId: string;
  readonly amount: Money;

  readonly stage: AllocationStage;
  readonly ruleVersionIds: readonly string[];

  readonly fundingStatus:
    | "FULLY_FUNDED"
    | "PARTIALLY_FUNDED"
    | "SKIPPED"
    | "NOT_REQUIRED";

  readonly requestedAmount?: Money;
  readonly unmetAmount?: Money;

  readonly explanationCodes: readonly string[];
}
```

A skipped item may be represented separately rather than as a zero-dollar line, but its reason must remain explainable.

---

# 12. Allocation Stages Enumeration

Recommended stages:

```typescript
type AllocationStage =
  | "GLOBAL_OBLIGATION"
  | "TOP_PRIORITY"
  | "REQUIRED_RECURRING"
  | "GOAL_FUNDING"
  | "LOWER_PRIORITY"
  | "EVERYDAY_SPENDING"
  | "LEFTOVER_POLICY"
  | "EVENT_OVERRIDE";
```

Stages must have explicit deterministic order.

---

# 13. Global Percentage Obligations

Global percentage obligations include rules such as tithing.

Example:

```text
Net eligible income: $2,000
Tithing rate: 10%
Tithing allocation: $200
Remaining pool: $1,800
```

The Allocation Engine receives:

* Rate
* Eligible amount
* Destination bucket
* Rounding rule
* Maximum or cap if applicable

It calculates the exact monetary amount.

---

# 14. Percentage Calculation

V1 percentages should use basis points.

Example:

```text
10% = 1,000 basis points
100% = 10,000 basis points
```

Conceptual calculation:

```text
Raw Numerator = Eligible Cents × Basis Points
Base Allocation = floor(Raw Numerator / 10,000)
Remainder Fraction = Raw Numerator mod 10,000
```

For a single percentage obligation, the configured rounding policy applies.

For percentage splits across several destinations, use the deterministic pool-allocation algorithm described later.

---

# 15. Rounding Policy

Every percentage calculation must have an explicit rounding policy.

Recommended default for a single obligation:

> Round to nearest cent using deterministic half-up rules.

However, pool splits should use:

1. Calculate exact fractional shares.
2. Allocate base whole cents.
3. Distribute leftover cents using deterministic ordering.

The final Engineering implementation must define and test one consistent method.

No calculation may rely on JavaScript floating-point dollars.

---

# 16. Top-Priority Allocation

Users may choose one to three top-priority buckets.

The Rule Engine supplies either:

* Sequential strategy
* Percentage-split strategy

---

# 17. Sequential Top-Priority Strategy

Default behavior:

1. Evaluate Priority 1’s current funding requirement.
2. Allocate as much as needed or available.
3. If fully funded, continue to Priority 2.
4. Continue until priorities are evaluated or money is exhausted.

Example:

```text
Available: $600

Priority 1 — Tithing requirement: $200
Priority 2 — Insurance requirement: $300
Priority 3 — Emergency Fund requirement: $500
```

Result:

```text
Tithing: $200 — fully funded
Insurance: $300 — fully funded
Emergency Fund: $100 — partially funded
Remaining: $0
Emergency Fund unmet: $400
```

The engine must not skip Priority 1 to provide money to Priority 3 unless the resolved strategy explicitly permits that behavior.

---

# 18. Percentage-Split Top-Priority Strategy

When the user chooses percentages:

```text
Available priority pool: $600

Emergency Fund: 60%
Roth IRA: 40%
```

Result:

```text
Emergency Fund: $360
Roth IRA: $240
```

Bucket caps and requirements still apply.

If a percentage destination cannot accept its full share because it reaches a cap or target, the rule set must specify what happens to the excess.

Recommended default:

1. Allocate up to destination capacity.
2. Return excess to the active priority pool.
3. Redistribute among remaining eligible destinations using their relative percentages.
4. Repeat until:

   * Pool is exhausted, or
   * No eligible destination can accept more.

The algorithm must terminate.

---

# 19. Allocation Capacity

Every bucket rule should produce an allocation capacity.

Examples:

## Percentage Obligation

Capacity equals the calculated obligation amount minus amount already satisfied for the event or period.

## Fixed Monthly

Capacity equals the remaining monthly requirement.

## Recurring Bill

Capacity equals remaining amount needed before due date or configured cycle target.

## Goal

Capacity equals remaining amount to target when automatic allocation pauses at target.

## Minimum Plus Unlimited Extra

Required-stage capacity equals remaining monthly minimum.

Leftover-stage capacity may be unlimited.

## Unlimited

Capacity is unlimited, subject to remaining pool and any external contribution limit supplied by rules.

The Allocation Engine must not allocate above a finite capacity unless the resolved rule explicitly allows excess.

---

# 20. Funding Requirement Result

For each required destination, the engine should calculate:

```typescript
interface FundingRequirement {
  readonly bucketId: string;
  readonly requestedAmount: Money | "UNLIMITED";
  readonly maximumAcceptableAmount: Money | "UNLIMITED";
  readonly alreadySatisfiedAmount: Money;
  readonly remainingRequiredAmount: Money;
}
```

The exact structure may differ, but required, capacity, and actual allocation must not be conflated.

---

# 21. Monthly Funding Rules

For fixed monthly requirements:

```text
Monthly target: $500
Already allocated this month: $350
Remaining requirement: $150
```

The Allocation Engine may allocate up to $150 during the required-funding stage.

If the bucket also permits unlimited extra contributions, it may receive more later through the leftover policy.

The engine must not count the same contribution toward the monthly minimum twice.

---

# 22. Recurring Bill Funding

A recurring bill may have:

* Total cycle target
* Due date
* Current reserved amount
* Remaining requirement
* Recommended per-paycheck amount
* Priority

The Goal Engine or supporting bill calculation should supply the current requirement.

The Allocation Engine funds the requirement according to priority and rule order.

If insufficient money exists, the engine reports:

* Amount funded
* Amount still needed
* Due date context if supplied
* Shortfall warning

---

# 23. Goal Funding

A goal bucket may receive automatic allocations only when:

* It is Active, or otherwise marked eligible
* Automatic allocation is allowed
* It has remaining capacity
* Its rule is active
* It is not archived

A Funded goal that pauses automatic contributions must be skipped.

Example explanation:

```text
MacBook received $0 because its $3,000 target is fully funded and automatic contributions are paused.
```

Manual event overrides may allocate beyond target only when the goal allows manual excess.

---

# 24. Funded Goal Behavior

Default:

* Automatic allocation stops at target.
* Goal remains active and visible.
* Funds remain reserved.
* Manual addition is allowed where configured.
* Target may be increased.

The Allocation Engine uses goal state supplied by the Goal Engine.

It must not change the goal to Completed.

---

# 25. Continuous and Unlimited Buckets

Examples:

* Brokerage
* Long-term investing
* Continuous giving
* General savings

These may receive:

* Required minimum funding
* Priority funding
* Leftover funding
* Manual event override funding

An unlimited bucket still cannot receive more than the remaining pool.

---

# 26. Debt Funding

V1 debt allocation may support:

* Minimum required payment
* Additional payment eligibility
* Priority
* Due date
* Remaining debt balance

Required allocation must not exceed the current debt balance unless an explicit overpayment policy exists.

Extra debt payments may be allocated during leftover stages if enabled.

The Allocation Engine does not calculate interest accrual unless supplied by a future debt module.

---

# 27. Lower-Priority Allocation

After higher-priority and required funding stages, the engine may allocate a defined pool among lower-priority buckets.

Default for everyday spending:

> Split evenly among eligible categories.

Example:

```text
Remaining spending pool: $300

Groceries
Gas
Restaurants
```

Result:

```text
Groceries: $100
Gas: $100
Restaurants: $100
```

---

# 28. Even-Split Algorithm

For `N` eligible destinations:

1. Divide total cents by `N`.
2. Give each destination the base integer amount.
3. Determine leftover cents.
4. Distribute extra cents by stable destination order.

Example:

```text
$100.00 across 3 buckets

Base: 3,333 cents each
Remainder: 1 cent
```

Result:

```text
First stable bucket: $33.34
Second: $33.33
Third: $33.33
```

Stable order must be explicit.

---

# 29. Percentage-Split Algorithm

For a percentage pool:

1. Confirm percentages total exactly 10,000 basis points.
2. Calculate each exact proportional numerator.
3. Assign base whole cents.
4. Track fractional remainders.
5. Calculate undistributed cents.
6. Distribute remaining cents deterministically.

Recommended remainder order:

1. Largest fractional remainder
2. Higher financial priority
3. Lower stable order number
4. Stable bucket ID

This method is similar to the largest remainder method.

The chosen method must be documented in code and tests.

---

# 30. Fixed Allocation Rules

When several fixed amounts compete for insufficient money, their ordering must come from the resolved rule set.

Example:

```text
Available: $250

Insurance required: $200
Phone required: $100
```

If Insurance precedes Phone:

```text
Insurance: $200
Phone: $50
Phone unmet: $50
```

The engine must not reduce both proportionally unless the strategy explicitly says to do so.

---

# 31. Leftover Allocation Policy

After required and ordinary allocation stages, the engine applies the resolved leftover policy.

Supported V1 policies:

* Leave unallocated
* Single destination
* Percentage split
* Highest-priority unfinished goal
* Maintain cash buffer, then redirect excess

---

# 32. Leave Unallocated

All remaining money becomes:

```text
Available to Allocate
```

No bucket receives it automatically.

The preview should explain:

```text
$427 remains available because your Leftover Allocation Policy is set to “Leave unallocated.”
```

---

# 33. Single Leftover Destination

Example:

```text
All leftover money → Brokerage
```

The engine allocates up to the destination’s capacity.

If the destination cannot accept all funds, the unresolved remainder stays unallocated unless the resolved rule provides a fallback.

---

# 34. Percentage Leftover Split

Example:

```text
70% Brokerage
30% Emergency Fund
```

If Emergency Fund reaches its target during distribution:

1. Allocate only its remaining capacity.
2. Return excess to the leftover pool.
3. Redistribute according to the policy’s defined fallback.

Recommended default:

* Redistribute among remaining eligible percentage destinations proportionally.
* If no eligible destinations remain, leave the rest unallocated.

---

# 35. Highest-Priority Unfinished Goal

The orchestrator supplies eligible unfinished goals in deterministic priority order.

The Allocation Engine:

1. Selects the first eligible goal.
2. Allocates up to its remaining target.
3. Continues to the next eligible goal if money remains.
4. Stops when the pool is empty or all eligible goals are funded.

The Allocation Engine must not decide whether a goal is unfinished without supplied state.

---

# 36. Maintain Buffer Then Redirect

Example:

```text
Maintain $1,000 available cash.
Redirect excess to Brokerage.
```

Required inputs:

* Current applicable available cash
* Buffer target
* Remaining allocation pool
* Destination capacity

Example:

```text
Current applicable cash: $800
Incoming leftover: $500
Required to reach buffer: $200
Excess after buffer: $300
```

Result:

```text
Remain unallocated for cash buffer: $200
Brokerage: $300
```

The exact account or cash concept used must be defined by the orchestration context.

The Allocation Engine does not query accounts.

---

# 37. Event-Level Overrides

During preview, a user may create one-time changes.

Examples:

* Add $100 to Car Repair
* Reduce Brokerage by $200
* Skip Vacation this paycheck
* Redirect all leftover funds to MacBook once

Overrides must be:

* Explicit
* Validated
* Applied deterministically
* Included in explanation output
* Stored with confirmed snapshot
* Nonpersistent unless separately saved as a permanent rule

---

# 38. Override Types

Potential V1 override types:

```typescript
type AllocationOverride =
  | {
      readonly type: "ADD_FIXED_ALLOCATION";
      readonly bucketId: string;
      readonly amount: Money;
    }
  | {
      readonly type: "SKIP_BUCKET";
      readonly bucketId: string;
    }
  | {
      readonly type: "REDUCE_ALLOCATION";
      readonly bucketId: string;
      readonly amount: Money;
    }
  | {
      readonly type: "REPLACE_LEFTOVER_POLICY";
      readonly policy: ResolvedLeftoverPolicy;
    };
```

The final list should remain small in V1.

---

# 39. Override Validation

Overrides must not:

* Allocate more than available income.
* Reference archived or deleted buckets.
* Violate system invariants.
* Create circular allocation behavior.
* Produce negative allocation lines.
* Alter historical rules.
* Persist as permanent rules automatically.

If an override conflicts with a required obligation, the preview should display a warning or reject it depending on product policy.

---

# 40. Insufficient Income

When available income cannot fund all requirements:

* Do not fail the entire calculation.
* Fund according to the resolved strategy.
* Record partial allocations.
* Record unmet amounts.
* Produce shortfall information.
* Preserve exact arithmetic.
* Provide data for the Funding Advisor.

Example:

```text
Income available after tithing: $1,800
Remaining required plan: $2,100
Shortfall: $300
```

---

# 41. Shortfall Result

Conceptual structure:

```typescript
interface AllocationShortfall {
  readonly totalUnmetRequiredAmount: Money;
  readonly items: readonly AllocationShortfallItem[];
}

interface AllocationShortfallItem {
  readonly bucketId: string;
  readonly requestedAmount: Money;
  readonly allocatedAmount: Money;
  readonly unmetAmount: Money;
  readonly priorityRank?: number;
  readonly dueDate?: FinancialDate;
  readonly reasonCode: string;
}
```

This output feeds the Funding Advisor.

---

# 42. Funding Advisor Boundary

The Allocation Engine reports factual shortfall data.

It may also generate mathematically valid alternative allocations if explicitly part of its interface.

The Coaching Engine or a dedicated Funding Advisor service presents user-friendly recommendations.

The Allocation Engine must not:

* Judge priorities
* Automatically reduce required obligations
* Apply a suggested alternative without confirmation

---

# 43. Suggested Alternative Generation

For V1, the engine or supporting service may calculate a small number of deterministic alternatives.

Examples:

* Reduce one lower-priority bucket by the shortfall
* Split the reduction evenly across several lower-priority buckets
* Skip one optional allocation
* Use unallocated funds
* Redirect leftover destination funds

Alternative generation must:

* Never reduce protected obligations without explicit eligibility
* Show every changed allocation
* Preserve all invariants
* Remain hypothetical until user selection

---

# 44. Protected Requirements

Some rules may mark allocations as protected or essential.

Examples:

* Required bill
* Minimum debt payment
* User-designated protected obligation

The Allocation Engine still follows user-defined priority, but Funding Advisor alternatives should not recommend reducing protected items unless no other option exists and the UI clearly warns the user.

The Planning Score weighting is owned by the Insight Engine.

---

# 45. Available to Allocate

The engine returns remaining money not assigned to a bucket.

This may happen because:

* Leftover policy is “Leave unallocated”
* No eligible destination exists
* All finite-capacity destinations are full
* The user intentionally retained a cash buffer
* A rule was skipped
* A policy failed safely and returned funds to unallocated

Available-to-allocate must not be confused with physical checking-account cash.

It is a planning amount.

---

# 46. Allocation Preview Output

Conceptual structure:

```typescript
interface AllocationPreview {
  readonly previewId: string;
  readonly incomeEventId: string;
  readonly planVersionId: string;
  readonly calculationTimestamp: string;

  readonly totalInput: Money;
  readonly totalAllocated: Money;
  readonly totalUnallocated: Money;

  readonly lines: readonly AllocationLine[];
  readonly skippedItems: readonly SkippedAllocationItem[];
  readonly shortfall?: AllocationShortfall;

  readonly warnings: readonly DomainWarning[];
  readonly explanations: readonly Explanation[];

  readonly invariants: AllocationInvariantReport;
}
```

The preview should be immutable.

---

# 47. Allocation Invariant Report

Every calculation should internally verify:

```typescript
interface AllocationInvariantReport {
  readonly inputEqualsAllocatedPlusUnallocated: boolean;
  readonly noNegativeAllocationLines: boolean;
  readonly noDuplicateAllocationLineEffects: boolean;
  readonly allDestinationsValid: boolean;
  readonly finiteCapacitiesRespected: boolean;
  readonly percentagePoolsBalanced: boolean;
}
```

A preview may not be presented as valid if a core invariant fails.

Invariant failure should produce a typed system error.

---

# 48. Duplicate Destination Handling

A bucket may appear in multiple stages.

Example:

* Roth IRA receives monthly minimum during required funding.
* Roth IRA also receives leftover money.

The engine may either:

* Produce multiple allocation lines with different reasons, or
* Aggregate them into one display line while preserving component explanations.

Recommended domain representation:

> Preserve separate calculation components, then provide an aggregated display summary.

This ensures traceability.

---

# 49. Allocation Component

Conceptually:

```typescript
interface AllocationComponent {
  readonly bucketId: string;
  readonly amount: Money;
  readonly stage: AllocationStage;
  readonly ruleVersionIds: readonly string[];
  readonly explanationCodes: readonly string[];
}
```

The final allocation line may aggregate components by destination.

The user should be able to see:

```text
Brokerage received $420:

$200 — monthly investment minimum
$220 — leftover allocation policy
```

---

# 50. Skipped Allocations

The engine must explain eligible-looking items that received no money.

Reasons may include:

* No remaining income
* Bucket already funded
* Automatic allocation paused
* Bucket archived
* Monthly requirement already met
* Destination reached cap
* Income source excludes bucket
* Event override skipped bucket
* Rule inactive on evaluation date
* Lower precedence rule replaced
* Invalid destination prevented activation before calculation

Skipped items should use stable reason codes.

---

# 51. Explainability Contract

Every Allocation Preview must explain:

## 51.1 Input

* Income amount
* Income source
* Evaluation date
* Plan version
* Event overrides

## 51.2 Allocation Sequence

* Which stage ran
* Which rule applied
* Which destination was evaluated
* Requested amount
* Actual amount
* Remaining pool afterward

## 51.3 Partial Funding

* Why the item was only partially funded
* Amount still needed
* Which higher-priority allocations consumed available money

## 51.4 Leftover Treatment

* Amount remaining before the policy
* Policy applied
* Destinations selected
* Final unallocated amount

## 51.5 Example

```text
Your $2,000 paycheck was allocated as follows:

$200 to Tithing because your global rule assigns 10% of eligible net income.

$300 to Car Insurance because it is Priority #1 and still required $300 this cycle.

$250 to Roth IRA because its monthly minimum had $250 remaining.

$625 each to Groceries and Gas because the remaining $1,250 spending pool was split evenly.

$0 remained unallocated.
```

---

# 52. Explanation Data Requirements

Explanations should include stable structured facts such as:

```typescript
interface AllocationExplanationFact {
  readonly code: string;
  readonly bucketId?: string;
  readonly stage: AllocationStage;
  readonly amount?: Money;
  readonly requestedAmount?: Money;
  readonly unmetAmount?: Money;
  readonly ruleVersionIds: readonly string[];
  readonly relatedBucketIds?: readonly string[];
}
```

The presentation layer may convert these facts into natural-language text.

The same explanation facts should be reusable by:

* Dashboard
* Allocation Preview
* Coaching Engine
* Decision Simulator
* Historical detail pages

---

# 53. Historical Recalculation

If a historical paycheck is corrected and the user selects “Correct and recalculate”:

* Use the original Plan Snapshot.
* Use the corrected income amount.
* Recalculate using the original historical rules.
* Produce a new correction result.
* Preserve the old result in audit history.
* Do not use current rules.

The mode must be explicit:

```text
HISTORICAL_RECALCULATION
```

---

# 54. Decision Simulator Mode

Simulation uses:

* Temporary financial state
* Temporary rule overrides
* Temporary income changes
* Production Allocation Engine

The simulator must not use a separate allocation implementation.

Simulation preview output should include before-and-after comparison data but remain structurally compatible with a normal preview.

---

# 55. Simulation Safety

The Allocation Engine in simulation mode:

* Must not persist.
* Must not mutate real entities.
* Must not create confirmed IDs that imply persistence.
* Must clearly mark results hypothetical.
* Must use the same invariants and validation as normal mode.

Applying a scenario is a separate orchestration command.

---

# 56. Plan Snapshot Integration

A confirmed allocation must reference the Plan Snapshot containing:

* Resolved rule set
* Applicable bucket rules
* Goal funding constraints
* Event overrides
* Allocation stage configuration
* Rounding policy
* Evaluation date
* Source rule versions

The Allocation Engine may produce data necessary to finalize the snapshot.

The orchestrator owns snapshot persistence.

---

# 57. Confirmation Workflow

Conceptual application flow:

1. Load income draft.
2. Load current domain state.
3. Resolve rules.
4. Run Allocation Engine.
5. Present preview.
6. User optionally modifies event overrides.
7. Recalculate preview.
8. User confirms.
9. Revalidate that source state has not materially changed.
10. Atomically persist confirmed records.
11. Emit domain events.
12. Refresh read models.

---

# 58. Stale Preview Detection

A preview may become stale if:

* Rule version changes
* Bucket balance changes
* Goal becomes funded
* Another allocation posts
* Income draft changes
* Planning period changes

Before confirmation, the orchestrator must verify preview input versions.

If stale:

* Do not post the old preview.
* Recalculate.
* Show the user what changed.

The Allocation Engine should support input fingerprints or version identifiers.

---

# 59. Concurrency

V1 is single-user and local-first, but multiple browser tabs may exist.

The application must avoid confirming two allocations against the same stale state.

Possible safeguards:

* Database transaction version check
* Optimistic concurrency token
* Last-modified version
* Allocation state fingerprint

Exact persistence design belongs in the Database specification.

---

# 60. Idempotency

Confirming the same preview twice must not create duplicate allocations.

The orchestration layer should use an idempotency key or confirmed preview identifier.

The Allocation Engine should return a stable logical preview reference where appropriate, but persistence-level idempotency belongs to the application layer.

---

# 61. Validation Errors

Examples:

* Negative income
* Unsafe monetary integer
* Missing resolved rules
* Missing destination bucket
* Invalid bucket capacity
* Duplicate top-priority rank
* Invalid percentage pool
* Inactive required destination
* Unsupported leftover policy
* Missing goal state
* Invalid override
* Invalid evaluation mode
* Mismatched currency
* Nonterminating redistribution

The engine must return typed errors.

---

# 62. Warnings

Warnings may include:

* Some priorities receive no funding
* A recurring bill remains underfunded
* A goal is only partially funded
* All leftover destinations are full
* A manual override reduces a protected requirement
* A large amount remains unallocated
* A configured bucket is skipped because it is funded
* Lower priorities receive zero
* Cash buffer cannot be reached
* Percentage strategy produces very small allocations

Warnings do not necessarily block preview.

---

# 63. Error Categories

Suggested errors:

```text
AllocationInputError
AllocationInvariantError
MissingBucketStateError
InvalidCapacityError
InvalidPercentagePoolError
UnsupportedAllocationStrategyError
NonTerminatingAllocationError
InvalidOverrideError
CurrencyMismatchError
HistoricalSnapshotError
```

Each error should include:

* Stable code
* User-safe summary
* Affected entity IDs
* Technical context
* Suggested correction where possible

---

# 64. Security Considerations

The Allocation Engine must:

* Reject malformed imported allocation data.
* Reject unsafe integer values.
* Reject unknown allocation strategy variants.
* Avoid executing user-provided expressions.
* Avoid arbitrary formula scripting in V1.
* Avoid leaking financial amounts to external telemetry.
* Treat backup-restored rules as untrusted until validated.
* Prevent prototype-pollution-style payloads through schema validation.

---

# 65. Performance Requirements

For normal personal plans:

* Allocation Preview should calculate in substantially under 100 milliseconds.
* Hundreds of buckets should not cause noticeable delay.
* The algorithm must terminate even with capped redistribution.
* Expensive explanation formatting should not duplicate financial calculations.
* Simulation may run several allocation scenarios quickly.

Correctness remains more important than micro-optimization.

---

# 66. Algorithm Termination

Redistribution algorithms must prove termination.

Every loop must reduce at least one of:

* Remaining money
* Number of eligible destinations
* Remaining capacity of a finite destination

If neither changes during an iteration, stop and return remaining money as unallocated with a warning.

A hard iteration safety limit may exist as a defensive measure, but correct algorithms should not rely on it.

---

# 67. Pure Function Design

The core engine should preferably expose a pure function:

```typescript
function calculateAllocation(
  context: AllocationContext
): Result<AllocationPreview, AllocationError>;
```

It must not:

* Read the clock
* Generate random behavior
* Query storage
* Mutate input objects
* Produce side effects
* Depend on React

ID creation for preview components may be deterministic or supplied by the application layer.

---

# 68. Stable Ordering

Every list influencing allocation must have explicit stable order.

Examples:

* Top priorities by rank
* Same-rank items by secondary order
* Percentage remainder distribution
* Eligible leftover destinations
* Equal fractional remainder tie-breakers

Never depend on:

* Object property order
* IndexedDB retrieval order
* Display name alphabetical order unless explicitly selected
* Current UI sorting

---

# 69. Data Model — Conceptual

## Allocation

* id
* incomeEventId
* planSnapshotId
* status
* totalInputCents
* totalAllocatedCents
* totalUnallocatedCents
* evaluationDate
* confirmedAt
* correctionOfAllocationId
* schemaVersion

## AllocationComponent

* id
* allocationId
* destinationBucketId
* stage
* amountCents
* requestedAmountCents
* unmetAmountCents
* ruleVersionIds
* explanationCodes
* stableOrder

## AllocationAuditEntry

* id
* allocationId
* action
* timestamp
* source
* priorAllocationId
* note

Exact persistence schema belongs in the Database specification.

---

# 70. Example 1 — Basic Paycheck

## Input

```text
Net paycheck: $2,000
Tithing: 10%
Insurance remaining requirement: $300
Roth IRA monthly requirement: $250
Groceries and Gas receive equal remaining spending pool
Leftover policy: Leave unallocated
```

## Calculation

```text
Initial pool: $2,000

Tithing: $200
Remaining: $1,800

Insurance: $300
Remaining: $1,500

Roth IRA: $250
Remaining: $1,250

Groceries: $625
Gas: $625
Remaining: $0
```

## Output

```text
Total allocated: $2,000
Total unallocated: $0
Invariant satisfied: Yes
```

---

# 71. Example 2 — Insufficient Paycheck

## Input

```text
Net paycheck: $1,000
Tithing: 10%
Priority 1 Insurance: $500 needed
Priority 2 Emergency Fund: $400 needed
Priority 3 Roth IRA: $300 needed
Strategy: Sequential
```

## Calculation

```text
Tithing: $100
Remaining: $900

Insurance: $500
Remaining: $400

Emergency Fund: $400
Remaining: $0

Roth IRA: $0
Unmet Roth IRA: $300
```

## Result

```text
Shortfall: $300
Roth IRA receives no funding because all available income was used by higher-ranked priorities.
```

---

# 72. Example 3 — Percentage Priorities with Capacity

## Input

```text
Priority pool: $1,000

Emergency Fund: 60%
Remaining capacity: $300

Roth IRA: 40%
Unlimited extra allowed
```

## Initial Shares

```text
Emergency Fund: $600
Roth IRA: $400
```

## Capacity Adjustment

```text
Emergency Fund accepts: $300
Excess returned: $300
```

## Redistribution

Only Roth IRA remains eligible.

```text
Roth IRA receives: $700 total
```

## Final

```text
Emergency Fund: $300
Roth IRA: $700
```

---

# 73. Example 4 — Funded Goal Skipped

## Input

```text
Leftover amount: $500

Policy:
50% MacBook
50% Brokerage

MacBook status: Funded
Automatic allocation: Paused
Brokerage: Unlimited
```

## Result

Recommended redistribution behavior:

```text
MacBook: $0
Brokerage: $500
```

## Explanation

```text
MacBook was skipped because it is fully funded and automatic contributions are paused.

Its unused share was redistributed to the remaining eligible leftover destination.
```

---

# 74. Example 5 — Cash Buffer

## Input

```text
Leftover: $600
Current applicable unallocated cash: $750
Buffer target: $1,000
Destination after buffer: Brokerage
```

## Result

```text
Retain unallocated: $250
Brokerage: $350
```

---

# 75. Example 6 — Event Override

## Permanent Plan

```text
Leftover → Brokerage
```

## One-Time Override

```text
For this paycheck:
Send $300 to Car Repair before leftover policy.
```

## Result

The engine allocates $300 to Car Repair during the event-override stage.

Remaining leftover follows the permanent Brokerage policy.

The override is stored in the confirmed Plan Snapshot but does not alter future paychecks.

---

# 76. Unit Tests

Required unit-test categories:

## Global Obligations

* 10% calculation
* Zero eligible income
* Rate of 0%
* Rate of 100%
* Rounding at half-cent boundaries
* Destination capacity lower than obligation

## Sequential Priorities

* Full funding
* Partial funding
* No money after Priority 1
* Three priorities
* Funded goal skipped

## Percentage Priorities

* Exact division
* Remainder cents
* Capacity redistribution
* Multiple capped destinations
* No eligible destinations

## Fixed Monthly

* Nothing funded yet
* Partially funded month
* Requirement already met
* Extra allowed later

## Leftover Policies

* Leave unallocated
* Single destination
* Percentage split
* Highest-priority goal
* Cash buffer
* All destinations unavailable

## Overrides

* Add fixed amount
* Skip bucket
* Replace leftover policy
* Invalid archived bucket

---

# 77. Invariant Tests

Every allocation test suite must verify:

```text
Input = Allocated + Unallocated
```

Additional invariants:

* No allocation line is negative.
* No finite capacity is exceeded.
* Total components equal aggregate destination totals.
* Percentage pools do not allocate more than their pool.
* Same cent is not allocated twice.
* Skipped buckets receive no automatic amount.
* Archived buckets receive no allocations.
* Automatic allocations do not exceed goal target unless allowed.
* Simulation does not mutate source input.
* Historical recalculation uses supplied snapshot rules.

---

# 78. Property-Based Tests

Generate broad input ranges and verify:

* Allocation always terminates.
* Total output always balances.
* Permuting input repository order does not change output.
* Percentage allocations remain deterministic.
* No destination receives more than capacity.
* Increasing input money cannot reduce a protected earlier sequential allocation.
* Reducing input money cannot increase total allocation.
* If all destinations are unlimited, all non-buffer leftover money is allocated.
* If no destination is eligible, all money remains unallocated.
* Redistributed capped percentage pools preserve total money.

---

# 79. Metamorphic Tests

Useful relationships:

## Scaling

For uncapped percentage-only plans, doubling income should double every allocation exactly, subject to cent rounding.

## Priority Monotonicity

Adding more lower-priority buckets must not reduce already satisfied higher-priority sequential allocations.

## Capacity

Increasing a bucket’s capacity must not reduce its own allocation when all other inputs remain equal.

## Rule Stability

Changing a display name must not change allocation results.

## Order Stability

Shuffling unordered input collections must not change results.

---

# 80. Integration Tests

Test the Allocation Engine with:

* Rule Engine resolved output
* Goal Engine state
* Orchestration preview flow
* Plan Snapshot creation
* Persistence confirmation
* Historical correction
* Decision Simulator
* Funding Advisor input
* Dashboard summary query

---

# 81. End-to-End Tests

At minimum:

## Core Question 1

A user enters a paycheck and sees exactly where every cent should go.

## Shortfall

A paycheck cannot fully fund the plan, and the user sees underfunded items.

## Preview Safety

Changing and canceling a preview leaves confirmed balances unchanged.

## Confirmation

Confirming posts allocations exactly once.

## Historical Rules

A prior allocation still shows the original rule explanation after rules change.

## Simulation

A simulated paycheck change uses the same engine but does not alter real data.

---

# 82. Regression Tests

Every financial allocation bug must receive a permanent regression test.

Examples:

* Lost penny in three-way split
* Double allocation to a bucket
* Funded goal still receiving automatic funds
* Leftover redistribution loop
* Stale preview posted
* Historical correction using current rules
* Credit-card reserve accidentally treated as paycheck allocation

---

# 83. Acceptance Criteria

The Allocation Engine is complete for V1 when:

1. It accepts explicit context and resolved rules.
2. It calculates allocations using exact monetary arithmetic.
3. Global percentage obligations work.
4. Sequential top priorities work.
5. Percentage-split top priorities work.
6. Capacity and target limits are respected.
7. Monthly minimum rules work.
8. Recurring bill requirements can be funded.
9. Active goals can be funded to target.
10. Funded goals pause automatic allocation.
11. Lower-priority even splits work.
12. Custom percentage pools work.
13. All V1 leftover policies work.
14. Cash-buffer behavior works.
15. Partial funding and shortfalls are reported.
16. Event-level overrides work without mutating permanent rules.
17. Simulation mode uses the same calculation logic.
18. Historical recalculation uses original Plan Snapshots.
19. Every preview includes explanations.
20. Every preview includes an invariant report.
21. The engine always terminates.
22. Repository order cannot change results.
23. The engine performs no persistence or UI work.
24. All unit, integration, property, and regression tests pass.
25. Total input always equals total allocated plus total unallocated.

---

# 84. Definition of Done

The Allocation Engine is not done merely because it can divide a paycheck.

It is done when:

* Every cent is accounted for.
* Every allocation has a reason.
* Every shortfall is visible.
* Every percentage split is deterministic.
* Every bucket capacity is respected.
* Every funded goal is handled correctly.
* Every override is explicit.
* Every preview is safe.
* Every historical calculation remains reproducible.
* Every simulation reuses production logic.
* Every invariant is tested.
* No UI or secondary feature performs independent allocation math.

---

# 85. Future Extensions

Potential future capabilities include:

* Payroll deposit detection
* Automatic approval by income source
* Annual contribution limits
* Employer matching
* Debt avalanche allocation
* Debt snowball allocation
* Tax withholding planning
* Multi-currency allocation
* Shared household allocations
* Conditional rules
* Dynamic behavior suggestions
* AI-proposed allocation policies
* Physical bank transfers
* Institution execution
* Calendar-aware funding
* Probabilistic income planning

These must not be partially implemented in V1.

---

# 86. Claude Implementation Guardrails

When Claude implements the Allocation Engine, it must:

1. Read PFOS-00, PFOS-01, PFOS-02, PFOS-ENG-00, and PFOS-ENG-01 first.
2. Implement only Allocation Engine domain logic and tests unless instructed otherwise.
3. Consume resolved rules rather than resolving precedence itself.
4. Use exact Money and BasisPoints primitives.
5. Avoid React and IndexedDB.
6. Use pure functions where practical.
7. Keep input immutable.
8. Use explicit stable ordering.
9. Test every rounding path.
10. Test every financial invariant.
11. Test capacity redistribution.
12. Test partial funding.
13. Test funded-goal exclusion.
14. Test simulation immutability.
15. Test historical Plan Snapshot use.
16. Never weaken rules to simplify the algorithm.
17. Never use floating-point dollars.
18. Never silently leave an unexplained remainder.
19. Report specification ambiguity before choosing a major behavior.
20. Provide a completion report with files changed, tests, assumptions, limitations, and next steps.

---

# 87. Recommended Claude Task for Allocation Engine

After the repository foundation and Rule Engine are complete, use a task similar to:

> Read the PFOS Product Constitution, Product Vision PRD, Decision Log, Core Architecture, Rule Engine Specification, and Allocation Engine Specification.
>
> Implement only the Allocation Engine domain model, pure calculation functions, structured explanations, typed errors, and tests.
>
> Do not implement React UI, IndexedDB, repositories, Goal Engine lifecycle logic, Transaction Engine, Coaching UI, or Dashboard.
>
> Consume a supplied `ResolvedRuleSet` and supplied bucket/goal state. Do not reimplement rule precedence.
>
> Use exact integer-cent monetary arithmetic and basis points. Verify `input = allocated + unallocated` for every successful result.
>
> Before coding, summarize the interfaces you intend to create and identify any specification conflicts. After implementation, report files changed, tests added, test results, assumptions, and remaining limitations.

---

# 88. Final Allocation Engine Statement

The Allocation Engine is the mathematical heart of PFOS.

It must turn income and a resolved financial plan into one trustworthy answer:

> **This is where every cent should go, this is what could not be funded, and this is why.**
