# Personal Financial Operating System

## Rule Engine Specification

**Document ID:** PFOS-ENG-01
**Status:** Draft for Review
**Target Release:** Version 1 Beta
**Primary Consumers:** Allocation Engine, Goal Engine, Decision Simulator, Coaching Engine, central orchestration layer
**Related Documents:**

* PFOS-00 Product Constitution
* PFOS-01 Product Vision & Version 1 PRD
* PFOS-02 Product Decision Log

---

# 1. Purpose

The Rule Engine is the authoritative owner of financial planning rules in PFOS.

Its purpose is to determine which rules apply to a financial event, resolve conflicts between rules, and return a deterministic rule set that other engines can execute.

The Rule Engine does not allocate money itself.

It answers questions such as:

* Which global rules apply to this paycheck?
* Is this income eligible for tithing?
* Does this income source override the default allocation policy?
* Which buckets are top priorities?
* Should priorities be funded sequentially or proportionally?
* What rollover rule applies to a bucket?
* What should happen to leftover money?
* Which rule version was active at the time of an historical allocation?
* What should the Allocation Engine do when multiple rules compete?

The Rule Engine must be deterministic, explainable, versioned, and independent of the user interface and storage implementation.

---

# 2. Core Principle

The Rule Engine follows:

> **One rule decision, one authoritative owner, one resolved answer.**

No other engine or UI component may independently determine rule precedence.

The Allocation Engine consumes resolved rules.

The Goal Engine consumes goal-related rule settings.

The Decision Simulator consumes the same resolved rules against temporary scenario state.

The Coaching Engine explains the Rule Engine’s output but does not recreate its logic.

---

# 3. Responsibilities

The Rule Engine is responsible for:

1. Storing and interpreting rule definitions.
2. Resolving rule inheritance.
3. Resolving rule precedence.
4. Determining rule applicability.
5. Validating rule configurations.
6. Producing immutable resolved rule sets.
7. Producing explanations for why rules were selected.
8. Supporting prospective rule changes.
9. Supporting Plan Snapshots.
10. Supporting simulation without modifying real rules.
11. Detecting invalid or contradictory rule combinations.
12. Returning structured warnings when a rule set is valid but potentially problematic.

---

# 4. Non-Responsibilities

The Rule Engine must not:

* Calculate final allocation amounts.
* Update bucket balances.
* Post transactions.
* Calculate net worth.
* Calculate the Planning Score.
* Calculate Goal Confidence Scores.
* Modify historical allocations.
* Import CSV data.
* Read directly from IndexedDB.
* Render UI components.
* Automatically change rules based on user behavior.
* Use AI or machine learning in V1.
* Move physical money.
* Decide whether a financial goal is morally or objectively correct.
* Override explicit user choices merely because another choice appears financially preferable.

---

# 5. Rule Categories

V1 supports the following rule categories.

## 5.1 Global Income Rules

Rules that apply across eligible income sources.

Examples:

* Tithing percentage
* Eligible income definition
* Default allocation strategy
* Default top-priority behavior
* Default lower-priority behavior
* Default leftover allocation policy
* Default rollover policy

---

## 5.2 Income-Source Rules

Rules attached to a specific income source.

Examples:

* Use the global plan
* Apply a custom allocation policy
* Direct bonus income to investments
* Exclude a reimbursement from tithing
* Use a custom leftover destination
* Use a different set of eligible buckets

Income-source rules inherit global rules unless explicitly overridden.

---

## 5.3 Bucket Rules

Rules attached to an individual bucket.

Examples:

* Percentage target
* Fixed monthly amount
* Monthly minimum
* Goal target
* Due date
* Recurrence
* Rollover policy
* Maximum balance
* Continue beyond target
* Pause when funded
* Priority rank
* Custom allocation percentage
* Eligibility for leftover funds

---

## 5.4 Group Rules

Rules attached to bucket groups.

In V1, groups are primarily organizational.

A group rule may provide default settings inherited by child buckets, but groups do not receive allocations directly.

Examples:

* Default rollover policy for all child buckets
* Default reporting classification
* Default visibility
* Default lower-priority allocation treatment

Bucket-level settings override group defaults.

---

## 5.5 Allocation Strategy Rules

Rules defining how money is distributed.

Examples:

* Sequential ranking
* Custom percentages
* Even split
* Fixed amount
* Percentage of income
* Monthly minimum
* Goal-until-target
* Unlimited destination
* Leftover destination
* Maintain cash buffer before redirecting funds

---

## 5.6 Rollover Rules

Rules defining what happens to a bucket balance across planning periods.

Supported V1 policies:

* Carry all
* Reset to zero
* Carry up to a cap
* Redirect excess to another bucket
* Redirect excess to leftover policy

“Ask every month” is deferred unless later included as a simple non-notification workflow.

---

## 5.7 Goal Lifecycle Rules

Rules controlling goal behavior.

Examples:

* Stop automatic allocation at target
* Allow manual contributions beyond target
* Automatically begin the next recurring cycle
* Prompt to confirm next recurring target
* Resume funding only after user confirmation when a funded goal falls below target

---

## 5.8 Leftover Allocation Rules

Rules applied after required allocation stages are complete.

Examples:

* 100% to one bucket
* Percentage split among several buckets
* Highest-priority unfinished goal
* Maintain a specified cash buffer
* Leave unallocated
* Apply an income-source-specific leftover override

---

# 6. Rule Hierarchy

Rules resolve through the following hierarchy:

1. System financial invariants
2. Historical Plan Snapshot rules, when evaluating history
3. Temporary simulator overrides, when running a simulation
4. Explicit event-level override, if supported by the workflow
5. Income-source-specific rules
6. Bucket-specific rules
7. Group defaults
8. Global user rules
9. Product defaults

A lower-numbered level has higher precedence than a higher-numbered level, except where the rule type defines additive behavior.

---

# 7. System Financial Invariants

System invariants cannot be overridden by user rules.

Examples:

* Money calculations use exact monetary arithmetic.
* Allocations cannot create or destroy money.
* A bucket group cannot directly receive money.
* Historical rules cannot be silently replaced with current rules.
* A credit-card payment cannot be counted as a second expense.
* A preview cannot alter confirmed balances.
* Rules must produce deterministic outputs.
* Confirmed historical records must retain their Plan Snapshot.
* The system cannot silently move existing bucket balances because a priority changed.

If a user rule conflicts with a system invariant, validation fails.

---

# 8. Rule Precedence Model

## 8.1 Product Default

A predefined fallback used only when the user has not made a choice.

Example:

```text
defaultRolloverPolicy = CARRY_ALL
```

---

## 8.2 Global User Rule

The user’s general rule across the financial plan.

Example:

```text
globalTitheRate = 10%
```

---

## 8.3 Group Default

A bucket group may provide inherited defaults.

Example:

```text
Savings group:
defaultRolloverPolicy = CARRY_ALL
```

---

## 8.4 Bucket Rule

The bucket may override applicable global or group defaults.

Example:

```text
Vacation:
rolloverPolicy = CARRY_UP_TO_CAP
cap = $2,500
```

---

## 8.5 Income-Source Rule

An income source may override the default allocation route after applicable global rules.

Example:

```text
Bonus:
leftoverPolicy = 100% Brokerage
```

---

## 8.6 Event-Level Override

A user may make a one-time change for a specific paycheck during preview.

Example:

```text
For this paycheck only:
redirect $200 from Brokerage to Car Repair
```

This override must be stored with the resulting allocation snapshot.

It must not modify the underlying permanent rule unless the user separately selects “Save as future rule.”

---

## 8.7 Simulation Override

The Decision Simulator may temporarily override any supported planning input.

Simulation overrides:

* Exist only in scenario state.
* Have highest non-system precedence.
* Never modify real rules.
* Must be clearly labeled as hypothetical.

---

## 8.8 Historical Snapshot

When evaluating a past allocation, the Plan Snapshot is authoritative.

Current rules must not be used to reinterpret a historical allocation.

---

# 9. Rule Inheritance

Rules inherit only where inheritance is explicitly supported.

Examples:

* Income sources inherit global allocation rules.
* Buckets may inherit group rollover defaults.
* Buckets inherit product defaults when neither group nor bucket defines a rule.

Rules do not inherit merely because objects share names or categories.

Example:

A bucket named “Roth IRA” must not automatically receive a special rule unless its bucket type or explicit settings define one.

---

# 10. Additive Versus Replacing Rules

Some rules replace lower-precedence rules.

Some rules are additive.

## 10.1 Replacing Rule Example

A specific bucket rollover policy replaces the group or global rollover policy.

```text
Global: Carry all
Bucket: Reset monthly
Resolved: Reset monthly
```

---

## 10.2 Additive Rule Example

A global tithing rule may apply first, followed by an income-source-specific allocation rule.

```text
Global:
10% eligible net income to Tithing

Bonus source:
Remaining income after global rules goes 100% to Brokerage
```

The bonus override does not replace the global tithe unless the income source is explicitly excluded from eligible income.

---

# 11. Global Rule Application Order

For a normal paycheck, the Rule Engine should resolve rules in this conceptual order:

1. Validate income event.
2. Identify income source.
3. Determine eligible income amount.
4. Resolve global percentage-based obligations.
5. Resolve income-source exclusions or eligibility.
6. Resolve top-priority list.
7. Resolve top-priority funding strategy.
8. Resolve required fixed or recurring obligations.
9. Resolve goal and bucket rules.
10. Resolve lower-priority distribution.
11. Resolve everyday spending policy.
12. Resolve leftover allocation policy.
13. Resolve rollover settings where relevant.
14. Produce a resolved rule set.
15. Produce explanations and warnings.

The Allocation Engine determines actual amounts using the resolved rule set.

---

# 12. Tithing Rule Specification

## 12.1 Default

```text
Rate: 10%
Basis: Net deposited income
Scope: All eligible income
```

## 12.2 Configurable Fields

* Percentage rate
* Enabled or disabled
* Eligible income sources
* Excluded income sources
* Income basis
* Destination bucket
* Effective date
* Rounding rule

## 12.3 Supported Income Basis in V1

Required:

* Net deposited income

Future-ready but not necessarily exposed in V1:

* Gross income
* Custom eligible amount

## 12.4 Aggregation

Eligible income is conceptually aggregated for global tithing.

The implementation must prevent double counting when multiple income entries exist.

## 12.5 Exclusions

Income may be explicitly excluded.

Examples:

* Reimbursement
* Internal transfer
* Refund
* Credit-card payment
* Loan proceeds

A transfer is never income for tithing unless the user manually records it as eligible income.

## 12.6 Explanation Example

```text
Tithing rule applied:
10% of $2,000 eligible net income = $200.
Income source “UCLA Paycheck” is included in the global tithing rule.
```

---

# 13. Priority Rules

## 13.1 Top Priority Count

The user may designate between one and three top-priority buckets.

Validation should prevent:

* Zero top priorities when the plan requires them, unless allowed by onboarding.
* More than three top priorities in V1.
* Duplicate priority positions.
* Inactive or archived buckets as active priorities.

## 13.2 Default Strategy

```text
SEQUENTIAL
```

Meaning:

1. Fund Priority 1 according to its funding rule.
2. Then fund Priority 2.
3. Then Priority 3.
4. Stop when money is exhausted.

## 13.3 Optional Strategy

```text
PERCENTAGE_SPLIT
```

The user assigns percentages across top priorities.

Validation:

* Percentages must be nonnegative.
* Total must equal 100%.
* Inactive buckets cannot receive a percentage.
* Rounding leftovers follow deterministic priority order.

## 13.4 Future Strategy

Weighted priority may be considered later but is not necessary in V1 unless equivalent to percentage split.

---

# 14. Lower-Priority Rules

## 14.1 Default

Remaining money designated for lower-priority everyday categories is split evenly.

## 14.2 Optional Behavior

Users may define:

* Fixed amounts
* Percentages
* Priority ranks
* Exclusions
* Bucket-specific eligibility
* Custom leftover treatment

## 14.3 Validation

A lower-priority percentage split must total 100% within its allocation pool.

The Rule Engine must distinguish:

* Percent of total paycheck
* Percent of remaining pool

These must never be represented by the same ambiguous field.

---

# 15. Funding Rule Types

Every allocatable bucket must use one supported funding rule.

## 15.1 Percentage of Eligible Income

Fields:

* Rate
* Income basis
* Applicable income sources
* Period
* Maximum, if any

Example:

Tithing receives 10% of eligible net income.

---

## 15.2 Fixed Amount Per Paycheck

Fields:

* Amount
* Applicable income source
* Start date
* End date
* Optional maximum

---

## 15.3 Fixed Monthly Amount

Fields:

* Monthly target
* Amount funded in current month
* Remaining monthly requirement
* Whether extra contributions are allowed
* Allocation behavior after minimum is met

---

## 15.4 Recurring Bill

Fields:

* Target amount
* Due date
* Recurrence
* Current reserved balance
* Required contribution pace
* Underfunding behavior

---

## 15.5 Goal Until Target

Fields:

* Target amount
* Current balance
* Deadline
* Stop at target
* Allow manual excess
* Continue automatically beyond target, optional

Default:

Automatic allocation pauses at the target.

---

## 15.6 Monthly Minimum Plus Unlimited Extra

Fields:

* Monthly minimum
* Amount funded this month
* Extra eligibility
* Extra allocation priority
* Optional annual limit for future use

Example:

Roth IRA receives its monthly minimum, then may receive leftover money.

---

## 15.7 Unlimited

Fields:

* Minimum, optional
* Maximum: none
* Leftover eligibility
* Priority

Example:

Brokerage account.

---

## 15.8 Debt Payoff

Fields:

* Minimum payment
* Due date
* Extra payment eligibility
* Target payoff amount
* Priority
* Future payoff strategy field

V1 may support basic debt funding without implementing avalanche or snowball automation unless explicitly specified later.

---

# 16. Leftover Allocation Policy

## 16.1 Purpose

Defines what happens after required and configured allocations are satisfied.

## 16.2 Supported V1 Policy Types

* Leave unallocated
* Single destination
* Percentage split
* Highest-priority unfinished goal
* Maintain cash buffer, then redirect excess

## 16.3 Single Destination

Example:

```text
100% to Brokerage
```

## 16.4 Percentage Split

Example:

```text
70% Brokerage
30% Emergency Fund
```

Validation:

* Percentages total 100%.
* Destination buckets are active and eligible.
* Funded goals that pause allocations are skipped unless explicitly allowed.
* Any skipped destination must be explained.

## 16.5 Highest-Priority Unfinished Goal

The Goal Engine determines which goals are unfinished.

The Rule Engine defines that this selection strategy applies.

The Allocation Engine requests eligible goal status from the orchestrator or supplied domain state.

## 16.6 Cash Buffer

Example:

```text
Keep $1,000 unallocated cash.
Send any amount above $1,000 to Brokerage.
```

The exact source of “cash available” must be provided to the Rule Engine or Allocation Engine as an input.

The Rule Engine must not query account balances directly.

---

# 17. Rollover Policy

## 17.1 Default

```text
CARRY_ALL
```

## 17.2 Supported Policies

### Carry All

Preserve the full virtual balance.

### Reset

Reset the bucket’s available planning balance according to an explicit closing operation.

Resetting must not delete transaction history.

### Carry to Cap

Preserve up to a configured cap.

### Redirect Excess

Move excess above a cap to a specified destination.

### Apply Leftover Policy

Treat excess as leftover money.

## 17.3 Effective Timing

Rollover rules apply at a defined planning-period boundary.

V1 default reporting period:

```text
Calendar month
```

The rule must store its effective date and timezone assumptions, even though V1 is single-user.

---

# 18. Rule Effective Dates

Every permanent rule must have:

* Created timestamp
* Effective start date
* Optional effective end date
* Status
* Version identifier

Rule changes are prospective.

Updating a rule creates a new version rather than mutating the historical meaning of the previous version.

---

# 19. Rule Versioning

## 19.1 Immutable Historical Meaning

Once a rule has been used in a confirmed allocation, its historical version must remain reconstructable.

## 19.2 New Version

Changing a rule creates a new rule version.

Example:

```text
Tithing Rule v1:
10%, effective January 1

Tithing Rule v2:
12%, effective April 1
```

## 19.3 User Experience

Users do not need to see technical version numbers by default.

They may see:

```text
Tithing changed from 10% to 12% on April 1.
```

---

# 20. Plan Snapshot Requirements

A Plan Snapshot is an immutable record of the resolved plan used for a confirmed financial operation.

It should include or reference:

* Active global rule versions
* Income-source rule versions
* Priority configuration
* Bucket funding rules
* Leftover policy
* Rollover settings where relevant
* Income event information
* One-time event overrides
* Explanation metadata
* Snapshot creation timestamp
* Schema version

The snapshot may store normalized references plus resolved values, provided historical reconstruction remains reliable.

---

# 21. Rule Validation

The Rule Engine validates configurations before activation.

## 21.1 Hard Validation Errors

Examples:

* Percentages total more than 100% in the same pool.
* Required destination bucket does not exist.
* Destination bucket is archived.
* A group is selected as an allocation destination.
* Negative allocation percentage.
* Negative fixed contribution.
* Invalid effective date range.
* Circular leftover redirection.
* Circular excess rollover redirection.
* Duplicate top-priority ranks.
* More than three top priorities.
* Rule violates a system invariant.
* Percentage rule has no valid income basis.
* Rule references a deleted income source.
* Allocation policy cannot terminate.

A rule with a hard error cannot be activated.

## 21.2 Warnings

Examples:

* Lower priorities are unlikely to receive funding.
* Monthly fixed commitments exceed expected income.
* A goal deadline is missing.
* A recurring bill has no due date.
* Leftover funds are directed to a funded goal that pauses allocations.
* Cash buffer is greater than typical available cash.
* Multiple rules compete for the same remaining pool.
* An income source override bypasses a normal investment minimum.
* A bucket has both a cap and an unlimited-extra setting.

Warnings may allow activation but must be visible.

---

# 22. Circular Rule Detection

The Rule Engine must detect cycles.

Examples:

```text
Bucket A excess → Bucket B
Bucket B excess → Bucket A
```

Or:

```text
Leftover policy → Bucket A
Bucket A at cap → leftover policy
```

Rules that can produce a non-terminating allocation cycle are invalid.

The validation process should model destinations as a directed graph and reject cycles that cannot terminate.

---

# 23. Rule Resolution Output

The Rule Engine should return a structured object conceptually similar to:

```json
{
  "resolvedRuleSetId": "resolved-rule-set-id",
  "planVersionId": "plan-version-id",
  "effectiveAt": "2026-08-06T12:00:00-07:00",
  "globalObligations": [],
  "priorityStrategy": {},
  "topPriorities": [],
  "requiredFundingRules": [],
  "lowerPriorityRules": [],
  "everydaySpendingRules": [],
  "leftoverPolicy": {},
  "rolloverPolicies": {},
  "warnings": [],
  "explanations": []
}
```

The final TypeScript structure will be defined in the Architecture document.

---

# 24. Explainability Contract

Every resolved rule set must explain:

## 24.1 Inputs

* Financial event type
* Income source
* Event date
* Applicable global rules
* Applicable source overrides
* Applicable bucket rules
* Simulation or event-level overrides

## 24.2 Resolution

* Which rules were selected
* Which lower-precedence rules were overridden
* Which rules were additive
* Which rules were skipped
* Why they were skipped

## 24.3 Warnings

* Potential shortfalls
* Invalid references
* Unusual combinations
* Rules that may produce no allocation

## 24.4 Example

```text
The global tithing rule applied because this paycheck is eligible income.

The UCLA income source inherited the global allocation plan because no custom source allocation override exists.

The Brokerage leftover rule applied after all required priorities were resolved.

The Vacation bucket was excluded from leftover funding because it is already funded and automatic contributions are paused.
```

---

# 25. Rule Evaluation Context

The Rule Engine must receive an explicit context object.

Possible fields:

* Event type
* Event date
* Income source
* Net income
* Eligible income
* Current planning period
* Active bucket IDs
* Bucket statuses
* Goal statuses
* Current monthly funded amounts
* Existing balances needed for rule selection
* Simulation overrides
* Event-level overrides
* Historical Plan Snapshot ID, if applicable

The Rule Engine must not fetch these values directly from persistence.

---

# 26. Determinism

Given the same:

* Rule definitions
* Rule versions
* Evaluation context
* Plan Snapshot
* System defaults

the Rule Engine must return the same resolved output.

Rule resolution must not depend on:

* Object iteration order
* Database retrieval order
* Localized display names
* Random IDs
* UI state
* Current date unless the evaluation date is explicitly provided

All ordering must be explicit and stable.

---

# 27. Tie-Breaking Rules

Where multiple items have equal rank or priority, the system must use a deterministic tie-breaker.

Recommended order:

1. Explicit priority rank
2. Explicit secondary order
3. Rule creation timestamp
4. Stable unique ID

The user should normally be prevented from creating ambiguous equal top-priority ranks.

Stable IDs should be a final technical fallback, not a visible financial rule.

---

# 28. Rule Editing Behavior

When editing a permanent rule, the user may choose:

* Effective immediately for future operations
* Effective on a future date

Historical operations remain unchanged.

The system must display impacted future behavior where practical.

Example:

```text
Changing your tithing rate from 10% to 12% will affect future eligible income beginning August 15.
Existing allocations will not change.
```

---

# 29. Event-Level Overrides

During Allocation Preview, the user may make a one-time change.

Examples:

* Reduce Brokerage for this paycheck.
* Add money to Car Repair.
* Skip a lower-priority bucket once.

The override must:

* Be included in the Allocation Preview.
* Be explainable.
* Be stored with the Plan Snapshot when confirmed.
* Not alter permanent rules.
* Offer a separate action to save it as a future rule.

---

# 30. Simulation Rules

The Decision Simulator may create temporary overrides.

Examples:

* Reduce income by 20%.
* Add a new bill.
* Change a priority.
* Redirect leftover money.
* Add a one-time purchase.

Simulation rule handling must:

* Reuse normal validation.
* Clearly mark hypothetical rules.
* Avoid persistence to active rule repositories.
* Allow scenario saving separately from active rules.
* Prevent accidental activation without explicit user approval.

---

# 31. Interaction with Allocation Engine

The Allocation Engine receives a resolved rule set.

The Rule Engine tells it:

* What rules apply
* In what order they apply
* Which buckets are eligible
* Which strategy governs each pool
* Which constraints apply
* Which rules are paused or skipped

The Allocation Engine calculates:

* Dollar amounts
* Remaining money
* Underfunded amounts
* Rounding distribution
* Final allocation result

The Rule Engine must never produce final allocation dollars except where a rule itself stores a fixed monetary requirement.

---

# 32. Interaction with Goal Engine

The Rule Engine supplies goal policy configuration.

The Goal Engine supplies current goal state.

Example collaboration:

* Rule Engine: “Fund this goal until target, then pause.”
* Goal Engine: “This goal is funded.”
* Allocation Engine: “Do not allocate automatically.”

The Rule Engine must not independently determine whether the goal balance has reached its target unless goal state is passed into the evaluation context.

---

# 33. Interaction with Transaction Engine

The Rule Engine may provide:

* Categorization rule definitions
* Rollover policies
* Bucket eligibility
* Reconciliation adjustment policies

The Transaction Engine owns transaction accounting effects.

Merchant categorization rules may later be separated into a dedicated rules domain, but V1 may store them under the Rule Engine if boundaries remain clear.

---

# 34. Interaction with Insight Engine

The Insight Engine may ask which plan rules were active during a period.

The Rule Engine returns:

* Active rule versions
* Rule changes
* Resolved plan context
* Explanations

The Insight Engine must not independently interpret precedence.

---

# 35. Interaction with Coaching Engine

The Coaching Engine consumes:

* Resolved rules
* Validation warnings
* Explanations
* Skipped-rule reasons
* Conflicts
* Shortfall context from the Allocation Engine

The Coaching Engine converts structured explanations into user-friendly guidance.

It must not alter the resolved rule result.

---

# 36. Storage Requirements

The Rule Engine must use repository interfaces.

Conceptual repositories may include:

* RuleRepository
* RuleVersionRepository
* PlanSnapshotRepository
* IncomeSourceRuleRepository
* BucketRuleRepository
* GroupRuleRepository

The Rule Engine may receive already-loaded data from the orchestration layer.

It must not call IndexedDB APIs directly.

---

# 37. Security Considerations

The Rule Engine must:

* Validate all imported rule data.
* Reject malformed rule types.
* Reject unknown enum values unless migration logic handles them.
* Reject references to unauthorized or nonexistent entities.
* Avoid executing arbitrary expressions supplied in backups.
* Use predefined rule types rather than user-provided JavaScript or formula code.
* Prevent prototype-pollution-style objects from imported JSON.
* Avoid exposing sensitive financial amounts in telemetry.

V1 must not support arbitrary user scripting.

---

# 38. Performance Requirements

Rule resolution should be fast enough to feel instantaneous for normal personal plans.

Target:

* Resolve a typical paycheck rule set in substantially less than 100 milliseconds on a modern desktop.
* Handle hundreds of buckets and rules without noticeable delay.
* Avoid repeatedly resolving unchanged rules during one workflow.
* Permit memoization or caching keyed by immutable rule versions and context.
* Never cache across differing Plan Snapshots or scenario overrides incorrectly.

Correctness takes priority over optimization.

---

# 39. Error Handling

The Rule Engine should return typed errors.

Suggested categories:

* ValidationError
* MissingReferenceError
* RuleConflictError
* CircularRuleError
* UnsupportedRuleTypeError
* HistoricalSnapshotError
* InvalidOverrideError
* EffectiveDateError
* InvariantViolationError

Errors must include:

* Stable error code
* Human-readable summary
* Affected rule IDs
* Suggested corrective action where possible

The UI must not display raw stack traces.

---

# 40. Audit Requirements

Material rule changes should record:

* Rule changed
* Previous version
* New version
* Effective date
* Timestamp
* Change source
* User action or restore/import source
* Optional note
* Whether the change came from an applied simulation

Audit records are immutable except during full data deletion.

---

# 41. Data Model — Conceptual

## Rule

* id
* ownerType
* ownerId
* ruleCategory
* ruleType
* status
* effectiveFrom
* effectiveTo
* currentVersionId
* createdAt
* updatedAt

## RuleVersion

* id
* ruleId
* versionNumber
* configuration
* createdAt
* supersedesVersionId
* changeReason

## PlanSnapshot

* id
* createdAt
* eventType
* eventId
* effectiveAt
* resolvedRuleSet
* sourceRuleVersionIds
* eventOverrides
* schemaVersion

## RuleAuditEntry

* id
* ruleId
* previousVersionId
* newVersionId
* action
* timestamp
* source
* note

Exact field types belong in the Architecture and Database specifications.

---

# 42. Rule Configuration Examples

## 42.1 Tithing

```json
{
  "ruleType": "PERCENTAGE_OF_INCOME",
  "rateBasisPoints": 1000,
  "incomeBasis": "NET_DEPOSITED",
  "destinationBucketId": "tithing-bucket",
  "eligibleIncomeSourceIds": ["all"]
}
```

A rate of 1,000 basis points represents 10%.

---

## 42.2 Top Priority Sequential

```json
{
  "strategy": "SEQUENTIAL",
  "bucketIds": [
    "tithing-bucket",
    "insurance-bucket",
    "emergency-fund-bucket"
  ]
}
```

---

## 42.3 Top Priority Percentage

```json
{
  "strategy": "PERCENTAGE_SPLIT",
  "allocations": [
    {
      "bucketId": "emergency-fund-bucket",
      "basisPoints": 6000
    },
    {
      "bucketId": "roth-ira-bucket",
      "basisPoints": 4000
    }
  ]
}
```

---

## 42.4 Leftover Brokerage

```json
{
  "policyType": "SINGLE_DESTINATION",
  "destinationBucketId": "brokerage-bucket"
}
```

---

## 42.5 Cash Buffer

```json
{
  "policyType": "MAINTAIN_BUFFER_THEN_REDIRECT",
  "bufferAmountCents": 100000,
  "destinationBucketId": "brokerage-bucket"
}
```

---

## 42.6 Rollover Cap

```json
{
  "policyType": "CARRY_TO_CAP",
  "capAmountCents": 50000,
  "excessDestinationType": "LEFTOVER_POLICY"
}
```

---

# 43. Tests

## 43.1 Unit Tests

Test each rule type independently.

Examples:

* Global default resolves when no override exists.
* Bucket override replaces group default.
* Income-source override applies after global tithing.
* Historical snapshot ignores current rules.
* Simulation override takes precedence without persistence.
* Event override applies only to one event.
* Funded goal is excluded when pause-at-target applies.

---

## 43.2 Precedence Tests

Test every hierarchy level.

Example:

```text
Product default: Carry all
Global rule: Carry all
Group rule: Carry to $500
Bucket rule: Reset
Resolved result: Reset
```

---

## 43.3 Validation Tests

Include:

* Percentages totaling 99.99%
* Percentages totaling 100.01%
* Missing bucket
* Archived bucket
* Circular redirects
* Duplicate top priorities
* More than three top priorities
* Invalid date ranges
* Negative amounts
* Unknown rule type

---

## 43.4 Determinism Tests

Run the same input repeatedly and confirm deep-equal output.

Shuffle repository result ordering and confirm identical resolution.

---

## 43.5 Snapshot Tests

Confirm:

* Historical resolution uses the original snapshot.
* Current rule changes do not alter past results.
* Corrected historical paycheck can reuse the original snapshot.
* Snapshot restore reproduces the same resolved rule set.

---

## 43.6 Property-Based Tests

Useful invariants:

* Resolved percentage pools never exceed 100%.
* Rule resolution always terminates.
* No active destination is duplicated unintentionally.
* Lower-precedence replacement rules never override higher-precedence rules.
* Same inputs always produce same outputs.
* No rule graph containing an unresolved cycle passes validation.

---

## 43.7 Integration Tests

Test Rule Engine with:

* Allocation Engine
* Goal Engine statuses
* Plan Snapshot creation
* Simulation context
* Rule repository
* Backup restore

---

# 44. Acceptance Criteria

The Rule Engine is complete for V1 when:

1. Global rules can be created, validated, versioned, and resolved.
2. Income sources inherit global rules by default.
3. Income-source overrides resolve correctly.
4. Tithing applies globally to eligible net income.
5. Top priorities support sequential and percentage strategies.
6. Lower-priority default behavior can be resolved.
7. Bucket-specific rules override group and global defaults.
8. Leftover policies resolve deterministically.
9. Rollover policies resolve deterministically.
10. Goal-related policy settings are exposed to consuming engines.
11. Rule changes affect future operations only.
12. Plan Snapshots preserve historical rule meaning.
13. One-time event overrides do not mutate permanent rules.
14. Simulations can supply temporary overrides safely.
15. Invalid and circular rules are rejected.
16. Every resolved rule set includes explanations.
17. Repository ordering cannot change the result.
18. Unit, precedence, validation, snapshot, integration, and invariant tests pass.
19. The Rule Engine does not access IndexedDB directly.
20. No UI component independently implements rule precedence.

---

# 45. Definition of Done

The Rule Engine is not done merely when rule objects can be saved.

It is done when:

* Rule ownership is unambiguous.
* Precedence is deterministic.
* Inheritance is explicit.
* Invalid configurations are rejected.
* Warnings are actionable.
* Historical meaning is preserved.
* Explanations are generated from the same logic as resolution.
* Simulation uses the production resolver.
* All critical paths are tested.
* No financial calculation is duplicated outside its owning engine.
* The Allocation Engine can consume the output without guessing.

---

# 46. Future Extensions

Potential future Rule Engine capabilities include:

* User-approved AI rule suggestions
* Behavior-based recommendation proposals
* Shared household rule scopes
* Multi-currency rules
* Tax allocation rules
* Debt avalanche and snowball strategies
* Rule scheduling
* Conditional rules
* Notification rules
* Calendar-based rules
* Institution-specific rules
* Annual contribution limits
* Employer-match rules
* Rule templates marketplace
* Natural-language rule creation

These must not be partially implemented in V1.

---

# 47. Claude Implementation Guardrails

When Claude implements this specification, it must:

1. Read PFOS-00, PFOS-01, and PFOS-02 first.
2. Implement only Rule Engine domain logic unless instructed otherwise.
3. Use pure functions where practical.
4. Avoid UI work.
5. Avoid direct IndexedDB access.
6. Avoid Allocation Engine dollar calculations.
7. Define explicit types for every rule variant.
8. Use discriminated unions rather than loosely structured objects.
9. Reject unknown rule variants.
10. Add tests before integration work.
11. Never remove validation to simplify implementation.
12. Report ambiguities instead of silently inventing major behavior.
13. Keep permanent, event-level, historical, and simulation rules distinct.
14. Preserve deterministic ordering.
15. Return a task report listing implementation, tests, assumptions, and unresolved issues.

---

# 48. Final Rule Engine Statement

The Rule Engine exists to turn a collection of user preferences, defaults, exceptions, versions, and temporary overrides into one clear answer:

> **Which financial rules apply here, in what order, and why?**

It must answer that question consistently, historically, and transparently so every other PFOS engine can operate from the same financial plan.
