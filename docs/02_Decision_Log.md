# Personal Financial Operating System

## Product Decision Log

**Document ID:** PFOS-02
**Status:** Draft for Review
**Applies to:** Version 1 Beta and future planning
**Related Documents:**

* PFOS-00 Product Constitution
* PFOS-01 Product Vision & Version 1 PRD

---

# 1. Purpose

This Decision Log records major product, UX, architecture, scope, and engineering decisions made during the design of PFOS.

Each entry documents:

* The decision
* Why it was made
* Alternatives considered
* Tradeoffs
* Consequences
* Possible future reconsiderations

The goal is to prevent future developers, designers, or AI coding agents from unintentionally reversing important choices without understanding the original reasoning.

This document should be updated whenever a new decision materially affects:

* Product behavior
* Financial calculations
* Data integrity
* User experience
* Engine ownership
* Version scope
* Architecture
* Security
* Testing
* Future extensibility

---

# 2. Decision Log Conventions

Each decision contains:

**Status**

* Proposed
* Accepted
* Superseded
* Rejected
* Deferred

**Scope**

* Product
* UX
* Architecture
* Financial logic
* Security
* Data
* Testing
* Roadmap

**Future Review Trigger**

The condition under which the decision should be reconsidered.

---

# Decision 001: PFOS Is Planning-First

**Status:** Accepted
**Scope:** Product

## Decision

PFOS will primarily help users decide where money should go before it is spent.

Expense tracking remains important, but it supports the plan rather than defining the product.

## Why

Existing budgeting tools frequently focus on explaining past spending.

The desired product should instead help users proactively allocate income toward:

* Tithing
* Bills
* Savings
* Investments
* Goals
* Debt
* Everyday spending

## Alternatives Considered

* Build a traditional expense tracker
* Build a monthly envelope-budgeting clone
* Build a net-worth dashboard first

## Tradeoffs

A planning-first model requires more sophisticated allocation logic.

It may also require users to understand the distinction between virtual allocations and physical money.

## Consequences

The paycheck and allocation workflow becomes the core of the product.

Transactions and reports exist mainly to compare the plan with reality.

## Future Review Trigger

Reconsider only if user testing shows that users consistently enter transactions but do not use paycheck planning.

---

# Decision 002: Use the Personal Financial Operating System Positioning

**Status:** Accepted
**Scope:** Product

## Decision

The product will be positioned as a Personal Financial Operating System rather than only as a budgeting app.

## Why

The product includes several connected responsibilities:

* Planning
* Goal management
* Transaction tracking
* Financial insights
* Coaching
* Simulations
* Life-event adaptation

“Budgeting app” does not fully describe the intended product.

## Alternatives Considered

* Budgeting app
* Goal-based savings app
* Financial dashboard
* Digital envelope system

## Tradeoffs

The term “Personal Financial Operating System” may require explanation.

It could also create expectations for functionality beyond V1.

## Consequences

V1 scope must remain clearly defined so the broader positioning does not cause feature expansion.

## Future Review Trigger

Reconsider branding after beta user testing.

---

# Decision 003: V1 Must Answer Five Core Questions

**Status:** Accepted
**Scope:** Product, Roadmap

## Decision

V1 must answer:

1. Where should my next paycheck go?
2. Am I on track with my financial plan?
3. Will I reach my goals?
4. What should I change if I will not?
5. What happens if I make this financial decision?

## Why

These questions define the smallest coherent version of the product.

They also provide a filter against uncontrolled feature growth.

## Alternatives Considered

* Build a broad personal-finance platform immediately
* Prioritize transaction tracking first
* Prioritize net worth first
* Include every planned future function in beta

## Tradeoffs

Some useful features must be delayed.

## Consequences

Notifications, bank syncing, mobile apps, AI learning, and several advanced features are deferred.

## Future Review Trigger

Reconsider after V1 successfully answers all five questions.

---

# Decision 004: V1 Is a Minimum Lovable Product

**Status:** Accepted
**Scope:** Product, Roadmap

## Decision

V1 should be the smallest version users genuinely enjoy and trust, not merely the smallest technically functional release.

## Why

A financial product must feel clear and dependable.

A feature-rich but unreliable beta would damage trust.

## Alternatives Considered

* Minimal proof of concept
* Broad but partially implemented beta
* Prototype with little testing

## Tradeoffs

Development may take longer than a basic prototype.

## Consequences

Correctness, explainability, testing, and UX polish are required in V1.

## Future Review Trigger

None. This remains a long-term product standard.

---

# Decision 005: Separate PFOS into Modular Engines

**Status:** Accepted
**Scope:** Architecture

## Decision

PFOS will use separate modules:

* Allocation Engine
* Goal Engine
* Transaction Engine
* Rule Engine
* Insight Engine
* Coaching Engine
* Decision Simulator

A central orchestration layer coordinates workflows.

## Why

Each module has a separate responsibility.

This reduces duplicated logic and allows incremental implementation and testing.

## Alternatives Considered

* One large financial service
* Business logic embedded in UI components
* Feature-based logic duplicated across screens

## Tradeoffs

The architecture requires more initial planning and interface design.

## Consequences

Each engine receives a dedicated specification with consistent sections.

## Future Review Trigger

Reconsider boundaries if implementation reveals unavoidable circular dependencies.

---

# Decision 006: One Calculation, One Owner, One Truth

**Status:** Accepted
**Scope:** Architecture, Financial logic

## Decision

Each financial calculation has one authoritative owner.

Examples:

* Allocation Engine owns allocation amounts.
* Goal Engine owns goal lifecycle.
* Transaction Engine owns ledger effects.
* Insight Engine owns Planning Score.
* Rule Engine owns rule resolution.

## Why

Duplicated calculations eventually disagree.

This is especially dangerous in financial software.

## Alternatives Considered

* Allow reports to calculate independently
* Let UI components derive values locally
* Give the simulator its own formulas

## Tradeoffs

Features must depend on engine interfaces rather than implementing shortcuts.

## Consequences

Dashboard, reports, coaching, and simulation consume engine outputs.

## Future Review Trigger

None, unless an engine is formally split and ownership is reassigned.

---

# Decision 007: Every Engine Returns Calculations and Explanations

**Status:** Accepted
**Scope:** Architecture, UX

## Decision

Important engine outputs must include:

* Inputs used
* Calculation result
* Explanation
* Rule or plan context
* Confidence classification where relevant

## Why

Users need to know where important numbers came from.

Explainability also improves debugging and testing.

## Alternatives Considered

* Generate explanations separately in the UI
* Let the Coaching Engine reconstruct reasons
* Display numbers without explanations

## Tradeoffs

Engine output structures become more detailed.

## Consequences

Explanations remain consistent across dashboard, reports, coaching, and simulation.

## Future Review Trigger

Reconsider the output format if it creates unacceptable performance or storage overhead.

---

# Decision 008: Use a Central Orchestration Layer

**Status:** Accepted
**Scope:** Architecture

## Decision

User workflows interact with an application or orchestration service, which coordinates engines.

Engines should not be tightly coupled to UI or storage.

## Why

This keeps workflows consistent and engines independently testable.

## Alternatives Considered

* UI calls each engine directly
* Engines call each other freely
* Store business logic in database repositories

## Tradeoffs

Adds another architectural layer.

## Consequences

The orchestrator handles workflows such as:

* Confirm paycheck
* Post allocation
* Import transactions
* Reconcile account
* Run simulation

## Future Review Trigger

Reconsider only if the orchestration layer becomes a monolith with excessive business logic.

---

# Decision 009: Physical Accounts and Virtual Buckets Are Separate

**Status:** Accepted
**Scope:** Product, Data

## Decision

PFOS distinguishes:

* Physical accounts: where money exists
* Virtual buckets: what money is reserved for

V1 uses virtual planning and does not physically move money.

## Why

A single bank account may fund many purposes.

The user needs to plan these purposes without opening separate real accounts.

## Alternatives Considered

* Treat each bucket as a physical account
* Require bank transfers
* Track only physical account balances

## Tradeoffs

Users must reconcile virtual balances with actual accounts.

## Consequences

V1 requires transaction tracking and reconciliation.

## Future Review Trigger

Reconsider the relationship when live banking and money movement are introduced.

---

# Decision 010: Bucket Groups Are Organizational Only

**Status:** Accepted
**Scope:** Product, Data

## Decision

Buckets may belong to groups such as Savings, Investing, Bills, or Giving.

Money is allocated only to buckets, not groups.

## Why

Groups simplify organization and reporting without creating ambiguous balances.

## Alternatives Considered

* Allow both groups and buckets to hold money
* Use only a flat category list

## Tradeoffs

Users cannot assign money directly to a broad group.

## Consequences

Group analytics aggregate child-bucket data.

## Future Review Trigger

Reconsider if user testing shows strong demand for group-level allocations.

---

# Decision 011: Bucket Behavior Is Driven by Bucket Type

**Status:** Accepted
**Scope:** Product, Architecture

## Decision

Buckets use defined types, including:

* Percentage
* Fixed monthly
* Recurring bill
* Investment minimum plus unlimited extra
* Unlimited
* Goal
* Emergency fund
* Debt payoff
* Everyday spending

## Why

Bucket type determines behavior, settings, analytics, and progress display.

## Alternatives Considered

* Give every bucket every possible setting
* Hard-code behavior based on bucket names

## Tradeoffs

Bucket types require careful domain modeling.

## Consequences

The UI displays only settings relevant to the selected type.

## Future Review Trigger

Add or revise types when a genuinely new behavior cannot be expressed with existing types.

---

# Decision 012: Goals Also Have an Intent

**Status:** Accepted
**Scope:** Product, Data

## Decision

Goals may be:

* One-time
* Recurring
* Continuous

Goal intent is separate from bucket type.

## Why

A MacBook, annual fee, and emergency fund have different lifecycles.

## Alternatives Considered

* Use only a single goal type
* Create separate bucket types for every lifecycle

## Tradeoffs

Combining type and intent creates more domain combinations to validate.

## Consequences

The Goal Engine determines behavior using both bucket type and goal intent.

## Future Review Trigger

Reconsider if combinations become too complex for users to understand.

---

# Decision 013: Top Priorities Are User-Selected

**Status:** Accepted
**Scope:** Financial logic

## Decision

Users may select approximately one to three top priorities.

By default, they are funded in ranked order.

Users may optionally assign percentages among them.

## Why

The app should respect the user’s priorities rather than impose a universal budgeting philosophy.

## Alternatives Considered

* Evenly split all allocations
* Hard-code bills before every other category
* Require percentages only

## Tradeoffs

Strict priority funding may leave lower priorities unfunded.

## Consequences

The Funding Advisor must explain shortfalls.

## Future Review Trigger

Reconsider default behavior after allocation usability testing.

---

# Decision 014: Lower-Priority Spending Is Split Evenly by Default

**Status:** Accepted
**Scope:** Financial logic

## Decision

After higher-priority rules are satisfied, remaining applicable money is divided evenly among everyday spending categories by default.

Users may override this with:

* Percentages
* Fixed amounts
* Priorities
* Custom allocation rules

## Why

Even splitting provides a simple default without requiring detailed setup.

## Alternatives Considered

* Require category budgets
* Use historical spending
* Use fixed recommended percentages

## Tradeoffs

Even splits may not reflect real spending needs.

## Consequences

The setup is simple, while customization remains available.

## Future Review Trigger

Reconsider after user testing or once behavioral recommendations exist.

---

# Decision 015: Tithing Defaults to 10% of Net Income

**Status:** Accepted
**Scope:** Financial logic

## Decision

Tithing defaults to 10% of eligible net deposited income.

The user may customize the percentage and eligibility rules.

## Why

This matches the intended user’s preferred starting behavior while preserving flexibility.

## Alternatives Considered

* Gross income
* User-defined amount only
* Income-source-specific tithing by default

## Tradeoffs

Users may interpret tithing differently.

## Consequences

The app must clearly state that this is a configurable default, not financial or religious instruction.

## Future Review Trigger

Reconsider onboarding defaults if PFOS targets a broad public audience.

---

# Decision 016: Tithing Is a Global Rule

**Status:** Accepted
**Scope:** Financial logic

## Decision

Eligible income is combined for global tithing calculations.

After global rules are resolved, income-source-specific allocation overrides may apply.

## Why

Tithing should not become inconsistent merely because income came from multiple sources.

## Alternatives Considered

* Calculate independently for each income source
* Treat tithing as a normal bucket override

## Tradeoffs

Global aggregation requires careful handling across time periods.

## Consequences

The Rule Engine must define eligible income and avoid double counting.

## Future Review Trigger

Reconsider if users require substantially different tithing rules by income source.

---

# Decision 017: Income Sources Inherit Global Rules

**Status:** Accepted
**Scope:** Financial logic

## Decision

Each income source inherits the global allocation plan by default.

Users may optionally create source-specific overrides.

## Why

This offers flexibility without forcing every income source to be configured.

## Alternatives Considered

* Universal plan only
* Require a separate plan for every income source

## Tradeoffs

Rule precedence becomes more complex.

## Consequences

The Rule Engine must explicitly define global and source-level precedence.

## Future Review Trigger

Reconsider precedence during detailed Rule Engine specification.

---

# Decision 018: Paycheck Entry Is Manual by Default

**Status:** Accepted
**Scope:** Product, UX

## Decision

V1 uses manual paycheck entry with:

* Saved income-source templates
* Pay-frequency memory
* Auto-filled recurring details
* One-click allocation calculation

## Why

V1 does not connect to banks.

Manual entry is dependable and simple to build.

## Alternatives Considered

* Automatic payroll detection
* CSV-only income entry
* Fully recurring generated paychecks

## Tradeoffs

The user must enter or approve each paycheck.

## Consequences

Automatic detection is deferred to a future connected version.

## Future Review Trigger

Reconsider when banking integrations are added.

---

# Decision 019: Allocation Preview Is the Default

**Status:** Accepted
**Scope:** UX, Financial logic

## Decision

PFOS displays a preview before posting allocations.

Immediate posting may be enabled as an optional advanced setting.

## Why

Users should understand and verify where money will go.

## Alternatives Considered

* Post immediately
* Show previews only for unusual paychecks

## Tradeoffs

Adds one confirmation step.

## Consequences

Preview state must never modify balances.

## Future Review Trigger

Reconsider after experienced-user feedback.

---

# Decision 020: Leftover Money Uses a User-Defined Policy

**Status:** Accepted
**Scope:** Financial logic

## Decision

Users define what happens after required allocations are satisfied.

Examples:

* Invest everything
* Fund a MacBook
* Split across goals
* Maintain a cash buffer
* Leave unallocated

## Why

Different users have different intentions for excess cash.

## Alternatives Considered

* Always invest
* Always use highest-priority goal
* Always leave unallocated

## Tradeoffs

Custom rules add setup complexity.

## Consequences

A simple default and optional advanced policy editor are required.

## Future Review Trigger

Reconsider default policy during onboarding design.

---

# Decision 021: Changing Priorities Affects Future Allocations Only

**Status:** Accepted
**Scope:** Financial logic, Data

## Decision

Priority changes do not redistribute existing bucket balances.

They affect future allocations only.

## Why

Silently moving previously allocated money would surprise users and distort history.

## Alternatives Considered

* Automatically reallocate existing balances
* Prompt every time priorities change

## Tradeoffs

Users who want to rebalance existing funds need a separate action.

## Consequences

A future “Reallocate Existing Funds” workflow may be added.

## Future Review Trigger

Reconsider if users frequently need retrospective reallocation.

---

# Decision 022: Rule Changes Are Prospective

**Status:** Accepted
**Scope:** Financial logic, Data

## Decision

Changes to:

* Tithing
* Priorities
* Leftover policy
* Rollover rules
* Allocation percentages

apply to future allocations.

Historical allocations remain unchanged.

## Why

History should represent the plan used at that time.

## Alternatives Considered

* Recalculate all historical data
* Ask prospective versus retroactive each time

## Tradeoffs

Historical reports may differ from the current plan.

## Consequences

Plan Snapshots are required.

## Future Review Trigger

None unless an explicit retrospective planning tool is created.

---

# Decision 023: Store Plan Snapshots

**Status:** Accepted
**Scope:** Data, Architecture

## Decision

Every confirmed allocation references the plan and rule configuration that produced it.

## Why

Plan Snapshots preserve historical explainability.

## Alternatives Considered

* Read only the current plan
* Store explanations without the plan version
* Recalculate history using current settings

## Tradeoffs

Snapshots increase data volume and migration complexity.

## Consequences

Historical correction and reporting remain accurate.

## Future Review Trigger

Optimize storage if snapshots become excessively large.

---

# Decision 024: Goal Funding Does Not Equal Goal Completion

**Status:** Accepted
**Scope:** Product, Financial logic

## Decision

A goal reaching its target enters a Funded state.

It is completed only when the user confirms the real-world purpose was fulfilled.

## Why

Saving $3,000 for a MacBook does not mean the MacBook was purchased.

## Alternatives Considered

* Automatically complete at target
* Archive immediately

## Tradeoffs

Adds an additional lifecycle state.

## Consequences

Goal states include Active, Funded, Completed, and Archived.

## Future Review Trigger

None.

---

# Decision 025: Funded Goals Pause Automatic Allocations

**Status:** Accepted
**Scope:** Financial logic

## Decision

When a goal reaches its target:

* It remains active and visible.
* Automatic allocations pause.
* Funds remain reserved.
* Users may increase the target or manually add money.

## Why

Taxes, accessories, or price changes may require additional saving.

## Alternatives Considered

* Continue allocating automatically
* Archive automatically

## Tradeoffs

Users must explicitly decide what happens next.

## Consequences

The Goal Engine must support funded-but-not-completed status.

## Future Review Trigger

Reconsider after goal-flow usability testing.

---

# Decision 026: Recurring Goals Automatically Start the Next Cycle

**Status:** Accepted
**Scope:** Financial logic

## Decision

After a recurring goal is completed, the next cycle is created with the same settings.

The default behavior is to ask the user to confirm or update the target amount.

## Why

Recurring expenses should not require complete reconfiguration.

## Alternatives Considered

* Require manual recreation
* Reuse the previous amount without confirmation
* Apply automatic inflation only

## Tradeoffs

The user still needs to review potential price changes.

## Consequences

Recurring cycles must be linked for historical reporting.

## Future Review Trigger

Reconsider when external bill detection is added.

---

# Decision 027: Depleted Target Buckets Prompt Before Resuming Funding

**Status:** Accepted
**Scope:** Financial logic, UX

## Decision

If a funded emergency fund or similar bucket falls below target, PFOS asks whether automatic funding should resume.

## Why

The withdrawal may be intentional, and users should control the response.

## Alternatives Considered

* Automatically reopen funding
* Require manual reactivation without prompting

## Tradeoffs

Adds a decision prompt.

## Consequences

The system recommends but does not force.

## Future Review Trigger

None.

---

# Decision 028: Bucket Balances Roll Over by Default

**Status:** Accepted
**Scope:** Financial logic

## Decision

All bucket balances carry forward by default.

Users may configure each bucket to:

* Reset
* Carry to a cap
* Redirect excess
* Apply a leftover policy

## Why

Allocated money should not disappear at month-end.

## Alternatives Considered

* Reset all spending categories
* Reset only everyday categories
* Automatically redirect unused balances

## Tradeoffs

Some categories may accumulate unexpectedly.

## Consequences

Rollover policy becomes a standard bucket property.

## Future Review Trigger

Reconsider default behavior after user testing.

---

# Decision 029: Manual Transactions Are the Reliable Default

**Status:** Accepted
**Scope:** Product

## Decision

V1 supports manual transaction entry as the dependable primary workflow.

CSV import is an optional convenience.

## Why

Bank syncing is outside V1 scope.

## Alternatives Considered

* CSV only
* Live syncing
* No transaction tracking in V1

## Tradeoffs

Manual entry requires user effort.

## Consequences

The app must provide fast entry and reconciliation.

## Future Review Trigger

Reconsider after bank integration.

---

# Decision 030: CSV Imports Are Preview-First

**Status:** Accepted
**Scope:** UX, Data, Security

## Decision

CSV imports:

1. Detect or map columns.
2. Show a preview.
3. Detect duplicates.
4. Apply known categorization rules.
5. Flag uncertain transactions.
6. Require confirmation.
7. Commit atomically.

## Why

Financial imports must not silently corrupt balances.

## Alternatives Considered

* Import immediately
* Require a fixed CSV format
* Support only one institution

## Tradeoffs

The import workflow is more involved.

## Consequences

Import drafts remain isolated from confirmed financial data.

## Future Review Trigger

Reconsider only to simplify the UI without weakening validation.

---

# Decision 031: Remember Merchant Categorization Rules

**Status:** Accepted
**Scope:** Product, Financial logic

## Decision

PFOS remembers confirmed mappings such as:

> GEICO → Insurance

High-confidence future matches may be categorized automatically, while uncertain matches require review.

## Why

Repeated manual categorization creates unnecessary work.

## Alternatives Considered

* Categorize everything manually
* Use AI classification in V1

## Tradeoffs

Rules may misclassify merchants with varied purchases.

## Consequences

Users must be able to review and override categorization.

## Future Review Trigger

Reconsider when behavioral learning is introduced.

---

# Decision 032: Detect Likely Duplicate Transactions and Paychecks

**Status:** Accepted
**Scope:** Financial logic, Data

## Decision

PFOS warns about likely duplicates but allows explicit confirmation.

## Why

Duplicate prevention must not block legitimate identical payments.

## Alternatives Considered

* Prevent duplicates entirely
* Allow duplicates without warning

## Tradeoffs

Duplicate detection may produce false positives.

## Consequences

Matching uses signals such as date, amount, source, merchant, and references.

## Future Review Trigger

Tune detection thresholds based on import testing.

---

# Decision 033: Support Split Transactions in V1

**Status:** Accepted
**Scope:** Financial logic

## Decision

One transaction may contain multiple bucket or category lines.

## Why

Real purchases frequently cover several purposes.

## Alternatives Considered

* Require separate transactions
* Allow only one bucket per purchase

## Tradeoffs

Editing, refunding, and reporting become more complex.

## Consequences

The transaction model needs a parent record and split lines.

## Future Review Trigger

None.

---

# Decision 034: Support Full Credit-Card Accounting in V1

**Status:** Accepted
**Scope:** Financial logic

## Decision

A credit-card purchase:

* Records spending once
* Reduces the spending bucket
* Increases liability
* Creates a payment reserve

A payment:

* Reduces cash
* Reduces liability
* Consumes the reserve
* Does not create a second expense

## Why

Simplified treatment would distort net worth and spending reports.

## Alternatives Considered

* Treat card purchases like cash spending only
* Delay credit-card liability tracking

## Tradeoffs

Credit-card accounting is one of the more complex V1 systems.

## Consequences

Strict invariants and tests are required.

## Future Review Trigger

None unless the model proves too difficult for users to understand.

---

# Decision 035: Credit-Card Payment Reserve Is Automatically Managed

**Status:** Accepted
**Scope:** Financial logic

## Decision

PFOS automatically reserves payment cash for credit-card purchases.

Users can see the reserve but normally do not edit it directly.

## Why

Without a reserve, virtual cash may appear available even though it is needed for the card payment.

## Alternatives Considered

* Require users to fund card payments manually
* Reduce checking immediately for card purchases

## Tradeoffs

The reserve introduces another balance concept.

## Consequences

The reserve must be a virtual transfer, not a duplicate expense.

## Future Review Trigger

Reconsider based on usability testing.

---

# Decision 036: Overspent Buckets May Become Negative

**Status:** Accepted
**Scope:** Financial logic, UX

## Decision

If spending exceeds a bucket balance:

* Record the full transaction.
* Allow the bucket to become negative.
* Show the shortfall.
* Offer explicit fixes.
* Do not silently move money.

## Why

The transaction occurred in reality and must be recorded accurately.

## Alternatives Considered

* Block the transaction
* Automatically pull from another bucket
* Use leftover rules silently

## Tradeoffs

Negative buckets may confuse some users.

## Consequences

The Funding Advisor and explanations must help resolve the shortfall.

## Future Review Trigger

Reconsider presentation, not accounting behavior, after testing.

---

# Decision 037: Refunds Restore the Original Split by Default

**Status:** Accepted
**Scope:** Financial logic

## Decision

Refunds propose reversing the original bucket allocation.

Partial refunds use the original proportions by default.

Users may edit the proposed refund split.

## Why

This preserves reporting and bucket accuracy.

## Alternatives Considered

* Send refunds to Available to Allocate
* Ask for a new split every time

## Tradeoffs

Matching refunds to original transactions may sometimes fail.

## Consequences

Unmatched refunds require manual categorization.

## Future Review Trigger

None.

---

# Decision 038: Reconciliation Shows Differences Before Fixing Them

**Status:** Accepted
**Scope:** Product, Financial logic

## Decision

PFOS shows the difference between virtual and actual balances and asks the user to reconcile.

Users may:

* Find missing transactions
* Correct records
* Enter an adjustment
* Force balances to match if the cause is unknown

## Why

Automatic fixes could hide errors.

## Alternatives Considered

* Adjust automatically
* Require perfect transaction reconstruction

## Tradeoffs

Reconciliation may require user effort.

## Consequences

Forced adjustments must be clearly labeled and auditable.

## Future Review Trigger

Reconsider workflow after beta testing.

---

# Decision 039: Initial Net Worth Is Manual

**Status:** Accepted
**Scope:** Product, Data

## Decision

Users manually enter starting account balances.

Known allocations and transactions update planned or expected balances thereafter.

## Why

V1 has no live bank connections.

## Alternatives Considered

* Require CSV history
* Exclude net worth from V1
* Use estimated balances only

## Tradeoffs

Initial accuracy depends on user input.

## Consequences

The app must distinguish planned and actual balances.

## Future Review Trigger

Reconsider when bank syncing is introduced.

---

# Decision 040: Distinguish Planned Balance and Actual Balance

**Status:** Accepted
**Scope:** Financial logic, Insight

## Decision

PFOS tracks:

* Planned or expected balance
* Actual reported balance
* Variance

## Why

The app knows about planned contributions but not all external growth or changes.

## Alternatives Considered

* Store only one balance
* Update actual balances immediately from plans

## Tradeoffs

Users must understand two related values.

## Consequences

Variance analysis and reconciliation become possible.

## Future Review Trigger

Reconsider naming during UX design.

---

# Decision 041: Support Optional Manual Assets

**Status:** Accepted
**Scope:** Product, Data

## Decision

Users may optionally track assets such as:

* Homes
* Vehicles
* Precious metals
* Collectibles
* Businesses
* Cold-storage cryptocurrency

## Why

Some users want a complete net-worth view.

## Alternatives Considered

* Track financial accounts only
* Require every asset during onboarding

## Tradeoffs

Manual asset values may become outdated.

## Consequences

Manual assets affect Total Net Worth but not normal paycheck allocation.

## Future Review Trigger

Reconsider valuation support in later versions.

---

# Decision 042: Distinguish Planning Net Worth and Total Net Worth

**Status:** Accepted
**Scope:** Insight, UX

## Decision

Planning Net Worth contains assets and liabilities actively involved in the financial plan.

Total Net Worth may include optional manual assets.

## Why

A house or collectible may matter for wealth but not for paycheck planning.

## Alternatives Considered

* Show only one net-worth number

## Tradeoffs

Two metrics may require explanation.

## Consequences

Users can focus on either operational finances or full wealth.

## Future Review Trigger

Validate terminology during user testing.

---

# Decision 043: Include a Planning Score and Label

**Status:** Accepted
**Scope:** Product, Insight

## Decision

PFOS shows both:

* Numerical score
* Descriptive label

The score reflects adherence to the user’s plan.

## Why

A summary can quickly communicate whether the plan needs attention.

## Alternatives Considered

* Label only
* Number only
* No score

## Tradeoffs

Scores can oversimplify financial circumstances.

## Consequences

The score must be fully explainable and must not reward unhealthy behavior.

## Future Review Trigger

Reconsider weights after beta testing.

---

# Decision 044: Include Deterministic Goal Confidence Scores

**Status:** Accepted
**Scope:** Product, Insight

## Decision

Goals receive transparent estimates of the likelihood of reaching their targets based on known plan data.

V1 does not use machine learning.

## Why

Users want to know whether their contribution rate is sufficient.

## Alternatives Considered

* Show projected date only
* Use AI predictions
* Exclude confidence scoring

## Tradeoffs

A percentage may appear more precise than the underlying assumptions justify.

## Consequences

The explanation must show assumptions and limitations.

## Future Review Trigger

Reconsider score presentation after usability testing.

---

# Decision 045: Funding Advisor Offers Alternatives

**Status:** Accepted
**Scope:** Product, Coaching

## Decision

When the plan cannot be fully funded, PFOS presents possible ways to resolve the shortfall.

It does not silently weaken priorities.

## Why

The product should support decisions rather than merely report failure.

## Alternatives Considered

* Stop allocation without advice
* Automatically reduce lower priorities
* Allow balances to go negative without explanation

## Tradeoffs

Generating useful options requires additional logic.

## Consequences

Recommendations remain user-approved.

## Future Review Trigger

Expand recommendation strategies in later versions.

---

# Decision 046: Coaching Is Deterministic in V1

**Status:** Accepted
**Scope:** Product, Roadmap

## Decision

The Coaching Engine explains calculations and offers rule-based recommendations.

It does not infer behavioral patterns or use AI to modify rules.

## Why

V1 lacks reliable physical transaction history and should prioritize trust.

## Alternatives Considered

* AI behavior learning in V1
* No coaching
* Automated plan changes

## Tradeoffs

V1 coaching may feel less conversational or personalized.

## Consequences

AI learning is deferred.

## Future Review Trigger

Reconsider when bank syncing, sufficient history, and user consent are available.

---

# Decision 047: Include a Simple Decision Simulator in V1

**Status:** Accepted
**Scope:** Product, Delight

## Decision

V1 includes a deterministic simulator for simple scenarios.

The simulator reuses production engines and does not modify real data unless the user explicitly applies supported changes.

## Why

Simulation directly answers one of the five core questions.

## Alternatives Considered

* Defer entirely to V2
* Build a highly advanced simulator immediately

## Tradeoffs

The simulator adds complexity to V1.

## Consequences

V1 scenarios are intentionally limited.

## Future Review Trigger

Expand after the core engine behavior is stable.

---

# Decision 048: Include Simple Life Events in V1

**Status:** Accepted
**Scope:** Product, Delight

## Decision

V1 supports basic life-event scenarios such as:

* New income
* Raise
* Pay cut
* Bonus
* New recurring expense

These reuse the Decision Simulator.

## Why

Financial plans must adapt to changing circumstances.

## Alternatives Considered

* Defer all life events
* Build a full life-planning system

## Tradeoffs

The feature must remain limited to avoid scope expansion.

## Consequences

More complex events are deferred to V2.

## Future Review Trigger

Expand based on user demand.

---

# Decision 049: Notifications Are Deferred to V2

**Status:** Accepted
**Scope:** Roadmap

## Decision

V1 does not include:

* Push notifications
* Email reminders
* Scheduled notifications
* Complex in-app reminder systems

## Why

Notifications add scheduling, preferences, time-zone, history, and delivery complexity without directly improving the core V1 questions.

## Alternatives Considered

* Include in-app reminders
* Include all notification channels

## Tradeoffs

Users must open the app to see changes.

## Consequences

The dashboard should surface relevant current information when opened.

## Future Review Trigger

Reconsider in V2.

---

# Decision 050: The Dashboard Is a Financial Summary

**Status:** Accepted
**Scope:** UX

## Decision

The dashboard summarizes:

* Net worth
* Available to allocate
* Next paycheck
* Top priorities
* Upcoming obligations
* Goal progress
* Recent transactions
* Planning Score

## Why

The user wants a command-center view covering all major topics.

## Alternatives Considered

* Allocation-only dashboard
* Goal-only dashboard
* Net-worth-only dashboard

## Tradeoffs

Too many cards could create clutter.

## Consequences

Each card should be concise and link to details.

## Future Review Trigger

Reconsider layout after prototype testing.

---

# Decision 051: Use a Hybrid Visual Design

**Status:** Accepted
**Scope:** UX

## Decision

PFOS should appear calm and approachable by default, with deeper analytics available through drill-down interactions.

## Why

The product must support both simplicity and advanced financial detail.

## Alternatives Considered

* Dense financial dashboard
* Minimal goal tracker

## Tradeoffs

Progressive disclosure requires careful navigation design.

## Consequences

Advanced options should not dominate the default screens.

## Future Review Trigger

Validate with usability testing.

---

# Decision 052: Use Sidebar Navigation for V1 Web

**Status:** Accepted
**Scope:** UX

## Decision

Primary navigation includes:

* Dashboard
* Paychecks
* Buckets & Goals
* Transactions
* Accounts & Net Worth
* Reports
* Decision Simulator
* Settings

Planning Score, Coaching, Confidence Scores, and Funding Advisor appear contextually.

## Why

These capabilities are cross-cutting, not separate destinations.

## Alternatives Considered

* Give every feature its own page
* Use top navigation only
* Use mobile-style bottom navigation

## Tradeoffs

The sidebar is optimized primarily for desktop.

## Consequences

V1 is desktop-first.

## Future Review Trigger

Redesign navigation for V2 mobile.

---

# Decision 053: Use Progressive Onboarding

**Status:** Accepted
**Scope:** UX

## Decision

Users should reach their first Allocation Preview quickly.

Most nonessential steps may be skipped and completed later.

## Why

A large setup wizard would delay the first useful experience.

## Alternatives Considered

* Require complete financial setup
* Provide no onboarding
* Ask every advanced question upfront

## Tradeoffs

Users may begin with incomplete data.

## Consequences

The app must clearly indicate optional setup gaps without blocking use.

## Future Review Trigger

Measure onboarding completion and time-to-value.

---

# Decision 054: V1 Is a Web Application

**Status:** Accepted
**Scope:** Roadmap, UX

## Decision

V1 is a desktop-oriented web application.

Native mobile applications are deferred to V2.

## Why

Web development reduces platform complexity and supports rapid iteration.

## Alternatives Considered

* Mobile-first web
* Native mobile first
* Build web and mobile simultaneously

## Tradeoffs

V1 may be less convenient for real-time transaction entry.

## Consequences

The web architecture should still avoid unnecessary desktop-only assumptions.

## Future Review Trigger

Begin mobile design after V1 stabilizes.

---

# Decision 055: V1 Is Local-First and Single-User

**Status:** Accepted
**Scope:** Architecture, Security

## Decision

Financial data is stored locally.

V1 does not require cloud accounts or synchronization.

## Why

This improves privacy and reduces authentication, hosting, and backend complexity.

## Alternatives Considered

* Cloud-first accounts
* Local-only architecture without future abstraction

## Tradeoffs

Data is not automatically synchronized across devices.

## Consequences

Backup and restore are required.

## Future Review Trigger

Reconsider in V2 cloud synchronization work.

---

# Decision 056: Use IndexedDB Behind Repository Interfaces

**Status:** Accepted
**Scope:** Architecture, Data

## Decision

V1 uses IndexedDB for structured local data.

Engines access storage only through repositories or interfaces.

## Why

IndexedDB is more suitable than localStorage for transactions, snapshots, imports, and larger datasets.

## Alternatives Considered

* localStorage
* Local SQLite wrapper
* Cloud database

## Tradeoffs

IndexedDB APIs can be complex.

## Consequences

Schema migrations and repository tests are required.

## Future Review Trigger

Replace the repository implementation if cloud or desktop storage is introduced.

---

# Decision 057: Support Full Export and Backup

**Status:** Accepted
**Scope:** Data, Product

## Decision

V1 supports:

* CSV exports
* Complete JSON backup
* Schema versioning
* Restore validation
* Data deletion

## Why

Users must own and control their financial information.

## Alternatives Considered

* CSV only
* No restore
* Proprietary export

## Tradeoffs

Backup migration increases engineering work.

## Consequences

The backup format must be documented and tested.

## Future Review Trigger

Expand to encrypted or automated backups later.

---

# Decision 058: V1 Supports USD Only

**Status:** Accepted
**Scope:** Product, Financial logic

## Decision

All V1 financial calculations and displays use USD.

## Why

Multi-currency complicates:

* Net worth
* Transfers
* Historical exchange rates
* Goals
* Reports
* Simulation

## Alternatives Considered

* Multi-currency from launch

## Tradeoffs

V1 cannot support users with significant foreign-currency finances.

## Consequences

The data model should remain future-aware but avoid premature conversion logic.

## Future Review Trigger

Reconsider after V1.

---

# Decision 059: Do Not Use Floating-Point Arithmetic for Money

**Status:** Accepted
**Scope:** Engineering, Financial logic

## Decision

Money is stored and calculated using integer cents or another exact decimal representation.

## Why

Binary floating-point errors are unacceptable in financial software.

## Alternatives Considered

* JavaScript number arithmetic with rounding
* Floating-point values in UI and database

## Tradeoffs

Percentage and division logic require explicit rounding methods.

## Consequences

Financial invariants must be tested to the cent.

## Future Review Trigger

None.

---

# Decision 060: Financial Operations Must Be Atomic

**Status:** Accepted
**Scope:** Engineering, Data

## Decision

Multi-step operations either succeed fully or leave the prior valid state unchanged.

## Why

Partial writes could corrupt allocations, balances, imports, or backups.

## Alternatives Considered

* Commit records independently
* Repair partial failures manually

## Tradeoffs

Transaction coordination in IndexedDB requires careful implementation.

## Consequences

Draft and preview records remain isolated until confirmation.

## Future Review Trigger

None.

---

# Decision 061: Historical Corrections Are Traceable

**Status:** Accepted
**Scope:** Data, Financial logic

## Decision

Users may correct historical records.

Corrections preserve an audit trail and may recalculate dependent data using the original Plan Snapshot.

## Why

Financial mistakes must be fixable without silently rewriting history.

## Alternatives Considered

* Lock history permanently
* Edit records without audit history
* Recalculate using current rules

## Tradeoffs

Correction workflows are more complex.

## Consequences

Soft deletion and audit records are preferred.

## Future Review Trigger

Reconsider user-facing complexity during UX design.

---

# Decision 062: Security Is Required in V1

**Status:** Accepted
**Scope:** Security

## Decision

V1 must:

* Avoid bank credentials
* Validate imported files
* Avoid telemetry containing financial amounts
* Prevent unnecessary third-party data access
* Warn users about sensitive backups
* Sanitize CSV and JSON input

## Why

A beta designation does not reduce the sensitivity of financial data.

## Alternatives Considered

* Delay security hardening
* Use third-party analytics by default

## Tradeoffs

Security controls increase implementation time.

## Consequences

Imported files are treated as untrusted input.

## Future Review Trigger

Expand requirements when authentication and cloud storage are added.

---

# Decision 063: Use a Strict Testing Standard

**Status:** Accepted
**Scope:** Testing

## Decision

V1 requires:

* Unit tests
* Integration tests
* Financial invariant tests
* Property-based tests where useful
* Import tests
* Migration tests
* End-to-end tests
* Regression tests

## Why

Financial errors can undermine the entire product.

## Alternatives Considered

* Basic unit tests only
* Test manually during beta
* Add tests after implementation

## Tradeoffs

Development is slower initially.

## Consequences

Every financial bug fixed must receive a regression test.

## Future Review Trigger

None.

---

# Decision 064: Establish V1 Performance Targets

**Status:** Accepted
**Scope:** Engineering

## Decision

V1 should aim for:

* Dashboard load under approximately one second for normal data
* Near-instant allocation previews
* CSV imports of at least 10,000 transactions without freezing
* Responsive reports across several years
* Progress feedback for long operations

## Why

Local-first should feel fast and responsive.

## Alternatives Considered

* No performance standard
* Optimize only after release

## Tradeoffs

Some operations may require background workers or incremental processing.

## Consequences

Performance optimizations may not bypass authoritative engine logic.

## Future Review Trigger

Measure real datasets and revise targets where necessary.

---

# Decision 065: Use Incremental AI-Assisted Development

**Status:** Accepted
**Scope:** Engineering process

## Decision

Claude or another AI coding agent will implement PFOS one scoped milestone at a time.

The agent should not be asked to build the entire application in one request.

## Why

Smaller tasks reduce:

* Hallucinated requirements
* Architectural drift
* Regressions
* Unreviewable changes
* Partial implementations

## Alternatives Considered

* One giant build prompt
* Let the AI choose the development order
* Build UI first without engine specifications

## Tradeoffs

The user must manage more development stages.

## Consequences

Each engine receives its own instructions, interfaces, tests, and Definition of Done.

## Future Review Trigger

None.

---

# Decision 066: Keep Product Documentation Model-Agnostic

**Status:** Accepted
**Scope:** Engineering process

## Decision

Product and engineering specifications refer to an “AI coding agent,” not a specific model.

Claude-specific instructions live in `CLAUDE.md` and the AI Developer package.

## Why

The project may later use:

* Claude
* Codex
* Local models
* Human developers
* Multiple coding agents

## Alternatives Considered

* Write every document specifically for Claude
* Write separate PRDs for every model

## Tradeoffs

Some tool-specific instructions must be maintained separately.

## Consequences

Core documentation remains reusable.

## Future Review Trigger

None.

---

# Decision 067: Every Engine Specification Uses the Same Structure

**Status:** Accepted
**Scope:** Documentation, Engineering process

## Decision

Each engine document should include:

1. Purpose
2. Responsibilities
3. Non-responsibilities
4. Inputs
5. Outputs
6. Business rules
7. Algorithms
8. Data model
9. Interfaces
10. Orchestration behavior
11. UI interactions
12. Explainability contract
13. Edge cases
14. Error handling
15. Security considerations
16. Tests
17. Acceptance criteria
18. Future extensions

## Why

Consistency makes the documentation easier for humans and AI agents to navigate.

## Alternatives Considered

* Custom structure for each engine
* One combined engineering document

## Tradeoffs

Some sections may be brief or repetitive.

## Consequences

The specifications become modular and predictable.

## Future Review Trigger

Adjust the template if repeated sections provide no value.

---

# Decision 068: Document Authority Order

**Status:** Accepted
**Scope:** Documentation, Engineering process

## Decision

When two PFOS documents conflict, authority resolves in the following order, from highest to lowest:

1. PFOS-00 Product Constitution
2. Accepted decisions in PFOS-02 Product Decision Log
3. PFOS-01 Product Vision & Version 1 PRD
4. PFOS-ENG-00 Core Architecture & Project Setup
5. Individual engine and subsystem specifications under `docs/engineering/`
6. `CLAUDE.md`, for operational instructions only

A more specific lower-authority document may refine implementation details left open by a higher-authority document.

It may not contradict one.

Where a lower-authority document appears to conflict with a higher-authority document, the conflict must be reported and resolved through the process in Section 4 rather than resolved silently in code.

`CLAUDE.md` carries no product or architectural authority. It defines how a coding agent works. It does not define what PFOS is or how it calculates.

## Why

No existing document stated which document wins in a conflict.

PFOS-00 Section 1 establishes the Constitution as the standard against which all decisions are evaluated, and PFOS-ENG-00 Section 39 states that engine specifications inherit architecture standards unless they explicitly state otherwise. The full ordering was never written down.

These documents were drafted in parallel across different concerns and several are still marked Draft for Review. Without a stated order, a developer or AI coding agent resolving an apparent conflict would have to guess, and separate tasks could guess differently.

## Alternatives Considered

* Leave the order implicit and derive it from each document's stated purpose
* Treat the most recently updated document as authoritative
* Treat the most specific document as authoritative in all cases
* Require every conflict to be escalated with no default ordering

## Tradeoffs

A strict ordering may occasionally rank a well-reasoned engine-level detail below a more general document that did not anticipate it.

The correct response is to amend the higher-authority document, not to ignore the ordering.

## Consequences

Conflicts between documents have a defined resolution path.

Engine specifications may continue to define implementation detail freely within the boundaries set above them.

`CLAUDE.md` may be updated for workflow reasons without implying a product or architectural change.

## Future Review Trigger

Reconsider when PFOS adds document classes not covered by this ordering, such as UX specifications under `docs/ux/` or roadmap documents under `docs/roadmap/`. New classes should be inserted at their appropriate level rather than left unranked.

---

# Decision 069: Milestone Sequencing Is Defined by PFOS-ENG-00 Section 48

**Status:** Accepted
**Scope:** Engineering process, Roadmap

## Decision

PFOS-ENG-00 Section 47 and Section 48 describe different things.

Section 47 describes the broader initial implementation phase and its outer scope boundary. It states what early work may touch and, more importantly, what it may not.

Section 48 defines the actual incremental milestones.

Section 48 governs the unit of work.

Milestones 0, 1, and 2 proceed in order as separate, individually reviewable milestones:

1. Milestone 0 — Repository Foundation
2. Milestone 1 — Financial Primitives
3. Milestone 2 — Rule Engine

They must not be combined into a single task or a single review.

## Why

Section 47 lists project scaffolding, shared primitives, and Rule Engine resolution together under the phrase "the first coding milestone," while Section 48 splits the identical work across Milestones 0, 1, and 2.

Read literally, Section 47 authorizes one change containing the toolchain, the Money value object, and rule resolution.

That would conflict with Decision 065 and with the requirement in PFOS-01 Section 65 that each milestone have explicit acceptance criteria before the next major milestone begins.

## Alternatives Considered

* Treat Section 47 as authoritative and deliver scaffolding, primitives, and Rule Engine as one milestone
* Rewrite Section 47 to remove the milestone language entirely
* Renumber the milestones so the two sections align textually

## Tradeoffs

Three separate milestones require three review cycles before any rule can be resolved.

## Consequences

PFOS-ENG-00 Section 47 is clarified to refer to a phase rather than a milestone.

No milestone content changes. Only the unit of work is clarified.

## Future Review Trigger

None, unless the milestone list in Section 48 is itself restructured.

---

# Decision 070: Financial Rounding Policy Is Unresolved and Blocks Milestone 1

**Status:** Superseded
**Superseded By:** Decision 071
**Scope:** Financial logic, Engineering

## Decision

PFOS has not yet chosen a single rounding method for monetary calculations.

The rounding policy must be resolved and recorded as an accepted decision before Milestone 1 Financial Primitives begins.

Milestone 0 Repository Foundation does not depend on it and may proceed.

## Why

Three sections currently describe rounding differently.

PFOS-ENG-00 Section 12 specifies rounding down, followed by deterministic remainder distribution in priority order.

PFOS-ENG-02 Section 15 specifies half-up rounding to the nearest cent for a single obligation, floor plus remainder distribution for pool splits, and states that the final implementation must define and test one consistent method.

PFOS-ENG-02 Section 29 recommends a largest-remainder method with a documented tie-break order, while PFOS-ENG-00 Section 12 and PFOS-ENG-02 Section 28 describe distribution by stable destination order.

These differences are observable in real results.

A ten percent obligation on $1,000.05 produces a raw value of 10,000.5 cents. Rounding down yields $100.00. Half-up yields $100.01.

Stable-order and largest-remainder distribution agree on an even three-way split, because every fractional remainder is equal. They can disagree on a percentage split.

The Money value object owns percentage allocation under PFOS-ENG-00 Section 10.3. It cannot be implemented correctly while the method is undecided.

## Alternatives Considered

* Choose a method during Milestone 1 implementation and document it afterward
* Implement multiple rounding strategies behind a configuration flag
* Defer the decision until the Allocation Engine milestone

The first would place a material financial decision inside an implementation task, contrary to PFOS-00 Principle 19 and to the requirement in `CLAUDE.md` that material ambiguities be reported before implementing assumptions.

The second would create two divergent paths through financial logic, contrary to PFOS-ENG-00 Section 39.

The third would leave Milestone 1 unable to deliver a complete Money primitive.

## Tradeoffs

Milestone 1 cannot begin until this is settled.

## Consequences

Milestone 0 may proceed immediately.

The resolving decision must state, at minimum:

* The rounding method for a single percentage obligation
* The distribution method for percentage pool splits
* The distribution method for even splits
* The complete tie-break ordering
* Whether one method applies uniformly to all monetary division

PFOS-ENG-00 Section 12, PFOS-ENG-02 Section 15, and PFOS-ENG-02 Section 29 must be reconciled to the chosen method once it is accepted.

## Future Review Trigger

Superseded by Decision 071, which resolves all five requirements listed above and lifts the Milestone 1 block.

---

# Decision 071: Unified Weighted Monetary Division

**Status:** Accepted
**Supersedes:** Decision 070
**Scope:** Financial logic, Architecture, Engineering

## Decision

All monetary division in PFOS uses one primitive.

```text
Money.allocateByWeights(total, weights)
```

The denominator is the sum of the supplied weights.

### Algorithm

1. Base share for each destination is `floor(total × wᵢ / Σw)`.
2. Residual `r = total − Σ base shares`.
3. Distribute `r` one cent at a time, largest fractional remainder first.
4. Break ties by lowest index in caller-supplied order.

The residual always satisfies `0 ≤ r < number of weights`. Exactly `r` destinations receive one additional cent, and no destination ever requires two.

The sum of the returned amounts equals the supplied total exactly.

### Single percentage obligation

A single percentage obligation is computed as the complementary two-way split:

```text
[rate, 10,000 − rate]
```

For two complementary weights the fractional parts sum to zero or one, so at most one cent is ever in play. Largest-remainder distribution therefore produces nearest-cent rounding, and an exact half goes to the obligation because the obligation occupies index 0.

Example:

```text
10% of $1,000.05 allocates $100.01.
```

The complement is an arithmetic device. It must never be emitted as an allocation line. The engine emits one line equal to the obligation amount and decrements the pool by exactly that amount.

### Multiple global obligations

Separately authored global rules are independent complementary two-way splits, each evaluated against its own configured income basis.

They are never combined into a single N-way split.

Each rule remains independently authored, versioned, traceable, and explainable.

### Even splits

Even splits use a weight of 1 for every eligible destination.

### Percentage pools

Authored percentage pools use basis points, where `Σw = 10,000`.

### Validation ownership

The Rule Engine validates authored configuration:

* An authored percentage pool totals exactly 10,000 basis points.
* An individual pool entry is between 0 and 10,000 basis points.
* A single rate is between 0 and 10,000 basis points and carries no sum requirement.

Money validates arithmetic preconditions only:

* Weights are non-empty.
* Every weight is a non-negative safe integer.
* The sum of the weights is at least 1.
* The total is non-negative.
* The product of the total in cents and the sum of the weights remains within the safe integer range.

Money never checks for 10,000.

### Negative totals

`allocateByWeights` rejects a negative total with a typed domain error.

Proportional reversals, including refunds under Decision 037, divide the absolute positive amount using the normal algorithm and then apply the negative sign to the resulting reversal records.

Ordinary Money addition, subtraction, and comparison remain signed.

### Primitive isolation

Money is unaware of buckets, bucket identifiers, priority ranks, stable order, capacities, eligibility, statuses, rules, rule versions, allocation stages, and every Allocation Engine type.

Money does not sort. The caller supplies canonical order, and the tie-break is positional.

### Rounding policy identity

Every Plan Snapshot records the rounding policy identifier used to produce it.

The initial value is:

```text
PFOS-ROUND-071-V1
```

## Why

Decision 070 required the resolving decision to state five things. This decision states all five:

1. **Rounding method for a single percentage obligation.** The complementary two-way split, which yields nearest-cent rounding with exact halves going to the obligation.
2. **Distribution method for percentage pool splits.** Largest fractional remainder over the supplied weights.
3. **Distribution method for even splits.** The same primitive with every weight equal to 1.
4. **Complete tie-break ordering.** Equal fractional remainder resolves to the lowest index in caller-supplied order. The Allocation Engine supplies canonical order as priority rank ascending with absent ranks last, then stable order ascending, then bucket identifier.
5. **Whether one method applies uniformly.** Yes. The single obligation, the even split, and the authored percentage pool are special cases of one weighted split.

A weighted primitive is required rather than optional. When a destination reaches its capacity and is removed, the surviving weights sum to less than 10,000 by definition. Any primitive that requires its inputs to total exactly 10,000 must renormalize the surviving weights, and renormalization is not exact in integers.

A 60/30/10 pool whose 10% destination is capped leaves true proportions of two-thirds and one-third. In basis points that is 6,666.67, which is not representable. Rounding the weights instead of the money shifts the split: on a $10,000 pool, renormalized weights of 6,667 and 3,333 produce 666,700 and 333,300 cents against an exact split of 666,667 and 333,333. The 33-cent deviation still conserves the total, so conservation tests pass and the error is silent.

Weighted division also serves Decision 037, where partial refunds restore the original proportions. Those weights are original cent amounts, which never total 10,000.

## Alternatives Considered

* Require every percentage split passed to Money to total exactly 10,000 basis points
* Use half-up rounding for single obligations and largest-remainder distribution for pools as two separate documented methods
* Distribute residual cents by stable destination order rather than by largest fractional remainder
* Choose a method during Milestone 1 implementation and document it afterward

The first is rejected for the reasons above. It cannot preserve exact relative proportions after capacity removal, and it introduces a second hidden rounding layer with its own tie-break rule when rounded weights fail to total 10,000.

The second would answer Decision 070's fifth question in the negative and would leave two rounding paths through financial logic, contrary to PFOS-ENG-00 Section 39.

The third gives residual cents to whichever destination sorts first regardless of entitlement, which is harder to explain under PFOS-00 Principle 9. It also conflicts with the largest-remainder recommendation already present in PFOS-ENG-02 Section 29.

The fourth was already rejected by Decision 070.

## Tradeoffs

Largest-remainder distribution requires tracking fractional remainders rather than simply walking a stable order, which is slightly more work to implement and test.

Adopting it amends PFOS-ENG-00 Section 12, a higher-authority document than the engine specification that recommended it. Under Decision 068 that amendment must be explicit rather than resolved silently in code, which this decision performs.

## Consequences

Milestone 1 is unblocked.

Milestone boundaries are preserved:

* Milestone 1 implements the Money primitive and its tests only.
* Milestone 2 implements Rule Engine authored-configuration validation.

PFOS-ENG-00 Sections 10.2, 10.3, 11, 12, and 44 are amended.

PFOS-ENG-01 Sections 13.3, 14.3, 15.1, 16.4, 21.1, 43.3, and 43.6 are amended.

PFOS-ENG-02 Sections 14, 15, 28, 29, 47, 56, 61, 63, 68, 76, 77, and 78 are amended.

The negate-after-split pattern for proportional reversals must be recorded in the Transaction Engine specification when that document is written.

## Future Review Trigger

Reconsider if PFOS adds a currency whose minor unit is not the cent, or if a monetary division case appears that cannot be expressed as a weighted split. A change to the algorithm requires a new rounding policy identifier so that existing Plan Snapshots continue to reproduce their original results.

---

# Decision 072: Capacity-Constrained Redistribution Recomputes the Split

**Status:** Accepted
**Related:** Decision 071
**Scope:** Financial logic, Architecture

## Decision

When a destination's proportional share exceeds its allocation capacity, the Allocation Engine fixes that destination at its capacity, removes it from eligibility, and recomputes the remaining pool against the surviving weights using `allocateByWeights`.

Previously calculated results are never patched incrementally.

Rules:

* Destinations that are ineligible for reasons other than capacity are excluded before the first round.
* Capacity removal occurs within rounds.
* If no surviving destination carries a positive weight, the engine stops, leaves the balance unallocated, and emits the appropriate warning and explanation. It does not call Money.
* Each round removes at least one destination or exhausts the pool, satisfying the termination requirement in PFOS-ENG-02 Section 66.

This behavior is owned by the Allocation Engine. Money is not involved in eligibility or capacity.

## Why

Both round-based recomputation and iterative excess redistribution produce identical results in exact rational arithmetic. They differ in rounding behavior.

Round-based recomputation performs exactly one rounding operation per round. Iterative excess redistribution rounds once per iteration and accumulates error across iterations.

One split per round also produces one explanation per round, which is simpler to present under PFOS-00 Principle 9.

## Alternatives Considered

* Iterative excess redistribution, as described in the original PFOS-ENG-02 Sections 18 and 34
* Proportional scaling of already-calculated results after a destination is capped

The first accumulates rounding error across iterations.

The second patches previously calculated results, which obscures the relationship between a destination's weight and its final amount and makes the allocation harder to explain.

## Tradeoffs

Recomputing the full remaining split on each round performs slightly more arithmetic than adjusting existing results. This is immaterial at the scale described in PFOS-ENG-02 Section 65.

## Consequences

PFOS-ENG-02 Sections 18, 34, 45, and 62 are amended.

Worked examples in PFOS-ENG-02 Sections 72 and 73 are unchanged. Both reproduce exactly under this behavior.

This decision targets Milestone 3 and does not authorize work outside it.

It may be reconsidered independently of Decision 071.

## Future Review Trigger

Reconsider if a rule type introduces a capacity that can increase during an allocation run, which would break the guarantee that each round strictly reduces the eligible destination count.

---

# Decision 073: Domain Errors Use Engine-Owned Error Code Registries

**Status:** Accepted
**Related:** Decisions 006, 068, 071
**Scope:** Architecture, Engineering

## Decision

The shared layer owns the domain error envelope. Each engine owns the registry of error codes it introduces.

### Shared ownership

`src/domain/shared/errors/` owns the `DomainError` envelope, the `Result` pattern, error categories, and the error codes belonging to shared primitives.

`ERROR_CODES` remains limited to the shared primitive families:

- `MONEY_*`
- `BASIS_POINTS_*`
- `DATE_*`

Engine-specific codes are never added to it.

`ErrorCategory` and `ERROR_CATEGORIES` remain shared and closed. This decision changes code ownership only. An engine maps its failures onto the existing categories defined by PFOS-ENG-00 and does not add new categories through its error registry.

### Generic envelope

`DomainError` and `DomainErrorInput` are generic over the code:

```ts
export interface DomainError<TCode extends string = string> {
  readonly code: TCode;
  readonly category: ErrorCategory;
  readonly summary: string;
  readonly details?: string;
  readonly affectedEntityIds?: readonly string[];
  readonly suggestedResolution?: string;
}

export interface DomainErrorInput<TCode extends string = string> {
  readonly code: TCode;
  readonly category: ErrorCategory;
  readonly summary: string;
  readonly details?: string;
  readonly affectedEntityIds?: readonly string[];
  readonly suggestedResolution?: string;
}

export function domainError<TCode extends string>(
  input: DomainErrorInput<TCode>,
): DomainError<TCode>;
```

The default of `string` allows an existing caller to name the shared envelope without supplying a type argument.

When a caller supplies a code from a closed registry, `TCode` preserves that registry's type.

### Engine ownership

Each engine declares its own closed literal union and constructs errors narrowed to that union.

The Rule Engine uses the `RULE_*` prefix:

```ts
export const RULE_ERROR_CODES = {
  // engine-owned codes
} as const;

export type RuleErrorCode =
  (typeof RULE_ERROR_CODES)[keyof typeof RULE_ERROR_CODES];

export type RuleDomainError = DomainError<RuleErrorCode>;

export function ruleError(
  input: DomainErrorInput<RuleErrorCode>,
): RuleDomainError;
```

A code outside the Rule Engine registry, including a valid shared `MONEY_*` or `DATE_*` code, is rejected by the Rule Engine constructor at compile time.

Future engines own their own registries under their own prefixes:

- Allocation Engine: `ALLOCATION_*`
- Goal Engine: `GOAL_*`

### Prohibited mechanisms

The shared layer must never import an engine error-code type.

Declaration merging and a global engine-code registry are prohibited.

A shared registry whose meaning changes depending on which engine modules are present would make a shared type depend implicitly on higher-level modules and create an unwanted coupling channel between engines.

### Enforcement

Because independently declared registries cannot provide compiler-enforced global uniqueness, registry separation is enforced by prefix conventions and architecture tests.

Architecture tests must enforce that:

- every Rule Engine error-code key and value begins with `RULE_`
- every registry key is identical to its value
- no Rule Engine error code appears in shared `ERROR_CODES`
- shared `ERROR_CODES` contains no engine-prefixed key or value
- shared `ERROR_CODES` contains only the shared primitive families
- engine and shared registry values are disjoint
- shared production sources import no engine module

The existing shared-primitive boundary tests are not weakened.

`RULE_*` constants do not belong in `domain/shared`.

### Runtime behavior

Milestone 1 `DomainError` runtime behavior is unchanged.

The construction function continues to freeze its result, omit absent optional properties rather than assigning them `undefined`, and preserve the existing immutable-envelope behavior.

This decision changes error-code typing and ownership, not the runtime error shape.

## Why

PFOS-ENG-00 requires domain failures to carry typed, stable codes, and PFOS-ENG-01 requires the Rule Engine to return typed errors with stable identifiers.

Before this decision, `DomainError.code` was constrained to the closed union exported by the shared primitive error registry.

That created a conflict: adding `RULE_*` codes to shared would give `domain/shared` Rule Engine vocabulary, violating the intended dependency boundary and the primitive-isolation architecture enforced by the existing shared-boundary tests.

The Rule Engine therefore needed a way to preserve a closed, typed error vocabulary without making shared own engine-specific names.

The shared envelope is generic; the engine owns the vocabulary.

This preserves both requirements.

## Alternatives Considered

- Add `RULE_*` codes to the shared registry
- Widen all domain error codes to bare `string`
- Introduce a branded global code type
- Use declaration merging to create a global engine-code registry

Adding `RULE_*` to shared is rejected because it weakens the architectural boundary in order to accommodate the code that boundary exists to exclude.

Using bare `string` is rejected because it discards the per-engine closed-union guarantee.

A branded shared code type is rejected because engine literals would require additional casts or constructors without solving the ownership problem.

Declaration merging is rejected because the effective definition of a shared type would depend on which engine modules participate in compilation.

## Tradeoffs

Global code uniqueness is no longer guaranteed by the compiler alone.

The guarantee moves to engine-specific prefixes plus architecture tests.

Exhaustive handling of every possible system error code as one universal union is no longer available automatically. Consumers instead handle the closed union belonging to the engine boundary they consume.

The shared envelope's default type parameter is broad, so engine constructors must explicitly narrow it to their engine-owned code union.

## Consequences

Milestone 2 can emit typed Rule Engine errors without adding Rule Engine vocabulary to shared primitives.

The Rule Engine owns `RULE_ERROR_CODES`, `RuleErrorCode`, `RuleDomainError`, and `ruleError`.

The Rule Engine registry is deliberately introduced incrementally. At adoption it contains only codes whose meanings are already settled by accepted decisions.

The first codes are the authored percentage-pool validation failures already assigned to the Rule Engine by Decision 071:

- `RULE_POOL_NOT_EXACTLY_100_PERCENT`
- `RULE_POOL_ENTRY_OUT_OF_RANGE`

Additional Rule Engine codes are introduced when the validation behavior they report is itself specified.

`src/domain/shared/errors/error-codes.ts` remains limited to the shared primitive families.

`ERROR_CATEGORIES` is unchanged and remains shared.

Future Allocation and Goal engines use the same ownership pattern with their own prefixes.

## Future Review Trigger

Reconsider if the number of engine registries makes prefix collision sufficiently difficult to manage that a compiler-enforced cross-engine mechanism becomes worth the additional coupling.

Also reconsider if error codes become persisted external identifiers that require runtime validation against a composed registry.

---

# Decision 074: ResolvedRuleSet Contract and M2/M3 Execution Boundary

**Status:** Accepted
**Related:** Decisions 006, 007, 010, 013, 014, 016, 017, 020, 021, 022, 023, 025, 026, 027, 028, 071, 072, 073
**Scope:** Financial logic, Architecture, Engineering

## Decision

`ResolvedRuleSet` is the single output of the Rule Engine and the single rule input to the Allocation Engine.

This decision fixes its exact TypeScript contract, resolving the deferral in PFOS-ENG-01 Section 23.

The Rule Engine resolves policy.

The Allocation Engine executes that resolved policy.

The Rule Engine must not calculate final allocation amounts.

The Allocation Engine must not independently re-resolve rule precedence.

## Root contract

```ts
export interface ResolvedRuleSet {
  // Provenance
  readonly resolvedRuleSetId: EntityId;
  readonly planVersionId: PlanVersionId;
  readonly schemaVersion: number;
  readonly roundingPolicyId: string;
  readonly resolvedAt: Timestamp;
  readonly evaluationDate: FinancialDate;
  readonly resolutionMode: ResolutionMode;
  readonly historicalSnapshotId?: EntityId;
  readonly sourceRuleVersionIds: readonly EntityId[];

  // Executable output
  readonly allocationBasis: AllocationBasis;
  readonly stageSequence: readonly AllocationStage[];
  readonly globalObligations: readonly ResolvedGlobalObligation[];
  readonly topPriorities: ResolvedTopPriorityPlan;
  readonly requiredFundingRules: readonly ResolvedFundingRule[];
  readonly lowerPriorityPool: ResolvedPoolPlan;
  readonly leftoverPolicy: ResolvedLeftoverPolicy;
  readonly rolloverPolicies: readonly ResolvedRolloverPolicy[];
  readonly goalPolicies: readonly ResolvedGoalPolicy[];

  // Non-executable output
  readonly skippedRules: readonly SkippedRule[];
  readonly warnings: readonly DomainWarning[];
  readonly explanations: readonly RuleExplanation[];
}
```

PFOS-ENG-01 Section 23's `effectiveAt` concept is represented by two fields:

- `evaluationDate: FinancialDate` for the date against which rules are evaluated
- `resolvedAt: Timestamp` for the moment the resolution occurred

This follows PFOS-ENG-00's distinction between date-only financial concepts and moments in time.

## Identity and provenance

```ts
export type PlanVersionId = EntityId;

export type ResolutionMode =
  | 'PREVIEW'
  | 'SIMULATION'
  | 'HISTORICAL_RECALCULATION';
```

`PlanVersionId` is a semantic provenance alias for V1. No second branded identifier type is introduced.

`planVersionId` identifies the version of the user's plan configuration from which the resolved rule set was produced.

It is not:

- `resolvedRuleSetId`
- a Plan Snapshot identifier
- `historicalSnapshotId`

V1 preserves that distinction through field names, construction paths, documentation, and tests rather than through a second identifier brand.

`resolutionMode` records the resolution context so simulated or historical results cannot be mistaken for ordinary preview resolution.

## Enumerations

```ts
export type AllocationBasis =
  | 'NET_AMOUNT'
  | 'ELIGIBLE_AMOUNT';

export type IncomeBasis =
  | 'NET_DEPOSITED';

export type Recurrence =
  | 'MONTHLY';

export type PercentageBasis =
  | 'PERCENT_OF_TOTAL_INCOME'
  | 'PERCENT_OF_REMAINING_POOL';

export type AllocationStage =
  | 'GLOBAL_OBLIGATION'
  | 'TOP_PRIORITY'
  | 'REQUIRED_RECURRING'
  | 'GOAL_FUNDING'
  | 'LOWER_PRIORITY'
  | 'EVERYDAY_SPENDING'
  | 'LEFTOVER_POLICY'
  | 'EVENT_OVERRIDE';
```

`allocationBasis` identifies which starting amount the Allocation Engine uses. It does not carry or calculate that amount.

`IncomeBasis` is a separate selector describing the authored income basis of an obligation.

V1 exposes only `NET_DEPOSITED`.

`Recurrence` supports only `MONTHLY` in V1. No additional recurrence may be introduced without an accepted specification.

`PercentageBasis` keeps percent-of-total-income and percent-of-remaining-pool as explicit, distinct concepts.

## Allocation stage ownership

The Rule Engine owns `AllocationStage`.

PFOS-ENG-02 enumerates the stages, but the resolved rule set determines their order.

The type therefore belongs under the Rule Engine contract layer, and the Allocation Engine imports and consumes it.

`domain/rules` must not import an Allocation Engine type merely to express a sequence the Rule Engine owns.

`EVERYDAY_SPENDING` remains part of the documented stage vocabulary but is not emitted by V1.

V1 represents lower-priority and everyday-spending behavior through one executable lower-priority pool.

## Global obligations

```ts
export interface ResolvedGlobalObligation {
  readonly obligationId: EntityId;
  readonly ruleVersionId: EntityId;
  readonly destinationBucketId: EntityId;
  readonly rateBasisPoints: BasisPoints;
  readonly incomeBasis: IncomeBasis;
  readonly maximumAmount?: Money;
  readonly sequence: number;
}
```

Separately authored obligations remain independent.

They are not collapsed into one N-way percentage split.

`sequence` is financially meaningful where separately authored obligations must be evaluated in a defined order.

Decision 071 supplies the uniform monetary-division and rounding rules.

No per-rule rounding field exists.

## Top priorities

```ts
export type ResolvedTopPriorityPlan =
  | {
      readonly strategy: 'SEQUENTIAL';
      readonly entries: readonly ResolvedTopPriorityEntry[];
    }
  | {
      readonly strategy: 'PERCENTAGE_SPLIT';
      readonly entries: readonly ResolvedTopPriorityShare[];
    };

export interface ResolvedTopPriorityEntry {
  readonly bucketId: EntityId;
  readonly rank: number;
  readonly ruleVersionIds: readonly EntityId[];
}

export interface ResolvedTopPriorityShare
  extends ResolvedTopPriorityEntry {
  readonly shareBasisPoints: BasisPoints;
}
```

The Rule Engine chooses the strategy.

Top-priority entries are ordered by ascending rank.

Percentage-split shares are authored `BasisPoints` values and are validated by M2 under Decision 071 before M3 receives them.

M3 does not reinterpret or re-resolve the top-priority strategy.

## Required funding rules

```ts
export interface ResolvedFundingRule {
  readonly bucketId: EntityId;
  readonly ruleVersionId: EntityId;
  readonly sequence: number;
  readonly isProtected: boolean;
  readonly allowExcessAboveCapacity: boolean;
  readonly funding: FundingRuleConfig;
}

export type FundingRuleConfig =
  | {
      readonly type: 'PERCENTAGE_OF_INCOME';
      readonly rateBasisPoints: BasisPoints;
      readonly incomeBasis: IncomeBasis;
      readonly maximumAmount?: Money;
    }
  | {
      readonly type: 'FIXED_PER_PAYCHECK';
      readonly amount: Money;
      readonly startDate?: FinancialDate;
      readonly endDate?: FinancialDate;
      readonly maximumAmount?: Money;
    }
  | {
      readonly type: 'FIXED_MONTHLY';
      readonly monthlyTarget: Money;
      readonly allowExtraContributions: boolean;
    }
  | {
      readonly type: 'RECURRING_BILL';
      readonly targetAmount: Money;
      readonly dueDate: FinancialDate;
      readonly recurrence: Recurrence;
    }
  | {
      readonly type: 'GOAL_UNTIL_TARGET';
      readonly targetAmount: Money;
      readonly deadline?: FinancialDate;
      readonly stopAtTarget: boolean;
      readonly allowManualExcess: boolean;
    }
  | {
      readonly type: 'MONTHLY_MINIMUM_PLUS_EXTRA';
      readonly monthlyMinimum: Money;
      readonly extraEligible: boolean;
    }
  | {
      readonly type: 'UNLIMITED';
      readonly minimumAmount?: Money;
    }
  | {
      readonly type: 'DEBT_PAYOFF';
      readonly minimumPayment: Money;
      readonly dueDate?: FinancialDate;
      readonly extraPaymentEligible: boolean;
      readonly targetPayoffAmount?: Money;
    };
```

Every variant is a discriminated union.

The Rule Engine emits authored monetary requirements where the rule itself stores money.

It does not calculate the amount that will actually be allocated.

`allowExcessAboveCapacity` records resolved policy. Capacity itself is calculated by M3 from bucket state.

`isProtected` records whether the requirement receives protected treatment under the Allocation Engine specification.

## No V1 recurring-bill underfunding configuration

`RECURRING_BILL` carries no `underfundingBehavior`.

The specification names the concept without defining its values or semantics.

M2 describes the authored requirement.

M3 calculates funded and unmet amounts.

A configurable underfunding policy requires a later accepted decision.

## Lower-priority pool

```ts
export type ResolvedPoolPlan =
  | {
      readonly strategy: 'EVEN_SPLIT';
      readonly destinations: readonly ResolvedPoolDestination[];
    }
  | {
      readonly strategy: 'PERCENTAGE_SPLIT';
      readonly basis: PercentageBasis;
      readonly destinations: readonly ResolvedPoolShare[];
    }
  | {
      readonly strategy: 'FIXED_AMOUNTS';
      readonly destinations: readonly ResolvedPoolFixedAmount[];
    };

export interface ResolvedPoolDestination {
  readonly bucketId: EntityId;
  readonly ruleVersionIds: readonly EntityId[];
}

export interface ResolvedPoolShare
  extends ResolvedPoolDestination {
  readonly shareBasisPoints: BasisPoints;
}

export interface ResolvedPoolFixedAmount
  extends ResolvedPoolDestination {
  readonly amount: Money;
  readonly sequence: number;
}
```

V1 represents lower-priority and everyday-spending allocation as one executable `lowerPriorityPool`.

A separate `everydaySpendingRules` field is not part of V1.

Two executable pools require a later accepted decision establishing behavior that meaningfully distinguishes them.

`FIXED_AMOUNTS` uses `sequence` where competition order is financially meaningful.

Set-like percentage and even-split destinations do not derive financial meaning from array index.

## Leftover policy

```ts
export type ResolvedLeftoverPolicy =
  | {
      readonly policyType: 'LEAVE_UNALLOCATED';
    }
  | {
      readonly policyType: 'SINGLE_DESTINATION';
      readonly destinationBucketId: EntityId;
    }
  | {
      readonly policyType: 'PERCENTAGE_SPLIT';
      readonly destinations: readonly ResolvedPoolShare[];
    }
  | {
      readonly policyType: 'HIGHEST_PRIORITY_UNFINISHED_GOAL';
    }
  | {
      readonly policyType: 'MAINTAIN_BUFFER_THEN_REDIRECT';
      readonly bufferAmount: Money;
      readonly destinationBucketId: EntityId;
    };
```

## No V1 leftover fallback

No leftover-policy variant carries a fallback.

If a destination cannot receive the remainder and no existing policy redirects it, the remainder stays unallocated.

The fallback language in PFOS-ENG-02 is treated as forward-looking until an explicit fallback contract is accepted.

`HIGHEST_PRIORITY_UNFINISHED_GOAL` carries no resolved goal-state calculation.

The Goal Engine/orchestrator supplies or determines the relevant goal state; M2 does not compute funded state as allocation arithmetic.

## Rollover policies

```ts
export interface ResolvedRolloverPolicy {
  readonly bucketId: EntityId;
  readonly ruleVersionId: EntityId;
  readonly policy: RolloverPolicyConfig;
}

export type RolloverPolicyConfig =
  | {
      readonly policyType: 'CARRY_ALL';
    }
  | {
      readonly policyType: 'RESET';
    }
  | {
      readonly policyType: 'CARRY_TO_CAP';
      readonly capAmount: Money;
    }
  | {
      readonly policyType: 'REDIRECT_EXCESS';
      readonly capAmount: Money;
      readonly destinationBucketId: EntityId;
    }
  | {
      readonly policyType: 'APPLY_LEFTOVER_POLICY';
      readonly capAmount: Money;
    };
```

## Goal policies

```ts
export interface ResolvedGoalPolicy {
  readonly bucketId: EntityId;
  readonly ruleVersionId: EntityId;
  readonly stopAtTarget: boolean;
  readonly allowManualExcess: boolean;
  readonly autoStartNextCycle: boolean;
  readonly resumeRequiresConfirmation: boolean;
}
```

This is configuration only.

The resolved rule set does not carry computed goal balances or derive a final funded amount.

## Rule Engine-owned registries

The Rule Engine owns three independent closed code registries:

```text
RULE_*          Rule Engine errors
RULE_EXPLAIN_*  Rule Engine explanation codes
RULE_SKIP_*     Rule Engine skip-reason codes
```

Errors, skip reasons, and explanations are intentionally different concepts.

An error represents a domain failure.

A skip reason is a machine-readable rule-resolution outcome.

An explanation is user-facing reasoning about how resolution occurred.

They must not be conflated.

## Skipped rules

```ts
export interface SkippedRule {
  readonly ruleId: EntityId;
  readonly ruleVersionId?: EntityId;
  readonly reasonCode: RuleSkipReasonCode;
  readonly affectedEntityIds: readonly EntityId[];
}

export type RuleSkipReasonCode =
  | 'RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE'
  | 'RULE_SKIP_SUPERSEDED_BY_HIGHER_PRECEDENCE'
  | 'RULE_SKIP_INCOME_SOURCE_EXCLUDED'
  | 'RULE_SKIP_DESTINATION_ARCHIVED'
  | 'RULE_SKIP_GOAL_FUNDED_ALLOCATION_PAUSED'
  | 'RULE_SKIP_EVENT_OVERRIDE_SKIPPED';
```

The reasons correspond to Rule Engine resolution outcomes already described by PFOS-ENG-01 and PFOS-ENG-02.

Allocation-time conditions such as no remaining income, a capacity reached during execution, or a monthly requirement already satisfied are not Rule Engine skip reasons.

They belong to M3 runtime reporting.

An invalid destination that blocks rule activation is a validation error rather than a skipped resolved rule.

## Rule explanation codes

```ts
export type RuleExplanationCode =
  | 'RULE_EXPLAIN_RESOLUTION_CONTEXT'
  | 'RULE_EXPLAIN_RULE_APPLIED'
  | 'RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY'
  | 'RULE_EXPLAIN_RULE_OVERRIDDEN'
  | 'RULE_EXPLAIN_DEFAULT_INHERITED'
  | 'RULE_EXPLAIN_RULE_SKIPPED';
```

The union derives from PFOS-ENG-01 Section 24's explainability contract.

`RULE_EXPLAIN_RESOLUTION_CONTEXT` covers the inputs and rule/plan context used during resolution.

`RULE_EXPLAIN_RULE_APPLIED` records a selected rule.

`RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY` records an additive rule that survives alongside another applicable rule.

`RULE_EXPLAIN_RULE_OVERRIDDEN` records a lower-precedence rule replaced by a higher-precedence rule.

`RULE_EXPLAIN_DEFAULT_INHERITED` records inheritance of an applicable default where no replacing override exists.

`RULE_EXPLAIN_RULE_SKIPPED` records a skipped rule and pairs with the machine-readable `RULE_SKIP_*` reason.

Warning categories remain on the warning channel as `DomainWarning` and are not duplicated as explanation codes.

`RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY` has no producer until additive-versus-replacing behavior is fully classified.

## Explanation envelope ownership

The shared layer owns an engine-agnostic explanation envelope.

Each engine owns its explanation-code vocabulary.

Shared never imports an engine explanation type.

```ts
export interface Explanation<
  TCode extends string = string,
  TDetail = never,
> {
  readonly code: TCode;
  readonly title: string;
  readonly summary: string;
  readonly affectedEntityIds: readonly EntityId[];
  readonly details?: readonly TDetail[];
  readonly ruleVersionIds?: readonly EntityId[];
  readonly severity?: ExplanationSeverity;
}

export type ExplanationSeverity =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING';

export type RuleExplanation =
  Explanation<RuleExplanationCode>;
```

The shared envelope uses `affectedEntityIds`, aligning error, warning, and explanation output around the same affected-entity terminology.

A concrete `RuleExplanationDetail` vocabulary is not introduced in V1.

The second generic argument therefore remains `never` for Rule Engine explanations, making structured details unavailable rather than merely unused.

V1 Rule Engine explanations still carry the stable code, title, summary, affected entity identifiers, and optional rule-version identifiers and severity.

## No per-rule rounding

Decision 071 is authoritative.

`ResolvedRuleSet` carries:

```ts
readonly roundingPolicyId: string;
```

and no per-rule rounding strategy.

PFOS-ENG-01's configurable per-rule rounding field and PFOS-ENG-02's corresponding per-rule input are superseded for V1 by Decision 071's uniform monetary-division policy.

`roundingPolicyId` is a string rather than the current literal so a historical snapshot can preserve the identifier that applied when that snapshot was created.

## M2 ownership

The Rule Engine owns rule resolution.

It:

- resolves precedence and inheritance
- selects the applicable rule version by effective date
- determines the allocation basis
- determines the allocation-stage sequence
- resolves global obligations
- resolves the top-priority strategy and membership
- determines required-funding competition order
- resolves the lower-priority strategy
- resolves leftover policy
- resolves rollover policy
- resolves goal policy
- validates authored single percentages
- validates authored percentage pools
- detects Rule Engine cycles and invalid references
- emits warnings
- emits skipped-rule reasons
- emits explanations
- records provenance and the rounding-policy identifier
- canonicalizes its result deterministically

The Rule Engine must not calculate final allocation amounts.

The only `Money` values permitted in `ResolvedRuleSet` are authored monetary requirements that a rule itself stores.

The resolved set does not contain calculated:

- allocation amounts
- remaining pools
- capacity amounts
- shortfalls
- unmet amounts
- allocation lines
- allocation components

## M3 ownership

The Allocation Engine owns monetary execution.

It:

- establishes the executable pool from the basis M2 names
- computes obligation amounts using the shared monetary-division primitive
- derives destination capacity from current bucket state
- executes sequential top-priority funding
- executes percentage top-priority funding
- executes required-funding rules
- performs capacity-constrained redistribution under Decision 072
- executes lower-priority allocation
- executes the leftover policy
- calculates the remaining pool
- calculates shortfalls and unmet amounts
- calculates available-to-allocate
- emits allocation lines and components
- verifies the allocation conservation invariant

The Allocation Engine must not re-resolve rule precedence.

It consumes `ResolvedRuleSet` as authoritative input.

## Plan Snapshot relationship

A Plan Snapshot stores the resolved configuration by value so historical results can be reconstructed without relying on mutable current rules.

The snapshot includes the complete `ResolvedRuleSet`, including:

- `roundingPolicyId`
- `evaluationDate`
- resolved executable structures
- warnings
- explanations
- skip outcomes
- provenance

`sourceRuleVersionIds` and `planVersionId` remain references identifying the versions that produced the resolved values.

Snapshot-specific event history remains outside `ResolvedRuleSet`.

Examples include:

- event type
- event identifier
- snapshot creation timestamp
- confirmed event overrides

Overrides are inputs to resolution and are recorded as event history at confirmation; they are not themselves part of the resolved answer.

## Deterministic ordering and canonicalization

Identical inputs must produce a deep-equal `ResolvedRuleSet`.

Two different ordering responsibilities exist and must not be confused.

### Rule Engine-owned financial ordering

M2 owns:

- `stageSequence`
- top-priority entries ordered by ascending rank
- global obligations ordered by financially meaningful `sequence`
- required funding rules ordered by financially meaningful `sequence`
- `FIXED_AMOUNTS` destinations ordered by financially meaningful `sequence`

These orderings affect execution semantics.

### Allocation Engine-owned residual-cent ordering

M3 owns destination canonical ordering for residual-cent tie-breaks.

The canonical order defined by PFOS-ENG-02 and Decision 071 is:

1. priority rank ascending, with unranked destinations last
2. stable order ascending
3. bucket identifier lexicographic

Those sort keys belong to Allocation Engine bucket state.

`ResolvedRuleSet` therefore does not carry a second canonical destination-order list.

### Reproducibility-only ordering

Arrays whose index has no financial meaning are still emitted canonically for deterministic deep equality.

For V1:

- set-like pool destinations are ordered by bucket identifier
- leftover percentage destinations are ordered by bucket identifier
- rollover policies are ordered by bucket identifier
- goal policies are ordered by bucket identifier
- `sourceRuleVersionIds` is de-duplicated and sorted
- `skippedRules` is ordered by rule identifier

Objects and arrays in the resolved contract are immutable and frozen according to domain conventions.

## Why

PFOS-ENG-01 described the Rule Engine as authoritative for rule applicability, precedence, inheritance, and resolution, while PFOS-ENG-02 consumed a `ResolvedRuleSet` without a final contract defining what that object contained.

Without a fixed boundary, M2 could not produce a stable output and M3 would be forced to guess at Rule Engine semantics.

That would violate the architecture principle that each financial calculation and policy decision has one authoritative owner.

This decision gives M2 a complete policy output and gives M3 a complete execution input.

The contract includes only values M3 needs in order to execute without re-resolving policy.

It excludes calculated monetary results that belong to M3.

## Alternatives Considered

- Keep separate `lowerPriorityRules` and `everydaySpendingRules`
- Let the Allocation Engine own `AllocationStage`
- Introduce a separately branded `PlanVersionId`
- Define a concrete shared `ExplanationDetail`
- Support configurable per-rule rounding
- Define configurable recurring-bill underfunding behavior
- Define a configurable leftover fallback
- Put a canonical destination ordering directly into `ResolvedRuleSet`
- Reuse skip-reason codes as explanation codes

Separate lower-priority and everyday-spending structures are rejected for V1 because the current product decisions define one executable lower-priority/everyday category concept.

Allocation Engine ownership of `AllocationStage` is rejected because M2 owns the sequence and M3 consumes it; reversing the dependency would make the producer import a type from its consumer.

A separate `PlanVersionId` brand is rejected for V1 because the architecture currently uses one opaque entity-identifier primitive and the additional brand provides limited value relative to its complexity.

A concrete `ExplanationDetail` is deferred because no specification defines its vocabulary.

Per-rule rounding is rejected by Decision 071.

Configurable recurring-bill underfunding behavior is deferred because its values and semantics are unspecified.

A configurable leftover fallback is deferred because its shape and semantics are unspecified.

A destination ordering in `ResolvedRuleSet` is rejected because M3 already owns the bucket-state fields required for its residual-cent ordering.

Skip reasons and explanations remain separate because they serve different consumers and purposes.

## Tradeoffs

The contract is intentionally broad because it represents the complete M2-to-M3 policy boundary.

`EVERYDAY_SPENDING` exists in the stage union despite having no V1 producer.

`RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY` exists despite having no producer until additive/replacing semantics are settled.

`PlanVersionId` is semantically distinct but not type-distinct from another `EntityId`, so misuse must be prevented through construction paths and tests rather than branding.

Structured Rule Engine explanation details remain unavailable in V1.

Some existing engineering-spec text is superseded by this decision, particularly the previously listed per-rule rounding configuration, the undefined recurring-bill underfunding field, and the undefined leftover fallback.

## Consequences

Milestone 2 may implement the approved contract types.

Milestone 3 may design and implement against a fixed Rule Engine output.

The Rule Engine output contract no longer depends on Allocation Engine types.

The Allocation Engine receives enough information to execute without deciding precedence itself.

Architecture tests should enforce the distinct Rule Engine code prefixes:

- `RULE_*`
- `RULE_EXPLAIN_*`
- `RULE_SKIP_*`

Changing the persisted resolved contract after snapshots exist requires a schema-version change.

## Remaining Milestone 2 semantic blockers

Decision 074 fixes the `ResolvedRuleSet` contract.

It does not resolve every remaining M2 semantic question.

These are not a general prohibition on M2 implementation. Components whose governing contracts are already settled may proceed.

### C — Additive versus replacing semantics

PFOS-ENG-01 establishes precedence except where a rule type defines additive behavior, but it does not classify every relevant rule category as additive or replacing.

This gates:

- precedence resolution
- resolver behavior
- production of `RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY`

The approved contract can represent either result.

### D — Minimum top-priority count

The specification says top priorities may number one to three while also referring to cases where zero may be permitted during onboarding.

The exact condition is not defined.

This gates top-priority validation only.

The resolved contract can represent an empty entry list under either final rule.

### E — Rule ordering versus allocation-destination ordering

This decision treats the two orderings as separate.

Rule-vs-rule precedence and tie-breaking belong to M2.

Residual-cent destination ordering belongs to M3 and uses Allocation Engine bucket state.

No further decision is required unless a contrary specification interpretation appears.

A contrary interpretation would require amending Decision 074.

### F — Eligible-income computation ownership

The specifications distinguish between the Rule Engine determining eligibility treatment and the Allocation Engine consuming an `eligibleAmount`, while also prohibiting the Rule Engine from performing final monetary calculations.

The exact owner of eligible-income aggregation and double-count prevention remains unresolved.

This gates eligible-income computation ownership.

It does not change the `ResolvedRuleSet` contract because the contract names the selected basis rather than carrying the computed amount.

## Future Review Trigger

Reconsider this contract if:

- a new rule category cannot be expressed by the existing unions
- everyday spending acquires behavior distinct from lower-priority allocation
- configurable leftover fallback becomes a product requirement
- configurable recurring-bill underfunding behavior becomes a product requirement
- a recurrence other than monthly is specified
- a Rule Engine structured explanation-detail vocabulary is defined
- multi-currency support changes the monetary shapes
- a persisted resolved-contract field changes meaning

Any incompatible persisted contract change requires a schema-version increment so existing Plan Snapshots continue to reproduce the rules under which they were created.

---

# Decision 075: Zero Sequential Top Priorities Are Allowed With a Warning

**Status:** Accepted
**Related:** Decisions 006, 013, 053, 068, 071, 073, 074
**Scope:** Financial logic, Architecture, Engineering, UX

## Decision

A resolved top-priority plan may contain zero entries under the `SEQUENTIAL` strategy.

Zero entries is a valid resolution result, not a validation failure. The Rule Engine resolves the plan, emits a visible warning, and returns a complete `ResolvedRuleSet`.

## Sequential

A `ResolvedTopPriorityPlan` with `strategy: 'SEQUENTIAL'` and an empty `entries` array is valid.

The Rule Engine must emit a warning stating that no top priorities are configured.

The warning travels on the existing `DomainWarning` channel defined by PFOS-ENG-00 §21 and carried by `ResolvedRuleSet.warnings` under Decision 074. This decision introduces no new code registry.

The warning must be visible, as PFOS-ENG-01 §21.2 requires of every warning.

## Percentage split

A `ResolvedTopPriorityPlan` with `strategy: 'PERCENTAGE_SPLIT'` and an empty `entries` array remains a hard validation error.

An empty authored pool totals zero basis points, which fails the authored-pool rule established by Decision 071 and stated in PFOS-ENG-01 §13.3. It reports the existing Rule Engine code `RULE_POOL_NOT_EXACTLY_100_PERCENT` introduced by Decision 073.

No new error code is required.

## Superseded specification text

PFOS-ENG-01 §13.1 lists among the conditions validation should prevent:

> Zero top priorities when the plan requires them, unless allowed by onboarding.

That bullet is superseded.

The remaining three bullets in §13.1 — more than three top priorities in V1, duplicate priority positions, and inactive or archived buckets as active priorities — are unchanged.

## No onboarding state in rule evaluation

The Rule Engine does not receive, infer, or consult onboarding state.

PFOS-ENG-01 §25 does not include onboarding state in the evaluation context, and §26 forbids resolution from depending on UI state. Zero top priorities resolves identically regardless of how the user arrived at that configuration.

## Why

Exactly one sentence in the corpus addressed zero top priorities, and it conditioned a hard error on two undefined terms.

"When the plan requires them" is defined nowhere. No bucket type, rule category, or plan state is designated as requiring top priorities.

"Unless allowed by onboarding" refers to a state the Rule Engine is never given. PFOS-ENG-01 §25 omits it from the evaluation context and §26 forbids depending on UI state. The clause was therefore not implementable deterministically.

The surrounding specification already treats zero as permitted:

- PFOS-ENG-01 §21.1 enumerates hard validation errors and lists both neighbouring top-priority failures, duplicate ranks and more than three, while omitting zero.
- PFOS-ENG-02 §61 lists Allocation Engine validation errors and likewise omits it.
- PFOS-ENG-02 §78 already specifies the runtime outcome as a property test: if no destination is eligible, all money remains unallocated.

Higher-authority documents require the permissive reading.

Decision 053 states that the app must clearly indicate optional setup gaps without blocking use. PRD §47 makes priority selection step 5 of onboarding and states that most nonessential setup steps should be skippable, while steps 7 and 8 are entering a paycheck and viewing an Allocation Preview. Treating zero as a hard error would prevent a user who skipped step 5 from reaching step 8.

Decision 013 and PRD §16 both state that users may select approximately one to three top priorities. Constitution Principle 5 states that the final financial decision belongs to the user, and Principle 2 lists ranked priority funding as an opinionated default rather than a requirement.

Under Decision 068 a lower-authority document may not contradict a higher one, and an apparent conflict must be resolved by explicit amendment rather than silently in code. This decision performs that amendment.

## Alternatives Considered

- Require at least one top priority, making zero a hard validation error
- Allow zero during draft and preview but reject it at confirmation
- Define an onboarding state and formalize the existing §13.1 exemption

Requiring at least one top priority contradicts Decision 053 at a higher authority level by blocking use on an incomplete setup gap. It would break the onboarding sequence in PRD §47, and it would force reintroducing an onboarding exemption, which is the same undefined concept this decision removes.

Allowing zero until confirmation cannot be owned by the Rule Engine. Decision 074 defines `ResolutionMode` as `PREVIEW`, `SIMULATION`, and `HISTORICAL_RECALCULATION`. Confirmation is an orchestration step under PFOS-ENG-02 §57 and is not visible at resolution time. The check would have to live in the orchestrator or the Allocation Engine, splitting one validation rule across two owners against Decision 006. It would also still block the user before their first confirmed allocation.

Defining an onboarding state would add a field to the evaluation context solely to make one validation rule conditional, and would make rule resolution depend on where the user is in the interface. PFOS-ENG-01 §26 forbids that.

## Tradeoffs

A user who intended to configure top priorities but did not complete the step receives a warning rather than a block, and money flows past the top-priority stage to later stages.

Warnings are easier to overlook than errors. PFOS-ENG-01 §21.2 requires warnings to be visible, and the presentation layer carries the responsibility for making this one noticeable.

The two strategies now validate asymmetrically: an empty `SEQUENTIAL` plan is valid while an empty `PERCENTAGE_SPLIT` plan is a hard error. The asymmetry is not arbitrary. A percentage pool makes an arithmetic claim that must total exactly 10,000 basis points, and an empty pool cannot satisfy it. A sequential list makes no such claim. The asymmetry must nonetheless be tested and explained.

## Consequences

Blocker D from Decision 074 is closed.

`ResolvedRuleSet` requires no change. `ResolvedTopPriorityPlan.entries` is already a plain readonly array in both variants, and Decision 074 anticipated this outcome by recording that the contract can represent an empty entry list under either final rule.

Allocation Engine behavior requires no change. PFOS-ENG-02 §62 and §78 already define the runtime outcome, and the `TOP_PRIORITY` stage with zero entries allocates nothing and passes the pool to the following stage.

No new error code is introduced. No new code registry is introduced.

PFOS-ENG-01 §13.1 is amended as described above.

PFOS-ENG-01 §21.2 gains a warning for an unconfigured top-priority list.

PFOS-ENG-01 §43.3 gains two validation tests: an empty `SEQUENTIAL` plan resolves successfully and warns, and an empty `PERCENTAGE_SPLIT` pool is rejected as a hard error.

Milestone 2 may implement top-priority validation. Blockers C and F remain open and continue to gate the work they name.

## Future Review Trigger

Reconsider if a rule type is introduced that genuinely requires at least one top priority in order to terminate or to produce a defined result, which would give "when the plan requires them" a concrete meaning for the first time.

Reconsider the warning channel if Rule Engine warning codes are later moved into a typed engine-owned registry under the Decision 073 pattern, since this warning would then need a registered code.

---

# Decision 076: Top-Priority Count and Rank Validation Codes

**Status:** Accepted
**Related:** Decisions 068, 071, 073, 074, 075
**Scope:** Architecture, Engineering

## Decision

The Rule Engine registry gains two error codes, so that the top-priority validation already required by PFOS-ENG-01 §13.1 and §21.1 can be implemented:

```text
RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM
RULE_TOP_PRIORITY_DUPLICATE_RANK
```

This decision names codes for behavior that is already accepted. It establishes no new validation rule, changes no financial semantics, and settles no question that Decision 075 left open.

## Validated contract

Validation operates on `ResolvedTopPriorityPlan`, the type in which Decision 075 already states the corresponding rules.

That type carries everything these two checks require. `entries` supplies the count under either strategy, and `rank` on `ResolvedTopPriorityEntry` — inherited by `ResolvedTopPriorityShare` — supplies the value compared for duplication. Neither check reads any other field, and neither reads anything outside the plan.

No authored `Rule` or `RuleVersion` contract is required, and none is introduced here.

## Behavior

Both rules apply under either strategy, because PFOS-ENG-01 §13.1 limits top priorities as such rather than limiting a particular strategy.

A plan with more than three entries reports `RULE_TOP_PRIORITY_COUNT_ABOVE_MAXIMUM`.

A plan in which two entries share a `rank` reports `RULE_TOP_PRIORITY_DUPLICATE_RANK`.

Both are hard validation errors under PFOS-ENG-01 §21.1 and use the shared `VALIDATION` category. Decision 073 does not authorise a new category.

## Independent validators

Each rule may be implemented as its own bounded validator, for example:

```ts
export function validateTopPriorityCount(
  plan: ResolvedTopPriorityPlan,
): Result<void, RuleDomainError>;

export function validateTopPriorityRanks(
  plan: ResolvedTopPriorityPlan,
): Result<void, RuleDomainError>;
```

A single combined validator is not required. The authored percentage-pool total validator established by Decision 071 remains separate from both.

This decision therefore does not establish how simultaneous validation failures are aggregated, ordered, or reported together. Each validator answers one question about one plan. A composite validation contract, if one is ever needed, requires its own accepted decision.

## Unchanged by this decision

A `ResolvedTopPriorityPlan` with `strategy: 'SEQUENTIAL'` and zero entries remains valid under Decision 075. This decision introduces no error for that case, and neither rule can fire on an empty entry list. The warning Decision 075 requires for that case is neither named nor implemented here.

A `ResolvedTopPriorityPlan` with `strategy: 'PERCENTAGE_SPLIT'` and zero entries remains a hard validation error reporting the existing `RULE_POOL_NOT_EXACTLY_100_PERCENT`. No second code is introduced for that case.

The superseded zero-top-priorities bullet in PFOS-ENG-01 §13.1 stays superseded. This decision concerns only the two bullets Decision 075 left unchanged.

No constraint on `rank` beyond duplicate detection is introduced. Ranks are not required to be positive, contiguous, to start at one, or to match array position. No accepted source requires any of those, and this decision adds none.

Bucket status validation — inactive or archived buckets as active priorities — is not addressed. It requires bucket state that no current contract supplies.

Blocker C and Blocker F remain open and continue to gate the work they name. This decision introduces no precedence behavior, no inheritance behavior, and no eligible-income behavior.

## Why

PFOS-ENG-01 §13.1 and §21.1 already make both conditions hard validation errors, and Decision 075 expressly preserved both bullets while recording that Milestone 2 may implement top-priority validation. The only thing preventing implementation is that no accepted document names the codes.

Decision 073 introduces engine codes as the behavior they report becomes specified. That behavior is specified, so the codes belong in the registry now. Because a released code must not change meaning, the names are fixed by decision rather than chosen inside an implementation commit.

The names place the subject before the condition, matching every existing code in every registry.

The number three is deliberately absent from the code name. The V1 limit may change; the meaning "more than the allowed maximum" does not.

## Alternatives Considered

Reusing a single generic code for both conditions was rejected. The two failures call for different corrective actions, and PFOS-ENG-01 §39 requires errors to suggest corrective action where possible.

Naming the codes `RULE_TOO_MANY_TOP_PRIORITIES` and `RULE_DUPLICATE_TOP_PRIORITY_RANK` was considered. Those mirror §21.1's phrasing and read more naturally, but every existing code places the subject before the condition, and consistency across a persisted vocabulary was judged more valuable.

Requiring one combined top-priority validator was rejected. It would have forced this decision to settle how concurrent failures are ordered or aggregated, which is a broader contract question affecting every future validator and is not needed in order to name two codes.

Deferring until the authored rule contracts exist was rejected. Decision 075 already authorises this work, and the validated type already exists.

## Tradeoffs

Validation operates on a resolved plan rather than on authored configuration. PFOS-ENG-01 §21 frames validation as occurring before activation, so an authored-time pass will be needed once the authored rule contracts are fixed. Decision 075 already states these rules in terms of `ResolvedTopPriorityPlan`, so this follows the accepted framing rather than inventing one.

Independent validators mean a caller invokes more than one function to check a plan fully. That is accepted deliberately, in exchange for leaving aggregation unspecified until it is actually needed.

## Consequences

`RULE_ERROR_CODES` gains two entries and continues to satisfy the Decision 073 architecture tests: the `RULE_` prefix, key identical to value, neither reserved engine prefix, and disjointness from every other registry.

Milestone 2 may implement the two checks as independent bounded validators over `ResolvedTopPriorityPlan`.

The warning required by Decision 075 for a zero-entry `SEQUENTIAL` plan remains unimplementable until Rule Engine warning codes are settled.

No existing contract, code, or registry value changes.

## Future Review Trigger

Reconsider if the V1 limit of three top priorities changes, if a composite or multi-error validation contract becomes necessary, if `rank` acquires constraints beyond uniqueness, or if Rule Engine warnings move into a typed engine-owned registry under the Decision 073 pattern.

---

# Decision 077: Rule Engine Warnings Use an Engine-Owned Code Registry

**Status:** Accepted
**Related:** Decisions 007, 023, 073, 074, 075, 076
**Scope:** Architecture, Engineering

## Decision

The Rule Engine gains a fourth engine-owned closed code registry, for warnings, under the prefix `RULE_WARN_`. It contains one code:

```text
RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED
```

## Ownership

Decision 073 gives the shared layer the envelope and each engine its own vocabulary. Decision 074 applied that to explanations and skip reasons. Warnings are the one channel it has not reached, which is why `ResolvedRuleSet.warnings` is the only member of that contract whose code is untyped.

The shared `DomainWarning` is unchanged. PFOS-ENG-00 §21 fixes its shape, it is already accepted, and this decision requires nothing from it:

```ts
export interface DomainWarning {
  readonly code: string;
  readonly message: string;
  readonly affectedEntityIds: readonly string[];
  readonly recommendedAction?: string;
}
```

The Rule Engine narrows it locally instead:

```ts
export type RuleWarningCode = (typeof RULE_WARNING_CODES)[keyof typeof RULE_WARNING_CODES];

export type RuleDomainWarning = DomainWarning & {
  readonly code: RuleWarningCode;
};
```

`RuleWarningCode` extends `string`, so the intersection narrows `code` and changes nothing else. A `RuleDomainWarning` remains assignable to `DomainWarning`, so it can be placed in `ResolvedRuleSet.warnings` without a cast.

The dependency runs one way only: rules may read shared, and shared must never import a Rule Engine warning type.

This decision does not require a construction helper. Whether typed construction is worth a small function is an implementation-design question, and if one is added its sole responsibility is typed construction.

## Prefix

The Rule Engine's four registries are:

```text
RULE_*          errors
RULE_EXPLAIN_*  explanations
RULE_SKIP_*     skip reasons
RULE_WARN_*     warnings
```

`RULE_WARN_` follows the verb-stem abbreviation the existing prefixes use, while the registry constant is named `RULE_WARNING_CODES`, exactly as `RULE_EXPLAIN_*` lives inside `RULE_EXPLANATION_CODES`.

## The Decision 075 warning

A `ResolvedTopPriorityPlan` with `strategy: 'SEQUENTIAL'` and zero entries produces one warning carrying `RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED`.

`affectedEntityIds` is `[]`. The field is required by the shared contract and cannot be omitted, and a plan with no entries names no entity.

`message` and `recommendedAction` are fixed literals with no interpolated value, so the warning is identical for every plan that produces it. No category or severity is introduced: `DomainWarning` has no such field, and `ExplanationSeverity` grades presentation on a different channel.

Production belongs to a bounded producer over `ResolvedTopPriorityPlan`, returning zero or one warning. It is not a validator: Decision 075 makes this a valid resolution result rather than a failure, so it must not travel on the `Result` error channel.

A non-empty `SEQUENTIAL` plan produces no warning. A zero-entry `PERCENTAGE_SPLIT` plan produces no warning either: Decision 075 keeps that case a hard validation error reporting `RULE_POOL_NOT_EXACTLY_100_PERCENT`, and its invalidity remains owned by percentage-pool validation.

## One code only

Decision 073 introduces a code when the behavior it reports is specified. Of the nine warnings PFOS-ENG-01 §21.2 lists as examples, none is producible in Milestone 2: they require projected amounts, bucket balances, goal state, precedence resolution, or authored contracts that do not exist. Several also overlap warnings PFOS-ENG-02 §62 already assigns to the Allocation Engine.

No code is registered for any of them.

## Unchanged by this decision

The shared `DomainWarning` contract, in both shape and typing. It does not become generic.

Runtime freezing. This decision establishes no immutability behavior for warning objects, no freeze depth, and no rule about omitting absent optional properties. Freezing depth and ownership is a separate unresolved architectural question and must not be partially settled here.

`ResolvedRuleSet.warnings` remains `readonly DomainWarning[]`. Decision 074 typed `roundingPolicyId` as `string` so a historical snapshot could preserve an identifier that later changed; warning codes are persisted the same way. Narrowing the persisted field is deferred and requires its own decision.

The order of `ResolvedRuleSet.warnings` is not established. PFOS-ENG-01 §26 requires ordering to be explicit and stable, and no accepted source states this array's order. With one producible warning the question does not yet arise, and it must not be settled inside an implementation commit.

No deduplication contract and no aggregation contract are introduced. Each producer answers one question, as Decision 076 established for validators.

The remaining §21.2 warning behaviors are untouched.

Blocker C and Blocker F remain open. This decision introduces no precedence behavior and no eligible-income behavior.

## Why

Decision 075 requires a warning and Decision 076 records it as unimplementable because no accepted document names the code. That is the whole of the blockage, and it is the same shape Decision 076 resolved for the top-priority errors.

Because a released code is persisted inside a Plan Snapshot and must not change meaning, the name is fixed by decision rather than chosen in an implementation commit.

## Alternatives Considered

Making shared `DomainWarning` generic over its code, as Decision 073 did for `DomainError`, was considered and rejected. It would be consistent with the error and explanation channels, but it changes an accepted shared contract to obtain a narrowing the Rule Engine can express locally. A local intersection achieves the same typing with no shared change, and the smaller decision is preferred.

Leaving `code` as a bare string with no registry was rejected: the vocabulary would have no closure, and an unregistered placeholder warning code already sits in a test fixture, which is what that decay looks like.

Placing warning codes in the shared registry was rejected: Decision 073 confines shared to the primitive families.

Reusing `RULE_EXPLAIN_*` with `ExplanationSeverity: 'WARNING'` was rejected: both the explanation envelope and the explanation registry state that presentation severity does not replace the warning channel.

`RULE_WARNING_` was considered and rejected in favour of `RULE_WARN_`, which matches the abbreviation the other prefixes use.

`RULE_WARN_TOP_PRIORITIES_NONE_CONFIGURED` was considered. `RULE_WARN_NO_TOP_PRIORITIES_CONFIGURED` reads as natural English, matches the concept already written in the codebase, and stays inside the `RULE_WARN_` namespace.

Registering the §21.2 examples now was rejected: none has a producer, and Decision 073 introduces codes with the behavior they report.

## Tradeoffs

A fourth registry adds a prefix to keep disjoint, enforced by architecture tests rather than the compiler.

The warning channel narrows by intersection while the error and explanation channels narrow by type parameter. The two shapes differ, and the reason is recorded here: warnings arrived after their envelope was accepted, and matching the older pattern was not worth editing an accepted shared contract.

Typing producers while leaving the persisted field wide means the closed union is not enforced at the `ResolvedRuleSet` boundary. That is accepted in exchange for historical snapshots that survive a retired code.

## Consequences

Architecture tests extend to four registries: prefix, key identical to value, and disjointness across shared `ERROR_CODES`, `RULE_ERROR_CODES`, `RULE_EXPLANATION_CODES`, `RULE_SKIP_REASON_CODES` and `RULE_WARNING_CODES`. `RULE_WARN_` joins the reserved non-error Rule prefixes, so a warning code placed in the error registry fails the build.

Milestone 2 may implement the Decision 075 warning producer.

The placeholder code in the `ResolvedRuleSet` test fixture is replaced with the registered code.

No shared contract, existing registry value, or `ResolvedRuleSet` field changes.

## Future Review Trigger

Reconsider when a second warning producer exists, since warning-array ordering must then be settled; if runtime freezing depth and ownership is resolved, since a construction helper may then acquire an immutability responsibility; if warning codes acquire a category or severity; if a persisted warning code is ever retired; or if a §21.2 warning currently owned by the Allocation Engine is reassigned.

---

# Decision 078: RuleVersion Owns Its Effective Period

**Status:** Accepted
**Related:** Decisions 022, 023, 068, 073, 074
**Scope:** Financial logic, Architecture, Engineering

## Decision

A rule's effective period belongs to the `RuleVersion` rather than to the stable `Rule`. It is represented by a required start and an optional end:

```ts
export interface RuleEffectivePeriod {
  readonly effectiveFrom: FinancialDate;
  readonly effectiveTo?: FinancialDate;
}
```

## Boundary semantics

Both endpoints are included. A version is in effect on an evaluation date when:

```text
effectiveFrom <= evaluationDate
```

and, when `effectiveTo` is present:

```text
evaluationDate <= effectiveTo
```

Inclusivity is fixed by this decision and by the tests that accompany it, not by the field name. `effectiveTo` is the name PFOS-ENG-01 §41 already uses, and introducing a new name to carry the semantics would add terminology drift without adding meaning.

An absent `effectiveTo` means the version is in effect indefinitely from `effectiveFrom` onward. This is the ordinary case, not an exception. `exactOptionalPropertyTypes` is enabled, so the property is absent rather than explicitly `undefined`.

`DateRange` is not used. It requires both endpoints, and PFOS-ENG-01 §18 makes the end optional.

## Amendment to PFOS-ENG-01 §41

§41 lists `effectiveFrom` and `effectiveTo` on `Rule` and gives `RuleVersion` no dates. That placement is superseded.

§19.2 gives versions their own effective dates, and Decision 074 assigns the Rule Engine the job of selecting the applicable rule version by effective date. Neither is expressible if only the stable `Rule` carries the period. §41 is self-declared conceptual and defers field types to the architecture and database specifications.

The field names are unchanged from §41.

## Identity

A `RuleVersion` is identified by `ruleVersionId`, and its parent rule by `ruleId`:

```ts
export type RuleId = EntityId;
export type RuleVersionId = EntityId;
```

Both are semantic aliases of `EntityId`, following Decision 074's treatment of `PlanVersionId`. No new branded identifier is introduced, and the distinction is preserved through field names, documentation and tests rather than through a second brand.

`planVersionId` is not part of an authored `RuleVersion`. It is provenance of a resolved set, and an authored rule must not depend on resolution.

## Validity

A period whose `effectiveTo` is present and falls strictly before its `effectiveFrom` is a hard validation error reporting `RULE_EFFECTIVE_PERIOD_INVALID_RANGE`, with category `VALIDATION`. This satisfies PFOS-ENG-01 §21.1 "Invalid effective date range" and §43.3 "Invalid date ranges".

That is the code's sole behavior. It reports nothing else, and this decision registers no other code.

A period whose endpoints are equal is valid. It describes a one-day rule, which is meaningful and which no accepted source forbids.

An `effectiveFrom` in the past or in the future is valid. §28 permits a rule to take effect immediately or on a future date.

This is the only period invariant introduced. No minimum duration, gap prohibition, overlap prohibition, contiguity requirement, or restriction on the number of open-ended versions is established.

If no version of a rule is effective on the evaluation date, that rule contributes nothing for that date.

## Multi-version selection is deferred

Selection across multiple simultaneously effective versions is not established by this decision. No overlap behavior or tie-breaker is introduced. In particular, identifiers must not be used as a financial tie-breaker.

This decision defines when a single version is effective. It takes no position on whether overlapping versions should later be prohibited at validation time, resolved by some ordering, or handled another way.

## Immutability

A `RuleVersion`'s effective period does not change after the version is created. §18 requires an update to create a new version rather than mutate the historical meaning of the previous one, and §19.1 requires a version used in a confirmed allocation to remain reconstructable.

This is historical immutability through versioning semantics, expressed by `readonly` fields. This decision establishes no runtime freezing behavior, no freeze depth and no freeze ownership; those remain unresolved.

## Unchanged by this decision

The `Rule` contract. `ownerType`, `ownerId`, `ruleCategory`, `ruleType` and rule-level `status` are untouched, because they carry the §6 precedence hierarchy that Blocker C gates.

No `RuleVersion` lifecycle or status is introduced. §41 places `status` on `Rule`, and §28's choice between immediate and future effect is expressed entirely by `effectiveFrom`.

The `RuleVersion` payload. `configuration`, `versionNumber`, `supersedesVersionId` and `changeReason` are not defined here, and no full `RuleVersion` interface is introduced yet.

Skip production. `RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE` already exists under Decision 074, is unchanged by this decision, and no new skip code is introduced. Emitting it requires the resolver and remains gated by Blocker C. A version that is not effective is filtered by the predicate and produces no observable skip yet.

Plan Snapshot design, persistence schema, canonicalization, runtime freezing, Blocker C behavior, Blocker F behavior and Milestone 3 behavior.

## Why

Decision 074 already made version selection by effective date a Rule Engine responsibility, while no accepted source stated where the date lived or whether its endpoints were inclusive.

An inclusive-versus-exclusive end boundary is a one-day error in a real paycheck. It is fixed by decision rather than chosen inside an implementation commit.

Three sources read inclusively and none reads otherwise: PFOS-ENG-00 §9 as implemented in the shared `DateRange`, whose documentation records that a half-open range would misreport every boundary; §19.2's "effective April 1"; and §19.3's user-facing "Tithing changed from 10% to 12% on April 1". `FinancialDate` carries no time component that would make a half-open boundary natural.

## Alternatives Considered

Keeping the period on `Rule` as §41 lists it was rejected: it cannot represent §19.2's two versions of one rule, and it leaves `sourceRuleVersionIds` unable to identify which version produced a resolved value.

Naming the field `effectiveThrough` to signal inclusivity was considered and rejected. §41 already says `effectiveTo`, the semantics are fixed by this decision and enforced by tests, and a second name for the same concept is terminology drift.

Reusing `DateRange` with a sentinel far-future end was rejected: it invents a magic date and misreports every open-ended rule.

An exclusive end was rejected for the reasons recorded above.

Prohibiting overlapping versions now was rejected: it requires a version-collection input, which requires the `Rule` contract this decision deliberately leaves alone.

Introducing a branded `RuleVersionId` was rejected: Decision 074 settled that V1 uses semantic aliases of `EntityId`.

## Tradeoffs

Amending §41 leaves the specification and the decision log disagreeing on paper until §41 is revised.

Deferring multi-version selection means the effective-period contract is implementable while selection is not, so the two arrive in separate commits.

A shape whose end is optional cannot reuse the shared `DateRange`, so the Rule Engine carries a small period type of its own.

## Consequences

`RuleEffectivePeriod`, an `isEffectiveOn` predicate and a bounded period validator may be implemented in Milestone 2.

`RULE_EFFECTIVE_PERIOD_INVALID_RANGE` joins `RULE_ERROR_CODES`, and the four-registry architecture tests cover it without change.

PFOS-ENG-01 §43.3's "Invalid date ranges" test line item becomes satisfiable.

No accepted contract, existing registry value or `ResolvedRuleSet` field changes.

## Future Review Trigger

Reconsider when the `Rule` contract is accepted, since multi-version selection then becomes implementable; if a rule type requires sub-day effectivity, which a date-only period cannot express; or if multi-time-zone support changes how an evaluation date is compared.

---

# Decision 079: Rule Version Selection Uses the Latest Effective Start

**Status:** Accepted
**Related:** Decisions 006, 018, 022, 023, 068, 073, 074, 075, 076, 077, 078
**Scope:** Financial logic, Architecture, Engineering

## Decision

More than one version of a rule may be in effect on an evaluation date. Among the versions of one rule that are in effect, the one with the **latest `effectiveFrom`** applies.

Two versions of the same rule must not share an `effectiveFrom`.

## Overlap is permitted

Decision 078 fixes a version's effective period at creation, and PFOS-ENG-01 §28 offers the author only "effective immediately" or "effective on a future date" — there is no gesture that closes a previous version.

§19.2's worked example is therefore an overlap: v1 is open-ended from January 1, v2 begins April 1, and on April 15 both satisfy `isEffectiveOn`. Because v1's period cannot be changed after creation, that overlap is not merely tolerated — it is the only shape in which the example can exist.

Overlap is consequently valid and expected, and it is required by the existing prospective-change example whenever the earlier version is open-ended. It is not a universal property of every version history: an author who supplied a finite `effectiveTo` when creating a version may produce a history with no overlap at all, and such a history is equally valid. Neither shape is required of a rule, and neither is an error state.

No overlap prohibition, contiguity requirement, or gap prohibition is introduced.

## Open-ended versions

A rule may have any number of open-ended versions. §19.2's example has two. Their starts must differ, and the latest start applies.

## Selection rule

For one `ruleId` and one evaluation date:

1. Take the versions whose period satisfies `isEffectiveOn` (Decision 078).
2. If none, the rule contributes nothing for that date.
3. Otherwise the version with the greatest `effectiveFrom` applies.

Selection reads `effectiveFrom` and nothing else. It does not read `ruleId`, `ruleVersionId`, `versionNumber`, `supersedesVersionId`, `currentVersionId`, `createdAt`, array position, or repository order. PFOS-ENG-00 §14 keeps identifiers opaque, §32 Invariant 11 forbids repository order from affecting a result, and Decision 078 forbids an identifier tie-breaker. PFOS-ENG-01 §27's tie-break ladder is not the governing mechanism: it resolves equal *rank or priority* among allocation items, and a rule version has no rank.

`versionNumber` and `supersedesVersionId` are not selection inputs. If §41's conceptual fields are later defined, they are descriptive and audit metadata. Authoring sequence is not effective date: a version authored later may take effect earlier, and Decision 022 makes the effective date the governing fact.

`currentVersionId` is not a selection input either. It carries no date and cannot answer a `HISTORICAL_RECALCULATION` or a backdated evaluation, which Decision 074 requires selection by effective date to do.

Version selection is **intra-rule** and precedes inter-rule precedence. It consults no other rule, no hierarchy level from §6, and classifies no rule as additive or replacing.

## Duplicate effective starts are invalid

Two questions are involved, and they must not be collapsed.

### A. Version-history validity

Two versions belonging to one `ruleId` must not share an `effectiveFrom`. A version collection containing such a duplicate is **invalid, regardless of the evaluation date** — including a date on which the duplicate has no effect, and including every date before either version begins.

This is the only shape that can defeat the selection rule, and it always defeats it on at least one date: both periods include their shared start, and Decision 078's range validator already guarantees `effectiveTo ≥ effectiveFrom`, so two versions sharing a start are simultaneously effective on at least that day with no permitted way to choose between them. Conversely, distinct starts make selection total on every date. Excluding this one shape is therefore exactly sufficient, and nothing narrower would do.

PFOS-ENG-01 §7 makes deterministic rule output a system invariant, and §21.1 makes a rule that violates a system invariant a hard validation error. A version history that is ambiguous on any date fails that invariant, so this is a collection-level invariant rather than a per-period one. It is enforced wherever a rule's versions are held together — at authoring and activation once that layer exists, and on import, which §37 requires the Rule Engine to validate and PFOS-ENG-00 §29.1 treats as untrusted.

The failure reports `RULE_VERSION_DUPLICATE_EFFECTIVE_FROM`, category `VALIDATION`.

### B. Selection defense

Selection assumes valid input. It is not a validator, and it does not scan a collection for duplicates it has no need to compare.

It must nonetheless never guess if malformed input reaches it. If more than one currently effective candidate shares the greatest `effectiveFrom`, selection returns `RULE_VERSION_DUPLICATE_EFFECTIVE_FROM` rather than choosing.

Where selection returns a version, that outcome is an answer to "which version applies on this date" and **is not a finding that the history is valid**. A collection carrying a duplicate elsewhere remains invalid under (A), and the validator remains the authority on that question. Selection's silence about a duplicate it did not have to compare says nothing about it.

One code covers both, because both report the same defect: two versions of one rule claim the same effective start.

Failing loudly is required here rather than warning: the competing versions carry different financial answers, and Constitution Principle 4 forbids silently making that decision — including by silently making it zero.

The `VALIDATION` category matches `RULE_TOP_PRIORITY_DUPLICATE_RANK`, the existing duplicate-detection code. `CONFLICT` was considered; consistency with the sibling code was preferred, and §39's `RuleConflictError` names an error concept rather than one of PFOS-ENG-00 §22's closed categories.

## Zero effective versions

Decision 078 already states that a rule with no version effective on the evaluation date contributes nothing for that date. This decision restates it and changes nothing about it.

It decides nothing about what happens next. Whether a lower-precedence rule, a group default, or the §8.1 product default then supplies a value is precedence and fallback behavior, which is Blocker C, and it remains open. "Contributes nothing" is a statement about the rule, not about the resolved outcome.

## Skipped rules

For this reason code, `skippedRules` is **rule-level**.

A version that is not effective on the evaluation date — whether its period has ended or has not yet begun — does **not** independently produce a `SkippedRule`. It is removed by the `isEffectiveOn` predicate, and a version is not itself a rule.

An older effective version that loses selection to a later `effectiveFrom` does **not** produce a `SkippedRule` either. That rule applied. Which of its versions answered is provenance, carried by `sourceRuleVersionIds` and by `RULE_EXPLAIN_RULE_APPLIED` under Decision 074. No new skip code and no new explanation code is introduced.

Where `RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE` is emitted for a rule with zero effective versions, it carries `ruleId` and **omits `ruleVersionId`** — the case for which Decision 074 made that field optional, since no version was applicable to name.

**This decision does not require every rule with zero effective versions to produce a `SkippedRule`.** It fixes the shape of such a record and forbids version-level records; it does not establish when one is emitted, or for which rules. That depends on the resolver, on Blocker C, and on the still-open contract governing which rules the evaluation context supplies — PFOS-ENG-01 §25 lists possible context fields rather than fixing a population. Decision 078 already recorded that emitting this code requires the resolver and remains gated by Blocker C, and that gating is unchanged here.

Confining these records to rule level preserves Decision 074's canonicalization: `skippedRules` ordered by rule identifier remains a total order, because at most one entry per rule can carry this reason. Version-level records would place several entries under one `ruleId` and force a secondary sort key that no accepted source supplies, and the only available key would be an identifier.

## Amendment to PFOS-ENG-01

§19.2's example is clarified rather than changed: v1 and v2 both remain open-ended and both are in effect from April 1 onward, with v2 applying because it starts later. §19.3's user-facing sentence is the correct reading of that outcome. Any reading under which authoring v2 closes v1 is superseded — Decision 078 makes a version's period immutable after creation, and §28 defines no gesture that would perform such a closing.

§41's `versionNumber`, `supersedesVersionId` and `currentVersionId` are unchanged and remain conceptual. This decision records only that none of them participates in selection.

§21.1's enumerated hard-error list gains one condition, duplicate effective starts within one rule, derived from the "rule violates a system invariant" bullet already present there and from §7.

## Unchanged by this decision

The authored `Rule` contract. `ownerType`, `ownerId`, `ruleCategory`, `ruleType`, `status` and `currentVersionId` are untouched; they carry the §6 hierarchy that Blocker C gates.

The `RuleVersion` payload. `configuration`, `versionNumber`, `supersedesVersionId` and `changeReason` are not defined here, and no full `RuleVersion` interface is introduced. Selection needs only `{ ruleVersionId, period }` grouped by `ruleId`, all of which Decision 078 already accepted.

Which rules the evaluation context supplies to resolution, and therefore which rules could ever be reported as contributing nothing.

Plan Snapshot design, persistence schema, runtime freezing, warning-array ordering, Blocker C and Blocker F.

How an open-ended rule is *stopped*. Under Decision 078's immutability, ending a rule whose latest version is open-ended cannot be expressed by the effective period alone. That belongs to `Rule.status` and the authored contract, and is not settled here.

Whether the duplicate-start collection validator, the selection defense, and the selector itself are one function or three. Decision 076's independent-validator framing applies: each answers one question, and no aggregation or ordering contract for concurrent failures is introduced.

## Why

Decision 074 assigned the Rule Engine the job of selecting the applicable rule version by effective date, and Decision 078 supplied the period and the predicate while deferring what happens when more than one version qualifies. That deferral gates the predicate's use on exactly the shape the specification demonstrates: §19.2's prospective change, where an open-ended earlier version and a later version are both in effect.

The corpus does not merely permit that overlap; for that shape it requires it. §19.2 shows an open-ended v1 and a later v2, §28 offers no way to close v1, and Decision 078 forbids changing v1's period after creation. Any decision that prohibits overlap therefore makes the specification's own worked example unrepresentable and blocks the user's core workflow. Histories without overlap remain expressible and valid; they simply are not the shape §19.2 describes.

Given that overlap exists, the answer must be deterministic (Constitution Principle 18) and must not come from an identifier (Decision 078, PFOS-ENG-00 §14). `effectiveFrom` is the only field in the accepted contract that carries the financial meaning of the question, and Decision 022's prospectivity, §19.2's "effective April 1" and §19.3's "changed … on April 1" all say the same thing: the later change is the one in force.

Because a released error code is persisted inside a Plan Snapshot and must not change meaning, the name is fixed by decision rather than chosen in an implementation commit, following Decisions 076 and 077.

## Alternatives Considered

Prohibiting overlap and rejecting it at authoring was rejected: an open-ended earlier version cannot be closed under Decision 078's immutability, and §28 offers no gesture that would close it, so the §19.2 change could not be authored at all.

Prohibiting overlap and rejecting it at resolution was rejected for the same reason, with the failure arriving at the next allocation preview instead — and it would make every historical recalculation across such a change fail.

Selecting by highest `versionNumber`, or by walking the `supersedesVersionId` chain, was rejected. Authoring order is not effective date: a version authored later may take effect earlier, so a correction to an old period would silently override a change the user scheduled for the future. It is insertion order under a field name, which PFOS-ENG-00 §32 Invariant 11 excludes, and PRD §50 states users must not manage version numbers.

Selecting by `Rule.currentVersionId` was rejected: a pointer carries no date and cannot answer a historical or backdated evaluation, which Decision 074 requires.

Breaking an exact `effectiveFrom` tie by `createdAt` was considered. §27 does list a creation timestamp above a stable ID, and §41 already places `createdAt` on `RuleVersion`, so it would not be an invented field. It was rejected because §27 governs equal-rank allocation items rather than version selection; because it makes an authoring artifact financially decisive between two versions the user gave the same effective date, which is more plausibly an authoring mistake than an intent; and because it would draw a payload field into a selection contract this decision must not design. Failing loudly on the ambiguity is the smaller and safer answer.

Breaking a tie by the narrower period, or by treating both versions as applying additively, were rejected: the first invents a specificity semantic no source states, and the second is Blocker C and would produce two competing rates for one obligation.

Treating a duplicate start as invalid only when it affects the evaluation date was rejected. Validity of a version history is not a function of when it is read; a history ambiguous on any date fails §7's determinism invariant, and a rule that resolves today would otherwise become an error on a backdated correction with no intervening change.

Emitting a skip record for every non-effective version was rejected. It would place several entries under one `ruleId`, defeating Decision 074's by-identifier ordering and forcing an identifier as a secondary sort key; it would grow every Plan Snapshot with one entry per historical version per resolution; and it reports a version, while `SkippedRule` names a rule.

Requiring a skip record for every rule with zero effective versions was rejected as premature: it presumes a settled population of rules supplied to the resolver, which §25 does not fix.

Deferring again was rejected: the question is decidable over accepted types, and it blocks the resolver's only date-based responsibility.

## Tradeoffs

An authoring mistake in a date is not caught by resolution. A version wrongly dated far in the future wins as soon as that date arrives, and one wrongly dated in the past loses silently. Both are the correct application of the stated rule; surfacing the mistake belongs to the authoring surface, where §28 already requires impacted future behavior to be shown.

One code serves both a collection validator and a selection guard. The two answer different questions — whether a history is well-formed, and whether this date has one answer — and a caller that sees the code from selection must not conclude the rest of the history has been checked.

The authoring-time enforcement point cannot be implemented in Milestone 2, so the invariant lands in stages, as Decision 076's validation did.

The shape of a zero-effective-version skip record is fixed while its emission is not, so the record type is specified before it has a producer. This matches the position Decisions 074 and 077 already accepted for `RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY` and for the §21.2 warnings.

A rule's version history may accumulate versions that can never again be selected, since a later start always wins. Nothing prunes them, and nothing should: §19.1 requires a version used in a confirmed allocation to remain reconstructable.

## Consequences

`RULE_VERSION_DUPLICATE_EFFECTIVE_FROM` joins `RULE_ERROR_CODES`. The four-registry architecture tests from Decisions 073, 074 and 077 cover it unchanged: `RULE_` prefix, key identical to value, neither reserved non-error prefix, disjoint from every other registry.

Milestone 2 may implement a bounded per-rule version selector, its duplicate-start selection guard, and a bounded duplicate-start collection validator over `{ ruleVersionId, period }` — without the authored `Rule` contract and without the full `RuleVersion` payload.

No existing contract, registry value, or `ResolvedRuleSet` field changes. `SkippedRule` is unchanged, and its optional `ruleVersionId` acquires its first specified shape constraint, though not yet a producer.

PFOS-ENG-01 §43.1's "Historical snapshot ignores current rules" and §43.5's snapshot tests become expressible for a multi-version rule, and §19.2's example becomes a directly testable case at three dates.

Blockers C and F remain open and continue to gate the work they name.

## Future Review Trigger

Reconsider if the authored `Rule` contract introduces a lifecycle or status that can end an open-ended version, since stopping a rule would then have a second representation; if a rule type requires sub-day effectivity, which a date-only start cannot order; if multi-time-zone support changes how an evaluation date is compared; when the evaluation-context population contract is settled, since emission of a zero-effective-version skip record then becomes decidable; if a second producer of `RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE` appears, since per-rule uniqueness for this reason would then need restating; or if an accepted decision ever permits a version's effective period to be closed after creation, which would reopen whether overlap should be prohibited at authoring.

---

# Decision 080: Additive Versus Replacing Rule Semantics and Precedence Resolution

**Status:** Accepted
**Related:** Decisions 010, 014, 015, 016, 017, 020, 021, 022, 025, 028, 068, 071, 073, 074, 075, 076, 077, 078, 079
**Scope:** Financial logic, Architecture, Engineering

## Decision

Rule precedence resolves per **resolved settings slot**. A slot is one addressable destination in the `ResolvedRuleSet` fixed by Decision 074, keyed by `bucketId` where that contract keys it.

Every V1 slot is **replacing** except `globalObligations`, which is **additive**.

This is the classification Decision 074 named as Blocker C. It settles semantics. It does not close every question Blocker C touches, and it unlocks very little implementation; both limits are recorded below.

## The slot is the unit

Decision 074 already fixed the granularity, and this decision invents none.

Inheritance is therefore neither per leaf field nor whole-rule. A configuration the accepted contract expresses as a discriminated union resolves whole: a `RolloverPolicyConfig` cap cannot be inherited from a group while its `policyType` comes from the bucket, and PFOS-ENG-01 §8.4's example carries policy and cap together. Equally, a bucket rule that supplies a funding rule does not displace that bucket's inherited group rollover default, because §9's inheritance allow-list is written per setting.

## Which hierarchy levels compete

Only PFOS-ENG-01 §6 levels 5 through 9 — income source, bucket, group default, global user rule, product default — are slot-level competitors in V1.

Level 1 is not a competitor: §7 makes a user rule conflicting with a system invariant a validation failure, so an invariant gates activation rather than winning a slot.

Level 2 is not a competitor: Decision 074 stores the complete `ResolvedRuleSet` by value in a Plan Snapshot, so historical evaluation replays a resolved answer rather than re-resolving slot by slot.

Levels 3 and 4 are out of scope. Decision 074 treats simulation and event-level overrides as inputs to resolution and keeps event overrides out of `ResolvedRuleSet` entirely. Neither override contract exists, and neither is established here.

## Precedence between different levels

Among levels 5 through 9, a lower-numbered level has higher precedence, as §6 states.

Where a replacing slot is addressed at two **different** levels, the rule at the higher-precedence level survives and the other is displaced. That outcome is determinate, and no identifier, array position, creation timestamp or repository order is consulted. PFOS-ENG-00 §14 keeps identifiers opaque, §32 Invariant 11 forbids repository order from changing a result, and Decisions 078 and 079 forbid an identifier tie-breaker.

## Replacing semantics

For a replacing slot addressed at distinct levels, exactly one rule survives: the one at the highest-precedence level.

This is PFOS-ENG-01 §43.2's accepted worked test — product default carry-all, global carry-all, group carry-to-$500, bucket reset, resolved reset — and §43.6's property that lower-precedence replacement rules never override higher-precedence rules. §15 states it directly for funding: every allocatable bucket uses one supported funding rule.

Replacing slots and their governing sources:

- `allocationBasis` — single-valued
- `topPriorities.strategy`, and per-bucket rank and membership — §13, Decision 074
- `requiredFundingRules[bucketId]` — §15
- `lowerPriorityPool.strategy`, and per-bucket destination membership — §14, Decision 014
- `leftoverPolicy` — §16, §8.5, Decision 020
- `rolloverPolicies[bucketId]` — §17, §10.1, §43.2, Decision 028
- `goalPolicies[bucketId]` — §5.7, Decisions 025, 026, 027

A keyed collection is not additive. `rolloverPolicies` holds many entries because it is keyed by bucket; per bucket, one survives.

`sequence` is not additivity either. `ResolvedFundingRule.sequence` orders distinct buckets competing for the same money; execution order is not two rules surviving in one slot.

`stageSequence` is not rule-authored. No §5 category authors a stage order, and Decision 074 assigns the sequence to the Rule Engine as engine output.

## Same-level contention is not determined by this decision

§6 orders hierarchy levels. It does not define contention between two replacing rules at the same level, and no other accepted source does.

The constraint, which holds under every possible future answer: no tie-break between same-level replacing rules may use an identifier, array position, a timestamp, creation order, repository order, or storage order. Decision 079 rejected a `createdAt` tie-break for version selection on reasoning that applies here unchanged.

This decision does **not** determine whether such a state is:

- structurally impossible under the future authored `Rule` contract,
- an authoring or activation validation failure, or
- a resolver error.

That determination is deferred until the authored `Rule` contract defines how a rule addresses a slot and whether more than one same-level rule can address one replacing slot. Choosing among the three now would require assuming an answer to that contract, which Decisions 078 and 079 deliberately left open.

No error code is registered for this condition. Registering one would presuppose the third answer. `RULE_ERROR_CODES` is unchanged by this decision.

**The replacing-semantics rule above is therefore stated for distinct levels only.** It is not a total selection procedure over an arbitrary candidate collection, and no such procedure may be implemented against this decision. A financial resolution must not contain a reachable case whose behavior is deliberately unspecified.

## Additive semantics

`globalObligations` is the only additive slot in V1.

Separately authored global obligations accumulate. Each takes effect and none displaces another. Decision 074 already requires this: separately authored obligations remain independent and are not collapsed into one N-way percentage split.

Accumulation is within the global level. No other §6 level authors a global obligation in V1.

An additive obligation cannot be replaced by a rule at any level. PFOS-ENG-01 §10.2 states it: the bonus source's route does not replace the global tithe. Decision 016 says the same — eligible income is combined globally, and income-source overrides apply after global rules are resolved.

Exactly one thing removes an additive obligation: an explicit eligibility or exclusion determination, which removes it as a **skip** reporting `RULE_SKIP_INCOME_SOURCE_EXCLUDED`, not as an override. §10.2's own qualifier — "unless the income source is explicitly excluded from eligible income" — and §12.5's exclusion list are the authority. Who computes eligible income, and how double counting is prevented, is Blocker F and is untouched here.

## Ordered materialization of the additive slot is blocked

`ResolvedGlobalObligation.sequence` is declared financially meaningful by Decision 074, and no accepted source supplies its value or the key that produces it. It must not come from an identifier, array position, or repository order.

This decision supplies neither. It classifies the slot; it does not enable the slot to be built.

`ResolvedRuleSet.globalObligations` therefore cannot be materialized under this decision alone — not for two or more obligations, and not for one, since a single obligation's `sequence` value has no accepted source either. Preserving input or repository order as financial order is excluded, and emitting a collection whose ordering is not financially established would defeat the determinism Constitution Principle 18 and §26 require.

The equivalent gap for `ResolvedFundingRule.sequence` predates this decision and is likewise untouched.

## Inheritance

Inheritance is the continuation of the same downward walk, taken only along the channels PFOS-ENG-01 §9 supports: income source from global, bucket from group default, and bucket from product default where neither group nor bucket defines a rule. §9's negative rule stands: nothing inherits merely because objects share a name or a category.

An income-source override replaces only the slots it addresses. It does not replace the global plan. If it did, §10.2's bonus rule would displace the global tithe, and §10.2 says it does not. Decision 017, PRD §12 and §24.4's worked example supply the default position: an income source inherits the global plan where no source override exists.

A bucket rule replaces a group default for that slot whole, and the group contributes nothing further to it. §5.4 and §8.4 supply this.

## Product-default fallback, where an accepted product default exists

Where no rule at levels 5 through 8 addresses a slot, the product default supplies the value. §8.1 defines it as the fallback used when the user has not made a choice, §9 states buckets inherit product defaults, and §43.2 exercises the full chain. Constitution Principle 2 makes the named defaults a product commitment.

This applies only to a slot for which an accepted product default exists.

Established by an accepted source:

- `rolloverPolicies[bucketId]` — `CARRY_ALL` (§17.1, Decision 028)
- `lowerPriorityPool.strategy` — even split (§14.1, Decision 014)
- `topPriorities.strategy` — `SEQUENTIAL` (§13.2), with an empty entry list valid under Decision 075

Not established by any accepted source:

- `leftoverPolicy` — Decision 020 makes it user-defined and names no default. §16.2 lists `Leave unallocated` among the supported types but does not designate it the product default. Decision 074's "no V1 leftover fallback" addresses a destination that cannot receive a remainder, which is a different question.
- `allocationBasis` — no accepted source names a default basis. This is also adjacent to Blocker F and is not settled here.
- `requiredFundingRules[bucketId]` — §15 requires each allocatable bucket to use one funding rule but names no default rule for a bucket that authors none.
- `goalPolicies[bucketId]` — Decisions 025, 026, 027 and §15.5 supply defaults for individual fields, but no accepted source assembles them into a default for the whole four-field slot, and whether a bucket without a goal rule receives an entry at all is a population question this decision does not settle.

`leftoverPolicy` and `allocationBasis` are non-optional fields of `ResolvedRuleSet`. A resolution in which no user rule addresses either slot therefore has no established value, and the contract cannot be satisfied. This decision records that as a discovered gap. It does not invent a default to close it, because a product default is a product commitment under Constitution Principle 2 and belongs in an accepted decision rather than in a resolver.

## Zero effective versions

Decisions 078 and 079 state that a rule with no version effective on the evaluation date contributes nothing for that date, and both explicitly left open what happens next.

Such a rule **contributes no candidate to the slot**, and resolution continues through the applicable chain to the next level that addresses it. Absence does not suppress fallback.

Three grounds. §8.1's product default is used where the user has not made a choice, and under Decision 022's prospectivity a rule whose versions are not effective on the evaluation date is not a choice for that date. Suppression would leave a slot unfilled while Decision 074 forbids the Allocation Engine from re-resolving, so the resolved set could not be executed. And Constitution Principle 4 forbids making an important financial decision silently, including by silently making it nothing.

A rule that contributes no candidate overrides nothing. It produces no `RULE_EXPLAIN_RULE_OVERRIDDEN` against a lower level, and the surviving value is an ordinary applied or inherited outcome.

Version selection is unchanged. It remains intra-rule, by latest `effectiveFrom` under Decision 079, and completes before any inter-rule resolution begins.

## Explanation production

This decision registers no explanation code and redefines none. It records which outcomes gain producers within the vocabulary Decision 074 already accepted.

Producers established by this decision:

`RULE_EXPLAIN_RULE_APPLIED` — Decision 074: "records a selected rule." The surviving value comes from a rule addressing the slot at the highest level in that slot's applicable chain: level 5 for plan-level slots, level 6 for bucket-keyed slots. Also the producer for a **single** surviving global obligation.

`RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY` — Decision 074: "records an additive rule that survives **alongside another applicable rule**." Produced for each surviving obligation where **two or more** obligations survive simultaneously in the additive slot.

"Another applicable rule" means another applicable rule participating in that same additive slot. Decision 074 ties this code's producer specifically to additive-versus-replacing behavior — it states the code "has no producer until additive-versus-replacing behavior is fully classified" — so the rule it survives alongside is one it was classified against, which is a rule in the same slot. A consequence, not a justification: the alternative reading would fire the code on almost every resolution, since a global obligation ordinarily co-occurs with unrelated bucket and leftover rules.

This leaves the code without a producer in the ordinary single-obligation V1 configuration. That is accepted. Decision 074's wording governs, and the existence of a producer is not a reason to widen a code.

The two additive producers are mutually exclusive by construction, so no multiplicity question arises between them.

`RULE_EXPLAIN_RULE_OVERRIDDEN` — Decision 074: "records a lower-precedence rule replaced by a higher-precedence rule." Produced for a replacing rule displaced by a rule at a higher-precedence level. Never produced for a version that lost intra-rule selection, which Decision 079 forbids, and never for a rule that contributed no candidate.

`RULE_EXPLAIN_DEFAULT_INHERITED` — Decision 074: "records inheritance of an applicable default where no replacing override exists." Produced where the surviving value reaches the slot from a level below the highest level in that slot's chain: a group default (§5.4, §8.3, §9), an inherited global default (§5.1's "Default …" settings; §8.4's "applicable global or group defaults"; §24.4's "inherited the global allocation plan"), or the product default (§8.1, §9, §43.2).

`RULE_EXPLAIN_RESOLUTION_CONTEXT` — no producer established here; it depends on the evaluation-context contract.

## Explanation multiplicity is not determined by this decision

Decision 074's glosses are not mutually exclusive, and two pairs overlap on a single outcome:

- a rule displaced by higher precedence satisfies both `RULE_EXPLAIN_RULE_OVERRIDDEN` ("a lower-precedence rule replaced by a higher-precedence rule") and `RULE_EXPLAIN_RULE_SKIPPED` ("records a skipped rule and pairs with the machine-readable `RULE_SKIP_*` reason"), since that rule is skipped and carries a `RULE_SKIP_*` reason;
- a slot filled by inheritance satisfies both `RULE_EXPLAIN_RULE_APPLIED` ("records a selected rule") and `RULE_EXPLAIN_DEFAULT_INHERITED`, since the inherited rule was selected.

Whether one outcome may carry more than one explanation record, and if not which code prevails, is an explanation-production convention. No accepted source forces an answer, and Blocker C does not require one: the classification, the precedence semantics and the producers above are unaffected by it.

It is therefore deferred, and this decision establishes no suppression, no deduplication, no explanation-code precedence, and no one-record-per-outcome behavior.

## Skip production

A rule displaced by a higher-precedence rule in a replacing slot is represented by a `SkippedRule` reporting `RULE_SKIP_SUPERSEDED_BY_HIGHER_PRECEDENCE`.

Decision 074 registers this literal and gives it no individual gloss; its meaning rests on its name, on §6, and on §24.2's requirement to report which lower-precedence rules were overridden. Decision 074's exclusions confirm what it is not: neither an allocation-time condition nor an activation-blocking validation error. This decision names its producer and does not purport to define the code.

Producing it does not presume the still-unsettled evaluation-context population: to know that a rule was displaced, the resolver necessarily held it.

Whether that same displaced rule additionally carries `RULE_EXPLAIN_RULE_SKIPPED` is the deferred multiplicity question above and is not settled here.

No skip code is registered and none is redefined.

## Deliberately deferred

- **Same-level replacing contention**, and whether it is structurally impossible, an authoring or activation validation failure, or a resolver error.
- **Explanation multiplicity and deduplication** across the two overlapping code pairs above.
- **The ordering source for `ResolvedGlobalObligation.sequence`**, and therefore ordered materialization of the additive slot; and the pre-existing equivalent for `ResolvedFundingRule.sequence`.
- **Product defaults for `leftoverPolicy`, `allocationBasis`, `requiredFundingRules` and the whole `goalPolicies` slot.**
- The projection from an authored rule to a §6 level and a slot. That requires `Rule.ownerType`, `ownerId`, `ruleCategory` and `ruleType` or an equivalent, which Decisions 078 and 079 deliberately left alone and which this decision does not define or invent.
- Which rules the evaluation context supplies (§25), and therefore production of `RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE`.
- Blocker F: eligible-income computation ownership and double-count prevention.
- The full `RuleVersion` payload and the authored `Rule` contract.
- Simulation-override and event-level-override contracts, §6 levels 3 and 4.
- Plan Snapshot design, persistence schema, canonicalization equal-sequence tie-break, runtime freeze depth and ownership, warning-array ordering, and cycle product and ownership semantics.
- All Milestone 3 allocation behavior.

## Why

Decision 074 named Blocker C as gating precedence resolution, resolver behavior and the production of `RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY`, and recorded that the approved contract can represent either result. Decisions 078 and 079 then resolved version selection completely while stating in terms that what happens after a rule contributes nothing is Blocker C.

The classification is decidable over already-accepted types. §6 makes replacing the rule and additive the stated exception; §10's two worked examples are one of each; and Decision 074's contract already discriminates them — resolved rollover, goal and funding entries each carry a singular `ruleVersionId`, while separately authored obligations are declared independent and uncollapsed.

Classifying the resolved slots rather than the §5 categories keeps the policy small and stable. §5.1 feeds both the additive obligation slot and several replacing default slots, so no §5 category is uniformly one kind. The slots are fixed by an accepted decision and persisted inside a Plan Snapshot; the §5 category vocabulary is not fixed by any decision.

Deferring same-level contention, explanation multiplicity, additive ordering and the missing product defaults keeps this decision to what the accepted corpus supports. Each requires either the authored `Rule` contract, a product commitment no accepted source has made, or a convention Blocker C does not need.

## Alternatives Considered

Classifying the §5 categories directly was rejected: §5.1 is not uniformly one kind, so a category label would be wrong for one of its slots or would require sub-categories no accepted source defines.

Treating every slot as replacing was rejected: it requires collapsing separately authored obligations, which Decision 074 forbids.

Additive-by-default with a listed set of replacing rules was rejected: it inverts §6's governing sentence.

Suppressing fallback when a rule has zero effective versions was rejected on the three grounds recorded above.

Emitting `RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY` for every rule in the additive slot regardless of how many survive was considered and rejected. It would give the code a producer in the ordinary single-obligation configuration, but Decision 074's accepted wording is "survives alongside another applicable rule," and a lone obligation survives alongside no rule it was classified against. Ensuring a code has a producer is not a reason to widen its accepted meaning.

Establishing that the more specific explanation code suppresses the more general one was considered and rejected. Both glosses fit their overlapping outcomes, Blocker C does not need the question answered, and settling it here would create a convention no accepted source supports.

Registering an error code for same-level contention was rejected: it presupposes that the condition is a resolver error rather than structurally impossible or an authoring failure, which the authored `Rule` contract has not determined. A released code must not change meaning, so naming one before its condition is characterised is the same mistake in a different place.

Designating `LEAVE_UNALLOCATED` the product default for `leftoverPolicy` was rejected: no accepted source designates it, and a product default is a product commitment under Constitution Principle 2.

Per-leaf-field inheritance was rejected: a discriminated-union configuration cannot be assembled from two levels. Whole-rule inheritance was rejected: §9's allow-list is written per setting.

## Consequences

### Semantics now settled

- Additive versus replacing classification, per resolved settings slot.
- `globalObligations` is the sole V1 additive slot; every other slot is replacing.
- Precedence between **different** §6 levels 5 through 9, lower-numbered first.
- Per-slot inheritance along §9's channels.
- A rule with zero effective versions contributes no candidate, and resolution continues.
- Product-default fallback for the three slots that have an accepted product default.
- The explanation and skip producers listed above.

### Implementation now possible

Only a unit whose behavior is defined for every input its contract admits qualifies.

- A `RulePrecedenceLevel` vocabulary expressing §6's levels, with the V1 slot-competitor subset (5 through 9) and the exclusion of levels 1 through 4 documented, and tests establishing the §6 ordering.

Nothing else. In particular, no selection procedure over a candidate collection may be implemented, because such a collection can contain two candidates at one level and this decision does not say what then happens.

### Implementation still blocked

- Any replacing-slot winner selection over an arbitrary candidate collection, until same-level contention has an accepted outcome or an accepted input contract makes that state unrepresentable.
- Additive materialization of `globalObligations`, on the `sequence` source.
- The whole `ResolvedRuleSet` resolver.
- The authored-rule-to-level-and-slot projection.
- Any slot whose product default is missing.
- Blocker F.
- Every evaluation-context-dependent producer.

### Registries and contracts

No code registry changes. `RULE_ERROR_CODES`, `RULE_EXPLANATION_CODES` and `RULE_SKIP_REASON_CODES` are unchanged, and no `ResolvedRuleSet` field changes.

Blocker F remains open. Blockers D and E are already closed by Decision 075 and by Decision 074 respectively.

## Future Review Trigger

Reconsider when the authored `Rule` contract is accepted, since the level and slot projection and the characterisation of same-level contention both become determinable and a replacing-slot selector then becomes implementable; when an additive ordering source is accepted, since `globalObligations` then becomes materializable; when a product default is accepted for `leftoverPolicy` or `allocationBasis`; when an explanation multiplicity convention is accepted; if a simulation or event-level override contract is accepted, since §6 levels 3 and 4 would then need slot semantics; if a new `ResolvedRuleSet` slot is introduced, since it must be classified at contract time; or if a rule category is found to require a second additive slot.

---

# Decision 081: Authored Rule Ownership, Slot Kind and Precedence Derivation

**Status:** Accepted
**Related:** Decisions 010, 016, 017, 020, 022, 028, 068, 073, 074, 076, 077, 078, 079, 080
**Scope:** Financial logic, Architecture, Engineering

## Decision

An authored `Rule` carries a stable identity, an owner, and the kind of resolved structure it contributes to:

```ts
export type RuleOwner =
  | { readonly ownerType: 'GLOBAL' }
  | { readonly ownerType: 'INCOME_SOURCE'; readonly ownerId: EntityId }
  | { readonly ownerType: 'BUCKET';        readonly ownerId: EntityId }
  | { readonly ownerType: 'GROUP';         readonly ownerId: EntityId };

export type ResolvedSlotKind =
  | 'ALLOCATION_BASIS'
  | 'GLOBAL_OBLIGATION'
  | 'TOP_PRIORITIES'
  | 'REQUIRED_FUNDING'
  | 'LOWER_PRIORITY_POOL'
  | 'LEFTOVER_POLICY'
  | 'ROLLOVER_POLICY'
  | 'GOAL_POLICY';

export interface Rule {
  readonly ruleId: RuleId;
  readonly owner: RuleOwner;
  readonly slotKind: ResolvedSlotKind;
}
```

`RuleId` and `RuleVersionId` are unchanged from Decision 078.

## A slot kind is not an exact resolved address

`ResolvedSlotKind` identifies which rule-authored `ResolvedRuleSet` structure established by Decision 074 a rule contributes to. It has one member per such structure, so the vocabulary cannot drift from an accepted contract.

Its meaning is deliberately narrow. It is not an exact resolved address. It does not identify a bucket subject for keyed structures. It does not settle whether bucket identifiers are stable addressing or `RuleVersion` configuration. It does not establish a natural key or any uniqueness constraint.

`REQUIRED_FUNDING`, `ROLLOVER_POLICY` and `GOAL_POLICY` are keyed by bucket, and `TOP_PRIORITIES` and `LOWER_PRIORITY_POOL` carry per-bucket entries inside a plan-level structure. An exact address is a kind together with a subject, and this decision does not establish how a subject is determined in every case.

Where the subject is determined by accepted sources:

- a plan-level kind has no subject;
- a bucket-owned rule's subject is its owner;
- a group-owned rule contributes to that group's child buckets, derived from bucket-to-group membership, which is entity state supplied in the evaluation context rather than a rule field (Decision 010; PFOS-ENG-01 §5.4);
- a global rule addressing a bucket-keyed kind contributes to every bucket.

Where it is not determined, the reason is recorded in the next section.

`stageSequence` has no slot kind. Decision 080 records that no §5 category authors a stage order and that the sequence is Rule Engine output.

## Rule authoring granularity is not settled by this decision

For `TOP_PRIORITIES` and `LOWER_PRIORITY_POOL`, and for whether a non-bucket owner may supply a `REQUIRED_FUNDING` default, the corpus supports two readings and no accepted source chooses between them.

PFOS-ENG-01 §42.2 and §42.3, which are accepted configuration examples, carry `bucketIds` and `allocations: [{ bucketId, basisPoints }]` inside one configuration. Under that reading one plan-level rule holds the strategy and the membership together, the target buckets are versioned configuration, and changing the top-priority set is an edit producing a new version.

§5.3 lists "Priority rank" and "Eligibility for leftover funds" among rules attached to an individual bucket. Under that reading the bucket is the owner, and changing which bucket is a top priority means a different logical rule.

§5.2 lists "Use a different set of eligible buckets" as an income-source rule, which names buckets that cannot be its owner.

Decision 074's `ResolvedTopPriorityEntry.ruleVersionIds` and `ResolvedPoolDestination.ruleVersionIds` are plural, accommodating assembly from more than one rule version without requiring it.

This is not a configuration-payload question that can be deferred to the payload decision. It decides whether a target bucket is stable addressing or versioned configuration, and therefore what makes two authored rules the same logical rule. It is named here as the next required decision.

One consequence worth recording for that decision, as evidence rather than as a finding: under Decision 080's replacing semantics a bucket-owned membership rule sits at level 6 and would displace a global strategy rule at level 8 rather than combine with it.

## Ownership

Ownership is a discriminated shape rather than an `ownerType` paired with an optional `ownerId`. PFOS-ENG-01 §47.8 requires discriminated unions rather than loosely structured objects, and a global rule owns no entity, so an always-present-except-once identifier is exactly the shape §47.8 names. Decision 074 uses discriminated unions throughout the resolved contract.

`GLOBAL` carries no `ownerId`. The other three variants each carry one.

The four variants are the four authored levels of §6. §5 describes each category as "Rules attached to" an income source (§5.2), an individual bucket (§5.3) or a bucket group (§5.4); attachment is the corpus's own word for this relationship.

## Identity

A `Rule` is the stable logical rule. It persists across edits, and each edit creates a new `RuleVersion` rather than mutating the historical meaning of the previous one (§18, §19.1, §19.2; Decision 022). Decision 078 established this and the implemented `RuleId` already documents it.

`RuleId` remains that stable logical identity across every version.

A `Rule` additionally carries stable ownership and slot-kind information. Changing an owner or a slot kind creates a different logical rule rather than retroactively changing what all historical rule versions governed, which §19.1 forbids.

This does not make `owner` and `slotKind` the rule's natural key. A natural key — what makes two rules the same logical rule without consulting the surrogate identity — is not established here, and cannot be until authoring granularity is settled.

## Precedence is derived, never stored

`Rule` stores no precedence level. The §6 level is a total function of the owner:

```text
INCOME_SOURCE -> 5
BUCKET        -> 6
GROUP         -> 7
GLOBAL        -> 8
```

Storing the level as well would create two fields that can disagree.

No independent stored `RulePrecedenceLevel` vocabulary is introduced. Levels 5 through 8 relabel the owner variants, and level 9 has no owner because a product default is not a rule. Decision 080 recorded such a vocabulary as implementable rather than required; this narrows that option rather than contradicting it.

§43.2's worked precedence test is directly representable: three rules with `slotKind: 'ROLLOVER_POLICY'`, owned by global, group and bucket, resolving against the product default constant.

## ruleCategory is not part of the stable authored Rule

§41 lists `ruleCategory`. §41 is self-declared conceptual, and Decision 078 already amended it.

A §5 category cannot name a resolved slot kind. Decision 080 established that §5.1 feeds both the additive obligation slot and several replacing slots, so a category can feed more than one resolved slot kind and is therefore not the stable address. No accepted source supplies a category-to-slot mapping.

## ruleType is not part of the stable authored Rule

Rule type, policy type and funding type are versioned configuration. Decision 074 already places them there: `FundingRuleConfig.type`, `RolloverPolicyConfig.policyType` and `ResolvedLeftoverPolicy.policyType`.

An ordinary edit may change one while the rule remains the same logical rule. Changing a bucket from `PERCENTAGE_OF_INCOME` to `FIXED_MONTHLY` is such an edit, and §18 and §19.2 make an edit a new version. Storing the type on the stable `Rule` would force either mutating stable identity or minting a second rule, losing the version continuity §19.1 requires and §19.3 reports to the user.

No `RuleVersion` payload is designed here.

## Same-level contention remains unresolved

Decision 080 deferred to this contract whether two rules at one level addressing one slot are structurally impossible, invalid at authoring or activation time, or a resolver case. This decision does not answer it. It narrows the question instead.

No uniqueness key is adopted. The tuple `(ownerType, ownerId, slotKind)` was considered and is too coarse: for `TOP_PRIORITIES` and `LOWER_PRIORITY_POOL`, two rules sharing that tuple may legitimately target different buckets under one authoring reading and be duplicates under the other, so its validity depends on the unsettled granularity.

Separately, no uniqueness invariant can be stated over stable `Rule` fields alone. Effective periods belong to `RuleVersion` under Decision 078, so a rule-only validator cannot evaluate simultaneous applicability, and `Rule.status` is undefined, so a plan may legitimately hold a superseded rule at the same address as its replacement.

Two questions must therefore stay apart:

- structural uniqueness over authored addresses, which requires authoring granularity and lifecycle;
- evaluation-date applicability after Decision 079 version selection, which requires versions and an evaluation context.

No validator is authorised. No error code is registered. Decision 073's convention is that a code is named once the behavior it reports is specified, and that behavior is not yet specified.

## Product defaults are fallback constants, not authored Rules

§6 level 9 is a resolver fallback step rather than a fifth `RuleOwner` variant.

§8.1 calls the product default "a predefined fallback used only when the user has not made a choice". §18 requires every permanent rule to carry a created timestamp, effective start, optional end, status and version identifier, none of which a product default has. Decision 078 places the effective period on a version, and a product default has no period. §40's audit records a user's change with a previous and a new version, while a product default changes only when the application ships. Decision 074 stores the resolved set by value in a Plan Snapshot, so historical fidelity does not require defaults to be rules.

No missing product-default value is chosen here.

## A discovered provenance gap, recorded but not solved

`ResolvedRolloverPolicy`, `ResolvedGoalPolicy` and `ResolvedFundingRule` each carry a non-optional `ruleVersionId`. Under Decision 028 most buckets author no rollover rule, so their resolved entry would come from the product default and has no rule version to name.

This decision does not make `ruleVersionId` optional and does not amend Decision 074.

The decision that settles the missing terminal defaults must also settle how a default-sourced resolved entry expresses provenance. If that fix makes `ruleVersionId` optional on those shapes, it is a Decision 074 amendment requiring a `schemaVersion` change, because Decision 074 requires a schema-version change for any incompatible persisted-contract change.

## Deliberately deferred

- Rule authoring granularity for `TOP_PRIORITIES`, `LOWER_PRIORITY_POOL` and non-bucket-owned `REQUIRED_FUNDING`, which is the next required decision.
- The exact resolved address and any natural key.
- Same-level contention, and any uniqueness validator or error code.
- `Rule.status`, lifecycle, and how an open-ended rule is stopped.
- `currentVersionId`, `versionNumber`, `supersedesVersionId` and `changeReason`.
- The full `RuleVersion` configuration payload.
- `ResolvedGlobalObligation.sequence` and `ResolvedFundingRule.sequence`.
- The missing product-default values, and the provenance gap recorded above.
- Blocker F: eligible-income computation ownership.
- Evaluation-context population.
- Explanation multiplicity.
- Plan Snapshot design.
- Simulation overrides and event-level overrides.
- Cycle detection.
- Runtime freezing.
- Warning-array ordering.
- All Milestone 3 allocation behavior.

## Why

Decisions 078 and 079 each left `ownerType`, `ownerId`, `ruleCategory` and `ruleType` alone because they carry the §6 hierarchy that Blocker C gated. Decision 080 discharged that classification and named this contract as the prerequisite for the slot projection, resolver dispatch and same-level contention.

Two of §41's four addressing fields do not survive scrutiny. A category cannot name a slot kind, and a type is what an ordinary edit changes. What replaces them is smaller — an owner and a slot kind — and the kind is a transcription of an accepted contract rather than a new vocabulary.

The decision stops at the kind because the corpus does not yet say, for three of the eight kinds, whether a target bucket is the rule's owner or its configuration. Answering that by choosing whichever shape makes a uniqueness validator possible would be designing the model to reach a conclusion, which is the reverse of the proper order.

## Alternatives Considered

An exact-address model, in which a rule names both a kind and a subject, was rejected for now. The subject is either derivable — from the owner, from group membership, or universally — or it lives in configuration that has not been designed, and inventing an address structure would presuppose the granularity answer.

Splitting `TOP_PRIORITIES` and `LOWER_PRIORITY_POOL` into separate strategy and membership kinds, as Decision 080's classification list does, was rejected for addressing. §42.2 and §42.3 show strategy and membership in one authored configuration, so that split is a classification granularity rather than an established authoring one.

Omitting `ResolvedSlotKind` entirely and deciding ownership alone was considered. It carries no split risk, but it removes `ruleCategory` without supplying a replacement, leaving no accepted way to group candidate rules.

`ownerType` with an optional `ownerId` was rejected under §47.8.

Retaining `ruleCategory` or `ruleType` on the stable `Rule` was rejected for the reasons above. The `ruleType` objection is a versioning defect rather than a style preference.

Storing a precedence level, or storing a subject, was rejected. Both are derivable, and two fields that can disagree are not permitted.

Making the address the rule's identity and dropping `ruleId` was rejected. It would delete a field that Decision 074's `SkippedRule`, Decision 079's rule-level skip records and §40's audit all require, and it would force structural impossibility by construction rather than deriving it.

Adopting `(ownerType, ownerId, slotKind)` as a uniqueness key, authorising a duplicate-address validator, and registering an error code for it were each considered and rejected for the reasons recorded above.

Representing product defaults as authored rules was rejected for the reasons recorded above, notwithstanding that it would have concealed the provenance gap.

## Tradeoffs

The decision settles ownership and slot kind while leaving the exact address open, so addressing arrives across two decisions rather than one.

`ResolvedSlotKind` may need to split two of its members if authoring granularity later chooses per-bucket authoring, and `slotKind` is intended for persistence, so that would be a migration.

Same-level contention, which Decision 080 deferred to this contract, is deferred again — but to one named question rather than to a contract in general.

Ownership is settled while lifecycle is not, so a rule can be addressed before it can be stopped.

## Consequences

Milestone 2 may implement the ownership and slot-kind types and a derived precedence-level projection, with §6 ordering tests and §43.2's chain expressed as an ordering assertion.

No validator is authorised. No code registry changes. No `ResolvedRuleSet` field changes.

Decision 080's same-level deferral is narrowed rather than discharged, and its statement that no error code is registered stands unchanged.

Blocker F remains open.

## Future Review Trigger

Reconsider when Rule authoring granularity is settled, since the exact address, the natural key and same-level contention all become determinable; when `Rule.status` is defined; when the `RuleVersion` payload is designed; if Decision 074 gains a rule-authored structure, since `ResolvedSlotKind` must gain a member; or if the provenance gap is resolved by amending Decision 074.

---

# Decision 082: Rule Authoring Granularity for Bucket-Bearing Slot Kinds

**Status:** Accepted
**Related:** Decisions 013, 014, 020, 022, 028, 068, 071, 073, 074, 075, 076, 078, 079, 080, 081
**Scope:** Financial logic, Architecture, Engineering

## Decision

`TOP_PRIORITIES` and `LOWER_PRIORITY_POOL` are each authored as **one Rule per owner**, whose `RuleVersion` configuration carries the strategy together with the whole set of member buckets.

`REQUIRED_FUNDING` is authored **only by a bucket**, one Rule per bucket.

A bucket identifier is stable Rule addressing only where it is the rule's owner. Everywhere else a bucket identifier is versioned configuration or a derived scope.

This settles the granularity Decision 081 named as its next required decision.

## TOP_PRIORITIES

Owner `GLOBAL`. One Rule. Its configuration carries the strategy and the member buckets with their ranks or shares.

PFOS-ENG-01 §42.2 and §42.3 already show exactly this shape. The deciding evidence is not their convenience but §13.3: a `PERCENTAGE_SPLIT` is an authored percentage pool that must total exactly 10,000 basis points, and Decision 071 assigns that cross-entry invariant to the Rule Engine precisely because, as the implemented validator records, a single share cannot express it — it is a property of the collection. Per-bucket authoring would leave §13.3 unstatable, and §15.1 expressly says a single rate carries no sum requirement.

§13.1's remaining validations point the same way. "More than three top priorities" and "Duplicate priority positions" are properties of a set, and §21 frames validation as occurring on a configuration before activation.

Decision 074 makes the strategy and the membership inseparable: the entry type is a function of the strategy, since `ResolvedTopPriorityShare` exists only under `PERCENTAGE_SPLIT`. Strategy and membership are therefore one logical Rule, not two.

Member bucket identifiers, ranks and shares are versioned configuration.

Changing the set, the order, or the shares of priority buckets creates a new `RuleVersion` of the same Rule. It creates no new Rule and deletes none. It is an ordinary edit under §18 and §19.2, and Decision 022 makes it prospective.

### Clarification of §5.3

§5.3 lists "Priority rank" and "Custom allocation percentage" among rules attached to an individual bucket.

This decision authoritatively clarifies their authoring meaning. Both name bucket-level properties and effects: a bucket does have a priority rank, and it does have a share under a percentage split. Their values are authored inside the plan-level `TOP_PRIORITIES` `RuleVersion` configuration rather than in a rule attached to the bucket. They are not separate bucket-owned top-priority Rules.

Decision 068 places the accepted Decision Log above PFOS-ENG-01, so this clarification governs implementation.

A later editorial update to §5.3, restating those bullets as bucket-level effects rather than as separately authored bucket rules, is recommended. That documentation cleanup is not part of this decision and changes nothing here.

A further reason to prefer this reading: under Decision 080's replacing semantics, a bucket-owned membership rule at level 6 would displace a global strategy rule at level 8 rather than combine with it, which no source intends.

## LOWER_PRIORITY_POOL

One Rule per owner, whose configuration carries the strategy and the whole destination set with any shares or fixed amounts.

§14.3 requires an authored lower-priority percentage split to total exactly 10,000 basis points within its allocation pool — the same collection invariant. Decision 074 again makes the destination type a function of the strategy. And `ResolvedPoolFixedAmount.sequence` is a cross-destination competition order, which no bucket-owned rule could supply because no bucket knows its competitors.

A global pool Rule holds the default set. §14.1's even split remains Decision 014's product default where no such rule exists.

An income-source override is a whole-pool configuration, not a per-bucket override, and it replaces the global pool under Decision 080. This is the reading §5.2's "a different set of eligible buckets" requires.

Bucket eligibility is not one Rule per bucket. §14.2's "Bucket-specific eligibility" and "Exclusions" are expressed by membership and non-membership in the pool configuration. There is no per-bucket pool Rule authoring.

Destination bucket sets, shares, fixed amounts and order are versioned configuration.

Every owner authors a whole pool. Granularity does not vary by owner level for this kind.

### An unresolved corpus fragment

§5.4 lists "Default lower-priority allocation treatment" among group rules. §14 never mentions groups and the bullet is elaborated nowhere. Group-level authoring of this kind is not established for V1, and this decision invents no semantics for it.

### A corrected reading

§5.3's "Eligibility for leftover funds" concerns §16's Leftover Allocation Policy, which is a different slot kind. It is not evidence about the lower-priority pool.

## REQUIRED_FUNDING

Authored only by a bucket. `GROUP`, `GLOBAL` and `INCOME_SOURCE` do not author funding rules or funding defaults in V1.

§15 states the requirement of the bucket: "Every allocatable bucket must use one supported funding rule." Every field in §15.1 through §15.8 is an irreducibly per-bucket value — target amount, due date, current reserved balance, monthly minimum, deadline, minimum payment — so a higher-level default carrying one of them would be meaningless for its children. §5.3 carries the funding-shaped fields, and neither §5.1's nor §5.4's example list contains a per-bucket funding rule.

§8.4's generic "applicable global or group defaults" is not treated as authorising funding defaults. No funding-specific source supports it.

The funding type or strategy and its values remain `RuleVersion` configuration, as Decision 081 established.

### Two consequences

`ResolvedFundingRule.sequence` cannot come from a funding rule's own configuration, because a bucket-owned rule cannot know its competitors. This decision excludes that source and identifies no other. The ordering source remains open.

§15's "must use one" can only be satisfied by authoring, since no higher owner and no accepted product default supplies a funding rule. Whether that becomes a plan-completeness rule belongs to the terminal-default decision, which this decision does not settle.

## Stable addressing versus versioned configuration

A bucket identifier is stable Rule addressing only where it is the rule's owner — `REQUIRED_FUNDING`, and `ROLLOVER_POLICY` and `GOAL_POLICY` when bucket-owned.

Everywhere else a bucket identifier is versioned configuration or a derived scope. Sets of target buckets, priority ranks and order, percentage shares, fixed amounts, funding and policy types, eligibility, and destinations are all versioned configuration. §12.2 already lists a destination bucket among configurable fields.

## The complete authored Rule address

Decision 081's `owner` together with `slotKind` completely identifies an authored Rule's V1 scope. No additional stable `Rule` field is required, and none is introduced.

That authored scope projects to resolved output in three ways:

- for a plan-level kind, the authored scope corresponds directly to the resolved field, because the kind has no bucket subject;
- for a `BUCKET`-owned keyed kind, `ownerId` gives the exact bucket, so the authored scope names one bucket-keyed resolved entry;
- for a `GROUP`-owned or `GLOBAL`-owned scope default, the authored scope names a default rather than a destination, and its concrete bucket-keyed resolved addresses are derived later, from the authored scope together with membership and bucket state supplied in the evaluation context.

The authored address is therefore complete while the resolved address, for scope defaults, is not yet determinable from the `Rule` alone. That is a property of inheritance, which Decision 080 already governs, rather than a gap in addressing.

This is a complete authored Rule address. It is not an exact resolved address for scope defaults.

This decision does not settle evaluation-context population. It records that scope defaults depend on it, and nothing more.

## Same-level contention

The question Decision 080 deferred to Decision 081, and Decision 081 deferred to here, is now characterized in its authored form.

For the seven replacing kinds, two Rules sharing `(ownerType, ownerId, slotKind)` are semantically invalid. That tuple is a complete authored-scope key rather than an exact resolved bucket address, and the argument is made of the scope: a given owner has at most one such setting. §15 states it literally for funding; §13 and Decision 013 give the plan one top-priority plan; §14.3 one authored pool; §16.1 and Decision 020 one leftover policy; §17.1 and Decision 028 one rollover policy for a bucket, one default for a group, one default for the plan; §5.7 with Decisions 025, 026 and 027 one goal policy.

Granularity is what makes the key complete: for these kinds, no owner authors per-bucket targets except where the bucket is itself the owner, so two Rules at one owner and kind claim the same scope rather than different subjects. That was the objection Decision 081 recorded, and it no longer applies.

`GLOBAL_OBLIGATION` is exempt. More than one Rule at the same owner remains valid there, with the resolver semantics Decision 080 already accepted: separately authored obligations accumulate.

The key is structural, stated over stable `Rule` fields alone. `RuleVersion` effectiveness is not required, because two rules claiming one authored scope are meaningless whether or not their versions overlap.

### No validator and no error code

The condition is characterized but its domain is not. `Rule.status` is undefined, so whether a retained superseded or archived Rule may legitimately share an authored scope with its replacement is unknown, and an unconditional invariant over all Rules could wrongly reject a valid plan.

Decision 073's convention is that a code is named once the behavior it reports is specified. The behavior is not yet fully specified, so no validator is authorised and no error code is registered or named. `Rule.status` and lifecycle are not introduced here, and they still determine the set of Rules over which this uniqueness is enforceable.

## ResolvedSlotKind is unchanged

Decision 081 recorded that `TOP_PRIORITIES` and `LOWER_PRIORITY_POOL` might need to split into strategy and membership kinds if per-bucket authoring were chosen. It is not chosen, so both remain one kind and no member splits.

Splitting either would sever a discriminated union whose entry type depends on its strategy.

Decision 081's eight members stand unchanged. The migration risk it disclosed is discharged rather than realised, and no amendment to Decision 081 is required.

## Deliberately deferred

- The full `RuleVersion` configuration payload, now scoped by this decision.
- `Rule.status`, lifecycle, and stopping an open-ended rule, which also gate the uniqueness validator and its code.
- `ResolvedGlobalObligation.sequence`, and `ResolvedFundingRule.sequence` beyond the exclusion recorded above.
- Missing product-default values, product-default provenance, and Decision 081's `ruleVersionId` gap. Decision 074 is not amended here.
- Blocker F.
- Evaluation-context population, including the membership and bucket state on which scope defaults depend.
- Whether §5.4's group lower-priority bullet has any V1 meaning.
- Explanation multiplicity, Plan Snapshot design, simulation overrides, event overrides, cycles, runtime freezing, warning-array ordering, and all Milestone 3 behavior.

## Why

Decision 081 settled ownership and slot kind but could not settle addressing beyond the kind, because for three kinds the corpus did not say whether a target bucket was the rule's owner or its configuration. It named that as the next required decision.

The corpus does answer it, through the accepted decisions rather than through the two competing §5 and §42 readings, which sit at the same authority level. Decision 071's authored-pool invariant, Decision 074's strategy-dependent entry types, and the shipped authored-pool validator all require that a pool be one authored collection. §15 states the opposite granularity for funding, of the bucket, in words.

What that yields is a complete authored address rather than a complete resolved one. For scope defaults the resolved destinations still depend on evaluation context, and claiming otherwise would quietly settle a contract this decision must leave open.

## Alternatives Considered

Per-bucket authoring of top priorities, following §5.3's bullets, was rejected: it makes §13.3's authored pool and §13.1's set validations unstatable, and it puts a bucket rule at level 6 in a position to displace a global strategy rule at level 8.

A hybrid of a plan-level strategy Rule plus per-bucket membership Rules was rejected: Decision 074 makes the entry type depend on the strategy, so the two cannot be authored independently.

Per-bucket authoring of lower-priority pool membership was rejected for the same reasons, with `ResolvedPoolFixedAmount.sequence` as an additional obstacle.

Per-bucket income-source overrides of pool membership were rejected: §5.2 describes a different set.

Group or global authoring of funding defaults was rejected: no funding-specific source supports it, and §15's field lists are per-bucket values.

Describing `owner` together with `slotKind` as an exact resolved address was considered and rejected. It holds for plan-level and bucket-owned kinds but not for group-owned or global-owned scope defaults, whose concrete destinations depend on evaluation context, and asserting it would have implied a settlement this decision does not make.

Adopting a uniqueness validator and registering its error code now was considered. The key is complete, but the set of rules it ranges over is not, and naming a code before its condition is fully characterized is the error Decisions 080 and 081 both declined.

## Tradeoffs

§5.3's wording continues to invite a per-bucket authoring reading until it is editorially updated, even though this decision governs implementation under Decision 068.

Editing one member of a top-priority set rewrites a configuration containing all of them, so a version diff is coarser than a per-bucket model would produce.

A same-level uniqueness key is complete but cannot yet be enforced, so the invariant is known before it is checkable.

`ResolvedTopPriorityEntry.ruleVersionIds` and `ResolvedPoolDestination.ruleVersionIds` are plural but will carry a single element in V1. The shape is satisfied and Decision 074 needs no change.

## Consequences

Decision 081's `owner` together with `slotKind` becomes a complete authored Rule address for all eight slot kinds, with no new field. Concrete bucket-keyed resolved addresses for group-owned and global-owned scope defaults are projected later from the evaluation context.

Decision 081's `ResolvedSlotKind` is confirmed unchanged, and its disclosed split-and-migrate risk is closed.

Same-level contention is characterized in its authored form: semantically invalid for the seven replacing kinds, valid and already-specified for the additive one.

No validator is authorised, no code registry changes, and no `ResolvedRuleSet` field changes.

Blocker F remains open.

## Future Review Trigger

Reconsider when `Rule.status` is defined, since the uniqueness invariant then becomes enforceable; when the `RuleVersion` payload is designed; if an accepted source ever authorises funding defaults above the bucket, or gives §5.4's group lower-priority bullet a meaning; if a future slot kind lets a non-owner name subjects in its configuration, since the authored-address projection would then need revisiting; or when §5.3 receives the recommended editorial update.

---

# Decision 083: Rule Lifecycle, Status and the Stopping Constraint

**Status:** Accepted
**Related:** Decisions 022, 023, 068, 073, 074, 078, 079, 080, 081, 082
**Scope:** Financial logic, Architecture, Engineering, Data

## Decision

A `Rule` carries a lifecycle status with exactly two members:

```ts
export type RuleStatus = 'ACTIVE' | 'RETIRED';
```

The stable authored `Rule` of Decision 081 will carry `readonly status: RuleStatus` alongside `ruleId`, `owner` and `slotKind`, which are themselves unchanged.

`RETIRED` is terminal. The lifecycle of a logical rule admits one transition, from `ACTIVE` to `RETIRED`, and no return.

Status carries no date, and it is never read as financial truth.

Stopping a rule must be represented by a prospective, dated, append-only event in that rule's version timeline. The exact terminating representation is deferred to the `RuleVersion` payload decision and is not chosen here.

This decision settles lifecycle semantics. It does not settle persistence mechanics: whether the transition is represented by replacing a stored record, by an audit-carried event, or otherwise belongs to the repository and database specifications, and nothing here requires mutating a value in place.

## Three questions that must stay apart

`Rule.status` answers whether a logical rule is part of the user's current authored plan or is retained only as historical and audit state.

`RuleEffectivePeriod` together with Decision 079 answers which immutable `RuleVersion` is effective for a given date.

A terminating representation, once defined, answers whether the selected version contributes financial configuration or represents a stop.

These are three distinct questions and no two of them may be merged. Status carries no date; the effective period carries no lifecycle; a terminating semantic carries no plan membership. Every question containing a date is answered by the version timeline, and every question about membership of the current plan is answered by status.

The bridging invariant is that changing a rule's status must not change the resolved value for any date.

## Current status is not historical financial truth

Current `Rule.status` may govern current-plan membership and authoring operations, and it may govern the structural authored-scope uniqueness domain recorded below.

Current `Rule.status` must not, by itself, exclude a rule from resolution for an earlier evaluation date. A rule that is `RETIRED` today may be the rule that applied historically, and excluding it because of a later administrative state would rewrite the past — which Constitution Principle 11 forbids and PFOS-ENG-00 §32 Invariant 10 states as a global invariant. Decision 074 makes `HISTORICAL_RECALCULATION` a resolution mode, so a path that re-resolves for a past date exists and must remain correct.

It follows that no claim is made here that filtering `RETIRED` rules out of resolver population is result-preserving. It is not.

Nor is any claim made that date-based pre-filtering is necessarily result-preserving. Decision 079 fixes the shape of a rule-level `SkippedRule` for a rule with no effective version, and a rule removed from population before resolution cannot produce such a record, so a filter may leave the money identical while changing the explanation surface.

Which rules an evaluation context supplies, and whether it supplies all retained rules or a date-aware selection produced elsewhere, is evaluation-context population. Decision 081 and Decision 082 defer it and this decision defers it too. What is fixed here is only the constraint any such population must satisfy: it must include every retained rule that could have contributed on the evaluation date, and current status is not an admissible filter.

### A worked case

A bucket-owned `ROLLOVER_POLICY` rule A applied from January and was retired in June. A replacement rule B was created in June at the same authored scope.

A historical recalculation for March must reconstruct rule A. Rule A is in scope for that date because it was retained, not because of its present status; its January version is effective on that date and answers. Rule B contributes nothing, because its first version does not begin until June.

Resolution in August must resolve rule B and must not financially reactivate rule A. Rule A is again in scope, and again its status is not consulted; its own dated stop is what ends its contribution, and rule B's version is effective.

Both outcomes are produced by dated, immutable timelines. Neither reads current status. That is the whole of the model, and it is why the retirement precondition below is a requirement rather than a recommendation: without a dated stop, a retired rule and an active rule at one authored scope would be separable only by the status the resolver may not read.

## Stopping an open-ended rule

Decision 079 recorded that PFOS-ENG-01 §28 offers an author only "effective immediately" or "effective on a future date", and that no accepted gesture closes a previous version. Stopping an open-ended rule was left open there. It is constrained here.

A stop must be prospective under Decision 022, dated, append-only in the version timeline, and non-mutating with respect to every existing `RuleVersion`. Decision 078 fixes a version's effective period at creation, and §19.1 requires a version used in a confirmed allocation to remain reconstructable, so no existing version's period is amended to express a stop.

Decision 078 and Decision 079 do not already define such an event, and this decision does not claim that they do. Decision 079 establishes that a rule with **zero effective versions** contributes nothing for a date. It does not establish an **effective version that means "contributes nothing"**. That is a new `RuleVersion` semantic, and no accepted source supplies it.

The exact terminating representation is therefore deferred to the `RuleVersion` payload decision. Candidate representations exist and none is chosen here: a version whose configuration expresses no contribution, which is the direction §12.2 points by listing enablement among configurable fields beside an effective date; or a version-level terminal marker outside configuration, which Decision 078 declined to introduce but did not forbid. Selection and materialization semantics for whichever is chosen belong to that decision as well.

## Retirement

A rule may not become `RETIRED` unless its dated stop is represented in its version timeline. `RETIRED` asserts that such a stop exists; it never substitutes for one.

This is a semantic precondition, and two things require it. A retirement without a represented stop leaves a financial-history gap whose date was never recorded, which PFOS-ENG-01 §40 and Constitution Principle 12 both work against. More decisively, because date-based resolution does not read status, a retired rule whose timeline was never stopped remains indistinguishable from an active rule at the same authored scope on a current date.

No transaction or database mechanics are designed here, and no ordering between the two facts is prescribed. What is fixed is that a `RETIRED` rule whose stop is unrepresented is not a valid state.

Validating that precondition requires knowing the terminating representation, so enforcement is deferred with it. Import and restore are the sharp case, since §37 requires the Rule Engine to validate imported rules and PFOS-ENG-00 §29.1 treats imported content as untrusted.

## Temporary stopping and resuming

Temporary stopping is a dated timeline concept and not a status. The intended semantic is a dated stop followed, where the user resumes, by an ordinary configuration `RuleVersion` from the resume date, so the interruption is visible in the history rather than concealed behind an undated flag.

A resume requires no new semantic: it is an ordinary new version under §18 and §19.2. The stop half is not implementable until the terminating representation is defined, and nothing here should be read as saying otherwise.

An undated status meaning "temporarily off" is rejected. It cannot express a stop dated in the future, which §28 and Decision 022 both require, and it would leave an open-ended version appearing to have applied throughout a period the rule was off.

## Authored-scope uniqueness

Decision 082 characterized the condition — for the seven replacing slot kinds, two rules sharing `(ownerType, ownerId, slotKind)` claim one authored scope and are semantically invalid — but could not state the set of rules it ranges over, because lifecycle was undefined. That set is now defined.

The domain is the `ACTIVE` rules of the current authored plan. The key is `(ownerType, ownerId, slotKind)`, where a `GLOBAL` owner has no `ownerId` and keys on owner type and slot kind alone. `GLOBAL_OBLIGATION` remains exempt, since Decision 080 accepts that separately authored obligations accumulate.

`RETIRED` rules are excluded from this domain. A retired rule therefore never permanently blocks a replacement, and a retired rule may legitimately coexist with an `ACTIVE` rule at the same authored-scope key. That is the ordinary shape after a replacement, and it creates no current-plan ambiguity because exactly one rule at that scope is `ACTIVE`, while historical reconstruction is unaffected because the retired rule and all its versions are retained.

The invariant is structural. It consults no evaluation date, no `RuleVersion` effectiveness and no evaluation context, and it must not be confused with the retained-rule population that date-based resolution receives.

## Two pipelines

Authoring and plan validation read current status: the `ACTIVE` rules of the current authored plan are the domain over which authored-scope uniqueness is enforced.

Date-based resolution does not read status: retained relevant rules supply their `RuleVersions`, Decision 079 selects the version with the latest effective start, a terminating representation once defined determines whether the selected version contributes, and Decision 080 then resolves precedence across rules.

Decision 079 is unchanged, and lifecycle eligibility is deliberately not placed in front of it. Doing so would exclude historically relevant retired rules, which the section above forbids. Retained-rule population is not fully defined here.

## Deletion and retention

Normal physical deletion of a `Rule` is not supported in V1. Historical rules and their versions remain retained and auditable.

PFOS-ENG-00 §32 Invariant 12 requires every reference in a confirmed record to resolve to a valid entity or a preserved historical reference, Invariant 9 keeps historical operations tied to their Plan Snapshot, §19.1 requires reconstructability, and Decision 074's `sourceRuleVersionIds` names versions from inside a snapshot. PFOS-ENG-00 §15 lists soft deletion among the sanctioned change mechanisms and the PRD states that historical data should generally be soft-deleted rather than silently destroyed. A user-facing request to delete a rule is therefore retirement.

Full user-data deletion remains governed separately by the existing product policy and is untouched here.

No persisted rule draft is introduced. §21's activation gate is validation performed before activation, not a persisted state, and no accepted source establishes a stored pre-active rule.

## Consequence for the Rule contract

Decision 081 recorded `Rule.status`, lifecycle and how an open-ended rule is stopped in its deliberately deferred list. This decision discharges the first two and constrains the third. Decision 081 is extended rather than contradicted, and no amendment to it is required.

`RuleStatus` and the `status` field are recorded conceptually here and are not implemented by this decision. When implementation is authorised, the field is documented as excluded from resolution, because its hazard is precisely that a later reader will assume it filters candidates.

## No new code

No skip-reason code and no explanation code is introduced, and no error code is registered or named. Decision 073's convention is that a code is named once the behavior it reports is specified.

Whether a stopped or retired rule produces a `SkippedRule` at all depends on the resolver and on evaluation-context population, which Decision 079 expressly left open, and it depends further on the terminating representation. No existing skip code is reinterpreted here.

This decision fully characterizes the domain a future authored-scope uniqueness validator requires — `ACTIVE` rules, the current authored plan, Decision 082's key, and the `GLOBAL_OBLIGATION` exemption — so that validator becomes specifiable. Authorising it, and naming the code it reports, belongs to a separate decision.

## Deliberately deferred

- The terminating `RuleVersion` representation, and its selection and materialization semantics.
- The full `RuleVersion` configuration payload.
- Enforcement of the requirement that a `RETIRED` rule carry a represented dated stop, including on import and restore.
- Evaluation-context population, including which retained rules a resolution receives.
- Skip emission, and any explanation accompanying a stopped or retired rule.
- The authored-scope uniqueness validator and its error code.
- `ResolvedGlobalObligation.sequence` and `ResolvedFundingRule.sequence`.
- Blocker F.
- Missing product-default values and product-default provenance.
- Plan Snapshot design, simulation overrides, event overrides, cycles, runtime freezing, warning-array ordering, explanation multiplicity, and all Milestone 3 behavior.

## Why

Decision 079 recorded that no accepted gesture closes a previous version, and Decision 082 recorded that its uniqueness condition could not be enforced because the set of rules it ranges over was unknown. Both point at the same missing piece, and both name it as lifecycle.

The smallest thing that answers them is a two-member status that says only whether a rule belongs to the current plan. Everything dated stays where Decision 078 put it, on the version, so no second dated dimension is created and there are no two facts that can disagree — the objection Decision 081 raised against storing a precedence level applies unchanged to storing a dated lifecycle fact on the rule.

Separating current membership from historical truth is what makes the model safe. Once the resolver is forbidden to read status, a retirement can never alter a past answer, and the guarantee is structural rather than a matter of implementation discipline.

What that leaves unsolved is honest and bounded: the corpus supports the constraint that a stop is dated and append-only, but it does not supply the representation of a version that contributes nothing. Choosing one here would be designing the payload inside a lifecycle decision.

## Alternatives Considered

An undated `ACTIVE`/`INACTIVE` toggle was rejected. It cannot express a stop dated in the future, which §28 and Decision 022 require, and if the resolver read it a historical recalculation would return a different answer than the allocation it recalculates.

`ACTIVE`, `DISABLED` and `ARCHIVED` was rejected. `DISABLED` inherits the defect above, and `ARCHIVED` collides with bucket, group and goal archival, which already carry allocation meaning in §21.1, Invariant 7, `RULE_SKIP_DESTINATION_ARCHIVED` and the PRD's goal lifecycle. `RETIRED` appears nowhere in the corpus and carries no inherited meaning.

A `DRAFT` member was rejected as unsupported: §21 describes validation before activation, not a persisted pre-active rule. Should one later prove necessary it falls outside `ACTIVE` and therefore outside the uniqueness domain recorded above, so the domain statement does not have to change to accommodate it.

Introducing no status at all was considered seriously, with lifecycle carried entirely by the version timeline and soft deletion treated as repository state. It is smaller. It was rejected because §18 names status among the fields every permanent rule must have and no accepted decision has removed it, because soft deletion needs a marker distinguishing a rule removed from the plan from a rule currently contributing nothing, and because it would foreclose replacement by a new logical rule.

A dated stop field on `Rule` was rejected. It would have made lifecycle implementable immediately, without waiting for the payload decision, and being dated it would not have falsified history. It was rejected because it puts a second dated dimension beside the version timeline, with no defined meaning when a version is authored effective after the stop date, and because Decision 078 deliberately moved dates off the stable rule.

Mutating the previous version to add an `effectiveTo` was rejected. Decision 078 states that a version's effective period does not change after creation, and a version named from inside a Plan Snapshot would later resolve to a period other than the one that applied. Adopting it would require amending Decision 078.

Permitting resolver population to exclude `RETIRED` rules as an optimisation was considered and rejected as unsound, for the reasons recorded above.

## Tradeoffs

Lifecycle is settled while the stopping gesture is not implementable, so the user-visible ability to stop a rule arrives with the payload decision rather than with this one.

This decision constrains that payload decision to an append-only dated representation. That is intended, and it restates a consequence Decision 078 already imposes rather than adding a new prohibition.

The stable authored rule of Decision 081 gains a field that changes once over a rule's life, so `Rule` is no longer wholly unchanging even though its addressing fields are.

The requirement that a retired rule carry a represented dated stop is stated before it can be enforced, so the invariant is known ahead of its validator, as Decision 082's uniqueness condition was.

## Consequences

Decision 082's deferred enforcement question is answered: the authored-scope uniqueness invariant ranges over the `ACTIVE` rules of the current authored plan, and a bounded structural validator becomes specifiable without dates, versions or evaluation context.

`RuleStatus` and a `status` field on `Rule` may be implemented once authorised, together with the tests that accompany the existing contract.

No registry changes, no `ResolvedRuleSet` field changes, and no change to Decision 078 or Decision 079.

Blocker F remains open, and evaluation-context population remains the gate on skip emission.

## Future Review Trigger

Reconsider when the `RuleVersion` payload decision defines the terminating representation, since retirement's precondition then becomes enforceable and temporary stopping becomes implementable; when evaluation-context population is settled, since the constraint recorded here becomes checkable against a concrete population; if an authoring layer ever requires a persisted pre-active rule, since a third status member would then be argued for; or if a future source authorises a rule to be returned from `RETIRED` to `ACTIVE`, which this decision forbids.

---

# 3. Deferred Decisions

The following topics are intentionally postponed until later specifications or versions:

## V1 Technical Details Still to Define

* Exact frontend framework
* Exact TypeScript project structure
* IndexedDB library or wrapper
* State-management approach
* Styling system
* Charting library
* Worker strategy for large imports
* Backup JSON schema
* Exact scoring weights
* Exact Confidence Score formula
* Exact allocation precedence algorithm
* Exact API/interface names, other than the Rule Engine `ResolvedRuleSet` output contract, which is fixed by Decision 074

These should be resolved in the Engineering Architecture and engine specifications.

## Version 2 or Later

* Cloud synchronization
* User authentication
* Native mobile apps
* Live bank connections
* Physical money transfers
* Notifications
* AI habit learning
* Shared household budgets
* Multi-currency
* Advanced investment analytics
* Tax planning
* Complex life events
* Automated valuations
* User-approved adaptive rules

---

# 4. Decision Review Process

A major accepted decision should not be reversed informally.

To change one:

1. Identify the current decision.
2. Describe the new evidence or requirement.
3. Explain why the existing reasoning no longer applies.
4. Document the alternatives.
5. Identify affected engines and data migrations.
6. Create a replacement decision.
7. Mark the previous decision as superseded.
8. Add regression and migration requirements where relevant.

---

# 5. Final Decision Standard

When considering a new feature or architectural change, ask:

1. Which of the five core questions does it support?
2. Which engine owns it?
3. Does it duplicate an existing calculation?
4. Can the result be explained?
5. Does it preserve financial history?
6. Does it improve or reduce clarity?
7. Does it belong in V1?
8. What tradeoff does it introduce?
9. How will it be tested?
10. Could the user’s financial data be harmed if it fails?

When clarity and additional functionality conflict, PFOS chooses clarity.
