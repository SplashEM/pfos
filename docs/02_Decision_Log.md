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

# Decision 084: Authored-Scope Uniqueness Validation

**Status:** Accepted
**Related:** Decisions 068, 071, 073, 076, 078, 079, 080, 081, 082, 083
**Scope:** Financial logic, Architecture, Engineering

## Decision

The authored-scope uniqueness validator characterized by Decision 082 and given its domain by Decision 083 is authorised, together with one Rule Engine error code:

```text
RULE_DUPLICATE_AUTHORED_SCOPE, category VALIDATION
```

A plan is invalid when two `ACTIVE` rules of the current authored plan claim the same authored scope on a replacing slot kind.

## What this decision does, and what it does not

It performs the separate authorisation Decision 083 reserved: it authorises the validator and names the code it reports.

It does not amend Decision 082 or Decision 083, and it introduces no new semantics. The domain, the key and the exemption are taken from them unchanged.

Decision 068 places the accepted Decision Log above a task instruction, and Decision 083 reserved this authorisation to a separate decision. That is why the authorisation is recorded here rather than assumed by an implementation.

## Domain

The validator ranges over the `ACTIVE` rules of the current authored plan. `RETIRED` rules are excluded, as Decision 083 established, so a retired rule never permanently blocks a replacement and may legitimately share an authored scope with the active rule that replaced it.

The validator may inspect `Rule.status` itself. A caller may therefore supply the current plan's retained rule collection rather than being required to pre-filter it, and the domain cannot be widened by a caller that forgets to. This is the one place Decision 083 permits status to be read: current authored-plan structure, never date-based resolution.

Grouping rules by plan remains the caller's responsibility. The function reads no plan identifier and cannot confirm that a supplied collection is one plan's rules. No Plan repository or Plan domain contract is designed here, and Decision 079's version-history validator already carries the same limitation for one rule's versions.

## The authored scope

An authored scope is a `RuleOwner` value together with a `ResolvedSlotKind`.

Two `RuleOwner` values are equal when:

- both are `GLOBAL` — no `ownerId` exists on either;
- or both carry the same `ownerType` among `INCOME_SOURCE`, `BUCKET` and `GROUP`, and their `ownerId` values are equal.

Owner types are never compared across each other, so a bucket and a group carrying the same identifier value are two different scopes.

`GLOBAL` is not described as having an optional `ownerId`. It has no such field. PFOS-ENG-01 §47.8 requires a discriminated union rather than an always-present-except-once identifier, and Decision 081 adopted exactly that shape.

This is a clarification of the tuple shorthand used by Decisions 082 and 083, not an amendment. Decision 083 already states that a `GLOBAL` owner has no `ownerId` and keys on owner type and slot kind alone, and Decision 082 already states that `owner` together with `slotKind` completely identifies an authored rule's V1 scope. The key is unchanged.

## Slot kinds

`GLOBAL_OBLIGATION` is exempt. Decision 080 accepts that separately authored obligations accumulate, so more than one rule at one owner is valid there. The exemption is a property of the kind rather than of the owner, so it holds at every owner.

The seven replacing kinds are in scope:

- `ALLOCATION_BASIS`
- `TOP_PRIORITIES`
- `REQUIRED_FUNDING`
- `LOWER_PRIORITY_POOL`
- `LEFTOVER_POLICY`
- `ROLLOVER_POLICY`
- `GOAL_POLICY`

Seven replacing kinds plus one exempt kind exhausts `ResolvedSlotKind`, so no member is unclassified. No other exemption is introduced and no per-slot exception is invented.

## Structural only

The validator reads no `RuleVersion`, no `effectiveFrom` or `effectiveTo`, no evaluation date, no resolution mode, no evaluation context and no precedence, and it accepts none of them as input.

Decision 082 records why: two rules claiming one authored scope are meaningless whether or not their versions overlap, so version effectiveness can neither rescue nor excuse the collision. This must not be confused with the retained-rule population that date-based resolution receives.

`ruleId` is not part of the uniqueness key. Two rules carrying different identities collide whenever their authored scopes match, and different identifiers do not make duplicate authored scopes valid. Decision 081 already records that `owner` and `slotKind` are not the rule's natural key, precisely because `ruleId` is the surrogate identity that persists across every version.

## Valid

- An `ACTIVE` rule and a `RETIRED` rule at one authored scope. This is the ordinary shape after a replacement.
- Two `RETIRED` rules at one authored scope. Neither is part of the current plan.
- Several `ACTIVE` `GLOBAL_OBLIGATION` rules at one owner.
- One replacing kind at different `ownerId` values of one owner type.
- One replacing kind at different owner types. §43.2's worked precedence chain is exactly this shape and must remain expressible.
- One owner holding several different replacing kinds.
- An empty collection.

## Invalid

Two `ACTIVE` rules sharing one replacing authored scope, at:

- `GLOBAL`;
- `BUCKET` with the same bucket `ownerId`;
- `GROUP` with the same group `ownerId`;
- `INCOME_SOURCE` with the same income-source `ownerId`.

## What this validator does not check

It does not validate whether a particular owner type may author a particular slot kind.

Decision 082 confines `REQUIRED_FUNDING` to bucket owners in V1, and records that §5.4's group lower-priority bullet has no established V1 meaning. Neither is enforced here, and neither is authorised as a validator by this decision.

Authorising uniqueness must therefore not be read as establishing that every combination of `RuleOwner` and `ResolvedSlotKind` is valid authoring. Owner-and-kind legality is a separate concern and remains open.

## Failure, multiplicity and determinism

A collision is a hard validation error under §21.1 and blocks activation.

The validator reports a single `RuleDomainError` and introduces no aggregation. Every existing Rule Engine validator returns one error, and no accepted PFOS contract defines how multiple simultaneous validation failures are aggregated or ordered. This decision follows that existing single-error convention and introduces no multi-error aggregation contract; it takes no position on whether such a contract could later be defined.

No first or primary offending rule is named, and no `ruleId` tie-breaker is introduced. `ruleId` is not part of this invariant, so no identifier ordering is needed here and none is authorised.

The valid-or-invalid outcome must not depend on the order of the supplied collection, on rule identifiers, or on object iteration order. Because the reported error carries no identity-specific payload, every rejection uses the same fixed error value, so the returned result is unchanged by the arrangement of the input even though the order in which a collision is encountered may differ.

## Error contract

Exactly one code is authorised:

```text
RULE_DUPLICATE_AUTHORED_SCOPE
```

Its category is `VALIDATION`, matching `RULE_TOP_PRIORITY_DUPLICATE_RANK` and `RULE_VERSION_DUPLICATE_EFFECTIVE_FROM`, the two existing duplicate-detection codes. Decision 079 considered `CONFLICT` for the nearer of those and preferred consistency, recording that §39's `RuleConflictError` names an error concept rather than one of PFOS-ENG-00 §22's closed categories; the same reasoning applies here.

No second code is introduced for any owner type or any slot kind.

`affectedEntityIds` is omitted, and the error interpolates no identifier or other context. Both rules sharing an authored scope are equally part of the collision, no accepted source says which is at fault, and populating the field would establish the first ordering convention for the error channel without a decision behind it. Every existing Rule Engine validator omits it on the same grounds.

The smallest existing `RuleDomainError` shape is therefore sufficient, and every duplicate-authored-scope rejection may use the same fixed error value.

## Identifier handling

An identifier is opaque (PFOS-ENG-00 §14). This validator compares owner identifiers for equality only. It does not parse an identifier, derive meaning from its shape, or infer ordering from it.

It must not build a delimiter-concatenated composite key whose correctness depends on identifier contents. §14 fixes no identifier format and PFOS-ENG-00 §29.1 treats imported content as untrusted, so an identifier containing the chosen delimiter could fabricate or conceal a collision. This constraint is normative.

The representation used to detect a repeated scope is not fixed here. Any representation that preserves the semantics above is permitted.

## Validator API

The bounded API authorised is:

```ts
validateDistinctAuthoredScopes(rules: readonly Rule[]): Result<void, RuleDomainError>;
```

It follows the existing convention: one subject or one readonly collection in, `Result<void, RuleDomainError>` out.

No structural `Like` contract is introduced. Decision 079's version validator needed one because `RuleVersion` did not exist; `Rule` exists and is complete, so this validator takes it directly.

No repository, Plan contract, persistence, resolver or evaluation-context API is designed.

## Deliberately deferred

- The terminating `RuleVersion` representation, and enforcement of Decision 083's requirement that a `RETIRED` rule carry a represented dated stop.
- Any owner-and-kind authoring-legality validator.
- Historical resolution and resolver candidate population.
- Skip and explanation emission.
- The full `RuleVersion` configuration payload.
- Blocker F.
- `ResolvedGlobalObligation.sequence` and `ResolvedFundingRule.sequence`.
- Missing product-default values and product-default provenance.
- Plan Snapshot design, and all Milestone 3 behavior.

## Why

Decision 082 characterized the condition but could not state the set of rules it ranges over. Decision 083 supplied that set and then reserved the authorisation itself, on Decision 073's convention that a code is named once the behavior it reports is specified. The behavior is now specified in full, so the remaining step is authorisation rather than design.

Nothing here is a new product or financial judgement. The domain, key, exemption and failure class are quoted from accepted decisions, and the API, multiplicity and payload follow conventions with several shipped precedents.

The one clause that is not a quotation is the identifier-handling constraint, and it is a consequence of §14 and §29.1 rather than a choice: a validator whose correctness depends on the byte content of an opaque identifier would be unsound against untrusted import data.

## Alternatives Considered

`CONFLICT` and `INVARIANT_VIOLATION` were considered as categories. `VALIDATION` was preferred for consistency with the two existing duplicate codes, one of which reports a determinism-invariant defect and still uses `VALIDATION`.

`RULE_AUTHORED_SCOPE_DUPLICATE` and `RULE_AUTHORED_SCOPE_NOT_UNIQUE` were considered as names. Neither is materially better: the registry's duplicate codes qualify the prefix when the subject is a sub-entity, and here the subject is the rule itself, so no qualifier is needed.

Reporting every collision rather than one was considered and not adopted, because no accepted contract defines aggregation or ordering of simultaneous validation failures and this decision introduces none.

Populating `affectedEntityIds` with the colliding rules was considered and rejected for the reason the shipped validators already record.

Requiring the caller to pass a pre-filtered `ACTIVE` collection was considered and rejected: it moves a decided domain into an unwritten caller.

Fixing a particular data structure — nested maps and sets keyed by slot kind, owner type and owner identifier — was considered as normative and rejected. It is a safe example and is recorded here as implementation guidance only, explicitly non-normative.

## Tradeoffs

The invariant becomes enforceable while the caller that assembles a plan's rules does not yet exist, so the validator is implementable before anything calls it.

A single error means a plan holding several collisions reports one of them, and the author fixes them one at a time.

An error naming no entity is precise about the defect and silent about where it is, which a future user interface may want to improve; doing so requires an accepted decision about the error channel.

## Consequences

`validateDistinctAuthoredScopes` may be implemented in Milestone 2, alongside the existing validators and following their conventions.

`RULE_DUPLICATE_AUTHORED_SCOPE` joins `RULE_ERROR_CODES`. The four-registry architecture tests cover it without change, since it carries the `RULE_` prefix, none of the reserved `RULE_EXPLAIN_`, `RULE_SKIP_` or `RULE_WARN_` prefixes, and a key identical to its value.

§21.1's enumerated hard-error list gains one condition, derived from the "rule violates a system invariant" bullet already present there.

No contract changes, no registry value changes, no `ResolvedRuleSet` field changes, and no change to Decision 079 or Decision 083.

## Future Review Trigger

Reconsider if an accepted decision ever defines aggregation or ordering of simultaneous validation failures, since reporting every collision would then become expressible; if owner-and-kind authoring legality is settled, since a second validator would join this one; if `ResolvedSlotKind` gains a member, since it must be classified as replacing or additive; if a future slot kind becomes additive, since the exemption list would grow; or if `Rule.status` gains a member, since the domain statement would need to say where it falls.

---

# Decision 085: Terminating Rule Versions

**Status:** Accepted
**Related:** Decisions 022, 068, 073, 074, 078, 079, 080, 081, 082, 083, 084
**Scope:** Financial logic, Architecture, Engineering, Data

## Decision

A rule's contribution is stopped by appending a terminating version to its timeline:

```ts
export interface TerminatingRuleVersion {
  readonly kind: 'TERMINATING';
  readonly ruleVersionId: RuleVersionId;
  readonly ruleId: RuleId;
  readonly period: {
    readonly effectiveFrom: FinancialDate;
  };
}
```

A `RuleVersion` will be a discriminated union on `kind`, whose other arm carries the rule's configuration. Only the terminating arm and its discriminant literal are fixed here. The configured arm, the union name, and any closed `kind` vocabulary belong to the `RuleVersion` payload decision: nothing today requires a closed kind type, and declaring one would close a variant vocabulary this decision has no authority to close.

This discharges the representation Decision 083 deferred.

## Why an explicit discriminated variant

An intentional stop must be explicit and impossible to confuse with incomplete or corrupt data.

A configuration-level `enabled` flag and an absent or nullable configuration were both rejected. Each requires the deferred payload, and the second reads silence — including a truncated import, which PFOS-ENG-00 §29.1 treats as untrusted — as a financial instruction. An independent `terminatesRule` boolean was rejected because a version could carry it alongside a live configuration, the two-fields-that-can-disagree hazard Decision 081 rejected for a stored precedence level and Decision 083 rejected for a dated status. A separate stop entity outside the version timeline was rejected because Decision 083 requires the stop to live in that timeline, and a second timeline reintroduces the same hazard.

PFOS-ENG-01 §47.8 requires discriminated unions rather than loosely structured objects, and Decisions 074 and 081 use that shape throughout.

A terminating version carries no configuration field at all, so a terminating version holding financial configuration is unrepresentable rather than merely invalid.

## Field names are fixed by shipped code

The period field is named `period`, not `effectivePeriod`, matching the shipped `RuleVersionEffectivePeriodLike`, whose documentation records that a future `RuleVersion` will satisfy it structurally without either type changing.

Because `selectRuleVersionEffectiveOn` is generic over that shape and returns the caller's own object, a terminating version flows through Decision 079 selection with no change to Decision 079 and no change to its implementation.

## A stop is open-ended

A terminating version carries `effectiveFrom` and no `effectiveTo`, and its narrowed period makes carrying one unrepresentable. A bounded terminating version is not permitted.

The reason is a concrete hazard rather than a preference. A bounded stop would drop out of `isEffectiveOn` when its bound elapsed, leaving an older open-ended configured version as the only effective candidate, so under Decision 079 that older version would be selected again and terms the user stopped would resume with no authored act at any point. That is a silent financial decision under Constitution Principle 4 and an unauthored change under Decision 022. Permitting both forms would also give two ways to express one timeline, one of them carrying that hazard.

Resumption is always an explicit later configured version. Because the constraint is structural, no validator and no error code is introduced for it.

## Stopping is prospective

Decision 083 requires a stop to be prospective. §28's two gestures map directly: effective immediately is a stop dated today, and effective on a future date is a stop dated then. There is no retrospective-stop gesture.

This constrains stop authoring semantics specifically. It does not amend Decision 078's general `RuleVersion` date validity: Decision 078 permits a past `effectiveFrom` by declining to prohibit it, and Decision 083 supplied the prohibition for stops.

Prospectivity is checked when a stop is authored, against a supplied authoring date. It is not a property of stored history and must not become one. The domain may not read a clock (PFOS-ENG-00 §13.4), and a stop authored today is in the past tomorrow, so a stored-history validator comparing old stops against "now" would reject every historical stop a day after it was authored. No authoring layer is implemented here, so the check is deferred with it.

## Selection and meaning

Decision 079 is unchanged. It selects the version with the latest `effectiveFrom` among the versions in effect. Before the stop date the previous version is the only effective candidate; from the stop date onward both are effective and the later start wins, which Decision 079 records as the ordinary shape. Their starts differ, so the duplicate-start validator is satisfied without change.

What a selected version means belongs to this contract rather than to Decision 079, which selects but does not materialize:

- a selected `CONFIGURED` version contributes its configuration;
- a selected `TERMINATING` version means the rule contributes nothing for that date.

This is post-selection meaning. It does not amend the Decision 079 selection algorithm.

## Two states that are not the same

A rule with **no effective version**, where selection returns nothing, and a rule whose **effective version terminates it** both contribute nothing. They are not the same state, and they must not be merged.

Only the second records an authored, dated act. The first says only that the timeline covers nothing on that date.

## Temporary stopping

A stop followed by a later configured version is a temporary stop, and the interruption is visible in the timeline rather than concealed. No `Rule.status` change is required for a temporary stop, and several terminating versions may occur over one rule's lifetime.

```text
v1 CONFIGURED   effectiveFrom 2026-01-01
v2 TERMINATING  effectiveFrom 2026-06-01
v3 CONFIGURED   effectiveFrom 2026-09-01

January–May    v1 contributes
June–August    v2 is selected; the rule contributes nothing
September on   v3 contributes
```

## Retirement

A `RETIRED` rule must have at least one `RuleVersion`, and the version with the greatest `effectiveFrom` must be `TERMINATING`.

The consequences are:

- `RETIRED` with zero versions is invalid;
- `RETIRED` over a configured-only history is invalid;
- configured January, then terminating June, then `RETIRED` is valid;
- configured January, terminating June, configured September, then `RETIRED` is invalid;
- configured January, terminating June, configured September, terminating December, then `RETIRED` is valid, because the June stop was temporary and the December stop is the retirement.

No zero-version exception is made. Decision 083 states that a rule may not become `RETIRED` unless a dated stop is represented in its version timeline, and an empty timeline represents none. Nothing is blocked by this: such a rule is retired by first appending a terminating version, which requires no predecessor, and the result records the date the rule left the plan.

A history whose latest-start version is configured is invalid because the rule would contribute again after retirement, contradicting Decision 083's terminality.

The greatest `effectiveFrom` is unique once Decision 079's duplicate-effective-start invariant holds, so this invariant is well defined for valid histories and composes after that check rather than replacing it.

## A future-dated permanent stop

A permanent terminating version may be scheduled for a future date. While a configured version still governs the current date, `Rule.status` remains `ACTIVE`, and `RETIRED` must not become true before the permanent terminating version is in force.

Decision 083 defines status as membership of the user's current authored plan, and a rule whose configured version still governs is part of that plan. Marking it retired would assert something false about the present.

The constraint is one-directional. `RETIRED` requires the permanent stop to be in force; the converse is not required. A terminating version may be in force while `Rule.status` remains `ACTIVE`, which is exactly the valid temporary-stop state.

No automatic status transition at the stop date is implied or required by this decision. Who or what performs `ACTIVE` to `RETIRED` remains deferred to authoring, orchestration and persistence design, which Decision 083 already places outside the domain. Status still carries no date and none is stored beside it: the timeline invariant above is date-free, and the timing constraint is a condition on when `RETIRED` may be true rather than a property stored on the value.

## Why retirement cannot be established early

Decision 084 validates authored-scope uniqueness over the `ACTIVE` rules of the current authored plan.

If a rule were marked `RETIRED` while its configured version still governed the current date, it would leave that uniqueness domain while still contributing financially, and a replacement `ACTIVE` rule could claim the same authored scope too early. Two rules would then contribute at one authored scope, which Decision 082 characterizes as semantically invalid, and the uniqueness validator could not see it.

A rule that is merely stopped and still `ACTIVE` remains inside the uniqueness domain, which is correct: the user has stopped the rule without removing it from the plan, so the authored scope is still claimed.

## Enforcement is deferred

No validator and no error code is authorised here for the prospectivity constraint or for the retirement invariant.

The retirement check spans a rule together with its versions, and no accepted contract pairs them: `validateDistinctRuleVersionEffectiveStarts` takes versions alone and `validateDistinctAuthoredScopes` takes rules alone. The prospectivity check requires an authoring layer that supplies the authoring date, and none exists.

## Skip codes

`RULE_SKIP_NOT_EFFECTIVE_ON_EVALUATION_DATE` must not describe a selected terminating version. Its registered meaning is that no version was in effect on the evaluation date; in this case a version is effective and is selected.

Whether a selected stop emits another skip, emits an explanation, or remains silent depends on the resolver and on evaluation-context population, which remain open. No code is introduced and no existing code is reinterpreted.

## Provenance is deferred

Whether a selected terminating version's identifier belongs in `sourceRuleVersionIds` is not settled here, and Decision 074 is not amended.

The tension is recorded rather than resolved. Decision 074 defines that field as naming the versions that produced the resolved values, and a terminating version produces an absence rather than a value. Constitution Principle 12 requires a user to determine which rule version was used, which pulls the other way. The field is flat, de-duplicated and sorted, so an entry that produced no value would be indistinguishable from one that did. The question is entangled with Blocker C and with the provenance gap Decision 081 recorded, and adopting inclusion would require amending Decision 074 and changing `schemaVersion`.

## Deliberately deferred

- The configured `RuleVersion` payload, the full `RuleVersion` union, and any closed `RuleVersion` kind vocabulary.
- `sourceRuleVersionIds` treatment for a stop.
- Skip and explanation emission for a stop.
- The prospectivity check and the authoring layer that supplies its date.
- The retirement invariant's validator and any error code it would report.
- The mechanics of the `ACTIVE` to `RETIRED` transition.
- Owner-and-kind authoring legality.
- Resolver population, Blocker C and Blocker F.
- `ResolvedGlobalObligation.sequence` and `ResolvedFundingRule.sequence`.
- Product-default provenance.
- Plan Snapshot implementation, and all Milestone 3 behavior.

## Why

Decision 083 fixed that a stop must be prospective, dated, append-only and non-mutating, and deferred only its representation. Decision 079 establishes that a rule with zero effective versions contributes nothing, but it does not establish an effective version that means "contributes nothing"; that is the semantic this decision supplies.

The smallest representation that cannot be confused with missing data is an explicit variant. Every alternative either depends on the deferred payload or admits a state where a stop and a configuration coexist, and in a system asserting money to the cent, silence must never read as an instruction.

The remaining clauses follow from that choice. An open-ended stop follows from Decision 079's selection rule, since any bound would hand the answer back to an older version. The retirement invariant follows from Decision 083's terminality. The timing constraint on `RETIRED` follows from Decision 083's definition of status together with Decision 084's uniqueness domain.

## Alternatives Considered

A nullable or absent configuration meaning "stop" was rejected: §29.1 treats imported content as untrusted, and a truncated record would become a deliberate financial stop.

A `configuration.enabled` flag was rejected: it requires the deferred payload, and every future payload would repeat the flag. PFOS-ENG-01 §12.2 lists enablement among the tithing rule's configurable fields, which is the only corpus evidence for it, and it concerns one category's configuration rather than version lifecycle.

An independent `terminatesRule` boolean was rejected: it permits a terminating version that also carries configuration.

A separate stop entity or second timeline was rejected: Decision 083 requires the stop to be an event in the version timeline.

`effectivePeriod` as the field name was rejected because shipped code fixes `period`, and changing it would break a documented structural promise.

Introducing `RuleVersionKind` or the full `RuleVersion` union now was rejected as premature: nothing today requires a closed kind vocabulary, and Decision 081 declined an unnecessary vocabulary on the same grounds.

A bounded terminating version was rejected for the silent-resumption hazard recorded above.

A zero-version exception to the retirement invariant was rejected: it would add to Decision 083 rather than apply it, and it is unnecessary because a terminating version can always be appended first.

Permitting `RETIRED` while a configured version still governs was rejected for the Decision 084 interaction recorded above. Decision 083's wording alone does not settle it; the consequence does.

## Tradeoffs

The terminating variant is fixed while the configured variant is not, so the `RuleVersion` union arrives across two decisions.

The terminating variant's period is narrower than `RuleEffectivePeriod`, so the two variants are not perfectly symmetric. That asymmetry is what removes a validator, an error code and a financial hazard.

Two retirement conditions are stated before either is enforceable, so the invariant is known ahead of its validator, as Decision 082's uniqueness condition was.

A user who schedules a future permanent stop must still have `RETIRED` established separately once it is in force, and no mechanism for that is designed here.

## Consequences

`TerminatingRuleVersion` may be implemented in Milestone 2, with no change to Decision 079's implementation and no change to any existing contract, registry or `ResolvedRuleSet` field.

Decision 083's stopping constraint becomes satisfiable in code, and its retirement precondition becomes statable as the invariant above.

No error code is registered and no validator is authorised.

## Future Review Trigger

Reconsider when the `RuleVersion` payload decision supplies the configured arm, since the union and any kind vocabulary are formed then; when a contract pairing a rule with its versions exists, since both retirement conditions become enforceable; when an authoring layer exists, since prospectivity becomes checkable; when evaluation-context population and Blocker C are settled, since skip emission and provenance for a stop become determinable; or if a future variant of `RuleVersion` is required beyond configured and terminating.

---

# Decision 086: The Configured Rule Version Envelope and Configuration Family Discrimination

**Status:** Accepted
**Related:** Decisions 022, 068, 071, 073, 074, 075, 076, 078, 079, 080, 081, 082, 083, 084, 085
**Scope:** Financial logic, Architecture, Engineering

## Decision

A configured rule version carries, at minimum:

- a discriminant fixing it as `CONFIGURED`;
- `ruleVersionId`, its own identity;
- `ruleId`, the stable rule whose timeline it belongs to;
- `period`, being Decision 078's `RuleEffectivePeriod` in full;
- `configuration`, a required and non-nullable configuration value.

`RuleConfiguration`, when it is eventually defined, is an explicitly discriminated union whose family tag is carried inside the configuration value and draws its members from the existing `ResolvedSlotKind` vocabulary.

This is a conceptual envelope, in the register of PFOS-ENG-01 §41, which closes by recording that exact field types belong to other specifications. It is not an implementable contract, and no source implementation is authorised.

## What this decision is, and what it is not

Decision 085 assigned the configured arm, the union name and any closed `kind` vocabulary to "the `RuleVersion` payload decision". This decision splits that work and discharges only the envelope and discrimination half of it.

It settles the configured discriminant, the minimum conceptual envelope, configured effective-period semantics, the configuration-family discrimination architecture, the absence of a named kind vocabulary, and a blocker inventory.

It defines no configuration payload arm, resolves no `RuleVersion` metadata question, and authorises no code.

The remainder — the configuration payload, its arms, and the metadata questions recorded below — belongs to the decision or decisions that complete the `RuleVersion` contract.

## The five elements are a minimum, not a closed field list

The five elements above are the least a configured rule version can carry.

This decision does not close the field list. Nothing here may be read as establishing that a configured rule version carries those five elements and nothing else, and whether further fields join them is unresolved and recorded below.

## The CONFIGURED discriminant

Decision 085 fixed the terminating arm and recorded that "only the terminating arm and its discriminant literal are fixed here".

The configured literal is fixed here, as `CONFIGURED`. That is the spelling Decision 085 already used when recording that a selected `CONFIGURED` version contributes its configuration, so this performs an act Decision 085 identified rather than introducing a new term.

## Configuration is required and non-nullable

`configuration` is never absent and never nullable.

Decision 085 rejected an absent or nullable configuration as a way of expressing a stop, because PFOS-ENG-00 §29.1 treats imported content as untrusted and a truncated record would become a deliberate financial instruction. The same reasoning fixes the element as required here: a configured version whose configuration is missing must be unrepresentable rather than merely invalid, so that silence is never read as an instruction under Constitution Principle 4.

No placeholder stands in for the undefined payload. `unknown`, `Record<string, unknown>`, arbitrary JSON and any invented placeholder type are excluded. Each would let a contract compile at the cost of admitting configurations no accepted source describes, and PFOS-ENG-01 §47.9 requires unknown rule variants to be rejected rather than accommodated.

## Configured versions use the full effective period

A configured rule version's period is Decision 078's `RuleEffectivePeriod`, including its optional `effectiveTo`. A configured version may be bounded or open-ended, and both are valid.

The element is named `period`, not `effectivePeriod`, matching the shipped `RuleVersionEffectivePeriodLike` and the field-name clause of Decision 085.

Decision 078 is unchanged.

Decision 085's narrowing of the period to `effectiveFrom` alone remains specific to `TerminatingRuleVersion` and is not generalised. That narrowing answers a hazard particular to stops: a bounded stop would drop out of `isEffectiveOn` when its bound elapsed, leaving an older open-ended configured version the only effective candidate, so terms the user stopped would resume with no authored act at any point. A configured version carries no equivalent hazard, because an elapsed configured version leaves either an older configured version or a stop, and both are authored.

`validateRuleEffectivePeriod` and `RULE_EFFECTIVE_PERIOD_INVALID_RANGE` acquire their first possible producer once a configured arm exists. Neither is invoked, extended or changed here.

## The conceptual variants

A rule version is conceptually `CONFIGURED` or `TERMINATING`. No third variant is established by this decision or by any accepted source.

No `RuleVersionKind` is introduced. A named closed vocabulary is unnecessary before the union exists, and Decision 081 refused an equivalent second name for the precedence levels on the ground that a duplicate vocabulary is an invitation to store a field that can disagree with the one it duplicates.

## Configuration family discrimination

When `RuleConfiguration` is defined, it will be an explicitly discriminated union whose family tag:

- is carried inside the configuration value, not on the outer configured rule version;
- draws its members from the existing `ResolvedSlotKind` vocabulary;
- leaves each family's own inner discriminant from Decision 074 unchanged, so `type`, `policyType` and `strategy` keep their accepted names and meanings.

No second `slotKind` field is placed on the configured rule version itself. The envelope's five elements stand as recorded above.

This is a new architectural choice made here. It is not implied by Decision 081, which placed `slotKind` on the stable `Rule` and said nothing about configuration, nor by Decision 074, which named the inner discriminants without addressing how families are told apart.

## Why a family tag is necessary, and why it reuses ResolvedSlotKind

Four shapes were considered and three rejected.

**No family tag, discriminating on the inner discriminants alone**, was rejected. `GOAL_POLICY` configuration has no variant discriminant of any kind — Decision 074 gives it four flat boolean fields — so no inner-discriminant scheme can distinguish it from another family. Independently, inner literals repeat across families: `PERCENTAGE_SPLIT` appears under `strategy` for top priorities and for the lower-priority pool, and under `policyType` for the leftover policy, so a single flat union would carry arms sharing one discriminant value as soon as those families are defined.

**Discriminating by which payload key is present** was rejected. PFOS-ENG-01 §47.8 requires discriminated unions rather than loosely structured objects, and key presence is the shape it names. It makes a mixed payload undetectable rather than impossible, and it gives imported or restored data no single field to validate, which PFOS-ENG-00 §29.1 and PFOS-ENG-01 §37 both require, and no clean way to satisfy §47.9's requirement that unknown rule variants be rejected.

**A new parallel family vocabulary** was rejected. It would duplicate `ResolvedSlotKind` under a second name and replace a plain equality relationship with a mapping that can itself drift. Decision 081 refused a second name for the precedence levels on the same grounds.

**A generic or mapped type carrying no runtime discriminator** was rejected. Type parameters erase at run time, so a runtime tag would still be required to deserialise safely, and a type parameter on the version would propagate into any collection of versions and reach the generic selector Decision 079 already ships.

Reusing `ResolvedSlotKind` therefore wins by elimination rather than by preference, and it keeps one vocabulary rather than two — the property Decision 081 valued when it recorded that the slot kind is a transcription of an accepted contract rather than a new vocabulary.

## The cross-object invariant, and its cost

The choice above creates an invariant spanning two objects:

```text
configuration.slotKind === Rule.slotKind
```

The cost is stated plainly: these are two fields that can disagree.

Decision 081 refused a stored precedence level, Decision 083 refused a dated status beside the version timeline, and Decision 085 refused an independent `terminatesRule` flag, each on that same objection.

The distinguishing fact here is that in every one of those cases the redundant value was derivable from a field that already existed, so storing it bought nothing. A configuration's family is not derivable from the configuration value itself — that is precisely what makes the tag necessary — and it must be available at run time for safe discrimination and for validating untrusted persisted input.

The redundancy is therefore accepted deliberately rather than overlooked.

## No validator, no error code, and no aggregate contract

No validator is authorised for the invariant above, and no error code is registered for it.

No accepted contract pairs a `Rule` with its versions. `validateDistinctRuleVersionEffectiveStarts` takes one rule's versions alone, `validateDistinctAuthoredScopes` takes rules alone, and Decision 085 recorded the same absence when it deferred the retirement invariant. This invariant joins that one as a second and independent reason such a contract is wanted; whether one should exist is not settled here, and no aggregate contract is authorised.

Decision 073's convention holds: a code is named once the behaviour it reports is specified.

## RuleVersion metadata remains unresolved

PFOS-ENG-01 §41 lists `createdAt`, `versionNumber`, `supersedesVersionId` and `changeReason` on `RuleVersion`. This decision neither includes nor excludes any of them.

Decision 081 deferred `versionNumber`, `supersedesVersionId` and `changeReason` to the `RuleVersion` payload decision. Because this decision is a split of that work and does not define the payload, that deferral is re-targeted here to the decision that completes the `RuleVersion` contract, so it is not left pointing at a decision which declined it.

`createdAt` was never superseded and appears in no deferral list. PFOS-ENG-01 §18 requires a created timestamp of every permanent rule, and Decision 081 cited that requirement as live when it argued that a product default is not a rule.

Two reasoning errors are excluded explicitly, because both are readily available and both are invalid.

That no resolution path reads a field is not evidence that the field is outside the contract. Decision 079 excludes a version number, a superseding identifier and a creation timestamp from version selection, and Decision 080 forbids a timestamp tie-break. Neither says anything about contract membership.

That the domain may not read a clock does not exclude a timestamp from a domain contract. PFOS-ENG-00 §13.4 forbids calling for the current time inside a deterministic engine function; it does not forbid carrying a moment supplied by another layer, and `ResolvedRuleSet.resolvedAt` already carries one.

No ownership is assigned. This decision does not place `createdAt` with persistence, with audit, with the application layer, or anywhere else. No accepted decision makes that choice, and making it here would settle a question outside this decision's scope.

## Configuration blockers, recorded and not resolved

**`GLOBAL_OBLIGATION` — income-source eligibility and exclusion have no accepted representation.** PFOS-ENG-01 §12.2 lists eligible and excluded income sources among the configurable fields, §12.5 supplies exclusion semantics, and Decision 080 records that an eligibility or exclusion determination removes an additive obligation as a skip reporting `RULE_SKIP_INCOME_SOURCE_EXCLUDED`, so the concept reaches the skip channel. `ResolvedGlobalObligation` carries no corresponding field. §42.1's `eligibleIncomeSourceIds: ["all"]` is not adopted: a magic sentinel inside an array of identifiers is excluded by PFOS-ENG-00 §14's opacity requirement and by §29.1's treatment of imported content as untrusted. This is adjacent to Blocker F, which remains open.

**`LOWER_PRIORITY_POOL`, for the `FIXED_AMOUNTS` strategy — the destination `sequence` has no accepted authoring source.** Decision 074 declares `ResolvedPoolFixedAmount.sequence` financially meaningful and lists it among the orderings the Rule Engine owns, and no accepted source establishes that a user authors it. It must not be derived from array order, from identifiers, or from repository order: Decision 080 excluded exactly those sources for the two equivalent gaps it recorded, PFOS-ENG-00 §14 keeps identifiers opaque, and §32 Invariant 11 forbids repository order from changing a result. Decision 082's observation that no bucket-owned rule could supply such an order is an obstacle to per-bucket authoring rather than a statement that a whole-pool rule authors it. PFOS-ENG-01 §14.2's "Priority ranks" is not this field: Decision 074 assigns pool priority rank to Allocation Engine bucket state as a residual-cent sort key.

**`ALLOCATION_BASIS` — no accepted user-authoring semantic is established.** Decision 074 fixes the vocabulary and Decision 081 gives the kind a slot, but Decision 080 records that no accepted source names a default basis and places the question adjacent to Blocker F. Deriving a shape from an accepted enumeration is not the same as establishing that a user authors it, and this decision does not.

**`TOP_PRIORITIES` — the authored treatment of rank under `PERCENTAGE_SPLIT` contains a tension between accepted sources.** Decision 082 records normatively that member bucket identifiers, ranks and shares are versioned configuration, without a strategy qualifier, while its own summary describes member buckets as carrying their ranks or shares. Decision 074's `ResolvedTopPriorityShare` extends an entry that requires a rank, and §42.3's percentage example carries none. Decision 075 confirms that §13.1's duplicate-priority-positions bullet stands, and Decision 076 finds §13.1 binding under either strategy. This decision resolves none of that, and it does not supersede §42.2 or §42.3. The question belongs to the payload decision, which must also perform any specification supersession explicitly rather than by implication.

**`GOAL_POLICY` and `GOAL_UNTIL_TARGET` — two authored fields are reachable from two places.** Decision 074 places `stopAtTarget` and `allowManualExcess` both on `ResolvedGoalPolicy` and inside the `GOAL_UNTIL_TARGET` variant of `FundingRuleConfig`. A bucket authoring both a goal policy and a goal-until-target funding rule would author the same two values twice, and they could disagree. Decision 074 accepted both and is not amended here. The tension is recorded and not resolved.

**`obligationId` — provenance is unattributed.** `ResolvedGlobalObligation.obligationId` is non-optional and no accepted source says whether it is the rule's own identity or names a separate entity. Recorded and not resolved.

## No configuration arm is authorised

No arm of `RuleConfiguration` is defined or authorised by this decision, for any of the eight slot kinds: `ALLOCATION_BASIS`, `GLOBAL_OBLIGATION`, `TOP_PRIORITIES`, `REQUIRED_FUNDING`, `LOWER_PRIORITY_POOL`, `LEFTOVER_POLICY`, `ROLLOVER_POLICY` and `GOAL_POLICY`.

Findings about how close any individual family may be to definition are discovery material for the payload decision and carry no authority here.

In particular, no partial `RuleConfiguration` is authorised, and no closed union missing a V1 family may be declared on the strength of this decision.

## Decision 079 compatibility

Both eventual variants of a rule version must satisfy `RuleVersionEffectivePeriodLike`.

`TerminatingRuleVersion` already does, and its shipped tests prove it structurally. The eventual configured arm satisfies it through the `ruleVersionId` and `period` elements the envelope above requires, and because its period is `RuleEffectivePeriod` itself, satisfaction is immediate rather than incidental.

The consequence is that `selectRuleVersionEffectiveOn` will accept a collection of rule versions and return the caller's own object with its discriminant intact, with no change to Decision 079, to its implementation, or to `RuleVersionEffectivePeriodLike`. This is the promise that shape's documentation already records — that a future `RuleVersion` will satisfy it structurally without either type changing — carried forward to the second arm.

Decision 079 remains selection-only and is unchanged.

## No implementation is authorised

After this decision:

- `TerminatingRuleVersion` remains the only concrete rule-version arm in the codebase;
- `ConfiguredRuleVersion` does not exist;
- `RuleVersion` does not exist;
- `RuleConfiguration` does not exist;
- `RuleVersionKind` does not exist and is not wanted.

This is intentional. It follows the discipline of Decision 083, which fixed the stopping constraint in full while recording that the stop half was not implementable until the terminating representation was defined — a deferral Decision 085 then discharged.

## No persisted contract changes

No field of `ResolvedRuleSet` changes, and no `schemaVersion` increment is authorised.

An authored rule version is not part of `ResolvedRuleSet`. A Plan Snapshot holds rule versions by reference: PFOS-ENG-01 §20 records that a snapshot may include or reference them, and Decision 074 keeps `sourceRuleVersionIds` as references identifying the versions that produced the resolved values. Introducing an authored envelope therefore changes no persisted resolved contract.

`sourceRuleVersionIds`, the Plan Snapshot design, and stop provenance are untouched.

Decisions 074, 078, 079 and 085 are unamended.

## Deliberately deferred

- The `RuleConfiguration` payload and every one of its arms.
- `createdAt`, `versionNumber`, `supersedesVersionId` and `changeReason` on `RuleVersion`.
- A contract pairing a `Rule` with its versions, and the two invariants that await it.
- The retirement invariant's validator and any error code it would report.
- The prospectivity check and the authoring layer that supplies its date.
- Owner-and-kind authoring legality.
- Resolver population, evaluation-context population, Blocker C and Blocker F.
- `sourceRuleVersionIds` treatment for a stop, and skip or explanation emission for a stop.
- `ResolvedGlobalObligation.sequence`, `ResolvedFundingRule.sequence` and `ResolvedPoolFixedAmount.sequence`.
- Missing product-default values and product-default provenance.
- Plan Snapshot design, and all Milestone 3 allocation behaviour.

## Why

Decision 085 fixed the terminating arm and left the configured arm, the union and any kind vocabulary to a single payload decision. That decision cannot be written yet: three configuration families cannot be represented without inventing semantics, and a fourth carries an unresolved tension between accepted sources.

What can be settled ahead of the payload is everything that does not depend on any arm — the discriminant that tells the two variants apart, the elements a configured version must carry, which period type it uses, and how configuration families will be told apart at run time. Settling those now makes the payload decision shorter, and prevents each of them from being decided implicitly by whichever implementation lands first.

The family-tag question in particular cannot be deferred without cost. It is not a property of any one arm, it constrains all of them, and an implementation that discovered the need for a tag while defining the fourth or fifth arm would have to reshape the first three.

## Alternatives Considered

Defining `RuleConfiguration` now over the families whose payloads are derivable, and deferring the rest, was rejected. It would declare a closed union missing V1 families while `Rule.slotKind` continued to admit them and `validateDistinctAuthoredScopes` continued to range over them, producing rules that are addressable but not authorable. Where a family is ready only in part, it would also make an authored strategy vocabulary drift from Decision 074's accepted one, which is the drift `ResolvedSlotKind` was shaped to prevent.

Recording nothing until the payload is ready was rejected. It would leave the family-tag question to be settled implicitly by an implementation, and it would leave Decision 085's identification of the configured literal unperformed.

Placing the family tag on the configured rule version rather than inside the configuration was rejected. It would put a second `slotKind` beside Decision 081's stable `Rule.slotKind` in the same position in the object graph, which reads as a duplicate address rather than as a payload discriminant, and it would enlarge an envelope this decision deliberately leaves open.

Settling the §41 metadata fields here was considered and rejected. None of the four is needed to decide family discrimination; the two arguments most readily available for excluding them are both invalid for the reasons recorded above; and settling them would have required an ownership choice no accepted decision supports.

Clarifying the top-priority rank tension here was considered and rejected. Resolving it would settle the shape of a configuration arm, which is exactly the work this decision defers.

## Tradeoffs

The envelope is a minimum rather than a closed field list, so a reader learns what a configured rule version must carry without learning what it may not carry.

A redundancy is accepted deliberately: a configuration's family is recorded in the configuration while the same family is recorded on the rule, and the two can disagree until a contract pairing them exists.

The `RuleVersion` contract now arrives across at least three decisions rather than one, and this decision ships no code at all.

Two invariants are now known and unenforceable for the same missing reason, which concentrates the cost of having no rule-and-versions contract rather than spreading it.

## Consequences

The configured discriminant, the minimum envelope, the configured period type and the family-discrimination architecture are fixed, and none of them remains open to implicit settlement by an implementation.

`TerminatingRuleVersion` remains the only concrete rule-version arm. Milestone 2 gains no new implementable contract from this decision.

Decision 081's deferral of `versionNumber`, `supersedesVersionId` and `changeReason` is re-targeted to the decision completing the `RuleVersion` contract, and `createdAt` joins them as an open question.

No validator is authorised, no code registry changes, no `ResolvedRuleSet` field changes, and no `schemaVersion` change.

Blocker C and Blocker F remain open and continue to gate the work they name.

## Future Review Trigger

Reconsider when any recorded configuration blocker is resolved, since each one unblocks an arm of the configuration union; when the `RuleVersion` metadata questions are taken up, since the envelope's field list closes then; when a contract pairing a rule with its versions exists, since this decision's cross-object invariant and Decision 085's retirement invariant become enforceable together; or if a future accepted source requires a rule-version variant beyond configured and terminating, since the conceptual two-variant model would then need revisiting.

---

# Decision 087: Authored Rank Semantics for TOP_PRIORITIES

**Status:** Accepted
**Related:** Decisions 013, 068, 071, 074, 075, 076, 080, 081, 082, 085, 086
**Scope:** Financial logic, Architecture, Engineering

## Decision

A member of the `TOP_PRIORITIES` configuration carries an authored rank under both `SEQUENTIAL` and `PERCENTAGE_SPLIT`.

Rank is required, is authored once per member, and is authored inside the single `GLOBAL` `TOP_PRIORITIES` `RuleVersion` configuration established by Decision 082.

The position of a member within an authored collection carries no financial meaning under either strategy.

This is a semantic decision. It defines no arm of `RuleConfiguration`, supplies no object shape, supersedes no specification text, and authorises no implementation.

## What this decision is, and what it is not

Decision 086 recorded the authored treatment of rank under `TOP_PRIORITIES` as a tension between accepted sources, resolved none of it, and assigned the question to the payload decision together with any specification supersession that resolution would require.

This decision takes only the semantic half of that assignment. Whether rank is authored, under which strategies, at what granularity, and whether array position means anything are questions answerable from accepted authority alone, without any knowledge of the payload.

The shape half stays where Decision 086 placed it. The `TOP_PRIORITIES` arm, its field names, its collection shape, and the correction of PFOS-ENG-01 §42.2 and §42.3 remain the payload decision's work, and this decision performs none of it.

This follows Decision 086's own method. Decision 085 assigned the configured arm, the union name and any closed kind vocabulary to a single payload decision; Decision 086 split that work and discharged only the envelope and discrimination half. The cut here is finer, because it separates a semantic from the shape that will express it, but the discipline is the same: settle what does not depend on the arm, so that it is not settled implicitly by whichever implementation lands first.

## Rank is authored under SEQUENTIAL

Decision 074 makes `rank` a required field of `ResolvedTopPriorityEntry` and places "top-priority entries ordered by ascending rank" among the Rule Engine-owned financial orderings that affect execution semantics. A required field with financial effect must have a source.

Every non-authored source is excluded by accepted authority. Array position is excluded by Decision 076 and by the constraint Decision 080 states as holding under every possible future answer. Identifiers are opaque under PFOS-ENG-00 §14. Repository order cannot alter a result under §32 Invariant 11 and PFOS-ENG-01 §26. Authoring order and version number are excluded by Decisions 079 and 080.

Decision 082 supplies the positive statement: member bucket identifiers, ranks and shares are versioned configuration, and priority ranks and order are versioned configuration. Decision 013 and PRD §16 describe ranked funding as the user's own selection, and Constitution Principle 5 places the financial decision with the user.

## Rank is authored under PERCENTAGE_SPLIT

`ResolvedTopPriorityShare` extends `ResolvedTopPriorityEntry` and does not make `rank` optional, so the resolved contract requires a rank under this strategy too. Decision 082 relies on exactly that inheritance to argue that strategy and membership are one logical rule; the authored side must be able to supply what the resolved side requires.

Decision 076 holds that both top-priority validation rules "apply under either strategy, because PFOS-ENG-01 §13.1 limits top priorities as such rather than limiting a particular strategy," and that a plan in which two entries share a `rank` reports `RULE_TOP_PRIORITY_DUPLICATE_RANK`. A rank that is absent or engine-assigned cannot collide in a way an authored plan produces, so the restrictive reading would leave that holding dead under one of the two strategies it expressly covers.

Decision 076 further records in its tradeoffs that an authored-time pass will be needed once the authored rule contracts are fixed. This decision fixes the semantic that pass will check. It does not authorise the pass.

## Rank is financially load-bearing under PERCENTAGE_SPLIT

Decision 071 distributes residual cents largest fractional remainder first and breaks ties by lowest index in caller-supplied order, recording that Money does not sort and that the caller supplies canonical order.

Decision 074 places top-priority entry order among the Rule Engine-owned financial orderings and expressly does not place it among the reproducibility-only orderings, where set-like pool destinations are ordered by bucket identifier instead.

Two percentage-split members with equal fractional remainders are therefore separated by ascending rank. That is one cent, assigned deterministically, under Constitution Principle 19 and Principle 18. Rank under `PERCENTAGE_SPLIT` is not display metadata.

No implementation mechanics beyond these accepted semantics are established here.

## Decision 082's wording

Decision 082 states three times, without a strategy qualifier, that member ranks are versioned configuration: in its `TOP_PRIORITIES` section, in its §5.3 clarification, and in "Stable addressing versus versioned configuration."

Its summary phrase "the member buckets with their ranks or shares" is elliptical. The same decision's §5.3 clarification qualifies share by strategy and leaves rank unqualified within a single sentence: "a bucket does have a priority rank, and it does have a share under a percentage split."

Decision 086 already characterised the first statement as normative and the second as summary. That characterisation is adopted here.

The reading is therefore:

- under `SEQUENTIAL`, a member carries a rank;
- under `PERCENTAGE_SPLIT`, a member carries a rank and a share.

The disjunction scopes the strategy-specific element only.

Decision 082 is clarified, not amended. Its granularity holding is untouched.

## Array position is not an authoring gesture

The position of a member in an authored collection is not its financial rank, and it carries no authored financial meaning under either strategy.

Rank must not be derived from any of:

- array position
- identifier
- repository order
- storage order
- creation order
- version number

Decision 076 states that ranks are not required to be positive, contiguous, to start at one, or to match array position. If position were the authored ordering, rank would necessarily match position.

Decision 086 answers the identical question for the sibling family, recording that the `FIXED_AMOUNTS` destination `sequence` must not be derived from array order, from identifiers, or from repository order.

PFOS-ENG-01 §13.1 and §21.1 make duplicate priority positions a hard validation error, preserved by Decision 075 and named by Decision 076. Under a positional model duplication is structurally impossible and both bullets are dead.

PFOS-ENG-00 §29.1 treats imported content as untrusted. A rank is a value that can be validated; a position cannot be validated against itself, and silence would again read as a financial instruction, which Decisions 085 and 086 both refused.

## Authoring granularity is unchanged

Decision 082's holding stands in full: one `GLOBAL` `TOP_PRIORITIES` Rule, whose `RuleVersion` configuration carries the strategy, the entire member set, the authored order and ranks, and the shares where applicable.

Rank is a per-member value inside that whole-set configuration. It is not a bucket-owned rule, no bucket-owned top-priority rule is introduced, and §5.3's per-bucket authoring reading remains rejected.

This decision strengthens Decision 082's argument rather than qualifying it. Duplicate rank and count above maximum are properties of a collection, statable only where the whole set is authored together.

## PFOS-ENG-01 §42.2 and §42.3 are not member-shape authority

Both examples omit the authored rank this decision requires. They are therefore insufficient as complete `TOP_PRIORITIES` member-shape authority, and neither may be relied upon as a full statement of what an authored member carries.

Two readings are excluded:

- §42.2's bare `bucketIds` array must not be interpreted as making array position the financial rank.
- §42.3 must not be interpreted as establishing a rank-free `PERCENTAGE_SPLIT` member.

Correcting or replacing both examples belongs to the `TOP_PRIORITIES` payload decision, at the point it defines the arm.

This decision performs no formal specification-shape supersession and supplies no replacement object shape. Decision 086 assigned the payload shape and any explicit specification replacement to the same decision, and separating them would leave the specification showing a void example with nothing in its place. Nothing here is superseded, PFOS-ENG-01 is not altered, and §42 stands as written while ceasing to be authority on this point.

Decision 082 cited both examples as evidence of whole-set plan-level granularity while recording that the deciding evidence was §13.3 rather than their convenience. That citation is unaffected: it concerned granularity, not member field lists.

PFOS-ENG-01 §13.1's remaining three bullets, §13.2, §13.3, §21.1 and §5.3 are unchanged. §5.3 continues to await the editorial update Decision 082 recommended.

## Unchanged by this decision

No specification text is superseded, amended or replaced.

No constraint on rank beyond Decision 076's uniqueness is introduced. Ranks are still not required to be positive, contiguous, to start at one, or to match array position, and no relationship between rank order and share magnitude is established. Uniqueness remains the only accepted rank constraint currently settled.

No arm of `RuleConfiguration` is defined or authorised, for `TOP_PRIORITIES` or for any other slot kind. No member field name and no collection field name is fixed, and no corrected §42 object example is supplied. The canonical serialised order of an authored member collection is not settled: rank is the financial ordering key, and whether and how an authored collection is canonicalised for deep equality belongs to the payload decision.

`RuleConfiguration`, `RuleVersion`, `ConfiguredRuleVersion` and `RuleVersionKind` remain as Decision 086 left them. Decision 086's envelope is not closed and gains no member. `TerminatingRuleVersion` remains the only concrete rule-version arm in source.

No validator is authorised, no authored validator API is defined, and no error code is registered or named, including for authored-time duplicate-rank or count validation. Decision 073's convention holds: a code is named once the behaviour it reports is specified. No registry changes.

No other configuration family is addressed. The PFOS-ENG-01 §41 metadata questions — `createdAt`, `versionNumber`, `supersedesVersionId` and `changeReason` — are untouched.

`ResolvedRuleSet`, `schemaVersion`, `sourceRuleVersionIds` and Plan Snapshot design are unchanged, and no `schemaVersion` increment is authorised.

Resolver population, evaluation-context population and all Milestone 3 behaviour remain outside this decision.

Decisions 013, 071, 074, 075, 076, 080, 081, 082, 085 and 086 are unamended.

## Why

Decision 086 recorded this as a tension between accepted sources and deferred it. The tension resolves entirely within accepted authority, without the payload, so settling it now prevents the question from being settled implicitly by whichever implementation defines the arm first.

The restrictive reading of Decision 082's summary cannot be held without cost. It would leave `ResolvedTopPriorityShare.rank` required and sourceless, and it would make Decision 076's "either strategy" holding inoperative under `PERCENTAGE_SPLIT`. The elliptical reading contradicts nothing.

The positional reading cannot be held either. Decision 076 forbids identifying rank with array position, Decision 080 forbids position as a financial ordering source under every possible future answer, and Decision 086 has already applied that prohibition to the equivalent field in the sibling family.

## Alternatives Considered

Reading "ranks or shares" as strategy-exclusive was rejected for the reasons above.

Making rank optional under `PERCENTAGE_SPLIT`, with the Rule Engine assigning a value when it is absent, was rejected. No accepted source authorises such an assignment, any assignment rule would need a source this corpus does not supply, an assignment from descending share is non-total on ties, and a synthesised ordering that decides a cent is a silent financial decision under Constitution Principle 4.

Treating rank under `PERCENTAGE_SPLIT` as authored but financially inert was rejected. Decision 074 places ascending-rank entry order among the orderings that affect execution semantics, and Decision 071's tie-break is positional over that order.

Adopting array position as the authored ordering under `SEQUENTIAL` only was rejected. It would make the two strategies disagree about what a member is, for no stated reason, and Decision 074 states one ordering rule for both.

Formally superseding PFOS-ENG-01 §42.2 and §42.3 in shape was considered and rejected. Decision 086 assigned the payload shape and any explicit specification supersession to the same decision, and a supersession without a replacement would leave an examples section showing a void where a reader needs a shape. Decision 075's precedent is not parallel: removing a validation bullet leaves the specification coherent, while voiding an example does not. Recording what the examples may not be read to establish achieves what this decision needs and leaves the payload boundary intact.

Supplying a corrected §42.2 or §42.3 example was rejected on the same ground: a corrected example is a configuration arm in all but name.

Deferring the semantic question itself to the payload decision, as Decision 086 originally routed it, was reconsidered and rejected. Nothing in the question depends on the payload, and Decision 086 established the precedent of settling what does not depend on any arm ahead of the arms.

## Tradeoffs

PFOS-ENG-01 §42.2 and §42.3 remain in the specification while ceasing to be authority on member shape, so a reader who consults them without this decision will still see an incomplete member. That is accepted in exchange for keeping the shape and its correction in one decision.

A `PERCENTAGE_SPLIT` author supplies two values per member rather than one, and the second decides a cent only on an exact tie. The cost is a value; the alternative is an unexplainable cent under Constitution Principle 9.

The authored-time duplicate-rank check is now semantically grounded but still unauthorised, so the invariant is known ahead of its validator, as in Decisions 082, 083 and 085.

The `TOP_PRIORITIES` question now arrives across two decisions rather than one, and this decision ships no code at all.

## Consequences

The `TOP_PRIORITIES` authored-rank blocker recorded by Decision 086 is closed. All other blockers, tensions and gaps recorded by Decision 086 remain open.

Decision 082's "ranks or shares" phrasing has a fixed reading and can no longer be cited for a strategy-limited rank.

PFOS-ENG-01 §42.2 and §42.3 may no longer be cited as establishing a rank-free member or an array-position rank, and the payload decision inherits the obligation to correct them.

The payload decision may treat authored rank as settled for `TOP_PRIORITIES` under both strategies, and need only choose the arm's structure and field names.

No specification text changes, no code is authorised, no contract changes, no registry changes, and no `schemaVersion` change. Milestone 2 gains no new implementable contract.

## Future Review Trigger

Reconsider if a future accepted source constrains rank beyond uniqueness, gives rank and share magnitude a required relationship, or introduces a top-priority strategy beyond the two Decision 074 fixes; when the `TOP_PRIORITIES` payload decision supplies the arm, since the field names, the collection's canonicalisation and the correction of §42.2 and §42.3 are fixed then; or if `ResolvedTopPriorityShare` ever stops extending `ResolvedTopPriorityEntry`, since the inheritance argument would then need restating.

---

# Decision 088: Income-Source Applicability Semantics for GLOBAL_OBLIGATION

**Status:** Accepted
**Related:** Decisions 015, 016, 017, 022, 068, 073, 074, 078, 080, 081, 082, 085, 086, 087
**Scope:** Financial logic, Architecture, Engineering

## Decision

A `GLOBAL_OBLIGATION` rule's applicability to income sources is one authored policy, and exactly one of three semantics is active for a given rule version:

- universal applicability, under which the obligation applies to every income source and no identifier set is carried;
- only explicitly listed sources, under which the obligation applies to an income source if and only if that source is in a set the version carries;
- every source except explicitly listed sources, under which the obligation applies to an income source if and only if that source is not in a set the version carries.

The two listed semantics carry a non-empty set of income-source identities.

Applicability is conceptually required and non-nullable. Missing data never means universal applicability.

The three labels above are explanatory semantic labels. This decision fixes no persisted literal spelling, no discriminant field name, no identifier-set field name, no source type, no enum and no union.

## What this decision is, and what it is not

Decision 086 recorded that income-source eligibility and exclusion have no accepted representation, and placed the question adjacent to Blocker F.

This decision settles the authored semantics: how many applicability policies there are, what each means, and what may not represent them. It settles nothing about how those semantics are spelled, carried, or typed.

The `GLOBAL_OBLIGATION` payload decision chooses the discriminant field name, the literal spellings, the identifier-set field name and the complete arm structure. It must preserve the three semantics established here exactly, and it must name its persisted literals itself rather than leaving them to an implementation.

This decision defines no arm of `RuleConfiguration`, no other member of a `GLOBAL_OBLIGATION` configuration, and authorises no implementation.

It follows the method of Decision 087, which settled a semantic ahead of the shape that would express it, and of Decision 086, which settled what did not depend on any arm ahead of the arms.

## Eligibility and exclusion are one policy, not two dimensions

PFOS-ENG-01 §12.2 lists "Eligible income sources" and "Excluded income sources" among the tithing rule's configurable fields. They are two authoring gestures for one policy rather than two simultaneously active independent dimensions.

§12.1 states the default as a single `Scope`, not as a pair of lists. Decision 080 speaks of "an explicit eligibility or exclusion determination", and PRD §15 of income sources "marked eligible or excluded". Both are disjunctive. No accepted source describes the two applying together, and none says what a source appearing in both, or in neither, would mean.

Two optional identifier collections is the loosely structured shape §47.8 forbids. It admits a contradictory record that PFOS-ENG-00 §29.1 and §37 require be rejected rather than silently resolved, and resolving such a record inside the engine would be a silent financial decision under Constitution Principle 4.

Exactly one semantic is therefore active, and a conflicting pair is unrepresentable rather than merely invalid — the standard Decisions 085 and 086 both applied.

## The three semantics are derived, not invented

Universal applicability transcribes §12.1's `Scope: All eligible income`, and matches Decision 017 and PRD §12, under which income sources inherit the global allocation plan by default.

Only explicitly listed sources transcribes §12.2's "Eligible income sources".

Every source except explicitly listed sources transcribes §12.2's "Excluded income sources", §10.2's "unless the income source is explicitly excluded from eligible income", and PRD §15's "or excluded".

No fourth semantic has a textual basis in any accepted source, and none is introduced.

## A caution for the payload decision

§12.1, §12.4, §25 and Decision 016 all use "eligible income" for the amount-qualification question that Blocker F owns, while §12.2 uses "eligible income sources" for the applicability question settled here.

The payload decision should choose vocabulary that keeps the two apart. That is a caution recorded for it, not a naming decision made here.

## Empty sets

A listed semantic's identifier set is semantically non-empty.

An empty set under "every source except explicitly listed sources" would mean every source, which is universal applicability — one financial intent with two representations, defeating canonical form and making version comparison ambiguous.

An empty set under "only explicitly listed sources" would mean no source, duplicating the terminating rule version Decision 085 established and expressing a stop with no date, which that decision rejected.

Whether non-emptiness is expressed structurally, by a construction invariant, by a domain validator or by an import validator is not decided here. It belongs to the payload and validation decisions. No error code is registered or named.

A non-empty set that matches no source in a given evaluation context remains valid. The obligation does not apply there, which is a resolution outcome rather than an authoring defect.

## Duplicate identifiers and order

The collection is a set. A repeated identifier changes neither membership nor non-membership, and no accepted source gives repetition any weight, count or ordering effect. Duplicate identifiers add no financial meaning.

Order adds no financial meaning either. Two configurations differing only in the order of the same identifiers express the same authored intent.

A persisted or imported duplicate is non-canonical and malformed, and no additional meaning may be assigned to it silently. This decision recommends that duplicates eventually be rejected rather than silently deduplicated, since normalising would rewrite what the user or the backup asserted, against Constitution Principles 4 and 12.

No validator, normalisation, deduplication or error code is authorised.

## Identifiers are opaque

Income-source identities remain stable opaque `EntityId`s under PFOS-ENG-00 §14.

No sentinel value may inhabit an identifier collection, including "all", "*" and "default". Decision 086 already recorded that §42.1's `["all"]` is not adopted, and an opaque identifier space cannot reserve a literal without a collision risk it can never rule out.

No wildcard, name matching, category matching or type matching names an income source. §9 forbids rules applying because objects share names or categories, and §26 forbids resolution depending on localized display names.

## Future income sources

Under universal applicability, a future-created income source is in scope. That is Decision 017's stated behaviour.

Under only explicitly listed sources, a future-created source is out of scope unless a later `RuleVersion` adds it.

Under every source except explicitly listed sources, a future-created source is in scope unless a later `RuleVersion` excludes it.

A rule version's set is fixed at creation under Decision 078. Changing scope creates a later `RuleVersion` under §18 and §19.2, prospective under Decision 022. Existing versions do not acquire or lose members after the fact.

This asymmetry is why both listed semantics exist. "Only these" and "everything but these" are different intentions about a future the author cannot enumerate, and Constitution Principle 4 requires that choice to be stated rather than inferred.

## Tithing scope

When a tithing obligation is authored with §12.1's "all eligible income" scope, its source-applicability semantic is universal applicability.

That is a correspondence and nothing more. This decision does not decide whether a tithing `Rule` is created automatically, whether an authoring interface preselects a semantic, whether an authoring service injects one, whether any value is a product-default constant, or whether a missing applicability value is defaulted or otherwise filled in.

Missing applicability remains invalid and unrepresented. It is never universal applicability.

Two facts from accepted authority bear on this and are recorded rather than established. Decision 081 states that a product default is not a rule, and Decision 080's enumeration of established product defaults contains no global obligation, so a tithing obligation exists only when authored. And because applicability is conceptually required, an authored obligation always states its semantic explicitly.

## The Blocker F boundary

Two questions are made explicit here so that each can be settled by the decision that owns it.

Source applicability asks whether this authored obligation applies to this income-source identity. Its authority is §12.2's configurable fields and §10.2's qualifier. It is settled by this decision.

Eligible-income computation asks whether a receipt or amount qualifies as eligible income, and how it is aggregated without double counting. Its authority is §12.4, §12.5 and Decision 016. It is Blocker F, and it remains open.

An obligation contributes only where both hold.

Decision 080's outcome is unchanged and Decision 080 is not amended. Its holding that an explicit eligibility or exclusion determination removes an additive obligation as a skip stands exactly as written. This decision makes the two underlying concepts explicit; it revises none of it.

## Applicability is per rule version

Applicability is authored per `GLOBAL_OBLIGATION` rule and carried in that rule's `RuleVersion` configuration. There is no shared global source filter.

Multiple additive global obligations may each carry a different applicability semantic.

Decision 074 keeps separately authored obligations independent and uncollapsed. Decision 080 makes accumulation the semantic of the only additive slot, with none displacing another. Decision 082 exempts `GLOBAL_OBLIGATION` from authored-scope uniqueness, so several global obligation rules legitimately coexist.

A shared filter would collapse independently authored obligations into one scope and would let one rule's edit silently change another rule's behaviour, against Constitution Principle 12.

## Ownership is unchanged

`GLOBAL_OBLIGATION` rules are owned by `GLOBAL`. Decision 080 states that accumulation is within the global level and that no other §6 level authors a global obligation in V1.

Income-source applicability is versioned configuration, not `Rule.owner`. This applies Decision 082's rule with the entity type changed: an identifier is stable Rule addressing only where it names the rule's owner, and everywhere else it is versioned configuration or a derived scope.

No `INCOME_SOURCE`-owned `GLOBAL_OBLIGATION` is introduced, and no income-source entity applicability flag is introduced for V1.

§5.2's "Exclude a reimbursement from tithing" is not evidence to the contrary. A reimbursement is a kind of receipt, which belongs with §12.5 and eligible-income computation.

PRD §15's "Income sources may eventually be marked eligible or excluded" is future-tense and authorises no V1 property on the income-source entity. Such a property would also be one filter shared across all obligations, and would be entity state supplied through the evaluation context rather than authored configuration.

`Rule.owner`, `RuleOwner` and `ResolvedSlotKind` are unchanged, and Decision 081 requires no amendment.

## Historical determinism

Historical applicability is determined from the `RuleVersion` effective for that historical date together with the income-source identity supplied in that historical evaluation context. Current repository state is never consulted.

Universal applicability means the source this evaluation concerns, not every source that exists now. §25 supplies `Income source` for the event, so the question is a membership question over one identity and requires no enumeration of a source population.

Whether a referenced income source currently exists is an authoring and import concern already named by lower authority. §21.1 makes a rule referencing a deleted income source a hard validation error, and §37 requires rejecting references to nonexistent entities. No code is named here for either.

It is not a resolution-time question for a past date. The authored set lives in an immutable `RuleVersion`, §19.1 requires a version used in a confirmed allocation to remain reconstructable, and Constitution Principle 11 with PFOS-ENG-00 §32 Invariant 10 forbid a later administrative act from changing a historical result. Current deletion or status must not rewrite historical financial truth. This applies Decision 083's rule — current status is not historical financial truth — to a referenced entity rather than to a rule's own status.

No archived-income-source lifecycle is invented. Archival in this corpus is a bucket concept, and no accepted source defines it for income sources.

Where Decision 016's cross-source aggregation is later specified, the same applicability question is asked per source, and any population it ranges over is supplied by the evaluation context under §25 and §26 rather than read from current storage. This decision settles nothing further about that population.

## Separation from IncomeBasis and PercentageBasis

Four questions must stay distinct and must never be merged into one field or one semantic.

Source applicability asks whether the obligation applies to this income source. `IncomeBasis` asks which amount of that source's income is the base. `PercentageBasis` asks against what denominator a percentage is taken. Eligible-income computation asks whether an amount qualifies at all, and remains with Blocker F.

`PercentageBasis` is not a member of `ResolvedGlobalObligation`; Decision 074 places it on pool structures. No such member is added.

§14.3 already requires percent-of-total and percent-of-remaining never to share an ambiguous field. The same discipline forbids fusing applicability into either basis: a rule that applies at zero percent and a rule that does not apply at all are different financial facts with different explanations under Constitution Principle 9.

## Mapping to the existing skip code

Universal applicability produces no non-applicable result from source scope.

Under only explicitly listed sources, a source outside the set maps to `RULE_SKIP_INCOME_SOURCE_EXCLUDED`. Under every source except explicitly listed sources, a source inside the set maps to the same code.

The ground is Decision 080's existing holding, and nothing more: an explicit eligibility or exclusion determination removes an additive obligation as a skip reporting that code. Decision 080 already writes the two gestures as one determination with one code, and the two listed semantics are those two gestures.

No meaning is stated for the code beyond what Decision 080 establishes. It is not renamed, not split and not redefined, and its registered meaning is unchanged. No new skip code is introduced.

Whether a skip record is emitted depends on resolver population and explanation emission, which Decisions 080, 085 and 086 defer. No skip-emission behaviour is authorised.

## No resolved-contract field is required

Source applicability requires no member on `ResolvedGlobalObligation`.

The question is answered during resolution: it decides whether an obligation produces a resolved obligation or a skip. Decision 080 removes a non-applicable obligation as a skip rather than emitting it with a filter attached, so nothing needs to be preserved on the resolved contract in order to explain the outcome.

Decision 086's observation that `ResolvedGlobalObligation` carries no corresponding field is therefore consistent with this decision rather than a gap it must close.

`ResolvedGlobalObligation` and `ResolvedRuleSet` are unchanged, and no `schemaVersion` increment is authorised.

## Future validation needs, and no codes

Several needs are identified. None is authorised, and no code is named for any of them. Decision 073's convention holds: a code is named once the behaviour it reports is specified.

A listed semantic's set is non-empty. No duplicate identifier appears within a set. Every referenced income source exists and is not deleted, which §21.1 and §37 already require while no accepted source names a code for it. Unknown variants are rejected on import, under §47.9 and PFOS-ENG-00 §29.2. And a rule carrying an obligation applicability value is in fact of slot kind `GLOBAL_OBLIGATION`, which is Decision 086's cross-object invariant rather than a new one, awaiting the same missing contract pairing a rule with its versions.

## PFOS-ENG-01 §42.1 is not representation authority

§42.1's `eligibleIncomeSourceIds: ["all"]` is insufficient as final representation authority for this field, and Decision 086 already recorded that the sentinel is not adopted.

It must not be interpreted as establishing a sentinel-bearing identifier collection, the final payload shape, or a two-list shape.

Correcting or replacing it belongs to the future `GLOBAL_OBLIGATION` payload decision, at the point it defines the arm. This decision performs no formal specification-shape supersession and supplies no replacement object shape. Nothing is superseded, PFOS-ENG-01 is not altered, and §42.1 stands as written while ceasing to be authority on this point.

## Unchanged by this decision

No specification text is superseded, amended or replaced.

No persisted literal spelling is fixed for any of the three semantics. No discriminant field name, no identifier-set field name, no rate field, no destination field, no income-basis field, no maximum field and no enabled field is fixed. No source type, enum or union is introduced.

No arm of `RuleConfiguration` is defined or authorised, for `GLOBAL_OBLIGATION` or any other slot kind, and no other member of a `GLOBAL_OBLIGATION` configuration is defined.

`RuleConfiguration`, `RuleVersion`, `ConfiguredRuleVersion` and `RuleVersionKind` remain as Decision 086 left them. `TerminatingRuleVersion` remains the only concrete rule-version arm in source.

No validator is authorised, no validator API is defined, no error code is registered or named, and no registry changes. No skip, warning or explanation code is added, redefined or split, and no skip-emission behaviour is authorised.

`ResolvedGlobalObligation`, `ResolvedRuleSet`, `schemaVersion`, `sourceRuleVersionIds` and Plan Snapshot design are unchanged.

`obligationId` provenance is untouched and remains as Decision 086 recorded it. `ResolvedGlobalObligation.sequence`, `ResolvedFundingRule.sequence` and `ResolvedPoolFixedAmount.sequence` remain without an accepted authoring source. `ALLOCATION_BASIS` authoring, the `GOAL_POLICY` and `GOAL_UNTIL_TARGET` duplication, and the `TOP_PRIORITIES` payload shape are untouched. The PFOS-ENG-01 §41 metadata questions are untouched. Resolver population, evaluation-context population, Blocker C, Blocker F implementation and all Milestone 3 behaviour remain outside this decision.

Decisions 016, 017, 074, 078, 080, 081, 082, 085, 086 and 087 are unamended.

## Why

Decision 086 recorded this family as unrepresentable and named the reason: the only shape the corpus offers is §42.1's sentinel, which opacity forbids, beside two §12.2 fields whose interaction nothing defines.

Both obstacles dissolve once the two fields are read as one policy. A single active semantic removes the need for a sentinel, removes the conflicting-lists state, and leaves an intent that can be explained to a user in one sentence under Constitution Principle 9.

Separating source applicability from eligible-income computation is what makes the decision safe to take now. Applicability is a question about a source identity, answerable from authored configuration and the identity §25 already supplies. Eligible-income computation is a question about an amount, and it needs rules the corpus has not written. Settling the first commits nothing about the second.

Stopping short of vocabulary is what keeps it inside Decision 086's boundary. The semantics are derivable from accepted sources; the spellings are not.

## Alternatives Considered

Two optional identifier collections, mirroring §12.2's two bullets literally, was rejected: it admits a source in both with no accepted resolution rule, it is the loose shape §47.8 names, and resolving the conflict inside the engine would be a silent financial decision.

A sentinel inside the identifier collection, following §42.1, was rejected. Decision 086 already excluded it, and an opaque identifier space cannot reserve a literal safely.

An absent value meaning universal applicability was rejected: Decision 085 refused silence as a stop instruction and Decision 086 refused it for `configuration`, both because §29.1 makes a truncated import indistinguishable from an authored act.

Two semantics, with an empty exclusion set standing for universal applicability, was rejected. It discards §12.1's explicitly named scope and re-encodes "all" as absence of content, and it loses the future-source distinction that makes the two listed semantics different intentions.

A semantic meaning "applies to no source" was rejected: it duplicates Decision 085's terminating version and expresses a stop without a date.

Reusing §12.2's "Enabled or disabled" was rejected: Decision 085 refused `configuration.enabled` as a lifecycle mechanism, and enablement is not source applicability.

A property on the income-source entity, and an `INCOME_SOURCE`-owned obligation rule, were both rejected for the reasons recorded under ownership.

Fixing persisted literal spellings for the three semantics here was considered and rejected. Decision 086 fixed `CONFIGURED` because Decision 085 had already used that spelling, and said so; spellings for these semantics have no antecedent in any accepted source and would be newly minted vocabulary. Naming them is properly the work of the decision that defines the arm they discriminate, which will name them by decision rather than leave them to an implementation.

Settling `obligationId` provenance here was considered and rejected: nothing in this decision requires it.

## Tradeoffs

An author who thinks in terms of two lists must choose one semantic. The gain is that no plan can hold a contradictory pair, and every scope has exactly one representation.

Universal applicability and every-source-except behave identically until a source is excluded, so the distinction earns itself only when a user narrows scope. Keeping both is what makes that narrowing an explicit dated edit rather than a silent reinterpretation.

The semantics are fixed while the vocabulary that expresses them is not, so this family's contract arrives across more than one decision, as `TOP_PRIORITIES` already does.

Several validation needs are now known and unenforceable for the same missing authored contract, as in Decisions 082, 085, 086 and 087.

## Consequences

The `GLOBAL_OBLIGATION` income-source applicability blocker recorded by Decision 086 is closed. All other blockers, tensions and gaps recorded by Decision 086 remain open.

Blocker F remains open and continues to gate the work it names, including eligible-income computation, aggregation and double-count prevention. Blocker C remains open.

`GLOBAL_OBLIGATION` does not become resolvable. `ResolvedGlobalObligation.sequence` still lacks an accepted authoring source, so the additive slot still cannot be materialized, as Decision 080 recorded.

§42.1 may no longer be cited as establishing the representation of this field, and the payload decision inherits the obligation to correct it.

The payload decision may treat the three applicability semantics as settled and must preserve them exactly, while choosing the vocabulary and structure that express them.

No specification text changes, no code is authorised, no contract changes, no registry changes, and no `schemaVersion` change. Milestone 2 gains no new implementable contract.

## Future Review Trigger

Reconsider when Blocker F is taken up, since the applicability question then composes with an eligible-income question and their interaction must be stated explicitly; when the `GLOBAL_OBLIGATION` payload decision supplies the arm, since the vocabulary, field names, serialisation and the correction of §42.1 are fixed then; if an accepted source ever authorises an income-source-level property marking a source eligible or excluded, since PRD §15 anticipates one; if a slot kind other than `GLOBAL_OBLIGATION` acquires income-source applicability, since the semantics would then be shared; or if `RULE_SKIP_INCOME_SOURCE_EXCLUDED` is ever split, since both listed semantics currently map to it.

---

# Decision 089: Global Obligations Are Independent, and Overcommitment Is Invalid

**Status:** Accepted
**Related:** Decisions 015, 016, 068, 071, 073, 074, 078, 079, 080, 081, 082, 086, 087, 088
**Scope:** Financial logic, Architecture, Engineering

## Decision

Applicable `GLOBAL_OBLIGATION` rules are independent financial commitments.

Each applicable obligation computes its own claim using its own accepted semantics and its own configured basis. No obligation is financially prior to another.

When the applicable global obligations' computed claims exceed the eligible amount available to satisfy those obligations, the resolution state is financially invalid. PFOS must surface that state for correction. It must not be resolved by sequential priority funding, by partially funding later obligations because earlier obligations consumed the available amount, by proportional reduction across obligations, or by any identifier, timestamp, array-position or repository-order tie-break.

It follows that `ResolvedGlobalObligation.sequence` has no financial execution meaning in V1.

This decision settles financial policy and one semantic classification. It fixes no detection point, no validator, no error code, no algorithm, and no contract or schema change.

## Independence

Decision 071 and PFOS-ENG-02 §14 both state that separately authored global obligations are independent complementary two-way splits, each evaluated against its own configured income basis, never combined into a single N-way split. Decision 074 states that separately authored obligations remain independent and are not collapsed. Decision 080 states that they accumulate, that each takes effect, and that none displaces another.

Independence is symmetric. There is no first obligation and no last one, and no obligation's computation reads another obligation's existence, rate, amount, destination or result.

No obligation acquires priority over another from authoring time, array position, `RuleId`, `RuleVersionId`, any other `EntityId`, a timestamp, a version number, repository order, storage order, iteration order, rate magnitude, or from being tithing.

## The overcommitted resolution state is financially invalid

When the applicable obligations' computed claims exceed the eligible amount available to satisfy them, the resolution state is financially invalid and must be surfaced for correction rather than resolved.

Four sources support why an over-claimed result cannot be accepted. PFOS-ENG-01 §7 lists "Allocations cannot create or destroy money" among system financial invariants that cannot be overridden by user rules, and closes: "If a user rule conflicts with a system invariant, validation fails." §21.1 lists "Rule violates a system invariant" among hard validation errors. PFOS-ENG-02 §2 fixes the balance invariant as total eligible input equalling total proposed allocations plus total remaining unallocated. Constitution Principle 19 requires that money never appear or disappear.

None of those sources specifies this condition for global obligations, and none states its remedy. They establish why an over-claimed result cannot stand. This decision supplies the family-specific financial policy.

## The condition is over computed claims

The invalid condition concerns the computed claims of the obligations that apply to a given resolution, measured against the eligible amount available to satisfy them.

It is not the condition that the authored obligation rates sum to more than 10,000 basis points. Decision 088's applicability semantics can remove an obligation from a resolution entirely, and a `maximumAmount` can cap a claim below what its rate alone implies. Two obligations authored at 6,000 basis points each are therefore not necessarily an invalid plan: they may never both apply to one income source, or one may be capped.

No authored-rate-sum validation rule is introduced. Decision 071 states that a single rate carries no sum requirement, PFOS-ENG-01 §21.1's over-total error is scoped to percentages "in the same pool", and Decision 071 with PFOS-ENG-02 §14 both hold that obligations are not a pool. No accepted source independently requires such a rule, so none is adopted.

A consequence follows and is recorded deliberately. Because applicability is per income source and caps are monetary, whether over-claiming occurs may depend on which source is being resolved and on the amount involved.

## Where and when the condition is detected is not decided

This decision does not settle where or when the invalid condition is detected.

No authoring-time validator, resolver validator or allocation-time validator is authorised. No validator API, no error code, no cap-handling algorithm, no user-facing behaviour and no recovery flow is authorised or implied.

Nothing here may be read as establishing that the condition is detectable at authoring time.

## Why ordered funding is rejected

Ordered funding would require an order that does not exist.

Every candidate source is excluded. Decision 080 states, as holding under every possible future answer, that no ordering may use an identifier, array position, a timestamp, creation order, repository order or storage order, and states the same specifically for this field. Decision 086 applied that prohibition to the fixed-amount pool sequence and Decision 087 to top-priority rank. PFOS-ENG-00 §14 keeps identifiers opaque, §32 Invariant 11 forbids repository order from changing a result, and PFOS-ENG-01 §26 requires all ordering to be explicit and stable.

No authored ordering exists either. PFOS-ENG-01 §12.2's configurable-field list for the tithing rule contains no order, rank, priority or sequence, and §42.1's example carries none.

Ordered funding would also contradict Decision 080's holding that no obligation displaces another, since consuming the eligible amount ahead of another obligation is displacement in effect. And whichever key were chosen, the user never expressed it, which would make an unauthored fact decide which commitment goes unfunded — a silent financial decision under Constitution Principle 4.

PFOS-ENG-02 §30 states a competition rule for a different family: "When several fixed amounts compete for insufficient money, their ordering must come from the resolved rule set." That sentence grounds the sequence fields on required funding and on fixed-amount pool destinations. The corpus states it there and states no counterpart for global obligations.

## Why proportional reduction is rejected

Proportional reduction would silently change an authored commitment. A user who authored ten percent would receive some other percentage with no authored act, against Constitution Principle 4.

It would also collapse independent obligations into a pool. Scaling every obligation by a common factor is the single N-way split that Decision 071, Decision 074 and PFOS-ENG-02 §14 each forbid, and Decision 071 reserves pool treatment for authored pools that must total exactly 10,000 basis points.

And it would conceal a plan defect. Constitution Principle 7 forbids rewarding unhealthy financial behaviour and Principle 6 requires factual, constructive diagnosis. Quietly shrinking every obligation makes an overcommitted plan look funded, when surfacing the shortfall is what Principle 9's explainability and the Funding Advisor exist for.

## Tithing has no intra-stage precedence

No accepted source gives tithing priority over another global obligation, and none makes obligation priority user-configurable.

PFOS-ENG-01 §11 resolves all global percentage-based obligations in one step. §12 specifies the tithing rule in the singular. PFOS-ENG-02 §13 describes global percentage obligations as including rules such as tithing, naming it as an instance of the category rather than its head. PRD §15 and Constitution Principle 2 fix its default rate, not its position.

The corpus's "tithing first" language orders the global-obligation stage against later stages. That stage ordering is carried by `stageSequence` and is unchanged by this decision. It is stage ordering, not intra-stage obligation priority.

Tithing's default rate and its prominence in the product do not make it financially first. Under this decision tithing is one independent commitment among possibly several.

## sequence has no financial execution meaning in V1

`ResolvedGlobalObligation.sequence` has no financial execution meaning in V1.

It does not affect the obligation amount, because each obligation computes its own claim against its own basis, and Decision 074 exposes one `IncomeBasis` member in V1 so that no obligation's base is a running remainder.

It does not affect `IncomeBasis`, which is a per-obligation selector.

It does not affect `maximumAmount`, which bounds its own obligation and creates no relation between obligations. No accepted source redirects a capped excess to another obligation.

It does not affect Decision 088's applicability, which is a per-source predicate contributing no ordering key.

It does not affect residual-cent assignment. Each obligation is its own complementary two-way split, so its residual is internal to it, and Decision 071 records that at most one cent is ever in play for two complementary weights. Decision 074 assigns residual-cent canonical ordering to Allocation Engine bucket state and records that `ResolvedRuleSet` does not carry a second canonical destination-order list.

It does not affect insufficient-funds priority, because there is no such priority: the overcommitted state is invalid rather than ordered.

Every channel through which the field could have carried financial meaning is closed.

## Supersedes Decision 074 only to the following extent

Decision 074's "Deterministic ordering and canonicalization" section is superseded to the minimum extent stated here, and no further.

Under "Rule Engine-owned financial ordering", the list entry:

    - global obligations ordered by financially meaningful `sequence`

is superseded, and the sentence governing that list:

    These orderings affect execution semantics.

is superseded only as it applies to global obligations.

The new authority is that `ResolvedGlobalObligation.sequence` is not a financially meaningful Rule Engine-owned ordering in V1, and that the statement that this ordering affects execution semantics no longer applies to global obligations.

Decision 074's Status remains Accepted. Decision 074 is not superseded as a whole, and nothing in this decision may be read as superseding it beyond the entry and the application named above.

Decision 074's "Global obligations" section states that "`sequence` is financially meaningful where separately authored obligations must be evaluated in a defined order." That sentence is conditional and is not superseded and is not contradicted. This decision establishes that no defined order is required in V1, so its antecedent is false in V1 and it asserts nothing for V1.

Decision 074's Blocker E recorded that a contrary interpretation of rule ordering would require amending Decision 074. This decision performs that correction at the minimum extent, rather than recording it as owed.

A later editorial cross-reference in Decision 074, pointing to this decision at the superseded entry, is recommended. That documentation cleanup is not part of this decision and changes nothing here.

## Decision 074 material preserved

The `sequence` field itself, its declared type, and the structure of `ResolvedGlobalObligation`. No member is added, removed, reordered or made optional.

`stageSequence`, and the stage ordering it carries.

Top-priority rank ordering, and therefore Decision 087.

`ResolvedFundingRule.sequence` and `ResolvedPoolFixedAmount.sequence`, together with the fixed-amount competition semantics that PFOS-ENG-02 §30 grounds. Each keeps its classification as a financially meaningful ordering, and Decision 074's governing sentence continues to apply to them and to `stageSequence` and to top-priority rank.

The Allocation Engine-owned residual-cent ordering, and the reproducibility-only ordering rules.

`ResolvedRuleSet`, `schemaVersion`, `sourceRuleVersionIds`, and every other Decision 074 contract element.

## Decision 080 is clarified, not superseded

Decision 080 is not superseded by this decision, and its Status remains Accepted.

One recital in its "Ordered materialization of the additive slot is blocked" section is no longer current authority: that `ResolvedGlobalObligation.sequence` is financially meaningful because Decision 074 declares it so. That recital was an accurate report of Decision 074 when written, and it is no longer current because the underlying Decision 074 classification is superseded above. This decision does not independently supersede Decision 080.

Decision 080's holdings remain binding:

- `sequence` must not derive from an identifier;
- `sequence` must not derive from array position;
- `sequence` must not derive from repository or storage order;
- Decision 080 classified the slot and did not enable it to be built;
- `ResolvedRuleSet.globalObligations` remains unmaterializable while the current non-optional `sequence` field has no accepted value.

The blocking conclusion still stands. Decision 080 gave two grounds for it: that `sequence` has no accepted value, and that emitting a collection whose ordering is not financially established would defeat determinism. The first stands unchanged. The second no longer applies in that form, because the ordering is now established to be financially absent rather than unestablished, and the canonicalization gap recorded below supplies a further ground.

## The persisted contract does not change

This decision changes a semantic classification only. It does not change the persisted contract.

`ResolvedGlobalObligation` retains every member including `sequence`, with its declared type unchanged. The field is not removed, not made optional, not retyped, not reclassified in source, and not replaced. `ResolvedRuleSet` is unchanged, `schemaVersion` is unchanged and no increment is authorised, and Plan Snapshot design is unchanged.

Decision 074 records that any incompatible persisted contract change requires a schema-version increment so that existing Plan Snapshots continue to reproduce the rules under which they were created. No such change is made or authorised here.

The eventual contract disposition of `ResolvedGlobalObligation.sequence` remains open. Removal, canonical-only retention, replacement and optionality are all available, and none is selected by this decision.

## Canonical ordering is a separate, unresolved question

Financial ordering for global obligations is settled absent. Canonical, reproducibility ordering is still required and still unresolved. The two must not be conflated.

Decision 074 requires that identical inputs produce a deep-equal `ResolvedRuleSet`, and distinguishes orderings that affect execution semantics from arrays whose index has no financial meaning but which are still emitted canonically. That requirement survives untouched, and `globalObligations` still requires deterministic emission for deep-equal `ResolvedRuleSet` behaviour.

No canonical key is adopted by this decision.

`destinationBucketId` is not necessarily a total key, because two obligations may legitimately target the same destination bucket. `obligationId` provenance remains unresolved under Decision 086 and cannot be assessed. `ruleVersionId` is recorded as a candidate for the later canonicalization decision, because Decision 079 selects at most one effective version per rule, so distinct resolved obligations carry distinct version identifiers. It is a candidate only and it is not adopted.

If a later decision adopts an opaque identifier for deterministic serialization, that use must not cause the identifier to acquire financial meaning. PFOS-ENG-00 §14 keeps identifiers opaque, and a fixed serialization order must never become execution priority. An array emitted in a fixed order must not be executed as though that order meant something.

The canonicalization gap for `globalObligations` remains open, separate from and not a resurrection of financial sequence.

## Blocker F

The obligation amounts do not depend on Blocker F. Each obligation is a rate against a supplied basis, and Decision 074 records that Blocker F does not change the `ResolvedRuleSet` contract because the contract names the selected basis rather than carrying the computed amount.

Blocker F remains responsible for eligible-income computation, aggregation and double-count prevention. This decision owns the overcommitment policy, not the calculation of the eligible amount.

Blocker F remains open and is not resolved, narrowed or implemented.

## Deliberately not decided

Where and when the invalid condition is detected, including whether detection occurs during authoring, during rule resolution, during allocation execution, or elsewhere.

Any validator, validator API, validation layer, authored-rate-sum check or error code, and any skip, warning or explanation code.

How `maximumAmount` and applicability are incorporated into the eventual check.

Eligible-income computation, aggregation and double-count prevention.

User-facing behaviour, wording, and any recovery or edit flow.

Whether `ResolvedGlobalObligation.sequence` is removed, retained as canonical-only, replaced, or made optional; any canonical key for `globalObligations`; and any `schemaVersion` change.

`obligationId` provenance.

## Unchanged by this decision

No specification text is superseded, amended or replaced. PFOS-ENG-01 and PFOS-ENG-02 are not altered.

Decision 074 is superseded only to the minimum extent recorded above and retains its Accepted status. Decision 080 is clarified rather than superseded and retains its Accepted status. No other decision is superseded, amended or clarified.

`ResolvedGlobalObligation`, `ResolvedRuleSet`, `schemaVersion`, `sourceRuleVersionIds` and Plan Snapshot design are unchanged. No source, test, registry, schema or configuration change is authorised.

No `GLOBAL_OBLIGATION` payload and no arm of `RuleConfiguration` is defined or authorised, and no field name, literal spelling, type, enum or union is introduced. `RuleConfiguration`, `RuleVersion`, `ConfiguredRuleVersion` and `RuleVersionKind` remain as Decision 086 left them, and `TerminatingRuleVersion` remains the only concrete rule-version arm in source.

No validator is authorised, no error code is registered or named, and no registry changes.

No explanation, skip or warning ordering is established. Decision 074 keeps those channels separate, Decision 079 orders `skippedRules` by rule identifier as a canonicalization, and no accepted source ties any of them to obligation order.

Decision 088's applicability semantics are untouched and remain orthogonal to ordering. `ALLOCATION_BASIS` authoring, the `TOP_PRIORITIES` payload shape, the `GOAL_POLICY` duplication and the PFOS-ENG-01 §41 metadata questions are untouched. Resolver population, evaluation-context population, Blocker C, and all Milestone 3 behaviour remain outside this decision.

Decisions 016, 071, 078, 079, 081, 082, 086, 087 and 088 are unamended.

## Why

Decision 080 recorded that no accepted source supplies this field's value or its key, and Decision 088 preserved that. Neither examined what the field would do if it had one.

That examination showed the only channel through which order could be financially decisive was competition when the obligations over-claim — a state the corpus permits but never describes. This decision answers that question at the level it belongs to, as financial policy, and then follows the answer to its consequence for the field's classification.

Both of the alternatives it rejects are silent. Ordered funding would let an unauthored fact decide which commitment goes unfunded; proportional reduction would quietly change every authored rate. Constitution Principle 4 forbids both.

The supersession is performed here rather than deferred because Decision 068 requires a conflict between documents to be resolved explicitly rather than silently, and leaving two accepted decisions in direct contradiction while recording that one will be corrected later is the silent outcome in slower form. Keeping the supersession to one list entry and one application of one sentence is what keeps the correction proportionate to the conflict.

## Alternatives Considered

Sequential priority funding was rejected: it requires an order no accepted source supplies and every candidate source is excluded, it contradicts Decision 080's holding that no obligation displaces another, and it makes an unauthored fact financially decisive.

Proportional reduction was rejected: it silently alters authored commitments, collapses independent obligations into the pool treatment three sources forbid, and conceals a plan defect.

An authored-rate-sum rule requiring obligations to total no more than 10,000 basis points was rejected. No accepted source independently requires it, and applicability and caps mean authored rates are not the quantity that over-claims.

Naming the Decision 074 conflict and leaving the correction to a later decision was considered and rejected. It would leave two accepted decisions in direct contradiction, which Decision 068 requires be resolved rather than carried, and an implementation reading Decision 074 alone would find the superseded classification still stated.

Superseding Decision 074 as a whole, or setting its Status to Superseded, was rejected as disproportionate. One classification is corrected; the contract, the other financial orderings, the residual-cent ordering, the reproducibility-only rules and every structural element remain correct and in force.

Superseding Decision 080 was rejected. Only its recital of the Decision 074 classification is affected, and that follows from the Decision 074 correction rather than from any defect in Decision 080's own holdings.

Deciding the field's contract disposition here was rejected. Removal, canonical-only retention, replacement and optionality are contract and schema questions entangled with a canonical-key choice, and Decision 074 requires a schema-version increment for an incompatible persisted change.

Adopting `ruleVersionId` as the canonical emission key was considered and rejected. The candidate is recorded because it is useful to the later decision, but adopting it would settle by implication the contract question this decision reserves.

Deciding where the invalid condition is detected was rejected: because applicability and caps affect the computed claims, the condition may not be determinable at authoring time, and choosing a detection point before that is understood would fix an algorithm this decision deliberately leaves open.

## Tradeoffs

`GLOBAL_OBLIGATION` remains unmaterializable. This decision removes the reason the field mattered without supplying the value the non-optional contract still requires, so the slot stays blocked.

A field in an accepted, persisted contract now carries no financial execution meaning while remaining in that contract with its type unchanged. That is uncomfortable and it is the accurate description until the contract question is taken up.

A user who authors obligations whose applicable claims over-claim will be blocked rather than partially funded. That is stricter than Decision 075's treatment of zero top priorities, which chose a warning over an error. The cases differ: zero top priorities is a coherent plan state in which money flows to later stages, whereas an over-claimed obligation set has no valid outcome, since every candidate resolution is rejected above.

The canonicalization gap is now explicit and unfilled, so `globalObligations` has neither a financial nor an established canonical ordering.

A narrow supersession requires Decision 074 to be read together with this decision at one point, until the recommended editorial cross-reference is made.

## Consequences

`ResolvedGlobalObligation.sequence` has no financial execution meaning in V1, and Decision 074's classification of it as a financially meaningful Rule Engine-owned ordering is superseded to that extent.

Decision 080's recital of that classification is no longer current authority, while its exclusions and its blocking conclusion remain binding. `GLOBAL_OBLIGATION` does not become resolvable.

The canonicalization gap for `globalObligations` is recorded as open, with `ruleVersionId` noted as a candidate and none adopted.

The closures established by Decisions 087 and 088 are unchanged.

This decision closes no additional Decision 086 configuration blocker. It resolves the financial-ordering question associated with `ResolvedGlobalObligation.sequence` while leaving the field's contract disposition and canonicalization unresolved.

Blocker C and Blocker F remain open and continue to gate the work they name.

No specification text changes, no code is authorised, no contract changes, no registry changes, and no `schemaVersion` change. Milestone 2 gains no new implementable contract.

## Future Review Trigger

Reconsider when the field's contract disposition and a canonical key are taken up, since the two are entangled and a schema-version question arrives with them; if a second `IncomeBasis` member is ever defined as a function of a running remainder, since obligations would then cease to be independent and this decision's foundation would change; when the invalid condition's detection point is taken up, since Blocker F's eligible amount and the treatment of caps are inputs to it; if an accepted source ever establishes a competition rule for global obligations equivalent to PFOS-ENG-02 §30's rule for fixed amounts, since that would contradict this decision and require replacing it; or when `obligationId` provenance is settled, since it becomes a second canonical-key candidate then.

---

# Decision 090: ResolvedGlobalObligation.sequence Is Removed

**Status:** Accepted
**Related:** Decisions 023, 068, 071, 073, 074, 078, 079, 080, 081, 082, 086, 088, 089
**Scope:** Financial logic, Architecture, Engineering, Data

## Decision

`sequence` is removed from `ResolvedGlobalObligation`.

Removing a required member is an incompatible `ResolvedRuleSet` contract change under Decision 074, so a schema-version consequence exists. This decision does not select a numeric `schemaVersion`, does not increment one, does not authorise the source removal, and does not define migration mechanics.

This decision settles the semantic contract disposition of that field and nothing else. It adopts no canonical ordering key, decides no projection cardinality, resolves no `obligationId` question, defines no `GLOBAL_OBLIGATION` payload, and does not make `GLOBAL_OBLIGATION` materializable.

## Why the field is removed

Decision 089 established that `ResolvedGlobalObligation.sequence` has no financial execution meaning in V1. What remained was what becomes of the member itself.

Decision 074's reproducibility-only collections encode canonical order at the array level rather than with per-item ordinals. Pool destinations, leftover percentage destinations, rollover policies and goal policies are ordered by bucket identifier, `sourceRuleVersionIds` is de-duplicated and sorted, and `skippedRules` is ordered by rule identifier. In every case the ordering is a property of the emitted array, not a datum stored on a member.

Retaining `sequence` as canonical-only metadata would duplicate array position. It would record twice what the array already states, and the two can disagree. Decision 081 refused a stored precedence level, Decision 083 a dated status and Decision 085 an independent terminating flag, each on that objection, and Decision 086 accepted such a redundancy only after establishing that the value was not derivable. This one is.

Making the field optional would create transitional and dual semantics. Absence would have to mean canonical-only while presence meant legacy, which is the shape Decision 085 refused for an absent configuration and Decision 088 refused for an absent applicability value.

Replacing it with another ordinal merely renames the same redundancy.

Deprecating it preserves a misleading dead field, in a contract, for as long as the deprecation lasts.

Constitution Principle 25 chooses clarity when clarity and an additional feature conflict. A member that means nothing is the cost that principle exists to avoid.

## Schema-version consequence

Removing a required member from `ResolvedGlobalObligation` is an incompatible `ResolvedRuleSet` contract change under Decision 074. A schema-version consequence therefore exists.

This decision does not select, increment or change any numeric `schemaVersion`, either in the Decision Log or in source.

The numeric and migration decision should occur only after the resolved `GLOBAL_OBLIGATION` contract is stable enough to version. It is not stable now: `obligationId` remains unresolved under Decision 086, and resolving it may itself change this contract.

A second reason applies independently. No accepted source establishes the current decision-level numeric `schemaVersion`, so there is no decided baseline to move from, and fixing one is a commitment about a persisted value rather than about the contract's shape.

That the repository currently has no persistence layer, no stored Plan Snapshot and no migration machinery bears only on how simple the eventual transition will be. It is not a reason the rule does not apply, and no pre-persistence exception is created here.

## Decision 074's schema-version rule is unchanged

Decision 074 states that any incompatible persisted contract change requires a schema-version increment so that existing Plan Snapshots continue to reproduce the rules under which they were created.

That rule is not amended, not narrowed and not excepted. It governs this change and every future one.

## Supersedes Decision 074 only for the contract shape

Decision 074 is superseded in one respect: `ResolvedGlobalObligation` no longer contains `sequence`.

Decision 089 already superseded Decision 074's classification of the global-obligation ordering as financially meaningful. This decision removes the member itself and does nothing further to Decision 074.

`globalObligations` is not added to Decision 074's reproducibility-only ordering list here. Every entry in that list names a key, and this decision adopts none. Entry into that list belongs with the decision that supplies the key.

Decision 074's Status remains Accepted and it is not superseded as a whole. Preserved unchanged: `stageSequence`; top-priority rank ordering; `ResolvedFundingRule.sequence`; `ResolvedPoolFixedAmount.sequence` and the fixed-amount competition semantics; the Allocation Engine-owned residual-cent ordering; the existing reproducibility-only ordering entries; every other member and field of `ResolvedRuleSet`; `sourceRuleVersionIds`, which is a different field from `ResolvedGlobalObligation.ruleVersionId` and keeps its own de-duplicated and sorted ordering; and the schema-version rule.

A later editorial cross-reference in Decision 074 at the affected point is recommended. That documentation cleanup is not part of this decision.

## Canonical ordering remains unresolved

`ResolvedRuleSet.globalObligations` still requires reproducibility-only canonical ordering for deterministic deep equality. Decision 074 requires that identical inputs produce a deep-equal `ResolvedRuleSet`, and PFOS-ENG-01 §26 requires all ordering to be explicit and stable.

No canonical key is accepted by this decision.

`ruleVersionId` is the strongest current candidate. It is already present on `ResolvedGlobalObligation`, so adopting it would add no field, and an opaque identifier may potentially serve reproducibility-only ordering under Decision 074's precedent, which orders six such collections by an identifier. Its totality depends on the projection cardinality recorded below, which is unresolved. It is not adopted.

`obligationId` is not adopted. Its provenance remains unresolved under Decision 086, and sorting by it would mean one thing if it is the rule's own identity and another if it names a separate entity.

`destinationBucketId` is not adopted. It is not necessarily total, because nothing forbids two global obligations targeting the same destination bucket.

`ruleId` is not present on `ResolvedGlobalObligation` and must not be added merely to serve as a sort key.

No compound key is adopted.

Three constraints are recorded forward, to bind whichever key is eventually chosen. The array index will carry no financial meaning. The canonical ordering must never become execution priority, since Decision 089 settled that applicable global obligations are independent with no obligation financially prior to another. And repository, storage and iteration order cannot decide emission semantics, as PFOS-ENG-00 §32 Invariant 11 and PFOS-ENG-01 §26 require.

The canonicalization gap Decision 089 recorded for this collection remains open.

## Projection cardinality remains unresolved

This decision does not decide whether one selected `GLOBAL_OBLIGATION` `RuleVersion` produces one `ResolvedGlobalObligation`, or potentially several.

The question is tied to `obligationId` provenance and to future `GLOBAL_OBLIGATION` payload semantics. If `obligationId` is the rule's own identity, one version yielding one obligation follows. If it names a separate entity, one version naming several obligations becomes coherent. Decision 086 left that open, so the cardinality is open with it.

Three things are recorded as evidence for a one-to-one projection, and as evidence only. Decision 074 types `ResolvedGlobalObligation.ruleVersionId` in the singular. `ResolvedTopPriorityEntry.ruleVersionIds` and `ResolvedPoolDestination.ruleVersionIds` are plural on structures that can conceptually assemble more than one version, a contrast Decision 082 noted when recording that those plural fields carry a single element in V1. And Decision 071, Decision 074, Decision 080 and PFOS-ENG-02 §14 all speak of separately authored global obligations and separately authored global rules interchangeably.

That evidence points one way. It is not converted into authority here. Settling the cardinality in order to obtain a sort key would close a design space for a canonicalization convenience, which is not a sufficient reason.

Decision 079 is unaffected and continues to select at most one effective version per rule. That is a statement about version selection, not about how many obligations a selected version contributes.

## Decision 080 and Decision 089

Decision 080 prohibited sourcing the `sequence` value from an identifier, from array position, or from repository order. Decision 089 preserved that prohibition for that field.

This decision removes the field, so no `sequence` value is supplied from anything.

Because no canonical array key is adopted here, Decision 080 is not broadened beyond that. Whether array-level canonical ordering by an identifier is permitted is a question for the decision that adopts a key.

Decision 080 is not superseded and its Status remains Accepted.

Decision 089 is unamended and preserved in full: `sequence` has no financial execution meaning, obligations are independent with no intra-stage priority, the overcommitted state is financially invalid, and canonical ordering must never become financial priority.

## obligationId

This decision does not resolve `obligationId` provenance.

`ResolvedGlobalObligation.obligationId` remains non-optional, remains without an accepted source for its value, and therefore remains a field-level blocker to materializing `GLOBAL_OBLIGATION`. That is the same defect that blocked `sequence`, and removing `sequence` does nothing about it.

## GLOBAL_OBLIGATION does not become materializable

Removing `sequence` does not enable the slot.

The remaining blockers include at least `obligationId` provenance, `GLOBAL_OBLIGATION` projection cardinality, the `GLOBAL_OBLIGATION` `RuleConfiguration` payload, the canonical ordering of `globalObligations`, resolver population, evaluation-context population, the questions Blocker C still touches, and Blocker F for eligible-income computation.

## No implementation is authorised

No source change is authorised, including removal of the member from the shipped contract and any change to the tests that reference it. That work follows the numeric and migration decision, which follows contract stability.

No `schemaVersion` edit, no migration and no persistence work is authorised.

No arm of `RuleConfiguration` is defined or authorised. No canonical key is adopted. No validator is authorised, no validator API is defined, no error code is registered or named, and no registry changes. `obligationId` provenance is not resolved. No Milestone 3 behaviour is established.

## Deliberately not decided

The canonical ordering key for `globalObligations`.

Whether one selected `GLOBAL_OBLIGATION` `RuleVersion` contributes one obligation or several.

`obligationId` provenance.

The numeric `schemaVersion` transition, the exact version value, whether the absence of stored data changes migration mechanics, and the implementation and migration boundary.

The `GLOBAL_OBLIGATION` payload and any arm of `RuleConfiguration`.

Where and when Decision 089's overcommitment condition is detected, and any validator, validator API or error code.

Eligible-income computation, aggregation and double-count prevention.

Resolver population, evaluation-context population, Blocker C and Blocker F.

The canonical ordering of any other collection, and the sequence fields of required funding and of fixed-amount pool destinations.

## Unchanged by this decision

No engineering specification text is superseded, amended or replaced. PFOS-ENG-01 and PFOS-ENG-02 are not altered.

Decision 074 is superseded only for the contract shape recorded above and retains its Accepted status, including its schema-version rule. Decision 080 is not superseded and retains its Accepted status. Decision 089 is unamended. Decision 088's applicability semantics are untouched. Decision 086's `obligationId` record is untouched.

`ResolvedRuleSet`'s field list is unchanged, `sourceRuleVersionIds` is unchanged, Plan Snapshot design is unchanged, and no numeric `schemaVersion` is changed.

`RuleConfiguration`, `RuleVersion`, `ConfiguredRuleVersion` and `RuleVersionKind` remain as Decision 086 left them, and `TerminatingRuleVersion` remains the only concrete rule-version arm in source.

Decisions 071, 078, 079, 081, 082, 085, 086, 088 and 089 are unamended.

## Why

Decision 089 emptied this field of meaning and recorded two questions as open: what becomes of the field, and how the array is canonically ordered.

Only the first resolves from accepted authority today. Decision 074's own practice answers it — every reproducibility-only collection is ordered at array level and none stores an ordinal — and the alternatives to removal each reproduce a redundancy or an ambiguity the corpus has refused before.

The second does not resolve yet, because every candidate key either depends on an unresolved question or is not total. Adopting one would have required settling projection cardinality, and that question belongs with `obligationId` provenance rather than with a serialization concern. Settling it here would close a design space to obtain a sort key, which is the wrong reason to close one.

Keeping this decision to the field's disposition also keeps the schema-version question where it belongs. The contract is not yet stable, and versioning an intermediate shape would record a transition that no stored data ever held.

## Alternatives Considered

Retaining `sequence` as canonical-only ordering metadata was rejected: it would be the corpus's only per-item ordinal and it duplicates array position.

Making `sequence` optional was rejected as dual meaning, the shape Decisions 085 and 088 each refused.

Replacing `sequence` with another ordering field was rejected as the same design renamed.

Deprecating the field was rejected: it preserves a misleading member of the contract for the duration.

Adopting `ruleVersionId` as the canonical key in this decision was considered and rejected. It would have required establishing that a selected rule version contributes at most one obligation, which is entangled with `obligationId` provenance, and closing that design space for a canonicalization convenience is not a sufficient reason.

Adopting `obligationId` or `destinationBucketId`, or a compound key, was rejected for the reasons recorded above.

Selecting or incrementing a numeric `schemaVersion` was rejected: no accepted source fixes the current decision-level value, and the contract is not yet stable enough to version.

Treating the absence of a persistence layer as an exception to Decision 074's schema-version rule was rejected. Creating an exception to an accepted rule inside a decision about something else is the silent resolution Decision 068 forbids.

## Tradeoffs

The field's disposition is settled while its version is not, so the source removal cannot proceed yet. If the intervening questions prove difficult, a member Decision 089 has already emptied of meaning will sit in the contract for several decisions. That is acceptable because nothing can be built on it, and it is recorded rather than left to be discovered.

`globalObligations` now has neither a financial ordering nor an established canonical one. The requirement is recorded and unmet.

`GLOBAL_OBLIGATION` remains unmaterializable, and this decision reduces the blocking fields by one without enabling anything.

## Consequences

`ResolvedGlobalObligation` will carry six members once the removal is implemented: `obligationId`, `ruleVersionId`, `destinationBucketId`, `rateBasisPoints`, `incomeBasis` and optional `maximumAmount`.

A schema-version consequence exists and is deferred. No numeric value is selected, and no source change is authorised until that decision is taken.

The canonicalization gap Decision 089 recorded for `globalObligations` remains open, and no key is accepted.

`GLOBAL_OBLIGATION` projection cardinality is recorded as an open question for the first time, alongside `obligationId` provenance, and the two are recorded as entangled.

`GLOBAL_OBLIGATION` remains unmaterializable.

The closures established by Decisions 087, 088 and 089 are unchanged. This decision closes no Decision 086 configuration blocker.

Blocker C and Blocker F remain open and continue to gate the work they name.

## Future Review Trigger

Reconsider when `obligationId` provenance and the projection cardinality are settled, since the canonical key depends on them and the contract's shape becomes stable then; when the canonical ordering key is adopted, since `globalObligations` would then join Decision 074's reproducibility-only list; when the numeric schema-version decision is taken, since the source removal is gated on it; or if a persistence layer or a stored Plan Snapshot is introduced before that decision, since the migration would then have data to act on.

---

# Decision 091: Resolved Global Obligation Provenance Is ruleId and ruleVersionId, and One Selected Version Contributes At Most One Obligation

**Status:** Accepted
**Related:** Decisions 016, 023, 068, 071, 073, 074, 078, 079, 080, 081, 082, 085, 086, 088, 089, 090
**Scope:** Financial logic, Architecture, Engineering, Data

## Decision

A `ResolvedGlobalObligation` carries two distinct provenance identities:

- `ruleId`, the identity of the stable authored `Rule`;
- `ruleVersionId`, the identity of the exact `RuleVersion` selected for the evaluation date.

`obligationId` is retired. Its value was never attributed by any accepted source, and this decision establishes that the concept it was reaching for is the stable authored `Rule` identity, under the name the corpus already uses for that concept.

A selected `GLOBAL_OBLIGATION` `RuleVersion` contributes at most one `ResolvedGlobalObligation`. Where it contributes, it contributes exactly one.

Renaming a required member of a persisted contract is an incompatible `ResolvedRuleSet` contract change under Decision 074, so a schema-version consequence exists. This decision does not select a numeric `schemaVersion`, does not increment one, does not authorise the source change, and does not define migration mechanics.

This decision adopts no canonical ordering key, defines no `GLOBAL_OBLIGATION` payload, authorises no validator or error code, and does not make `GLOBAL_OBLIGATION` materializable.

## The two identities

`ruleId` answers which logical authored `Rule` this obligation is. Decision 081 makes `RuleId` the stable logical identity that persists across every version, and records that changing an owner or slot kind creates a different logical rule rather than retroactively changing what historical versions governed. Decision 078 defines it as a semantic alias of `EntityId` on the terms Decision 074 established for `PlanVersionId`.

`ruleVersionId` answers which exact version of that Rule produced this resolved obligation. Decision 079 selects it by latest `effectiveFrom`, Decision 085 fixes what a selected `CONFIGURED` version contributes, and PFOS-ENG-01 §19.1 requires a version used in a confirmed allocation to remain reconstructable.

Neither derives from the other inside the resolved contract. PFOS-ENG-00 §14 forbids deriving a rule identity from a version identifier's shape, and Decision 086 records that no accepted contract pairs a `Rule` with its versions.

PFOS-ENG-01 §19.2's own example is the demonstration: a tithing rule at 10% from January 1 and 12% from April 1 produces two resolved obligations across two snapshots with the same `ruleId` and different `ruleVersionId`s. That is the fact §19.3 reports as "Tithing changed from 10% to 12% on April 1," and no version-only contract can express it.

This family needs it more than the others. `GLOBAL_OBLIGATION` is the only executable resolved family with no natural key: every other is keyed by `bucketId`, and `destinationBucketId` cannot serve, because Decisions 089 and 090 both record that two obligations may legitimately target the same destination bucket.

Both identifiers remain opaque under PFOS-ENG-00 §14. Domain logic must never parse either identifier or derive financial, business, chronological, precedence, priority, or execution semantics from its value or shape. A later accepted decision may separately use an opaque identifier mechanically as a reproducibility-only canonical serialization key, provided that use acquires no financial meaning and never becomes execution priority.

## Why this is not the redundancy the corpus has refused

Decision 081 refused a stored precedence level, Decision 083 a dated status, Decision 085 an independent terminating flag, and Decision 090 the `sequence` ordinal, each on the objection that two fields can disagree. In every one of those cases the redundant value was derivable from a field that already existed, so storing it bought nothing. Decision 086 accepted a cross-object redundancy deliberately, precisely because the value there was not derivable.

`ruleId` is in Decision 086's position. It is not derivable from `ruleVersionId` by any consumer of a `ResolvedRuleSet`.

The cost is stated plainly: `ruleId` and `ruleVersionId` can disagree, and no contract pairs a `Rule` with its versions to check them. This is not a new class of hazard — `SkippedRule` already carries the identical unenforceable pair — and it joins the invariants Decisions 085 and 086 recorded as awaiting that same missing contract. No validator is authorised and no error code is registered, under Decision 073's convention that a code is named once the behaviour it reports is specified.

Decision 081's provenance gap does not extend here. It concerns `ResolvedRolloverPolicy`, `ResolvedGoalPolicy` and `ResolvedFundingRule`, whose entries may originate in a product default with no version to name. Decision 080's enumeration of established product defaults contains no global obligation, and Decision 088 records the consequence that a tithing obligation exists only when authored. Both fields are therefore safely non-optional for this family. Decision 081's gap is untouched and remains open for the three families it names.

## Why the field is renamed rather than kept

`obligationId` names the wrong thing once its value is a `RuleId`, and it invites the reading this decision rejects — that some obligation entity exists.

A second name for an existing concept is terminology drift, the objection Decision 078 raised against `effectiveThrough` and Decision 081 raised against a parallel precedence vocabulary. `ruleId` is the spelling already used by `SkippedRule`, by `Rule`, by `TerminatingRuleVersion` and by the shipped `RuleId` alias, so the rename keeps one vocabulary rather than two.

Constitution Principle 25 chooses clarity where clarity and an additional feature conflict. A correctly-typed field under a misleading name is the cost that principle exists to avoid, and Decision 090 invoked it for the same reason.

Retaining the name and documenting the semantic was considered and rejected: it leaves a persisted field whose name contradicts its meaning, which is what an implementation or an import validator reads first.

## No separate obligation entity

No accepted authored obligation entity exists. PFOS-ENG-01 §41's conceptual data model lists `Rule`, `RuleVersion`, `PlanSnapshot` and `RuleAuditEntry`, and no `Obligation`.

`GLOBAL_OBLIGATION` is authored as a `Rule`: Decision 081 gives it a slot kind, Decision 082 places it at `GLOBAL` and exempts it from authored-scope uniqueness, and Decision 088 confirms its ownership. Its changing financial semantics belong to the `RuleVersion`, where Decision 086 places a required non-nullable configuration and Decision 088 places applicability.

An obligation entity would create a new identity space, lifecycle and versioning domain — a commitment far larger than a field's provenance, and the kind Decision 068 forbids making as a side effect of another decision.

No `Obligation`, no `ObligationVersion`, no obligation lifecycle, no new `RuleOwner` variant and no new `ResolvedSlotKind` member is introduced. Decision 081 requires no amendment.

## No per-resolution identity

A resolved-entry identity minted per resolution is rejected.

Decision 074 requires identical inputs to produce a deep-equal `ResolvedRuleSet`, and PFOS-ENG-01 §26 excludes random identifiers from resolution. A minted value would differ between two recalculations of one historical date, so a stored snapshot's value would be unreproducible, against §19.1, Constitution Principle 11 and PFOS-ENG-00 §32 Invariant 10. Decision 088's historical-determinism holding requires historical facts to come from the effective version and the identity supplied in that historical evaluation context; a minted value comes from neither. And an identity minted at resolution time traces to nothing authored.

`ResolvedRuleSet.resolvedRuleSetId` presents a related question that no accepted source examines. It is outside this decision's scope, is not resolved here, and is not changed.

## Projection cardinality

This decision establishes the projection cardinality. No earlier decision states it. Decision 086 recorded `obligationId` provenance as unattributed. Decision 089 recorded that it could not be assessed. Decision 090 recorded the cardinality as an open question for the first time, listed three items expressly as evidence for a one-to-one projection and as evidence only, and declined to convert them into authority. This decision performs that conversion, on its own authority, for the first time.

A selected `GLOBAL_OBLIGATION` `RuleVersion` contributes at most one `ResolvedGlobalObligation`, and exactly one where it contributes.

The grounds are these. Decision 079 selects at most one effective version per rule for an evaluation date. Decision 085 holds that a selected `CONFIGURED` version contributes its configuration. Decision 088 records that applicability decides whether an obligation produces a resolved obligation or a skip. Decisions 080, 082 and 089 each explain multiplicity by multiple Rules and never by one version. Decision 074 types `ResolvedGlobalObligation.ruleVersionId` in the singular while typing `ResolvedTopPriorityEntry.ruleVersionIds` and `ResolvedPoolDestination.ruleVersionIds` plural on structures that can conceptually assemble from more than one version. And Decisions 071, 074 and 080 with PFOS-ENG-02 §14 speak throughout of separately authored obligations and separately authored global rules, which is an authoring multiplicity.

The only construction under which one version could name several obligations is the separate obligation entity rejected above, which appears in no accepted source. Decision 090 recorded that entanglement in exactly those terms: if `obligationId` names a separate entity, one version naming several obligations becomes coherent.

Decision 090 declined to settle this because doing so in order to obtain a sort key would close a design space for a canonicalization convenience, which is the wrong reason to close one. That reason is specific to its subject and does not apply to a decision whose subject is the cardinality itself. Decision 090's Future Review Trigger names this settlement as the reconsideration event.

Decision 079 is unaffected and continues to select at most one effective version per rule. That remains a statement about version selection; this decision supplies the separate statement about how many obligations a selected version contributes.

## The cardinality is stated per selected version, not per income source

The holding is:

```text
one selected GLOBAL_OBLIGATION RuleVersion  ->  at most one ResolvedGlobalObligation
```

It is not:

```text
one selected RuleVersion  ->  one ResolvedGlobalObligation per applicable income source
```

Nothing in this decision establishes a per-income-source projection of a rule version into resolved entries. `ResolvedGlobalObligation` carries no income-source member, and Decision 088 records why none is required: the question is answered during resolution and decides whether an obligation is emitted or skipped, so nothing needs to be preserved on the resolved contract in order to explain the outcome. `ResolvedRuleSet` carries no income-source list. PFOS-ENG-01 §25 supplies `Income source` to the evaluation context, and §11 identifies the income source as one step of resolution.

This decision does not decide eligible-income aggregation, per-source computation, double-count prevention, or Blocker F. Decision 016's cross-source aggregation and PFOS-ENG-01 §12.4's conceptual aggregation remain unspecified, and Decision 088 settled nothing further about the population its applicability question might range over. Decision 089's boundary is preserved: obligation amounts do not depend on Blocker F, and Blocker F remains responsible for eligible-income computation, aggregation and double-count prevention.

One consequence is recorded rather than resolved. If a later accepted decision establishes a resolution ranging over several income sources that emits a separate resolved obligation per source, that would place several resolved obligations against one selected version and would contradict this decision, requiring it to be replaced rather than extended. That possibility is recorded as a review trigger. It is neither anticipated nor pre-authorised, and no accepted source establishes it today.

## Contribution and non-contribution

Two levels must be kept apart, because a rule with no effective version has no selected version at all.

At the Rule level, a `GLOBAL_OBLIGATION` `Rule` contributes no `ResolvedGlobalObligation` for an evaluation date on which no `RuleVersion` of that rule is effective. Decision 078 establishes this, Decision 079 restates it, and Decision 080 adds that such a rule contributes no candidate and overrides nothing. No version is selected in this state, so nothing is said here about a selected version.

At the selected-version level, where Decision 079 selects a version for the evaluation date:

- a selected `TERMINATING` version contributes no `ResolvedGlobalObligation`. Decision 085 fixes that post-selection meaning;
- a selected `CONFIGURED` version contributes its configuration, per Decision 085, and may fail to contribute under the income-source applicability semantics Decision 088 established.

Decision 085's distinction is preserved and nothing here merges it: a rule with no effective version and a rule whose effective version terminates it both contribute nothing, they are not the same state, and only the second records an authored, dated act.

## What Decision 088 supports on applicability, and no more

Decision 088 establishes exactly three applicability semantics for a `GLOBAL_OBLIGATION` rule version, of which exactly one is active: universal applicability; only explicitly listed sources; and every source except explicitly listed sources. Applicability is conceptually required and non-nullable, and missing data never means universal applicability.

Decision 088 records that the question decides whether an obligation produces a resolved obligation or a skip, and that it is answered during resolution over an income-source identity supplied to the evaluation context under PFOS-ENG-01 §25. Under only explicitly listed sources, a source outside the set maps to `RULE_SKIP_INCOME_SOURCE_EXCLUDED`; under every source except explicitly listed sources, a source inside the set maps to the same code; universal applicability produces no non-applicable result from source scope. The ground is Decision 080's existing holding that an explicit eligibility or exclusion determination removes an additive obligation as a skip rather than as an override.

This decision states no stronger zero-case. Decision 088 expressly settles nothing about any population its applicability question might later range over, leaving Decision 016's cross-source aggregation to a later decision and eligible-income computation to Blocker F. Accepted authority therefore does not establish the exact condition under which applicability yields zero resolved obligations for a whole resolution, and this decision does not supply one.

"At most one" is the correct formulation precisely because these non-contributing outcomes exist. "Exactly one" would contradict Decisions 078, 079, 080, 085 and 088.

No skip emission is authorised. Whether a skip record is emitted depends on resolver population and explanation emission, which Decisions 080, 085 and 086 defer and which remain deferred. Decision 088's applicability semantics are otherwise untouched.

## Multiplicity

Multiplicity in `ResolvedRuleSet.globalObligations` comes from several coexisting `GLOBAL_OBLIGATION` Rules, never from one `RuleVersion` producing several obligations. Decision 082 exempts the kind from the authored-scope uniqueness that binds the seven replacing kinds, Decision 080 makes separately authored obligations accumulate with each taking effect and none displacing another, Decision 089 makes them symmetrically independent, and Decision 088 lets each carry its own applicability semantic with no shared global source filter.

Under this decision, several resolved obligations means several Rules.

`ruleId` and `ruleVersionId` acquire no financial meaning from this decision. Neither may become a financial ordering, an execution order, a funding priority, or a financial tie-break input. Decision 089 settles that applicable global obligations are independent, that none is financially prior to another, and that no obligation acquires priority from authoring time, array position, `RuleId`, `RuleVersionId`, any other `EntityId`, a timestamp, a version number, repository order, storage order, iteration order, rate magnitude, or from being tithing. That holding is unchanged, and this decision adds no identifier-derived financial ordering to any family.

This is a prohibition on financial use and on nothing else. A later decision may separately consider either opaque identifier as a reproducibility-only canonical serialization key for `globalObligations`, as the canonical-ordering section below records. Such canonical use must never become execution priority.

Decision 089 is otherwise preserved in full, including that the overcommitted resolution state is financially invalid and must be surfaced for correction rather than resolved by sequential priority funding, by partial funding, by proportional reduction, or by any identifier, timestamp, array-position or repository-order tie-break.

One consequence is recorded rather than established. Decision 080's two additive explanation producers become well-defined by counting Rules — `RULE_EXPLAIN_RULE_APPLIED` for a single surviving obligation, `RULE_EXPLAIN_RULE_APPLIED_ADDITIVELY` for each where two or more survive. This decision registers no code, redefines none, and authorises no emission.

## Traceability

Constitution Principle 12 requires a user to be able to determine what changed, when, why, which rule or plan version was used, and whether the change was manual, imported, calculated, corrected or simulated. It names no third concept beside rule and plan version, so it does not require a separate obligation identity — an independent ground for the rejection above.

Principle 12 does not prescribe this pair. It states a product-level requirement and specifies no field names and no granularity. This decision supplies the family-specific resolved provenance contract for `GLOBAL_OBLIGATION`, as its own act.

What follows is only the satisfaction claim: a resolved obligation carrying both identities satisfies the traceability model without any further contract, whereas a version-only entry would answer "which rule" only through a `Rule`-to-`RuleVersion` pairing that Decision 086 records does not exist and did not authorise. That dependency is removed for this family and for no other. No pairing contract is created.

## sourceRuleVersionIds is a different field

`ResolvedRuleSet.sourceRuleVersionIds` is root-level, spans every rule family, and is de-duplicated and sorted as reproducibility-only provenance for the whole resolved set. Decision 090 already records that it is a different field from `ResolvedGlobalObligation.ruleVersionId` and keeps its own de-duplicated and sorted ordering.

It cannot key an entry, cannot count obligations, cannot say which version produced a given obligation, and holds no rule identities at all. It does not replace per-entry `ruleId` or `ruleVersionId`, and neither replaces it.

`sourceRuleVersionIds` is unchanged, keeps its membership, de-duplication and sort, and keeps its place in Decision 074's reproducibility-only ordering list. Its treatment for a stop remains deferred where Decision 086 left it.

## Contract shape

`ResolvedGlobalObligation` will carry six members once this decision and Decision 090 are both implemented: `ruleId`, `ruleVersionId`, `destinationBucketId`, `rateBasisPoints`, `incomeBasis` and optional `maximumAmount`. Decision 090's recorded count is unchanged; one name changes.

The rename of `obligationId` to `ruleId` is the sole incompatible change this decision introduces. Declaring the two identity fields as `RuleId` and `RuleVersionId` is not incompatible: both are semantic aliases of `EntityId` under Decision 078, on the terms Decision 074 fixed for `PlanVersionId`, so that change is to documentation and construction discipline rather than to what the contract serialises.

Decision 074 is superseded in one further respect: `ResolvedGlobalObligation` carries `ruleId` in place of `obligationId`. Decision 090 already superseded it for the removal of `sequence`, and Decision 089 for the classification of the global-obligation ordering. Decision 074's Status remains Accepted, it is not superseded as a whole, and its schema-version rule is neither amended, narrowed nor excepted. Everything Decision 090 listed as preserved remains preserved: `stageSequence`; top-priority rank ordering; `ResolvedFundingRule.sequence`; `ResolvedPoolFixedAmount.sequence` and the fixed-amount competition semantics; the Allocation Engine-owned residual-cent ordering; the existing reproducibility-only ordering entries; every other member and field of `ResolvedRuleSet`; `sourceRuleVersionIds`; and the schema-version rule. A later editorial cross-reference in Decision 074 is recommended and is not part of this decision.

Decision 086's `obligationId` blocker is discharged, in the way Decision 088 discharged its income-source applicability blocker. All other Decision 086 blockers, tensions and gaps remain open.

## Schema-version consequence

Two incompatible `ResolvedRuleSet` contract changes now stand outstanding against `ResolvedGlobalObligation`: Decision 090's removal of `sequence`, and this decision's rename of `obligationId` to `ruleId`.

They should be handled together by one later schema-version transition, covering the combined six-member shape above rather than creating separate transitions for each.

Decision 090 deferred the numeric decision until the contract was stable enough to version, and named the unresolved `obligationId` as the reason it was not. Resolving it did change the contract, as Decision 090 anticipated.

The narrow conclusion this supports: the `ResolvedGlobalObligation` identity and ordering-field shape on which Decision 090 deferred the schema-version question is now settled sufficiently to take up the schema-version decision. Both outstanding changes against that shape are known, and no further question about that shape remains open.

This is not a claim that the resolved `GLOBAL_OBLIGATION` contract is permanently stable in every respect. The `GLOBAL_OBLIGATION` `RuleConfiguration` payload arm remains undefined and unauthorised since Decision 086, and the decision that supplies it may reveal a further contract question if accepted authority requires one. No such change is expected, none is pre-authorised, and nothing here may be read as licensing one.

No numeric `schemaVersion` is selected, incremented or changed, either in the Decision Log or in source. No migration mechanics are defined. Decision 090's second ground also still holds independently: no accepted source establishes the current decision-level numeric value, so there is no decided baseline to move from, and fixing one is a commitment about a persisted value rather than about the contract's shape.

That the repository has no persistence layer, no stored Plan Snapshot and no migration machinery bears only on how simple the eventual transition will be. It is not a reason the rule does not apply. No pre-persistence exception is created, on Decision 090's ground that creating an exception to an accepted rule inside a decision about something else is the silent resolution Decision 068 forbids.

## Canonical ordering

`ResolvedRuleSet.globalObligations` still requires reproducibility-only canonical ordering for deterministic deep equality. Decision 074 requires that identical inputs produce a deep-equal `ResolvedRuleSet`, and PFOS-ENG-01 §26 requires all ordering to be explicit and stable.

No canonical key is adopted by this decision. Decision 090 assigned that to a later decision, and held that entry into Decision 074's reproducibility-only ordering list belongs with the decision that supplies the key.

Decision 090 rejected `ruleVersionId` for one stated reason: its totality depended on the projection cardinality, which was unresolved. That condition is satisfied here. `ruleVersionId` is now total, since distinct Rules select distinct versions under Decision 079 and one selected version yields at most one obligation under this decision. `ruleId` is likewise total for surviving obligations, since one Rule contributes at most one resolved obligation in one resolution — the second candidate Decision 089's Future Review Trigger anticipated.

Both are therefore available to the later canonicalization decision as reproducibility-only serialization keys. This decision chooses between them and adopts neither. The later decision should note that they order differently across snapshots: `ruleId` gives an order stable across versions of the same rules, `ruleVersionId` does not.

`destinationBucketId` remains not total, because nothing forbids two global obligations targeting the same destination bucket. `ruleId` is now present on `ResolvedGlobalObligation` as a provenance field decided on its own merits, and it must not be read as having been added in order to serve as a sort key.

Decision 090's three forward constraints stand unchanged and bind whichever key is eventually chosen: the array index will carry no financial meaning; the canonical ordering must never become execution priority, since Decision 089 settled that applicable global obligations are independent with none financially prior to another; and repository, storage and iteration order cannot decide emission semantics, as PFOS-ENG-00 §32 Invariant 11 and PFOS-ENG-01 §26 require. Decision 089's further caution also stands: an identifier adopted for deterministic serialization must not thereby acquire financial meaning.

The canonicalization gap Decision 089 recorded and Decision 090 left open remains open.

## GLOBAL_OBLIGATION does not become materializable

This decision closes the previously recorded field-level provenance and value-source blockers for `sequence` and for `obligationId`. Decision 080 recorded that `sequence` had no accepted value source; Decision 090 disposed of the member. Decision 086 recorded `obligationId`'s provenance as unattributed; this decision attributes it.

That is the extent of the closure. It is not a claim that no defect remains on the shape. The consistency of `ruleId` with `ruleVersionId` is unenforceable until an accepted contract pairing a `Rule` with its versions exists. That missing pairing contract is not a Decision 086 configuration blocker and is not recorded as one: Decision 086's configuration blockers concern what a `RuleConfiguration` arm cannot yet represent, whereas this is an unenforceable invariant, and it joins the two that Decisions 085 and 086 already recorded as awaiting the same missing contract.

Remaining blockers include at least the `GLOBAL_OBLIGATION` `RuleConfiguration` payload arm, the canonical ordering of `globalObligations`, resolver population, evaluation-context population, the questions Blocker C still touches, Blocker F for eligible-income computation, and the deferred schema-version transition that gates every incompatible source change.

The slot is not enabled, and nothing here may be read as enabling it.

## No implementation is authorised

No source change is authorised: not the `obligationId` to `ruleId` rename, not Decision 090's `sequence` removal, not the adoption of the `RuleId` and `RuleVersionId` aliases on this shape, and not any change to the tests that reference them. That work follows the schema-version and migration decision.

No `schemaVersion` edit, no migration and no persistence work is authorised. No arm of `RuleConfiguration` is defined or authorised. No canonical key is adopted. No validator is authorised, no validator API is defined, no error code is registered or named, and no registry changes. No skip, warning or explanation emission is authorised. No Milestone 3 behaviour is established.

## Deliberately not decided

The canonical ordering key for `globalObligations`, and the choice between `ruleId` and `ruleVersionId`.

The numeric `schemaVersion` transition, its value, migration mechanics, and the implementation boundary.

The `GLOBAL_OBLIGATION` payload and any arm of `RuleConfiguration`.

A contract pairing a `Rule` with its versions, and the three invariants now awaiting it.

Eligible-income computation, aggregation and double-count prevention; Decision 016's cross-source aggregation; and the population any applicability question may later range over.

`ResolvedRuleSet.resolvedRuleSetId` and its relationship to deterministic deep equality.

Decision 081's provenance gap for `ResolvedRolloverPolicy`, `ResolvedGoalPolicy` and `ResolvedFundingRule`.

Where and when Decision 089's overcommitment condition is detected, and any validator or error code.

Resolver population, evaluation-context population, Blocker C and Blocker F.

The canonical ordering of any other collection, and the sequence fields of required funding and of fixed-amount pool destinations.

## Unchanged by this decision

No engineering specification text is superseded, amended or replaced. PFOS-ENG-01 and PFOS-ENG-02 are not altered.

Decision 074 is superseded only for the contract shape recorded above and retains its Accepted status, including its schema-version rule. Decisions 016, 071, 078, 079, 080, 081, 082, 085, 086, 087, 088, 089 and 090 are unamended. Decision 090's holdings are preserved in full, including the removal of `sequence` and its three forward constraints. Decision 089 is preserved in full. Decision 088's applicability semantics are untouched. Decision 085's two-states distinction is preserved.

`ResolvedRuleSet`'s field list is otherwise unchanged, `sourceRuleVersionIds` is unchanged, Plan Snapshot design is unchanged, and no numeric `schemaVersion` is changed.

`RuleConfiguration`, `RuleVersion`, `ConfiguredRuleVersion` and `RuleVersionKind` remain as Decision 086 left them, and `TerminatingRuleVersion` remains the only concrete rule-version arm in source. `RuleOwner` and `ResolvedSlotKind` are unchanged.

## Why

Decision 090 left two questions open and recorded them as entangled: what `obligationId` identifies, and how many obligations one selected version contributes.

The second resolves from accepted authority. Six independent sources point to one obligation per selected version, none points the other way, and the only construction that would make several coherent is an entity the corpus does not contain.

The first did not resolve from accepted authority, and this decision does not pretend otherwise. Decision 086 recorded that no source attributes the field, and Decisions 088, 089 and 090 each preserved that record. What the corpus does settle is what the alternatives cost: a version-only contract cannot say that two snapshots' obligations are the same commitment, an obligation entity invents a domain, and a minted identity breaks determinism. The remaining choice is a product commitment, and it is made here rather than left to whichever implementation defines the field first.

Renaming rather than documenting keeps one vocabulary. The corpus already spells this concept `ruleId` in four places, and a fifth spelling would be the drift Decisions 078 and 081 each refused.

Taking both questions in one decision is what settles the identity and ordering-field shape on which Decision 090 deferred the schema-version transition, so that transition can now be taken up over a known shape rather than an intermediate one.

## Alternatives Considered

Removing `obligationId` as redundant was considered and rejected. It is not derivable from `ruleVersionId` by any consumer of a `ResolvedRuleSet`, since Decision 086 records that no contract pairs a `Rule` with its versions, and this family has no natural key to fall back on.

Defining `obligationId` as the selected `RuleVersionId` was rejected: it would duplicate the sibling field exactly, which is the two-fields-that-can-disagree objection Decisions 081, 083, 085 and 090 each sustained.

A separate obligation entity was rejected for the reasons recorded above.

A per-resolution minted identity was rejected for the reasons recorded above.

Retaining the name `obligationId` while fixing its semantic was rejected: it preserves a persisted field whose name contradicts its meaning.

Settling the cardinality while deferring the provenance was considered and rejected. It would leave the identity shape unsettled, defer the schema-version transition a further cycle, and leave a field Decision 086 recorded as unattributed sitting in a persisted contract for no gain.

Stating a per-income-source projection, under which one selected version yields one resolved obligation per applicable source, was considered and rejected. No accepted source establishes it, `ResolvedGlobalObligation` carries no income-source member and Decision 088 records that none is required, and adopting it would decide aggregation questions that belong to Decision 016's cross-source specification and to Blocker F.

Prohibiting `ruleId` and `ruleVersionId` from any ordering use whatever was considered and rejected as too broad. The prohibition accepted authority supports is against financial ordering, execution order, funding priority and financial tie-breaks. Decision 074 already orders six reproducibility-only collections by an identifier, so foreclosing mechanical canonical use here would pre-empt the canonicalization decision in the opposite direction.

Adopting a canonical key here was rejected. Two total candidates now exist, and choosing between them is the later decision's work.

Versioning Decision 090's change separately was rejected: it would record an intermediate shape no stored data ever held.

## Tradeoffs

`ResolvedGlobalObligation` carries two identity fields that can disagree, with no contract able to check them. That cost is accepted deliberately, on Decision 086's reasoning, and it joins two existing invariants awaiting the same missing contract.

Two incompatible contract changes now sit undone, so the source contract will differ from the decided contract until the schema-version transition. Nothing can be built on either field in the meantime, and both are recorded rather than left to be discovered.

The projection cardinality is settled on converging evidence rather than on a single dispositive source. The evidence is unanimous and no accepted source contradicts it, but this decision performs the conversion and says so.

The exact condition under which applicability yields zero resolved obligations for a resolution is left where accepted authority leaves it, so the zero case is stated at the level Decision 088 supports and no further.

`GLOBAL_OBLIGATION` remains unmaterializable. This decision closes two recorded field-level blockers without enabling the slot.

## Consequences

`ResolvedGlobalObligation`'s decided shape is `ruleId`, `ruleVersionId`, `destinationBucketId`, `rateBasisPoints`, `incomeBasis` and optional `maximumAmount`.

Decision 086's `obligationId` blocker is discharged. The projection cardinality is settled, per selected version and not per income source.

A second incompatible contract change joins Decision 090's, and both should be covered by one later schema-version transition over the combined decided shape.

`ruleVersionId` and `ruleId` are both total reproducibility-only canonical-key candidates, and no key is adopted.

`GLOBAL_OBLIGATION` remains unmaterializable, and the blockers listed above continue to gate it. Blocker C and Blocker F remain open.

No source, test, registry, schema or configuration change is authorised. Milestone 2 gains no new implementable contract.

## Future Review Trigger

Reconsider when the canonical ordering key is adopted, since `globalObligations` would then join Decision 074's reproducibility-only list and one of the two total candidates is chosen; when the numeric schema-version decision is taken, since both outstanding source changes are gated on it; when a contract pairing a `Rule` with its versions exists, since the `ruleId`-to-`ruleVersionId` consistency invariant becomes enforceable alongside those of Decisions 085 and 086; when the `GLOBAL_OBLIGATION` payload decision supplies the arm, since it may reveal a further contract question; when Blocker F or Decision 016's cross-source aggregation is taken up, since the applicability question then composes with an eligible-income question and the population it ranges over is settled there; if a later accepted decision establishes a resolution emitting a separate resolved obligation per income source, since that would contradict this decision's cardinality and require replacing it; if a persistence layer or a stored Plan Snapshot is introduced before the transition, since the migration would then have data to act on; or if a future accepted source establishes an authored obligation entity, since the projection cardinality rests on its absence.

---

# Decision 092: The ResolvedRuleSet Schema-Version Transition for Decisions 090 and 091

**Status:** Accepted
**Related:** Decisions 023, 056, 068, 071, 074, 078, 086, 089, 090, 091
**Scope:** Architecture, Engineering, Data

## Decision

The current `ResolvedRuleSet.schemaVersion` is ratified as `1`, naming the seven-member `ResolvedGlobalObligation` shape currently shipped in source.

The combined shape decided by Decisions 090 and 091 is `schemaVersion` `2`.

The two incompatible changes — Decision 090's removal of `ResolvedGlobalObligation.sequence` and Decision 091's rename of `obligationId` to `ruleId` — are carried by one transition from `1` to `2`. No numeric value other than `1` and `2` is selected, reserved or implied.

This decision applies Decision 074's versioning rule. It adopts no canonical ordering key, defines no `GLOBAL_OBLIGATION` payload, authorises no persistence or migration work, and does not make `GLOBAL_OBLIGATION` materializable.

## What schemaVersion versions

`ResolvedRuleSet.schemaVersion` is the schema version of the persisted `ResolvedRuleSet` contract.

Decision 074 places that version field on `ResolvedRuleSet` and records that the resolved set is persisted inside a Plan Snapshot, so the shape is a contract whose incompatible change requires an increment.

PFOS-ENG-00 §40 lists an application version, a database schema version, a backup format version and a domain snapshot schema version, and records that these versions serve different purposes and must not be conflated. That section proves that PFOS carries multiple version classes which must be kept apart.

Applying that separation:

- `ResolvedRuleSet.schemaVersion` is not the IndexedDB or database schema version governed by PFOS-ENG-00 §26 and Decision 056.
- It is not the backup format version governed by PFOS-ENG-00 §27.
- It is not the application version.

PFOS-ENG-01 §41 lists a conceptual `schemaVersion` on `PlanSnapshot`, and PFOS-ENG-02 §69 lists one on `Allocation`. Neither exists in source, and no accepted source establishes whether `ResolvedRuleSet.schemaVersion` is identical to, subordinate to, coordinated with, or independent from either of them.

This decision does not determine that relationship. It decides the version of the persisted `ResolvedRuleSet` contract and nothing else, and it assigns no semantics to `PlanSnapshot.schemaVersion` or to `Allocation.schemaVersion`.

## PFOS-ENG-00 §26 is not authority for this baseline

PFOS-ENG-00 §26 states that V1 may begin at schema version 1. That section is titled IndexedDB Schema Versioning and its rules are database migration rules, so it governs the database schema version under Decision 056.

It is not authority for the value of `ResolvedRuleSet.schemaVersion`. Borrowing its number would be the conflation PFOS-ENG-00 §40 forbids.

## The baseline is ratified as 1

No accepted decision previously fixed the numeric baseline. Decisions 090 and 091 each record that absence.

The repository's only numeric evidence is the fixture in `resolved-rule-set.test.ts`, which uses `1` for the seven-member shape.

Decision 074 requires an increment for an incompatible change. Preserving `1` for the shipped shape and assigning `2` to the new shape avoids making one numeric value denote two different shapes.

This decision is the appropriate place to ratify a previously implicit baseline, because schema versioning is its direct subject. Decision 090's objection — that fixing a value is a commitment about a persisted value rather than about a contract's shape — was a reason not to fix one inside a decision about a field's disposition, and does not apply here.

This is not a pre-persistence exception. It applies Decision 074. Decision 090's refusal to treat the absence of a persistence layer as an exception to the versioning rule stands, and nothing here creates one.

## Version mapping

```text
schemaVersion 1

ResolvedGlobalObligation {
  obligationId
  ruleVersionId
  destinationBucketId
  rateBasisPoints
  incomeBasis
  maximumAmount?
  sequence
}
```

```text
schemaVersion 2

ResolvedGlobalObligation {
  ruleId
  ruleVersionId
  destinationBucketId
  rateBasisPoints
  incomeBasis
  maximumAmount?
}
```

Under `schemaVersion` 2, `ruleId` is typed `RuleId` and `ruleVersionId` is typed `RuleVersionId`. Decision 091 records that adopting those aliases is not itself an incompatible change, both being semantic aliases of `EntityId` under Decision 078 on the terms Decision 074 fixed for `PlanVersionId`.

`schemaVersion` versions the persisted `ResolvedRuleSet` contract as a whole, not merely this nested interface. The nested `ResolvedGlobalObligation` change is the only contract difference in this transition; every other `ResolvedRuleSet` member is unchanged between the two versions.

## One transition, not two

Decision 074's rule exists so that a stored resolved set's shape is identifiable.

The intermediate shape — `sequence` removed while `obligationId` is retained — was never persisted and was never shipped, because neither Decision 090 nor Decision 091 authorised any source change and no persistence layer exists. Assigning it a version would name a shape no datum ever held.

Decision 090 anticipated this in recording that versioning an intermediate shape would document a transition no stored data ever held. Decision 091 concluded that both changes should be handled together by one transition over the combined decided shape.

## What this decision does about migration

Decision 074 requires the incompatible contract change to receive a schema-version increment. This decision satisfies that requirement by moving the decided `ResolvedRuleSet` contract from `schemaVersion` 1 to `schemaVersion` 2.

No persisted `schemaVersion`-1 `ResolvedRuleSet` or Plan Snapshot data exists in the repository or in any implemented persistence layer. `src/infrastructure` contains no implementation, no `PlanSnapshot` type exists in source, no repository or IndexedDB code exists, no migration machinery exists, and `ResolvedRuleSet` is constructed only in one test file.

This decision therefore requires no data transformation and no migration implementation for existing data, because there is no existing persisted data to transform.

This is not an exception to Decision 074's versioning rule.

Future read-migration, dual-version support, rejection behaviour and migration-engine design remain undefined and are not decided here.

No general rule is established that every schema-version transition necessarily requires a data migration, and no general data-migration requirement is attributed to Decision 074. Decision 074 requires an increment; what else a transition may require is not settled by Decision 074 and is not settled here.

PFOS-ENG-00 §26's migration rules are neither invoked nor extended here. They govern the database schema version, and §40 keeps that version class separate from this one. Nothing in this decision limits §26 within its own domain.

## What Decision 074 requires of history

Decision 074 requires that existing Plan Snapshots continue to reproduce the rules under which they were created. That is a reproduction-of-rules requirement. Constitution Principle 11, PFOS-ENG-01 §19.1 and PFOS-ENG-00 §32 Invariant 10 point the same way.

Whether a stored snapshot would retain old field names or be migrated on read is unspecified by every accepted source. No such snapshot exists, and this decision invents no guarantee about one.

## Forward and backward compatibility are undefined

No accepted source specifies how a reader of one version should behave when presented with another, in either direction.

PFOS-ENG-00 §29.2 and PFOS-ENG-01 §47.9 require unknown rule variants to be rejected, which is a payload concern rather than a schema-version concern. PFOS-ENG-00 §27's restore flow validates the backup format version, a different class under §40. Neither governs this question.

Both directions are recorded as undefined and deferred. Importing an older contract, read-migration and dual-version support are likewise undecided. No validator, no error code and no unsupported-schema behaviour is authorised or implied, and no compatibility mechanism is created or authorised.

## Why the current changes are settled enough to version

The incompatible changes before this decision are sufficiently settled to version:

- `sequence` is removed by Decision 090;
- `obligationId` is renamed `ruleId` by Decision 091;
- the resulting six-member `ResolvedGlobalObligation` shape is decided.

No remaining open question currently prevents assigning the combined decided shape `schemaVersion` 2.

This decision does not define an exhaustive taxonomy of which future semantic, serialization, ordering or structural changes require another schema-version increment. Decision 074 continues to govern future incompatible persisted-contract changes.

## The canonical key does not block this transition

This decision does not need the canonical ordering key in order to identify the two contract shapes being versioned here. The difference between the two versions is fully specified by the removal of `sequence` and the rename of `obligationId` to `ruleId`.

Decision 091 already made `ruleId` and `ruleVersionId` total candidates for the later canonicalization decision.

No canonical key is adopted by this decision.

Whether a later change to persisted canonical ordering itself requires another schema-version increment is not decided here, and remains governed by Decision 074's incompatible-contract-change rule.

## The GLOBAL_OBLIGATION payload does not block this transition

`RuleConfiguration` is authored-side and is not itself part of `ResolvedRuleSet`. Decision 086 records that an authored rule version is not part of `ResolvedRuleSet`, that a Plan Snapshot holds rule versions by reference, and that introducing an authored envelope therefore changes no persisted resolved contract.

No currently accepted payload decision requires another change to the six `ResolvedGlobalObligation` fields.

The payload blocker therefore does not prevent taking the current schema transition.

Decision 091's caveat is preserved: a later accepted payload decision may reveal a separate incompatible `ResolvedRuleSet` change, in which case Decision 074 governs that future change.

## The first Plan Snapshot persisted after this transition

No persisted `schemaVersion`-1 `ResolvedRuleSet` data exists today.

Once the implementation authorised below becomes the current PFOS producer of resolved rule sets, a Plan Snapshot produced and persisted by that implementation should embed a `ResolvedRuleSet` carrying `schemaVersion` 2.

The first Plan Snapshot produced and persisted by the current PFOS implementation after that transition should therefore carry a `schemaVersion` 2 `ResolvedRuleSet`.

This decision makes no claim that `schemaVersion`-1 data can never exist under some future accepted compatibility, import or history mechanism. Forward compatibility, backward compatibility, importing an older contract, read-migration and dual-version support all remain undecided, and no such mechanism is created or authorised here.

This says nothing about `PlanSnapshot.schemaVersion`, whose relationship to this version is undetermined as recorded above.

## Decision 074 is applied, not changed

This decision applies Decision 074. It does not supersede Decision 074, does not amend it, does not narrow it and does not except it. Decision 074's Status remains Accepted and its schema-version rule stands exactly as Decisions 089, 090 and 091 each preserved it.

Decisions 090 and 091 remain the decisions that changed the contract shape. This decision assigns schema versions to those already-decided shapes and changes no member itself.

Decision 074 states its rule twice, conditionally in its Consequences and unconditionally in its closing line. Decision 090 settled the unconditional reading, and this decision applies the settled reading without reopening it. A later editorial cross-reference in Decision 074 is recommended and is not part of this decision.

## Authorised implementation

A later bounded implementation unit is authorised to:

- remove `ResolvedGlobalObligation.sequence`;
- rename `obligationId` to `ruleId`;
- type `ruleId` as `RuleId`;
- type `ruleVersionId` as `RuleVersionId`;
- correct the stale `sequence` documentation;
- establish a named `ResolvedRuleSet` schema-version constant with the value `2`;
- update `ResolvedRuleSet` fixtures and tests from 1 to 2;
- update `ResolvedGlobalObligation` fixtures and tests;
- add compile-time protection that `sequence` is absent;
- add compile-time protection that `obligationId` is absent;
- retarget any `@ts-expect-error` currently using `sequence` solely for immutability testing.

Nothing else. In particular this decision authorises no persistence system, no migration engine, no old-version reader, no new-version compatibility layer, no backward-reader behaviour, no forward-reader behaviour, no import compatibility, no unsupported-schema validator, no error code, no canonical ordering key, no `GLOBAL_OBLIGATION` `RuleConfiguration`, no resolver population, no evaluation-context population, no Blocker C work, no Blocker F work, and no Milestone 3 behaviour.

## What this decision closes

Decision 090's deferred numeric schema-version decision.

Decision 091's combined schema-version transition.

The version gate preventing implementation of the `sequence` removal.

The version gate preventing implementation of the `obligationId` to `ruleId` rename.

## What this decision does not close

The canonical ordering key. The `GLOBAL_OBLIGATION` `RuleConfiguration` payload. The contract pairing a `Rule` with its versions. Resolver population. Evaluation-context population. Blocker C. Blocker F. The `resolvedRuleSetId` question. Forward compatibility. Backward compatibility. Migration architecture.

`GLOBAL_OBLIGATION` remains unmaterializable. A shape can be versioned without the slot becoming resolvable.

## Unchanged by this decision

No engineering specification text is superseded, amended or replaced. PFOS-ENG-00, PFOS-ENG-01 and PFOS-ENG-02 are not altered.

Decisions 023, 056, 068, 071, 074, 078, 086, 089, 090 and 091 are unamended. Every other member and field of `ResolvedRuleSet` is unchanged, `sourceRuleVersionIds` is unchanged, and Plan Snapshot design is unchanged.

`RuleConfiguration`, `RuleVersion`, `ConfiguredRuleVersion` and `RuleVersionKind` remain as Decision 086 left them, and `TerminatingRuleVersion` remains the only concrete rule-version arm in source.

## Why

Decisions 090 and 091 each decided a contract change and each deferred its version — Decision 090 because no baseline existed and the shape was not yet settled, Decision 091 because it settled the shape and left the number.

Both reasons are now discharged. The shape is decided, and the baseline can be ratified in the one decision whose subject it is.

Taking the two changes as one transition follows from what a version is for. A version number identifies the shape a stored resolved set holds, and the intermediate shape was never held by anything.

## Alternatives Considered

Assigning the new shape `schemaVersion` 1, on the ground that nothing has ever been persisted and numbering could begin at the first storable shape, was considered and rejected. It would make one numeric value denote two different shapes across the repository's own history, which defeats the identification Decision 074's rule exists to provide, and it is a renumbering rather than the increment Decision 074 requires.

Two separate transitions, one for each decision, was rejected: the intermediate shape was never persisted and never shipped.

Selecting a non-numeric versioning scheme was rejected: Decision 074 types the member `number`, and the shipped contract tests enforce it.

Treating PFOS-ENG-00 §26's database schema version 1 as the baseline was rejected under §40, which requires the version classes not to be conflated.

Determining the relationship between `ResolvedRuleSet.schemaVersion` and the conceptual `PlanSnapshot.schemaVersion` was considered and rejected. No accepted source establishes it, nothing in this transition requires it, and settling it here would decide a question outside this decision's subject.

Deferring the transition until the canonical key or the `GLOBAL_OBLIGATION` payload is settled was rejected: neither is needed to identify the two shapes being versioned, and Decision 074 governs any future incompatible change on its own terms.

Splitting the baseline ratification into a separate prior decision was rejected: it would answer one uncontested question with no intervening dependency.

## Tradeoffs

`schemaVersion` 1 names a source contract shape that was shipped but was never persisted by the repository as it exists today.

Forward and backward compatibility remain undefined, so the first reader implementation will arrive without an accepted rule for encountering an unexpected version. That is recorded rather than resolved, because no accepted source supplies one and no reader exists.

The relationship between this version and the conceptual `PlanSnapshot.schemaVersion` is left open, so a future persistence design must settle it rather than inherit it.

The implementation authorised here changes a contract that nothing yet consumes, so the change is verifiable only by contract tests until a resolver exists.

## Consequences

`ResolvedRuleSet.schemaVersion` has a ratified baseline of 1 and a decided new value of 2.

The implementation gate on Decision 090's `sequence` removal and Decision 091's `obligationId` to `ruleId` rename is lifted, within the bounded authorisation above.

A Plan Snapshot produced and persisted by the current PFOS implementation after that transition should carry a `schemaVersion` 2 `ResolvedRuleSet`.

`GLOBAL_OBLIGATION` remains unmaterializable, and Blocker C and Blocker F remain open.

## Future Review Trigger

Reconsider when a persistence layer or a stored Plan Snapshot is introduced, since forward compatibility, backward compatibility and migration architecture become live then, and the relationship to `PlanSnapshot.schemaVersion` must be settled with them; when a canonical ordering key is adopted, since whether that change requires a further increment is governed by Decision 074 and is not decided here; when the `GLOBAL_OBLIGATION` payload decision supplies the arm, since it may reveal a separate incompatible `ResolvedRuleSet` change; if any other incompatible persisted-contract change is decided, since Decision 074 requires it to be versioned; or if an accepted source ever relates `PlanSnapshot.schemaVersion` or `Allocation.schemaVersion` to this version.

---

# Decision 093: Terminal Product Defaults and Default-Sourced Provenance

**Status:** Accepted
**Related:** Decisions 014, 020, 023, 025, 026, 027, 028, 068, 071, 074, 075, 078, 080, 081, 082, 083, 084, 085, 086, 088, 090, 091, 092
**Scope:** Financial logic, Architecture, Engineering, Data

## Decision

The product default for `ResolvedRuleSet.leftoverPolicy` is `LEAVE_UNALLOCATED`.

The product default for `ResolvedRuleSet.allocationBasis` is `NET_AMOUNT`.

`requiredFundingRules` receives no product default. Required funding is satisfied through authored configuration, and the direction is plan completeness rather than a default.

Whenever a resolved entry can legitimately be produced either by an authored `RuleVersion` or by a product default, its provenance is expressed through two explicit, mutually exclusive states rather than through an absent identifier. That is a general semantic rule of the Rule Engine.

Its persisted-contract consequence is applied here to `ResolvedRolloverPolicy` and to no other family, because rollover is the only family for which product-default sourcing is already established by an accepted source.

This decision settles semantics. It fixes no source property names, selects no numeric `schemaVersion`, defines no migration, authorises no implementation, and does not make any rule family materializable.

## Which fields have no empty representation

Two members of `ResolvedRuleSet` have no empty value and therefore cannot be satisfied at all when no authored rule addresses them:

- `leftoverPolicy`, a required discriminated union in which every arm is a policy;
- `allocationBasis`, a required enumeration with no empty member.

Decision 080 recorded that a resolution addressing neither slot has no established value and that the contract cannot then be satisfied. That structural totality problem is confined to these two members.

`requiredFundingRules`, `goalPolicies`, `rolloverPolicies` and `globalObligations` are readonly arrays. An empty array satisfies the contract in every case, so none of them is structurally unsatisfiable. Where their semantics are incomplete, the question is what a valid plan requires, which is a different question treated separately below. Nothing in this decision may be read as calling those collections unsatisfiable.

## The leftover policy default

The product default for `leftoverPolicy` is `LEAVE_UNALLOCATED`.

No previously accepted source designated it. Decision 080 recorded that PFOS-ENG-01 §16.2 lists `Leave unallocated` among the supported types without designating it the product default. That reading is correct and is not disturbed. This decision performs the designation.

Four grounds support it.

Decision 020 requires that a default exist. Its Consequences state that "a simple default and optional advanced policy editor are required," and its Future Review Trigger contemplates reconsidering the default policy during onboarding design. Decision 020 commits the product to having one while naming none.

Constitution Principle 2 requires sensible default behaviour so that users receive value quickly, and states that users "should not need to configure dozens of settings before completing their first paycheck allocation." A leftover policy that must be authored before a first allocation is possible sits against that requirement.

The accepted vocabulary narrows the field structurally. Of the five arms Decision 074 fixes, `SINGLE_DESTINATION` needs a destination bucket, `PERCENTAGE_SPLIT` needs an authored split, `MAINTAIN_BUFFER_THEN_REDIRECT` needs a buffer amount and a destination, and `HIGHEST_PRIORITY_UNFINISHED_GOAL` needs goal state that no default can supply. `LEAVE_UNALLOCATED` is the only arm inhabitable without authored data. This is a property of the accepted contract rather than a preference.

Constitution Principles 4 and 5 favour it among the arms. Every other arm commits the user's remainder to a destination the user did not choose, which is a financial decision made silently, while `LEAVE_UNALLOCATED` commits nothing and leaves the money visible for the user to direct.

The designation plugs into Decision 080's existing mechanism, under which the product default supplies the value where no rule at §6 levels 5 through 8 addresses the slot, applied only to a slot for which an accepted product default exists. Decision 080 is not amended; a slot it listed as lacking a default now has one.

No contract shape changes. `ResolvedLeftoverPolicy` already contains the arm and carries no provenance member.

## The allocation basis default

The product default for `allocationBasis` is `NET_AMOUNT`.

Decision 080's record is correct and is not disturbed. It stated that no accepted source names a default basis, and none designates one. This decision performs the designation as an explicit product commitment.

PFOS-ENG-02 §10 supplies the behavioural ground. It states that the Allocation Engine begins with an initial pool equal to the income event net amount, and that some workflows may instead use the eligible allocatable amount if the income event includes money excluded from planning. That is an ordinary case and a conditional exception. Decision 068 permits a more specific lower-authority document to refine an implementation detail left open above it, and the default basis is such a detail.

Both concepts remain available. PFOS-ENG-02 §6 supplies an income event carrying both a net amount and an eligible amount, so selecting a default basis removes neither from the Allocation Engine's reach, and an authored rule addressing this slot continues to override the default under Decision 080.

**What this does not decide.** Selecting `NET_AMOUNT` as the default allocation basis does not decide who computes eligible income, how eligible income is aggregated across income sources, how double counting is prevented, or Blocker F generally. Decision 074 records that Blocker F does not change the `ResolvedRuleSet` contract because the contract names the selected basis rather than carrying the computed amount, and that separation is preserved exactly. Nothing here may be read as closing, narrowing or advancing Blocker F.

No contract shape changes. `AllocationBasis` already contains the member, and the field carries no provenance.

## Required funding receives no product default

PFOS-ENG-01 §15 states that every allocatable bucket must use one supported funding rule.

No product default supplies one, and none can. Decision 082 records that every field in §15.1 through §15.8 is an irreducibly per-bucket value — target amount, due date, reserved balance, monthly minimum, deadline, minimum payment — so a higher-level default carrying one of them would be meaningless for its children. Decision 082 also records that §15's requirement can be satisfied only by authoring, and it routed the completeness question here.

Decision 093 establishes that required funding is satisfied through authored configuration rather than a product default. The exact plan-completeness predicate remains open until "allocatable bucket" is defined.

The term appears in §15 and in PFOS-ENG-02 §10's "eligible allocatable amount", and no accepted source defines which buckets it covers. Until it does, the set of buckets the requirement ranges over is unknown, so the behaviour is not specified fully enough to be checked. This decision does not define the term, names no error code, chooses no validation timing, and authorises no validator. Decision 073's convention holds.

An empty `requiredFundingRules` collection remains structurally valid, and a plan with no allocatable buckets is an ordinary case.

## Goal-policy population remains unresolved

No whole `ResolvedGoalPolicy` is synthesized for every bucket by this decision.

Decisions 025, 026 and 027 supply semantics and defaults for individual goal-policy behaviours. Decision 025 pauses automatic allocation when a goal reaches its target, Decision 026 creates the next cycle of a completed recurring goal with the same settings and defaults to asking the user to confirm the target, and Decision 027 asks before resuming funding when a funded bucket falls below target. Each speaks of a bucket that has a goal or a target.

None establishes which buckets receive a `ResolvedGoalPolicy` entry. Decision 080 recorded the same finding: those decisions and §15.5 supply defaults for individual fields, but no accepted source assembles them into a default for the whole four-field slot, and whether a bucket without a goal rule receives an entry at all is a population question it did not settle.

`goalPolicies` is structurally representable as an empty array, so nothing is unsatisfiable while the question stands. The population depends on bucket and goal state, which a future evaluation-context contract supplies and which no accepted source fixes.

The `goalPolicies` population therefore remains unresolved. This decision does not decide whether entries are synthesized from field-level product defaults, authored only, or populated some other way, and it does not treat any of those models as rejected. The duplication between `ResolvedGoalPolicy` and the `GOAL_UNTIL_TARGET` variant of `FundingRuleConfig`, recorded by Decision 086, is untouched and remains unresolved.

## The rollover provenance gap is already live

The defect this decision repairs exists today and does not arise from any default it creates.

Decision 028 states that all bucket balances carry forward by default, PFOS-ENG-01 §17.1 fixes that default as `CARRY_ALL`, and Decision 080 lists it among the three product defaults an accepted source already establishes.

Decision 081 records that under Decision 028 most buckets author no rollover rule, so their resolved entry would come from the product default and has no rule version to name. Decision 080 requires the product default to supply the resolved value where no rule at levels 5 through 8 addresses the slot, and Decision 074 forbids the Allocation Engine from re-resolving, so an unfilled slot could not be executed.

`ResolvedRolloverPolicy` carries a non-optional `ruleVersionId`, and no genuine `RuleVersion` exists for a value a product default supplied.

The accepted contract therefore cannot truthfully represent an already-accepted product default, for what Decision 081 describes as most buckets. That is a present defect in accepted authority, and it is why provenance is settled alongside the defaults rather than after them.

The other two established product defaults do not have this problem. The lower-priority even split reaches `ResolvedPoolDestination`, whose `ruleVersionIds` is plural, and the `SEQUENTIAL` top-priority strategy is valid with an empty entry list under Decision 075.

## The general provenance semantic

Whenever a resolved entry can legitimately be produced either by an authored `RuleVersion` or by a product default, its provenance is expressed through two mutually exclusive conceptual states.

**Authored provenance.** The entry's provenance kind identifies it as authored, and it carries the exact `RuleVersionId` of the rule version that produced the value.

**Product-default provenance.** The entry's provenance kind identifies it as product-default sourced, and it carries no `RuleVersionId`.

The invariants are these. Authored provenance carries exactly one genuine `RuleVersionId`. Product-default provenance carries none. The two states are mutually exclusive, and an entry carrying both or neither is unrepresentable rather than merely invalid. Absence alone is never overloaded to mean product-default provenance. No sentinel or fabricated `RuleVersionId` is permitted. No implicit `Rule` or `RuleVersion` is manufactured for a product default.

This is a general rule. It binds any resolved family that meets its antecedent, whether or not that family is known today. It settles semantics and does not fix property names, discriminant spelling or type structure; those belong with the contract and schema work described below.

**Why explicit rather than absent.** PFOS-ENG-01 §47.8 requires discriminated unions rather than loosely structured objects. More directly, the corpus has three times refused to let absence carry a meaning: Decision 085 refused an absent or nullable configuration as a way of expressing a stop, Decision 086 refused a nullable configuration for the same reason, and Decision 088 refused an absent applicability value meaning universal applicability. Each rests on PFOS-ENG-00 §29.1, under which imported content is untrusted and a truncated record is indistinguishable from an authored one. A missing `ruleVersionId` would be indistinguishable from a product-default entry on exactly those terms, and reading it as one would be a silent financial decision under Constitution Principle 4.

**Why a product default carries no rule identity.** Decision 081 establishes that a product default is not an authored `Rule`. PFOS-ENG-01 §8.1 calls it "a predefined fallback used only when the user has not made a choice"; §18 requires every permanent rule to carry a created timestamp, effective start, optional end, status and version identifier, none of which a product default has; Decision 078 places the effective period on a version, and a product default has no period; and §40's audit records a user's change between two versions, while a product default changes only when the application ships.

It follows that a product default has no `RuleId`, no `RuleVersionId`, no lifecycle status under Decision 083, and no authored scope under Decision 082. It is not addressed by `Rule.owner` and `Rule.slotKind`, and it is not subject to Decision 084's authored-scope uniqueness. This decision creates no `ProductDefaultId`, no `ProductDefaultVersionId`, no fabricated `RuleId` or `RuleVersionId`, no lifecycle status for product defaults, and no authored scope for them.

## Where the persisted consequence applies

The general semantic above is a rule about meaning. Its persisted-contract consequence is applied only where an accepted source already establishes that a family can be product-default sourced.

**`ResolvedRolloverPolicy` — in scope now.** Decision 028, §17.1 and Decision 080 already establish `CARRY_ALL` as its product default, and Decision 081 records that most buckets author no rollover rule. The antecedent of the general rule is satisfied today, and the existing required `ruleVersionId` cannot truthfully represent the resulting state. `ResolvedRolloverPolicy` therefore adopts the explicit provenance states.

**`ResolvedFundingRule` — not in scope.** This decision holds that required funding receives no product default and is satisfied by authored configuration, and Decision 082 shows that a meaningful higher-level default cannot exist for it. The antecedent is therefore unsatisfied: the family cannot legitimately be produced by a product default. Its required `ruleVersionId` is not shown defective by default-sourced provenance, and its persisted contract does not change on that ground. `ResolvedFundingRule` remains authored-sourced. If a future accepted decision ever introduces a funding product default, that decision must revisit provenance for this family. The open definition of "allocatable bucket" concerns the completeness predicate rather than provenance and creates no default-sourced entry.

**`ResolvedGoalPolicy` — deferred.** This decision leaves the `goalPolicies` population unresolved, so it is not established that a product-default-sourced `ResolvedGoalPolicy` exists at all. That depends on whether a later decision determines which buckets receive an entry, and whether any entry is synthesized from field-level product defaults without an authored `GOAL_POLICY` rule. Applying a shape change now would version a contract against a case that may never arise and would prejudge the population answer. The persisted-shape consequence is therefore deferred. If a later population decision creates default-sourced `ResolvedGoalPolicy` entries, that decision must apply the general provenance semantic above, and Decision 074 will govern any resulting incompatible persisted change. Its future shape is not prejudged here.

**Families that need nothing.** `ResolvedLeftoverPolicy` carries no provenance member; `allocationBasis` is a bare enumeration on the root; `ResolvedPoolDestination` and `ResolvedTopPriorityEntry` and their extensions carry plural `ruleVersionIds`; and `ResolvedGlobalObligation` is untouched, since Decision 080's enumeration of established product defaults contains no global obligation. Decisions 090, 091 and 092 are unaffected.

Whether an empty plural `ruleVersionIds` is the final canonical representation of a product-default contribution on the pool and top-priority families is not decided here. Existing authority requires no more than that those shapes can hold what produced them, and Decision 082 records that they will carry a single element in V1. If a canonical representation is wanted for them, it belongs to a separate decision.

## sourceRuleVersionIds is unchanged

`ResolvedRuleSet.sourceRuleVersionIds` contains genuine `RuleVersionId` values only. Decision 074 defines it as references identifying the versions that produced the resolved values, de-duplicated and sorted, and Decision 081 establishes that a product default is not a Rule and has no version.

A product-default contribution therefore adds no identifier to that collection. No sentinel, no product-default identifier and no other non-rule-version value may be inserted, and the field is not repurposed to carry product-default provenance.

A consequence is recorded rather than resolved: a resolved set whose values are wholly default-sourced carries an empty `sourceRuleVersionIds`. That is coherent, because no rule version produced any of them, and the entry-level provenance state is what distinguishes the case for the family that carries one.

`sourceRuleVersionIds` keeps its membership, de-duplication, sort and its place in Decision 074's reproducibility-only ordering list. Its treatment for a stop remains deferred where Decision 085 left it.

## Historical reproducibility

Decision 074 stores the complete `ResolvedRuleSet` by value inside a Plan Snapshot. The exact resolved policy value is therefore preserved, and a later product release that changes a default cannot alter a stored historical result. Constitution Principle 11 and PFOS-ENG-00 §32 Invariant 10 are satisfied without any further mechanism.

The explicit provenance state adds what the stored value alone cannot say: whether the value came from an authored rule version or from a product default. That is what makes such an entry explainable under Constitution Principle 9 and traceable under Principle 12, which asks which rule or plan version was used and names no third concept.

No accepted source currently requires a separate product-default identity or a product-default version identity, and none is created here. Whether a future audit requirement needs to identify the exact product release or default definition that supplied a product-default value is left open. It must not be solved with a fabricated default version identifier, and Decision 081's observation that a product default changes only when the application ships is recorded as the nearest existing concept rather than adopted as an answer.

This decision assigns no semantics to the conceptual `PlanSnapshot` schema version, whose relationship to `ResolvedRuleSet.schemaVersion` Decision 092 left undetermined.

## Schema consequence

This decision establishes one live incompatible persisted contract change: `ResolvedRolloverPolicy`, whose existing required `ruleVersionId` cannot represent the already-accepted `CARRY_ALL` product-default case.

Decision 074 therefore requires another `ResolvedRuleSet` schema-version increment from the current `schemaVersion` 2. The numeric target is deferred.

`ResolvedGoalPolicy` and `ResolvedFundingRule` do not change shape under this decision, and no transition batches several family changes together on the strength of it. Future goal-policy population work may create another incompatible change if it establishes default-sourced entries, and Decision 074 will govern it if so. Required funding has no product-default provenance change here.

This decision selects no numeric value, defines no migration behaviour, and authorises no compatibility reader in either direction. Those remain where Decision 092 left them: undefined and deferred.

Decision 074's schema-version rule is applied, not amended, narrowed or excepted. No pre-persistence exception is created, on the ground Decision 090 gave and Decisions 091 and 092 each preserved.

Nothing here should be read as establishing that source-level field typing alone exhaustively defines what makes a persisted contract change incompatible. Decision 074 governs that question on its own terms.

The two defaults designated by this decision cause no contract change and carry no schema consequence of their own.

## What this decision closes

The missing product default for `leftoverPolicy`.

The missing product default for `allocationBasis`.

The question whether required funding receives a product default: it does not.

The general semantic rule distinguishing authored provenance from product-default provenance, for any resolved family that can legitimately be produced either way.

The live `ResolvedRolloverPolicy` provenance defect, at the semantic level.

It does not close the complete required-funding plan-completeness behaviour, which awaits a definition of "allocatable bucket".

## What this decision does not close

Whether `ResolvedGoalPolicy` can be product-default sourced at all, and its persisted shape if it can.

The `goalPolicies` population.

`ResolvedFundingRule`'s provenance shape beyond retaining authored rule-version provenance under the no-default holding above.

The definition of "allocatable bucket". The full required-funding completeness behaviour. The `GOAL_POLICY` and `GOAL_UNTIL_TARGET` duplication. The `GLOBAL_OBLIGATION` `RuleConfiguration` payload and the authored provenance of its `maximumAmount`. The canonical ordering key for `globalObligations`. The `LOWER_PRIORITY_POOL` `FIXED_AMOUNTS` authored sequence. The `RuleConfiguration` union, `ConfiguredRuleVersion`, the full `RuleVersion` contract and its §41 metadata. The contract pairing a `Rule` with its versions. Evaluation-context API and population. Explanation multiplicity. Blocker F. The `resolvedRuleSetId` determinism question. The identifier-ordering documentation wording. Product-default identity and versioning. The canonical product-default representation on plural-`ruleVersionIds` families. The numeric `ResolvedRuleSet` schema-version target, migration architecture and compatibility readers. All Milestone 3 behaviour.

## No implementation is authorised

No source change is authorised by this decision.

A later bounded implementation will eventually be required, and it is described here only so that its shape is not settled by whichever implementation lands first. It would carry the explicit provenance states on `ResolvedRolloverPolicy` alone, adopt the schema version the deferred numeric decision selects, and update the rollover fixtures and tests. That work requires a later implementation authorisation, taken once the contract spelling and the numeric schema transition are both settled. It does not touch `ResolvedGoalPolicy` or `ResolvedFundingRule`.

The general provenance semantic may be reused by another family only after that family's product-default sourcing is itself established by an accepted decision.

No validator is authorised, no validator API is defined, no error code is registered or named, and no registry changes. No resolver, evaluation context, `RuleConfiguration` arm or Milestone 3 behaviour is established.

## Unchanged by this decision

No engineering specification text is superseded, amended or replaced. PFOS-ENG-00, PFOS-ENG-01 and PFOS-ENG-02 are not altered.

Decision 074 is applied rather than amended, except that `ResolvedRolloverPolicy` will change shape as recorded above; its schema-version rule and every other element stand. Decision 080's fallback mechanism, its classification of slots, and its record that no source previously designated these two defaults are all preserved. Decision 081's holding that a product default is not a Rule is applied, not narrowed. Decisions 014, 020, 025, 026, 027, 028, 075, 082, 083, 084, 085, 086, 088, 090, 091 and 092 are unamended.

`ResolvedRuleSet`'s field list is unchanged, `sourceRuleVersionIds` is unchanged, `ResolvedGoalPolicy`, `ResolvedFundingRule` and `ResolvedGlobalObligation` are unchanged, Plan Snapshot design is unchanged, and no numeric `schemaVersion` is changed.

## Why

Decision 080 discovered that two required fields had no established value and recorded the gap rather than inventing a default, because a product default is a product commitment under Constitution Principle 2. Decision 081 discovered that entries supplied by an already-accepted default had no way to express provenance. Decisions 082 and 084 each routed further questions to a terminal-default decision. This is that decision.

Taking the defaults and the provenance together is what Decision 081 required, and it is what keeps the result usable: a default recorded for a bucket-keyed family without a provenance representation would be unrepresentable the moment it was accepted.

The two defaults are chosen where the corpus already points. Decision 020 requires a leftover default to exist and the accepted vocabulary leaves one arm inhabitable without authored data. PFOS-ENG-02 §10 states which pool the Allocation Engine begins with. Neither was a designation, so this decision makes both explicit.

Separating the general semantic from its persisted consequence is what keeps the decision proportionate. The semantic costs nothing to state and prevents the question from being answered differently by each family that meets it later. The contract change is confined to the one family whose default sourcing an accepted source already establishes, so no contract is versioned against a case that may never arise, and no population question is prejudged.

The provenance model follows the corpus's own method rather than convenience. Three accepted decisions have refused to let absence carry meaning, and one has refused to represent product defaults as authored rules. An explicit state satisfies both refusals at once.

## Alternatives Considered

Requiring an authored leftover policy instead of a default was rejected. Decision 020 requires a simple default, and Constitution Principle 2 states that users should not need to configure many settings before completing a first paycheck allocation. It would also have required a new plan-completeness invariant where Decision 080's existing fallback mechanism already suffices.

Designating another leftover arm as the default was rejected. `SINGLE_DESTINATION`, `PERCENTAGE_SPLIT` and `MAINTAIN_BUFFER_THEN_REDIRECT` each require authored data a default cannot supply, and `HIGHEST_PRIORITY_UNFINISHED_GOAL` requires goal state. Each would also commit the user's remainder to a destination the user never chose, against Constitution Principles 4 and 5.

Designating `ELIGIBLE_AMOUNT` as the default basis was rejected. PFOS-ENG-02 §10 presents it as the conditional case for income events containing money excluded from planning, not the ordinary one. It is not rejected because it would decide Blocker F — it would not, since Decision 074 records that the contract names the basis rather than carrying the amount, and PFOS-ENG-02 §6 supplies both amounts on the income event. It is rejected because it inverts §10's stated ordinary case, and because it would make every default resolution depend on a quantity whose computation and double-count ownership is unresolved.

Requiring an authored allocation basis was rejected for the reason given for leftover: it would block a first allocation, and Decision 086 records that no accepted source establishes that a user authors this slot at all.

A product default for required funding was rejected as impossible rather than merely undesirable. Decision 082 establishes that every §15 funding field is an irreducibly per-bucket value, so a higher-level default carrying one would be meaningless for its children.

Making `ruleVersionId` optional was considered and rejected. It is the simplest change and Decision 081 anticipated it, but absence would have to mean product-default provenance, which is the reading Decisions 085, 086 and 088 each refused, and which PFOS-ENG-00 §29.1 makes unsafe because a truncated import is indistinguishable from an authored omission.

A separate provenance discriminator retained beside an optional `ruleVersionId` was rejected. It creates two fields that can disagree, the objection Decision 081 sustained against a stored precedence level, Decision 083 against a dated status, Decision 085 against an independent terminating flag and Decision 090 against a redundant ordinal.

A sentinel or fabricated `RuleVersionId` for product-default entries was rejected. The primary objection is semantic truthfulness: Decision 081 establishes that a product default is not a Rule, so it has no genuine `RuleVersion`, and persisting a fabricated identifier would represent product-default provenance as authored rule-version provenance — a false statement in a contract Decision 074 persists by value and Constitution Principle 12 requires to be traceable. Identifier opacity supplies a further reason not to reserve a magic literal inside an identifier space PFOS-ENG-00 §14 leaves unformatted, as Decisions 086 and 088 each recorded when refusing §42.1's sentinel. That reason is additional rather than primary.

Manufacturing an implicit `RuleVersion` for product defaults was rejected. Decision 081 refused to represent product defaults as authored rules on grounds that apply unchanged: §18's required fields, the absence of an effective period, §40's audit of a user's change, and Decision 074's by-value snapshot removing any need for it. Decision 081 also recorded that this option would have concealed the provenance gap.

Avoiding default-sourced rollover entries through a plan-completeness requirement was rejected. It would contradict Decision 028's holding that all bucket balances carry forward by default, and Constitution Principle 2's prohibition on requiring many settings before a first allocation. Plan completeness is adopted for required funding instead, where Decision 082 shows a default is impossible in principle. No conclusion is drawn about goal policy, whose population is unresolved.

Applying the persisted provenance change to every family carrying a singular required `ruleVersionId` was considered and rejected. It would version `ResolvedFundingRule` against a case this decision's own holdings deny, and `ResolvedGoalPolicy` against a case no accepted source has established, prejudging the population question. The general semantic already binds them if and when their antecedent is met.

Deferring the rollover change as well, and stating only the general semantic, was considered and rejected. The rollover defect is live today under Decisions 028, 080 and 081, and leaving an accepted product default unrepresentable while recording that it will be repaired later is the slower form of the silent outcome Decision 068 forbids.

Applying one provenance representation to every resolved family was rejected. Family-specific scope is retained because the existing shapes already differ: two families carry no provenance member and two carry plural identifier lists, so extending the states to them would change contracts this decision has no reason to change.

## Tradeoffs

One nested persisted contract changes shape, so a further schema-version increment is owed before it can be implemented, and the source contract will differ from the decided contract until that transition is taken.

Two product commitments are made that no prior source designated. Both are recorded as this decision's own act rather than as findings, so a later reconsideration knows exactly what it is revisiting.

A general semantic is stated while only one family adopts its persisted form, so a reader learns the rule before seeing it applied twice. That is the intended trade: the rule is stated once, and each family adopts it when its own default sourcing is established rather than by anticipation.

Required funding gains a direction without a checkable predicate, because "allocatable bucket" is undefined. The invariant is known before it is enforceable, as Decisions 082, 085, 086 and 091 each recorded for other invariants.

The `goalPolicies` population remains open, so one of the four slots Decision 080 listed is left where it stood, and this decision says so rather than inventing a population rule.

Product defaults gain explicit provenance without gaining identity, so a snapshot can say that a value came from a default but not which definition of that default supplied it. That is accepted deliberately and recorded as open.

## Consequences

`leftoverPolicy` and `allocationBasis` have accepted product defaults, and Decision 080's fallback mechanism becomes total for both.

A general rule now governs how any resolved family distinguishes authored provenance from product-default provenance.

`ResolvedRolloverPolicy` adopts explicit provenance states, and Decision 081's provenance gap is closed for the one family in which it is live.

`ResolvedGoalPolicy` and `ResolvedFundingRule` are unchanged, and their provenance questions are recorded as deferred and as inapplicable respectively.

A further incompatible persisted change is owed against the current `schemaVersion` 2, with the numeric target deferred.

Required funding is settled as authored rather than defaulted, with its completeness predicate open.

No implementation is authorised, no code registry changes, and Milestone 2 gains no new implementable contract from this decision.

Blocker C's remainder and Blocker F remain open and continue to gate the work they name.

## Future Review Trigger

Reconsider when the `goalPolicies` population is settled, since default-sourced goal-policy entries would then adopt the general provenance semantic and Decision 074 would govern any resulting incompatible change; if any future accepted decision introduces a product default for required funding, since that family's provenance would then need revisiting; when "allocatable bucket" is defined, since the required-funding completeness predicate becomes statable; when the numeric schema-version decision is taken, since the rollover provenance implementation is gated on it; when the contract spelling for the provenance states is fixed, since the implementation authorisation follows it; if an accepted source ever requires identifying which product-default definition supplied a value, since no identity exists for one; if onboarding design revisits the leftover default, as Decision 020's own trigger contemplates; or if a future accepted source designates a different default basis, since PFOS-ENG-02 §10 is the ground for this one.

---

# Decision 094: The Persisted Provenance Spelling for ResolvedRolloverPolicy

**Status:** Accepted
**Related:** Decisions 023, 028, 068, 073, 074, 078, 080, 081, 082, 083, 085, 086, 088, 090, 091, 092, 093
**Scope:** Architecture, Engineering, Data

## Decision

`ResolvedRolloverPolicy` carries a required `provenance` member whose value is a two-arm discriminated union, discriminated on `kind`:

- `AUTHORED`, carrying exactly one `ruleVersionId` typed `RuleVersionId`;
- `PRODUCT_DEFAULT`, carrying its discriminant and nothing else.

The required top-level `ruleVersionId` is removed. `bucketId` and `policy` are unchanged, and `RolloverPolicyConfig` is unchanged in every respect.

The provenance type is named `RolloverPolicyProvenance` and is local to the rollover contract.

No `ruleId` is added to this family, and that question is closed here rather than deferred.

This decision fixes contract spelling. It selects no numeric `ResolvedRuleSet` schema version, defines no migration, authorises no compatibility reader, authorises no validator or error code, and authorises no source change.

## What this decision is

Decision 093 settled the semantics of default-sourced provenance and recorded, in terms, that it "does not fix property names, discriminant spelling or type structure; those belong with the contract and schema work described below." This is the contract half of that work.

Decision 093 applied the persisted consequence to `ResolvedRolloverPolicy` alone, because Decision 028, PFOS-ENG-01 §17.1 and Decision 080 already establish `CARRY_ALL` as its product default, and Decision 081 records that most buckets author no rollover rule. The antecedent of the general rule is satisfied for this family today and for no other. This decision changes that scope in neither direction.

The schema half — the numeric target — is not taken here. It is a separate decision, for the reason given below.

This decision makes no financial holding. It decides how a resolved rollover entry records where its value came from, and it decides nothing about what any rollover value is, when it applies, or which policy a product default may supply. Its scope is recorded as Architecture, Engineering and Data for that reason.

## The current shape

The shipped contract, identical to the shape Decision 074 declared:

```ts
export interface ResolvedRolloverPolicy {
  readonly bucketId: EntityId;
  readonly ruleVersionId: EntityId;
  readonly policy: RolloverPolicyConfig;
}
```

`ruleVersionId` is typed `EntityId`, not `RuleVersionId`, in both Decision 074's declaration and in source. Nothing in this decision should be read as implying the alias was already adopted for this family. `ResolvedGlobalObligation` adopted `RuleId` and `RuleVersionId` under Decisions 091 and 092; `ResolvedRolloverPolicy`, `ResolvedGoalPolicy` and `ResolvedFundingRule` did not, and still carry bare `EntityId`.

## The target contract

```ts
export type RolloverPolicyProvenance =
  | {
      readonly kind: 'AUTHORED';
      readonly ruleVersionId: RuleVersionId;
    }
  | {
      readonly kind: 'PRODUCT_DEFAULT';
    };

export interface ResolvedRolloverPolicy {
  readonly bucketId: EntityId;
  readonly provenance: RolloverPolicyProvenance;
  readonly policy: RolloverPolicyConfig;
}
```

The member names, the discriminant property, the two literals, the arm contents and the type names above are fixed by this decision. Their implementation is not authorised.

## Three questions, three members

The resolved entry answers three questions, and each member answers exactly one:

```text
bucketId     which bucket
policy       what rollover behaviour applies
provenance   where that resolved value came from
```

`policy` and `provenance` are independent dimensions. Nothing in accepted authority ties a provenance state to a policy variant, and the shipped contract already treats provenance as uniform across all five policy arms by carrying it once on the envelope.

That independence is the architectural reason to compose the two dimensions rather than multiply them. Multiplying five policy variants by two provenance states would produce ten arms restating `bucketId` and every policy field, and would dissolve `RolloverPolicyConfig` — a type Decision 074 declared and which this decision preserves — into the envelope. Composition expresses two independent questions with two independent discriminated values; multiplication expresses one question that does not exist.

## Why provenance is nested

`provenance` is a nested discriminated value rather than a discriminator and an optional identifier laid flat beside `bucketId` and `policy`.

The grounds are these.

Provenance is a semantic dimension of its own, and nesting gives that dimension one addressable value carrying its own discriminant. A reader of the contract, of persisted JSON, or of an eventual import validator finds the whole provenance answer in one place rather than assembled from two members at different depths.

It keeps `ResolvedRolloverPolicy` an interface envelope. Every resolved *entry* in the corpus is an interface holding nested discriminated unions — `ResolvedRolloverPolicy`, `ResolvedFundingRule`, `ResolvedGlobalObligation`, `ResolvedGoalPolicy` — while top-level unions are reserved for *plans and policies*: `ResolvedLeftoverPolicy`, `ResolvedPoolPlan`, `ResolvedTopPriorityPlan`, `RuleOwner`, `RolloverPolicyConfig`. Flattening would make rollover the only resolved entry that is itself a union, for no gain in expressiveness.

It avoids restating `bucketId` and `policy` once per provenance arm.

And it keeps the two discriminants apart. A flat arrangement places `sourceKind` and `policy.policyType` in one object at different depths, with nothing in the shape indicating that they answer unrelated questions. Nesting states the separation structurally.

A further engineering observation supports the same conclusion and is recorded under Alternatives Considered. It is corroboration, not ground: this decision does not rest a persisted contract on the behaviour of one compiler's excess-property checking.

## The discriminant property is kind

The property path is `provenance.kind`.

Decision 093 speaks of the "provenance kind" twice, once for each state, so the path spells the concept in the words the accepted decision already used.

`kind` does not collide with the accepted family discriminants. Decision 086 fixed that each family's inner discriminant from Decision 074 keeps its accepted name and meaning, so `type`, `policyType` and `strategy` are spoken for, and each names financial behaviour rather than provenance. The only existing `kind` in source is `TerminatingRuleVersion.kind`, the discriminant of a future `RuleVersion` union; it sits on a different object in a different contract and no ambiguity arises between them.

The alternatives were considered and rejected. `sourceKind` is redundant inside a member already named `provenance`, and "source" is additionally spoken for by `sourceRuleVersionIds`, which means something else. `provenanceKind` stutters as `provenance.provenanceKind`. `type` is the most generic name available and sits nearest the financial-behaviour discriminants. `ownerType` names rule ownership, which a product default does not have — `rule-owner.test.ts` already guards against exactly that confusion by asserting that `ownerType: 'PRODUCT_DEFAULT'` does not compile, on Decision 081's ground that §6 level 9 is a resolver fallback rather than a fifth owner.

## The discriminant literals are AUTHORED and PRODUCT_DEFAULT

The persisted literals are exactly `'AUTHORED'` and `'PRODUCT_DEFAULT'`.

Both are the corpus's own words. Decision 093 states the semantic as authored provenance against product-default provenance throughout. PFOS-ENG-01 §8.1 is headed "Product Default". "Authored" is the corpus's standing term for user-supplied configuration, carried by Decision 082's and Decision 084's authored scope and by the registered `RULE_DUPLICATE_AUTHORED_SCOPE` code. `PRODUCT_DEFAULT` already exists as a string in the repository, in the negative test that keeps it out of `RuleOwner`; using it for the concept it actually names, in the contract where that concept belongs, is Decision 091's principle of keeping one vocabulary rather than two.

SCREAMING_SNAKE matches every discriminant literal in the codebase without exception.

`SYSTEM`, `BUILT_IN`, `INHERITED`, `DEFAULT_RULE`, `IMPLICIT_RULE` and `FALLBACK_RULE` are rejected. The first three appear nowhere in accepted authority, and `INHERITED` additionally implies a precedence relationship that Decision 080's fallback mechanism does not create. The last three embed *rule*, contradicting Decision 081's holding — reaffirmed by Decision 093 — that a product default is not an authored `Rule`, has no `RuleId`, no `RuleVersionId`, no lifecycle status and no authored scope. No literal naming a product default may call it a rule.

## The AUTHORED arm

The authored arm carries its discriminant and exactly one identifier:

```ts
{ readonly kind: 'AUTHORED'; readonly ruleVersionId: RuleVersionId }
```

This is Decision 093's invariant in source form: authored provenance carries exactly one genuine `RuleVersionId`, being the exact version that produced the value, which PFOS-ENG-01 §19.1 requires to remain reconstructable for a version used in a confirmed allocation.

No other provenance metadata joins it.

## No ruleId is carried, and the question is closed

`ResolvedRolloverPolicy` does not carry `ruleId`. No accepted source has addressed this for the rollover family, and this decision closes it rather than leaving it to surface later.

Decision 091 gave `ResolvedGlobalObligation` both identities, and stated the reason that confines the holding: `GLOBAL_OBLIGATION` "is the only executable resolved family with no natural key: every other is keyed by `bucketId`." Rollover is keyed by `bucketId`. Decision 074 independently orders `rolloverPolicies` by bucket identifier. The condition that made a second identity necessary for obligations is absent here.

Adding `ruleId` would therefore add a second independently supplied identity that can disagree with `ruleVersionId`, with no contract pairing a `Rule` to its versions to check them — an absence Decisions 085, 086 and 091 each recorded. Decision 086 accepted such a redundancy once, and named the test it must pass: the value must not be derivable, and it must be needed. Decision 091 showed obligations passing that test. Rollover does not reach it, because no accepted source demonstrates a need for stable logical `Rule` identity in a resolved rollover entry at all.

Two things this holding does not say. It does not say `bucketId` and `ruleId` are semantically interchangeable — they are different concepts answering different questions, and `bucketId` addresses the entry rather than identifying the rule that produced it. And it does not say rollover could never need `ruleId`. The holding is only that no accepted need exists today, so none is persisted today. If a future requirement demonstrates one — a §19.3-style report naming which rule changed, for instance — that is a separate contract decision governed by Decision 074's versioning rule, and the second identity would arrive with the argument that justifies it.

## The PRODUCT_DEFAULT arm carries its discriminant and nothing else

```ts
{ readonly kind: 'PRODUCT_DEFAULT' }
```

Decision 093 fixes the invariant: product-default provenance carries no `RuleVersionId`, no sentinel, no fabricated identifier, and no manufactured implicit `Rule` or `RuleVersion`.

This decision adds nothing beside it. Not `ruleId`, `ruleVersionId`, `ProductDefaultId` or `ProductDefaultVersionId`; not `createdAt`, `effectiveFrom`, `versionNumber`, `applicationVersion` or `schemaVersion`; not a lifecycle status, an authored scope, an owner or a precedence level. Decision 093 enumerated most of these and refused each, on Decision 081's ground that a product default has none of the fields PFOS-ENG-01 §18 requires of a permanent rule and no effective period under Decision 078.

Decision 093 deliberately left the identity of a product-default *definition* unresolved, recording that a future audit requirement might need to identify the exact product release or default definition that supplied a value, that the question is open, and that it must not be solved with a fabricated default version identifier. This decision does not solve it. A discriminant-only arm is what leaves it genuinely open: it commits to no identity scheme, so any future scheme remains available on its own merits.

A discriminant-only arm is also the established local shape. `RolloverPolicyConfig`'s own `CARRY_ALL` and `RESET` carry nothing but their discriminator, with a shipped test asserting it by key inspection, and `RuleOwner`'s `GLOBAL` carries only `ownerType`.

## The type is rollover-local

The provenance union is named `RolloverPolicyProvenance` and lives in the rollover contract. No shared `ResolvedRuleProvenance` is introduced.

Decision 093 states a general semantic and applies the persisted consequence to one family. `ResolvedFundingRule` is expressly out of scope, because required funding receives no product default. `ResolvedGoalPolicy` is expressly deferred, because it is not established that a default-sourced goal policy exists at all. One concrete adopter is not evidence for a shared persisted contract.

Decision 086 refused to declare a `RuleVersionKind` even with both arms conceptually settled, recording that a named closed vocabulary is unnecessary before the union exists and that declaring one would close a vocabulary the decision had no authority to close. The same restraint applies with more force here, where the second adopter is not merely undefined but explicitly undetermined.

Deferring costs nothing later. If a second family legitimately adopts the semantic and its needs match, the type can be moved and renamed with no change to persisted JSON, provided `kind` and the two literals are preserved. That property is what makes the local choice safe rather than merely cautious.

## Type structure follows repository convention

The convention in `src/domain/rules/contracts` is uniform: discriminated unions are exported `type` aliases with inline object arms, and records are `interface` declarations. `RuleOwner`, `ResolvedLeftoverPolicy`, `RolloverPolicyConfig`, `ResolvedPoolPlan` and `ResolvedTopPriorityPlan` are all type aliases with inline arms; no named-interface-per-arm pattern exists anywhere in the Rule Engine contracts.

So `RolloverPolicyProvenance` is a type alias with two inline arms, and `ResolvedRolloverPolicy` remains an interface. The envelope is not converted to a top-level union.

## What the contract makes unrepresentable, and what it does not

Decision 093 requires that an entry carrying both a product-default state and a `RuleVersionId`, or neither, be unrepresentable rather than merely invalid. The target shape satisfies that at the level of the contract: no arm of `RolloverPolicyProvenance` admits either combination, so neither state is describable in the decided contract.

For ordinary typed construction — the object literals through which every value in this codebase is built — TypeScript enforces it. A `PRODUCT_DEFAULT` arm carrying `ruleVersionId` is rejected as an excess property; an `AUTHORED` arm missing `ruleVersionId` is rejected as a missing required member; a third discriminant literal is rejected; a bare string is rejected by the `EntityId` brand; and every member is `readonly`, so mutation is rejected.

The limit is stated plainly rather than left implicit. TypeScript's structural typing does not guarantee that an arbitrary widened intermediate object cannot carry an extra member past an assignment, and no static type validates untrusted persisted or imported JSON at all. PFOS-ENG-00 §29.1 treats imported content as untrusted, and a type is not a parser. This is not a weakness peculiar to the shape chosen here — the same limit applies to `RuleOwner`'s exclusion of `ownerId` from `GLOBAL`, and to every discriminated union the corpus has accepted — and the alternatives considered below share it exactly. Closing it is runtime validation at a trust boundary, which belongs to the persistence and import authority and is not this decision's job.

Nothing here should be read as claiming the type alone validates persisted JSON.

## Consequences for future tests

No test is authorised by this decision. The following are recorded so that the eventual implementation authorisation inherits a described intent rather than inventing one.

The compile-time guards the target shape makes available, in the shipped `COMPILE_TIME_ONLY` idiom under which an unused `@ts-expect-error` fails the build:

- a `PRODUCT_DEFAULT` arm carrying `ruleVersionId` is rejected;
- an `AUTHORED` arm missing `ruleVersionId` is rejected;
- a raw string is rejected where a branded identifier is required;
- an unaccepted provenance `kind` is rejected;
- `provenance` and its members are immutable;
- a top-level `ruleVersionId` on the envelope is rejected, guarding this decision's retirement of that member as Decisions 090 and 091 guarded theirs.

Two cautions belong with them.

The raw-string guard establishes that a bare string is not accepted. It does not, and cannot, establish that `RuleVersionId` differs from any other `EntityId`. `rule-identifiers.ts` records that these are semantic aliases rather than second brands, and that the distinction is preserved "through field names, construction paths, documentation and tests rather than through the compiler." No test may claim otherwise.

Each `@ts-expect-error` asserts only that some diagnostic occurs on the line it guards, not which one. Each must therefore be constructed so that the intended diagnostic is the only one available — built from a known-good fixture with exactly one defect introduced, and attached to the offending member rather than to an enclosing call, as the shipped resolved-contract tests already do.

## No runtime validation is authorised

No validator, no validator API, no error code, no import parser and no persistence reader is authorised, defined or named by this decision.

Decision 093 authorised none, and Decision 073's convention holds that a code is named once the behaviour it reports is specified. Validation of untrusted persisted and imported input remains a future boundary question under the persistence and import authority, which no accepted decision has yet established.

## sourceRuleVersionIds is unchanged

`ResolvedRuleSet.sourceRuleVersionIds` is untouched.

A product-default rollover entry contributes no identifier to it. No sentinel, no product-default identifier and no other non-rule-version value is inserted, and the field is not repurposed to carry provenance. Decision 093 settled this and Decision 074 is not amended.

The field's own type spelling — it is declared `readonly EntityId[]` while Decision 093 describes its contents as `RuleVersionId` values — is a separate question spanning `ResolvedRuleSet` and the other resolved families. It is not addressed here.

## The exact incompatible change

```text
schemaVersion 2 (current)

ResolvedRolloverPolicy {
  bucketId
  ruleVersionId
  policy
}
```

```text
target shape

ResolvedRolloverPolicy {
  bucketId
  provenance
  policy
}
```

The incompatible persisted change is precisely this: the required top-level `ruleVersionId` is removed, and a required top-level `provenance` member is added, whose value takes one of two persisted shapes. `bucketId` and `policy` are unchanged, including all five `policyType` arms and their fields.

The `EntityId` to `RuleVersionId` change inside the authored arm is not part of it. Decision 092 records the point directly for the equivalent change on `ResolvedGlobalObligation`: adopting those aliases "is not itself an incompatible change, both being semantic aliases of `EntityId`." It changes no serialized shape and no compiler behaviour. It is a semantic spelling improvement carried on a member this decision is rewriting in any case, and it is recorded here so that it is not later mistaken for part of the incompatible change.

## Schema consequence

Decision 093 established that this change requires another `ResolvedRuleSet` schema-version increment from the current `schemaVersion` 2, and deferred the numeric target.

This decision confirms that the rollover target shape is now stable and fully specified: the member set, the discriminant property, both literals, both arm contents, the identifier type and the disposition of `ruleId` are all fixed above, and no open question about this family's resolved shape remains.

It selects no numeric value. It does not name the next version number. It defines no migration behaviour, authorises no compatibility reader in either direction, and assigns no semantics to the conceptual `PlanSnapshot` schema version, whose relationship to `ResolvedRuleSet.schemaVersion` Decision 092 left undetermined. Those remain exactly where Decisions 092 and 093 left them.

Decision 074's versioning rule is applied, not amended, narrowed or excepted, and no pre-persistence exception is created.

## Why the numeric transition is a separate decision

Decision 093 deferred the contract spelling and the numeric target as two distinct items, and this decision discharges the first only.

The numeric transition should version a stable target shape rather than a shape still under design; that is why it follows rather than precedes this decision. Decision 092 is the precedent for the sequencing and for the form: it took the numeric transition after Decisions 090 and 091 had settled the shapes, ratified the baseline, and carried two settled changes in one increment.

Whether the eventual numeric decision carries this change alone or batches it with another family's settled change is left to that decision. Decision 093 recorded that no transition batches several family changes together on the strength of it, and nothing here changes that.

## No product-default policy coupling is created

This decision does not encode, at the type level or otherwise, that `PRODUCT_DEFAULT` provenance may accompany only `CARRY_ALL`.

`CARRY_ALL` is today's accepted product default under Decision 028, PFOS-ENG-01 §17.1 and Decision 080. That is a statement about which value the default currently supplies. The provenance contract records where a resolved value came from; it does not constrain which policy values a future accepted default may use.

Encoding the coupling would create a new financial invariant as a side effect of a spelling decision, closing a design space no accepted source closed. Decision 068 forbids making an architectural commitment as a side effect of another decision, and Decision 093 declined to make any holding of this kind. All combinations of the five policy variants with the two provenance states therefore remain expressible in the contract, and which of them a resolver may legitimately produce is a resolver question that no accepted decision has reached.

## No implementation is authorised

No source change is authorised by this decision. Not to `resolved-rollover-policy.ts`, not to `resolved-rule-set.ts`, not to `RESOLVED_RULE_SET_SCHEMA_VERSION`, not to any test or fixture, and not to any persistence, migration or resolver code, none of which exists.

After this decision, `ResolvedRolloverPolicy` in source still carries the required top-level `ruleVersionId` typed `EntityId`, and `RolloverPolicyProvenance` does not exist. The decided contract and the source contract differ, and will differ until a transition is taken. That is the state Decision 093 recorded and it is unchanged here.

Implementation remains gated on three things in order: this decision being accepted; the numeric schema transition being accepted; and an explicit bounded implementation authorisation taken after both. Decision 093 described the eventual work — the provenance states on `ResolvedRolloverPolicy` alone, the schema version the numeric decision selects, and the rollover fixtures and tests — precisely so that its shape is not settled by whichever implementation lands first. That description stands, now with the contract spelling fixed.

## Alternatives considered

**Making `ruleVersionId` optional.** Rejected, and rejected twice over. Decision 093 rejected it semantically: absence alone is never overloaded to mean product-default provenance, because PFOS-ENG-00 §29.1 treats imported content as untrusted and a truncated record would be indistinguishable from a deliberate product-default entry, which reading it as one would turn into a silent financial decision under Constitution Principle 4. Decision 086 rejected the same structural device generally, holding that discriminating by which payload key is present is the loosely structured object PFOS-ENG-01 §47.8 forbids. Decision 081 contemplated this path when it recorded the gap; Decision 093 closed it. The repository's `exactOptionalPropertyTypes` setting sharpens the objection further: an optional member can only be omitted, never explicitly present-and-empty, so the truncated record and the product-default entry would be byte-identical.

**A flat provenance discriminator.** A `sourceKind` discriminator with `ruleVersionId` beside it, at the same level as `bucketId` and `policy`, was considered and rejected on the architectural grounds recorded above: it makes rollover the only resolved entry that is itself a union, restates `bucketId` and `policy` per arm, and places two discriminants answering unrelated questions in one object at different depths.

An engineering observation corroborates that conclusion, and is recorded as corroboration only. Under the repository's own compiler settings, the flat shape admits a stale identifier through the ordinary spread idiom the rollover tests already use. Taking an authored entry and overriding only the discriminant type-checks cleanly and yields, at run time, an object carrying `PRODUCT_DEFAULT` alongside the previous `ruleVersionId` — a persisted state the contract forbids. Under the nested shape the corresponding correction replaces the whole `provenance` value, and no stale identifier can survive it; reproducing the fault requires deliberately spreading the inner union. This is evidence about how a shape behaves under the construction idioms actually in use. It is not the ground of the decision, and no persisted contract is settled here on the behaviour of one compiler's excess-property checking.

**Duplicating policy arms by provenance state.** Ten arms, each restating `bucketId` and every policy field, dissolving `RolloverPolicyConfig`. Rejected as multiplication of independent dimensions, with no impossible-state benefit over the nested shape.

**A wrapper around `bucketId` and `policy`.** Rejected. It adds a serialization level, moves `bucketId` inside a wrapper so the entry is no longer directly keyed by the field Decision 074 orders the array by, and buys nothing the nested member does not.

**A shared provenance type now.** Rejected for the reasons under "The type is rollover-local": one adopter is not reuse, Decision 086's refusal to name a vocabulary before its union exists applies with more force where the second adopter is explicitly undetermined, and later promotion costs nothing persisted.

**A sentinel or fabricated `RuleVersionId`.** Rejected by Decision 093 in terms. Independently barred by PFOS-ENG-00 §14's opacity requirement, and by Decision 086's rejection of §42.1's `["all"]` magic value inside an array of identifiers on exactly that ground.

**A manufactured implicit `Rule` or `RuleVersion` for the default.** Rejected by Decision 093 in terms, on Decision 081's holding that a product default has none of the fields PFOS-ENG-01 §18 requires of a permanent rule, no effective period under Decision 078, and no audit relationship under §40. Decision 081 additionally recorded that representing product defaults as authored rules was rejected notwithstanding that it would have concealed the provenance gap — the concealment being the objection, not the attraction.

**Adding `ruleId`.** Considered and closed above.

**Coupling `PRODUCT_DEFAULT` to `CARRY_ALL`.** Considered and refused above.

## Relationship to earlier decisions

Decision 093 is applied, not amended: its general semantic, its scope limitation to `ResolvedRolloverPolicy`, its invariants and its deferrals all stand, and this decision performs the contract work it assigned.

Decision 074 is applied rather than amended, except that `ResolvedRolloverPolicy` changes shape as Decision 093 already established; its ordering rule, its `sourceRuleVersionIds` definition, its schema-version rule and every other element stand. `RolloverPolicyConfig` as Decision 074 declared it is unchanged in every particular.

Decision 086's holding that each family's inner discriminant keeps its accepted name and meaning is preserved: `policyType` is untouched. Decision 091's two-identity holding is confined to the family whose justification it stated, and is not extended here. Decision 092's schema-transition posture, including its treatment of alias adoption as not itself incompatible, is applied. Decisions 023, 028, 068, 073, 078, 080, 081, 082, 083, 085, 088 and 090 are unamended.

## What this decision closes

The persisted and source spelling of default-sourced provenance for `ResolvedRolloverPolicy`: the member, its nesting, its discriminant property, both literals, both arm contents, the identifier type, the type's name and its locality.

The question whether `ResolvedRolloverPolicy` carries `ruleId`: it does not.

The stability of the rollover target shape for the purposes of the numeric schema transition.

## What this decision does not close

The numeric `ResolvedRuleSet` schema-version target, migration architecture, and compatibility readers in either direction. `PlanSnapshot` schema-version semantics and its relationship to `ResolvedRuleSet.schemaVersion`. Product-default identity and versioning. Runtime and import validation, any validator API, and any error code. The `sourceRuleVersionIds` alias typing and the equivalent typing on the other resolved families. The `goalPolicies` population and `ResolvedGoalPolicy`'s persisted shape. `ResolvedFundingRule`'s provenance beyond its authored-sourced holding. The definition of "allocatable bucket" and the required-funding completeness predicate. The `GOAL_POLICY` and `GOAL_UNTIL_TARGET` duplication. The `GLOBAL_OBLIGATION` `RuleConfiguration` payload and the authored provenance of its `maximumAmount`. The canonical ordering key for `globalObligations`. The `LOWER_PRIORITY_POOL` `FIXED_AMOUNTS` authored sequence. The `RuleConfiguration` union, `ConfiguredRuleVersion`, the full `RuleVersion` contract and its §41 metadata. The contract pairing a `Rule` with its versions. Evaluation-context API and population. Explanation multiplicity. Blocker F. The `resolvedRuleSetId` determinism question. The identifier-ordering documentation wording. The canonical product-default representation on plural-`ruleVersionIds` families. All Milestone 3 behaviour. All implementation.

## Deliberately deferred

- The numeric `ResolvedRuleSet` schema-version target, and whether that transition carries this change alone or with another settled change.
- Migration behaviour, read-migration, dual-version support and compatibility readers.
- Runtime validation of persisted and imported rollover entries, and the error code that would report a failure.
- Promotion of `RolloverPolicyProvenance` to a shared type, which awaits a second family whose product-default sourcing is established.
- The bounded implementation, which awaits this decision and the numeric transition.

## Future Review Trigger

Reconsider when the numeric schema transition is taken, since it depends on the shape fixed here; when the `goalPolicies` population is settled, since a default-sourced `ResolvedGoalPolicy` would apply Decision 093's semantic and may justify promoting the provenance type; if any future accepted decision introduces a product default for required funding, since `ResolvedFundingRule` provenance would then need revisiting; if an accepted source ever requires identifying which product-default definition supplied a value, since Decision 093 left that identity open and the `PRODUCT_DEFAULT` arm carries none; if an accepted requirement demonstrates a need for stable logical `Rule` identity in a resolved rollover entry, since `ruleId` is closed here for want of such a need rather than in principle; and when a persistence or import authority is established, since the untrusted-input boundary recorded above becomes actionable then.

---

# Decision 095: The ResolvedRuleSet Schema-Version Transition for Rollover Provenance

**Status:** Accepted
**Related:** Decisions 023, 028, 056, 068, 071, 074, 078, 081, 082, 089, 090, 091, 092, 093, 094
**Scope:** Architecture, Engineering, Data

## Decision

The `ResolvedRuleSet` contract carrying the `ResolvedRolloverPolicy` shape Decision 094 fixed is `schemaVersion` 3.

The current contract is `schemaVersion` 2. This transition carries exactly one incompatible persisted change: on `ResolvedRolloverPolicy`, the required top-level `ruleVersionId` is removed and a required top-level `provenance` member is added, whose value takes one of two persisted shapes. `bucketId`, `policy` and `RolloverPolicyConfig` are unchanged, and every other `ResolvedRuleSet` member is unchanged.

No numeric value other than 1, 2 and 3 is selected, reserved or implied.

This decision applies Decision 074's versioning rule. It defines no migration behaviour, authorises no compatibility reader in either direction, authorises no validator and registers no error code, and it does not make any rule family materializable.

## What schemaVersion versions

`ResolvedRuleSet.schemaVersion` is the schema version of the persisted `ResolvedRuleSet` contract as a whole.

PFOS-ENG-00 §40 lists an application version, a database schema version, a backup format version and a domain snapshot schema version, and records that these versions serve different purposes and must not be conflated. Applying that separation, exactly as Decision 092 did:

- it is not the IndexedDB or database schema version governed by PFOS-ENG-00 §26 and Decision 056;
- it is not the backup format version governed by PFOS-ENG-00 §27;
- it is not the application version;
- it is not the conceptual `PlanSnapshot.schemaVersion` of PFOS-ENG-01 §41, whose relationship to this version Decision 092 left undetermined and Decision 093 declined to assign.

That relationship remains undetermined here.

This is not "the rollover schema version". It versions the whole persisted contract. Rollover is simply the only nested contract that differs between version 2 and version 3.

## The baseline is 2

Decision 092 ratified 1 for the shipped seven-member `ResolvedGlobalObligation` shape and established 2 for the shape Decisions 090 and 091 decided.

Source agrees: `RESOLVED_RULE_SET_SCHEMA_VERSION` is `2`, and a shipped test pins the literal 2 so the decided value stays under test while every producer names the constant.

Decision 093 recorded that Decision 074 "requires another `ResolvedRuleSet` schema-version increment from the current `schemaVersion` 2" and deferred the numeric target. This decision supplies it.

## Version mapping

```text
schemaVersion 2

ResolvedRolloverPolicy {
  bucketId       EntityId
  ruleVersionId  EntityId
  policy         RolloverPolicyConfig
}
```

```text
schemaVersion 3

RolloverPolicyProvenance =
  | { kind: 'AUTHORED'; ruleVersionId: RuleVersionId }
  | { kind: 'PRODUCT_DEFAULT' }

ResolvedRolloverPolicy {
  bucketId    EntityId
  provenance  RolloverPolicyProvenance
  policy      RolloverPolicyConfig
}
```

Under `schemaVersion` 2, `ruleVersionId` is typed bare `EntityId` in both Decision 074's declaration and in source. The `RuleVersionId` alias is adopted for this family for the first time at version 3, and nothing here should be read as implying it was already in place.

`RolloverPolicyConfig` is unchanged between the two versions, including all five `policyType` arms and their fields. `bucketId` is unchanged. Every other member of `ResolvedRuleSet` is unchanged.

## The one incompatible change

Decision 094 states it precisely, and this decision versions exactly that: the required top-level `ruleVersionId` is removed, a required top-level `provenance` member is added, and `provenance` has two persisted variants.

Every version-2 rollover entry lacks `provenance`; every version-3 entry lacks a top-level `ruleVersionId`. Neither document validates as the other, in either direction. That is what makes the change incompatible and what Decision 074's rule exists to make identifiable.

## The alias is not the trigger

The `EntityId` to `RuleVersionId` change inside the authored arm is not the incompatible change and is not an independent schema-version trigger.

Decision 091 recorded the point for the equivalent change on `ResolvedGlobalObligation`, and Decision 092 carried it into the version mapping: adopting those aliases "is not itself an incompatible change, both being semantic aliases of `EntityId`" under Decision 078 on the terms Decision 074 fixed for `PlanVersionId`. Decision 094 applied the same reasoning to this family in advance.

It changes no serialized shape and no compiler behaviour. It rides on the transition; it does not cause one.

## Why the target is 3

Decision 074 requires an increment for an incompatible persisted contract change. The question is which number the increment reaches, and it is answered from accepted practice rather than from arithmetic.

Decision 092 is the corpus's only prior transition, and it moved 1 to 2 — the next integer. It also stated the reasoning that makes the next integer correct rather than merely conventional: the version exists so that a stored shape is identifiable, so a numbering scheme must never let one numeric value denote two different shapes. Decision 092 rejected renumbering the new shape to 1 on exactly that ground, describing it as "a renumbering rather than the increment Decision 074 requires".

Decision 092 further recorded that "no numeric value other than `1` and `2` is selected, reserved or implied". Nothing therefore claims 3, reserves it, or stands between 2 and it.

The member is numeric. Decision 092 rejected a non-numeric scheme because Decision 074 types the member `number` and the shipped contract tests enforce it. That remains true.

Two is the current value, an increment is required, no number is reserved, no skip mechanism exists and no intermediate shape exists. The next increment is therefore 3.

## No intermediate version exists

No `schemaVersion` exists, conceptually or in any accepted source, between the current version 2 and the shape Decision 094 fixed.

Decision 093 settled the provenance semantic and expressly declined to fix property names, discriminant spelling or type structure, so it produced no persisted shape to number. Decision 094 settled the persisted shape. There is no separately accepted intermediate persisted contract between them.

Decision 092 confronted the same question about its own intermediate — `sequence` removed while `obligationId` was retained — and answered it: that shape "was never persisted and was never shipped… Assigning it a version would name a shape no datum ever held." The reasoning applies with more force here, where no intermediate shape exists even in principle.

## No number is skipped

Selecting 4 or any later value is rejected.

No accepted source reserves a number or establishes a skipped-version mechanism. No unimplemented schema holds an assigned number. Version numbers identify actual persisted contract shapes, and assigning 3 to nothing while calling the new shape 4 would leave a numeric value naming no contract at all — the inverse of the defect Decision 092 refused, and equally destructive of the identification Decision 074's rule provides.

## Rollover provenance travels alone

This transition carries one change because one settled, unversioned incompatible change exists.

`ResolvedGlobalObligation` needs nothing further: Decision 090's removal of `sequence` and Decision 091's rename of `obligationId` to `ruleId` were both carried by Decision 092's transition to version 2.

`ResolvedGoalPolicy` has no settled target shape. Decision 093 left the `goalPolicies` population unresolved and recorded that it is not established that a product-default-sourced `ResolvedGoalPolicy` exists at all.

`ResolvedFundingRule` does not change shape. Decision 093 held that required funding receives no product default, that the family cannot legitimately be produced by one, and that it remains authored-sourced.

The two product defaults Decision 093 designated cause no contract change. `LEAVE_UNALLOCATED` was already an arm of `ResolvedLeftoverPolicy` and `NET_AMOUNT` already a member of `AllocationBasis` before Decision 093; designating which value the product default supplies is a resolution-behaviour holding, not a shape change. Decision 093 recorded exactly this: "The two defaults designated by this decision cause no contract change and carry no schema consequence of their own."

The `sourceRuleVersionIds` alias typing is unresolved and outside scope. Decision 094 recorded it as a separate question spanning `ResolvedRuleSet` and the other resolved families, and it is not addressed here.

The `GLOBAL_OBLIGATION` `RuleConfiguration` payload and the canonical ordering of `globalObligations` are unresolved. Decision 092 recorded that a later payload decision may reveal a separate incompatible change, and that whether a later canonical-ordering change requires an increment remains governed by Decision 074. Neither is settled, so neither is batched.

No other accepted, settled incompatible `ResolvedRuleSet` change is waiting. Version 3 therefore carries rollover provenance alone.

## Goal policy does not block this transition

Waiting for the `goalPolicies` population to settle is rejected.

Decision 093 forecloses it directly: `ResolvedGoalPolicy` and `ResolvedFundingRule` "do not change shape under this decision, and no transition batches several family changes together on the strength of it. Future goal-policy population work may create another incompatible change if it establishes default-sourced entries, and Decision 074 will govern it if so."

Decision 093 also explained why acting early would be wrong in the other direction: applying a shape change to goal policy now "would version a contract against a case that may never arise and would prejudge the population answer." The same discipline forbids delaying a settled change for an unsettled one.

Decision 092 rejected the structurally identical proposal — deferring until the canonical key or the `GLOBAL_OBLIGATION` payload settled — because "neither is needed to identify the two shapes being versioned, and Decision 074 governs any future incompatible change on its own terms."

A transition versions settled shapes. Gating one on a question that may never produce a shape would defer it indefinitely. If a later population decision creates a default-sourced `ResolvedGoalPolicy`, Decision 074 will require its own increment then. No goal-policy design is performed here.

## The repository as this decision finds it

The following is a finding about the repository at the time of this decision, not a claim about the future:

- the `ResolvedRuleSet` source contract exists;
- tests construct `ResolvedRuleSet` and `ResolvedRolloverPolicy` values;
- no `PlanSnapshot` type and no Plan Snapshot producer exist in source;
- no persistence repository, database, IndexedDB or local-storage implementation exists — `src/infrastructure`, `src/application` and `src/presentation` contain no implementation;
- no persisted `schemaVersion`-2 `ResolvedRuleSet` user data exists;
- no migration machinery and no compatibility reader exist.

That constructing a value in a test is not the same as persisting one is the distinction this section turns on, and it is stated so that a later reader does not infer stored data from the existence of a contract or a fixture.

## What this decision does about migration

Decision 074 requires the incompatible contract change to receive a schema-version increment. This decision satisfies that requirement by moving the decided `ResolvedRuleSet` contract from `schemaVersion` 2 to `schemaVersion` 3.

No current data-transformation migration is required, because no persisted `schemaVersion`-2 `ResolvedRuleSet` data exists to transform. That is the whole of the finding, and it is contingent on the repository state recorded above rather than on any general principle.

This is not an exception to Decision 074's versioning rule, and no pre-persistence exception is created, on the ground Decision 090 gave and Decisions 091, 092, 093 and 094 each preserved.

No general rule is established that a schema-version transition never requires a data migration, and no general data-migration requirement is attributed to Decision 074. Decision 074 requires an increment; what else a transition may require is not settled by Decision 074 and is not settled here.

PFOS-ENG-00 §26's migration rules are neither invoked nor extended. §26 states that every schema change requires a migration, but it is titled IndexedDB Schema Versioning and governs the database schema version, which §40 keeps as a separate version class from this one. Importing its requirement here would be the conflation §40 forbids. Nothing in this decision limits §26 within its own domain.

Future migration architecture, read-migration and migration-engine design remain undefined.

## Forward and backward compatibility are undefined

No accepted source specifies how a reader of one version should behave when presented with another, in either direction.

A version-2 reader encountering version 3, a version-3 reader encountering version 2, read-migration, dual-version support, import compatibility, rejection behaviour and unsupported-schema handling are all recorded as undefined and deferred. No validator, no error code and no compatibility mechanism is created or authorised, under Decision 073's convention that a code is named once the behaviour it reports is specified.

## The first Plan Snapshot persisted after this transition

No persisted `schemaVersion`-2 `ResolvedRuleSet` data exists today.

Once the implementation authorised below becomes the current PFOS producer of resolved rule sets, a Plan Snapshot produced and persisted by that implementation should embed a `ResolvedRuleSet` carrying `schemaVersion` 3.

Four guards attach to that statement.

It says nothing about `PlanSnapshot.schemaVersion`. It does not equate any Plan Snapshot version with `ResolvedRuleSet.schemaVersion`, and it assigns the conceptual `PlanSnapshot.schemaVersion` no semantics; that relationship remains undetermined where Decisions 092 and 093 left it.

It does not claim that snapshot persistence exists. No Plan Snapshot type, producer or persistence layer exists in source today, and the statement is conditional on an implementation that has not been performed.

It makes no claim that `schemaVersion`-2 data can never exist under some future accepted compatibility, import or history mechanism. Those mechanisms are undecided, and none is created here.

And it does not declare Decision 092's analogous statement erroneous. Decision 092 said that a Plan Snapshot produced and persisted by the current PFOS producer should carry a `schemaVersion` 2 `ResolvedRuleSet`. That was correct for the producer its own transition established. This decision updates what the current producer should emit once the version-3 implementation replaces it. Decision 092's sentence described the producer of its moment; this one describes the producer after this transition.

## Decision 074 is applied, not changed

This decision applies Decision 074. It does not supersede, amend, narrow or except it. Decision 074's Status remains Accepted and its schema-version rule stands exactly as Decisions 089, 090, 091, 092, 093 and 094 each preserved it.

Decisions 093 and 094 remain the decisions that changed the contract. Decision 093 established the semantic and the existence of the incompatible change; Decision 094 fixed the shape. This decision assigns a schema version to that already-decided shape and changes no member itself.

No exhaustive taxonomy of which future semantic, serialization, ordering or structural changes require an increment is defined. Decision 074 continues to govern future incompatible persisted-contract changes on its own terms.

## Decisions 093 and 094 are applied, not reopened

Decision 094's spelling is applied exactly and is not reconsidered: the nested provenance member, the `provenance.kind` discriminant, the `AUTHORED` and `PRODUCT_DEFAULT` literals, the `RuleVersionId` typing of the authored identifier, the discriminant-only product-default arm, the absence of `ruleId`, the `RolloverPolicyProvenance` name and its rollover locality, and the independence of `policy` from `provenance`.

Decision 093 is unchanged: the `LEAVE_UNALLOCATED` and `NET_AMOUNT` product defaults, the holding that required funding is authored-only, the deferral of the `goalPolicies` population, and the separation of Blocker F all stand.

## Authorised implementation

A later bounded implementation unit is authorised to:

- add `RolloverPolicyProvenance` exactly as Decision 094 specifies;
- replace the top-level `ResolvedRolloverPolicy.ruleVersionId` with the required `provenance` member;
- type the authored arm's identifier `RuleVersionId`;
- leave `bucketId` unchanged;
- leave `policy` and `RolloverPolicyConfig` unchanged;
- add no `ruleId`;
- change `RESOLVED_RULE_SET_SCHEMA_VERSION` from `2` to `3`;
- update `ResolvedRuleSet` fixtures and tests from 2 to 3, including the pinning test;
- update the rollover fixtures in `resolved-rollover-policy.test.ts` and `resolved-rule-set.test.ts` to the Decision 094 shape;
- add test coverage of both the `AUTHORED` and `PRODUCT_DEFAULT` provenance states;
- add compile-time protection that a `PRODUCT_DEFAULT` arm carries no `ruleVersionId` and that an `AUTHORED` arm requires one;
- add compile-time protection that the retired top-level `ruleVersionId` is absent;
- preserve the existing readonly and immutability protections, retargeting any `@ts-expect-error` that currently uses the retired member;
- update only directly stale comments and documentation in the touched contract and test files where necessary to reflect Decisions 094 and 095.

Nothing else. In particular this decision authorises no persistence system, no migration engine, no old-version reader, no new-version compatibility layer, no backward-reader behaviour, no forward-reader behaviour, no import compatibility, no unsupported-schema validator, no error code, no goal-policy change, no funding-provenance change, no `sourceRuleVersionIds` alias change, no product-default identity or versioning, no canonical ordering key, no `GLOBAL_OBLIGATION` `RuleConfiguration`, no resolver population, no evaluation-context population, no Blocker C work, no Blocker F work, and no Milestone 3 behaviour.

## The source state before and after

Before the authorised implementation, source carries `RESOLVED_RULE_SET_SCHEMA_VERSION = 2` and the version-2 `ResolvedRolloverPolicy` shape. The decided contract and the source contract differ, and will differ until the implementation is taken. That gap is deliberate: Decisions 090, 091, 093 and 094 each recorded the same state, and Decision 092 closed its own gap only through a separately authorised implementation.

After the authorised implementation, source carries `RESOLVED_RULE_SET_SCHEMA_VERSION = 3` and the Decision 094 rollover shape.

No mixed state is authorised as a permanent contract. Shipping the Decision 094 rollover shape while the constant still reads 2 would make one numeric value denote two different shapes, which is the defect the versioning rule exists to prevent. Shipping the constant as 3 while the old rollover shape remains would name a shape that is not the decided one. The two changes belong to one implementation unit.

## What this decision closes

Decision 093's deferred numeric schema-version target.

Decision 094's remaining prerequisite, being the numeric transition its target shape was waiting for.

The version gate preventing implementation of the rollover provenance change, within the bounded authorisation above.

## What this decision does not close

Migration architecture beyond the current no-data-transformation finding. Forward and backward compatibility, read-migration, dual-version support, import compatibility, rejection behaviour and unsupported-version handling, and any error code for them. `PlanSnapshot` schema-version semantics and its relationship to this version. Product-default identity and versioning. The `goalPolicies` population and `ResolvedGoalPolicy`'s persisted shape. `ResolvedFundingRule`'s provenance beyond its authored-sourced holding. The `sourceRuleVersionIds` alias typing and the equivalent typing on the other resolved families. The definition of "allocatable bucket" and the required-funding completeness predicate. The `GOAL_POLICY` and `GOAL_UNTIL_TARGET` duplication. The `GLOBAL_OBLIGATION` `RuleConfiguration` payload. The canonical ordering key for `globalObligations`. The `LOWER_PRIORITY_POOL` `FIXED_AMOUNTS` authored sequence. The `RuleConfiguration` union, `ConfiguredRuleVersion`, the full `RuleVersion` contract and its §41 metadata. The contract pairing a `Rule` with its versions. Evaluation-context API and population. Explanation multiplicity. Blocker F. The `resolvedRuleSetId` determinism question. The identifier-ordering documentation wording. Any universal taxonomy of future schema-changing events. All Milestone 3 behaviour.

## Unchanged by this decision

Every `ResolvedRuleSet` member other than the element shape of `rolloverPolicies`, and the `schemaVersion` member's own type and meaning. `RolloverPolicyConfig` in full. `bucketId`. `sourceRuleVersionIds`. Plan Snapshot design. Decisions 023, 028, 056, 068, 071, 074, 078, 081, 082, 089, 090, 091, 092, 093 and 094 are unamended.

## Why

Decision 093 discovered that an already-accepted product default could not be truthfully represented by the accepted contract, and recorded the schema consequence while deferring the number. Decision 094 fixed the target shape and confirmed it stable. A settled incompatible shape with no assigned version is a contract that cannot be identified once anything stores it, which is the precise failure Decision 074's rule exists to prevent. This decision supplies the number, and nothing else.

## Alternatives Considered

Keeping `schemaVersion` 2 for the new shape was rejected. Decision 074 requires an increment, and one numeric value would denote two different rollover shapes across the repository's own history, defeating the identification the rule provides.

Skipping to 4 or a later value was rejected. No number is reserved, no skipped-version mechanism exists, and version numbers identify actual persisted shapes; a gap would name no contract.

Assigning an intermediate version to Decision 093's semantics alone was rejected. Decision 093 fixed no persisted shape, so there is no contract to number, and Decision 092 already refused to version a shape no datum ever held.

Delaying until the `goalPolicies` population settles was rejected on Decision 093's no-batching holding and Decision 092's parallel refusal to wait for the canonical key or the payload.

Batching hypothetical future changes was rejected. A transition versions settled shapes; nothing else has one.

Assigning 3 while retaining the old rollover source shape was rejected: the new number would denote the old contract.

Shipping the Decision 094 shape while retaining `schemaVersion` 2 was rejected on the same ground in reverse, and it is the state the version gate exists to prevent.

Defining migration architecture now was rejected. Nothing is persisted, so there is nothing to transform, and inventing an architecture would decide a question no accepted source reaches.

Adding dual-version or compatibility readers now was rejected. No reader exists, and both directions remain undefined where Decision 092 left them.

Splitting the number into a separate later decision from this one was rejected: this decision has no other subject, and the shape it versions is already settled.

## Tradeoffs

`schemaVersion` 2 names a source contract shape that was shipped but was never persisted by the repository as it exists today. The same will briefly be true of 3.

Forward and backward compatibility remain undefined, so the first reader implementation will arrive without an accepted rule for encountering an unexpected version. That is recorded rather than resolved, because no accepted source supplies one and no reader exists.

The relationship between this version and the conceptual `PlanSnapshot` schema version is left open for a second transition running, so a future persistence design must settle it rather than inherit it.

The implementation authorised here changes a contract that nothing yet consumes, so the change is verifiable only by contract tests until a resolver exists.

## Consequences

`ResolvedRuleSet.schemaVersion` has a ratified baseline of 1, a decided value of 2 for the Decision 090 and 091 shape, and a decided value of 3 for the Decision 094 rollover shape.

One nested contract differs between versions 2 and 3: `ResolvedRolloverPolicy`.

The implementation gate on the rollover provenance change is lifted, within the bounded authorisation above, and Milestone 2 gains its first implementable consequence from the Decision 093 line of work.

No persistence implementation, current data-transformation migration, or compatibility-reader implementation is authorised.

No runtime validation is authorised.

## Future Review Trigger

Reconsider when a persistence layer or a stored Plan Snapshot is introduced, since forward compatibility, backward compatibility and migration architecture become live then, and the relationship to the conceptual `PlanSnapshot` schema version must be settled with them; when the `goalPolicies` population is settled, since default-sourced goal-policy entries would create another incompatible change governed by Decision 074; if any future accepted decision introduces a product default for required funding, since that family's provenance would then need revisiting; when the `GLOBAL_OBLIGATION` payload decision is taken, since Decision 092 recorded that it may reveal a separate incompatible change; when a canonical ordering key for `globalObligations` is adopted, since whether it requires a further increment is governed by Decision 074 and is not decided here; or if any other incompatible persisted-contract change is decided, since Decision 074 requires it to be versioned.

---

# Decision 096: Bounded Authorability and the First Three RuleConfiguration Arms

**Status:** Accepted
**Related:** Decisions 071, 073, 074, 078, 080, 081, 082, 083, 085, 086, 087, 088, 089, 090, 091, 093, 095
**Scope:** Financial logic, Architecture, Engineering

## Decision

`RuleConfiguration` may cover a bounded subset of `ResolvedSlotKind` rather than all eight families.

`ResolvedSlotKind` stays at eight families and is unchanged. A family outside the authorable subset is **not authorable**: no `RuleVersion` configuration may carry it, and that is enforced at rule admission. It is never represented as a placeholder arm, a nullable configuration, `unknown`, arbitrary JSON, `Record<string, unknown>`, or any fabricated payload.

The current authorable subset is `GLOBAL_OBLIGATION`, `TOP_PRIORITIES` and `LEFTOVER_POLICY`.

Each arm carries the family tag `slotKind`, drawn from `ResolvedSlotKind`, as Decision 086 fixed.

V1 global obligations carry no authored cap. `ResolvedGlobalObligation.maximumAmount` remains an optional member of the resolved contract and is not populated in V1.

This decision fixes arm membership and field naming by transcription of accepted sources. It defines no resolver, no evaluation context, no aggregate contract, no validator and no error code; it changes no `ResolvedRuleSet` field and authorises no `schemaVersion` increment; and it authorises no implementation.

## Why bounded authorability is allowed

Decision 086 rejected defining `RuleConfiguration` over the ready families and deferring the rest, on the ground that a closed union missing a V1 family would produce rules that are addressable but not authorable while `Rule.slotKind` continued to admit them.

That objection is against a silent gap, not against a bounded subset. It is answered by making the boundary explicit and enforced rather than implicit and structural. A family outside the subset is not a family whose arm is merely absent; it is a family a rule may not be admitted with, stated here and checkable at admission.

The alternative Decision 086 preferred — waiting for every arm — is no longer neutral. Three families are now transcription-ready: Decision 087 closed the `TOP_PRIORITIES` rank tension, Decision 088 closed `GLOBAL_OBLIGATION` applicability, and Decisions 090 and 091 removed `ResolvedGlobalObligation.sequence` and settled its provenance. The remaining five each still need a semantic no accepted source supplies. Holding three complete arms hostage to five incomplete ones leaves `RuleConfiguration` undefined, and with it the resolver, for reasons that no longer apply to the three.

The subset stays inside Decision 086's own discipline: nothing is invented, and a family is admitted only where every member of its arm is a transcription of an accepted source.

## Current authorable subset

Provenance is never authored. `ruleId`, `ruleVersionId` and `ruleVersionIds` on the resolved contracts are supplied during resolution from the envelope Decision 086 fixed, and no arm below carries them.

Three fields named by PFOS-ENG-01 as configurable are owned elsewhere and appear on no arm: the effective date is the envelope's `period` under Decision 078, enablement is rule lifecycle under Decisions 083 and 085, and rounding is uniform under Decision 071, which admits no per-rule rounding field.

**`GLOBAL_OBLIGATION`** carries:

- `destinationBucketId`, `rateBasisPoints` and `incomeBasis`, transcribing PFOS-ENG-01 §12.2 and Decision 074;
- `applicability`, being exactly one of Decision 088's three semantics, spelled `scope: 'ALL_SOURCES'`, `scope: 'ONLY_LISTED_SOURCES'` and `scope: 'ALL_EXCEPT_LISTED_SOURCES'`, where the two listed semantics carry a non-empty set `incomeSourceIds` of opaque income-source identities.

The spellings avoid "eligible" throughout, as Decision 088's caution requires, so that source applicability is never confused with the eligible-income computation Blocker F owns. Decision 088's three semantics are preserved exactly and none is added.

No cap member exists. §12.2 enumerates the configurable fields of this family and contains no cap or maximum; §15.1's "Maximum, if any" is a field of the funding-rule types governing `REQUIRED_FUNDING`, and importing it across families would be invention rather than transcription. Decision 089 records that no accepted source redirects a capped excess, so a cap would also need excess semantics this corpus does not supply.

**`TOP_PRIORITIES`** carries `strategy`, being `'SEQUENTIAL'` or `'PERCENTAGE_SPLIT'` in Decision 074's spellings, together with `entries`, the whole member set authored in the single `GLOBAL` Rule Decision 082 fixed.

Each entry carries `bucketId` and a required `rank` under both strategies, per Decision 087. Under `PERCENTAGE_SPLIT` an entry additionally carries `shareBasisPoints`. Position within `entries` carries no financial meaning under either strategy; rank is the financial ordering key.

**`LEFTOVER_POLICY`** carries `policyType` in Decision 074's five spellings, with per-arm members transcribing PFOS-ENG-01 §16:

- `'LEAVE_UNALLOCATED'` — no further member;
- `'SINGLE_DESTINATION'` — `destinationBucketId`;
- `'PERCENTAGE_SPLIT'` — `destinations`, each carrying `bucketId` and `shareBasisPoints`;
- `'HIGHEST_PRIORITY_UNFINISHED_GOAL'` — no further member;
- `'MAINTAIN_BUFFER_THEN_REDIRECT'` — `bufferAmount` and `destinationBucketId`.

No arm carries a fallback, per Decision 074. §16.4's requirement that an authored percentage pool total exactly 10,000 basis points is unchanged and is not implemented here. `LEAVE_UNALLOCATED` being the product default under Decision 093 does not make it unauthorable: a product default is not a rule under Decision 081, so the default and the authored arm coexist.

## Treatment of unsupported families

`REQUIRED_FUNDING`, `LOWER_PRIORITY_POOL`, `ALLOCATION_BASIS`, `GOAL_POLICY` and `ROLLOVER_POLICY` are not authorable.

Not authorable means a `RuleVersion` configuration carrying one of these families is rejected at rule admission, not accepted and later ignored. Nothing stands in for the absent payload. Decision 086's exclusions are carried forward in full: no placeholder arm, no nullable or absent configuration, no `unknown`, no `Record<string, unknown>`, no arbitrary JSON, and no invented type. PFOS-ENG-01 §47.9 requires unknown rule variants to be rejected rather than accommodated, and PFOS-ENG-00 §29.1 treats imported content as untrusted, so a family with no accepted payload must be unrepresentable rather than merely invalid.

`ResolvedSlotKind` keeps all eight members, and `Rule.slotKind` under Decision 081 is unchanged. A rule of an unsupported family remains addressable; it is its configuration that cannot exist. That asymmetry is the explicit boundary this decision substitutes for the silent gap Decision 086 objected to.

Non-authorability is a statement about authored configuration only. It says nothing about product defaults, which Decision 093 already supplies for `leftoverPolicy` and `allocationBasis`, and nothing about whether a family is resolvable by other means.

## Extension rule

A later Decision may add one arm for one family by establishing that family's payload from accepted sources, without reopening this decision's general rule.

Such a Decision must name its own fields and persisted literals rather than leave them to an implementation, must supply the semantic the family currently lacks rather than assume it, and must state that the family moves from not authorable to authorable.

Adding an arm is additive on the authored side and requires no change to this decision. Whether any arm requires a `ResolvedRuleSet` `schemaVersion` increment is governed by Decision 074 and is not decided here; none of the three arms above requires one.

The same route applies to a global-obligation cap: an accepted source granting one would add a cap member to the `GLOBAL_OBLIGATION` arm and populate an already-present optional resolved member, without a resolved-contract change.

## What this closes

`RuleConfiguration` may now be defined over a bounded subset, and the scope question Decision 086 deferred is answered.

Three arms are fixed in membership and field naming: `GLOBAL_OBLIGATION`, `TOP_PRIORITIES` and `LEFTOVER_POLICY`.

The authored provenance of `ResolvedGlobalObligation.maximumAmount` is settled negatively: there is none in V1, and the field is not populated.

Decision 086's exclusion of placeholder payloads is extended into a positive admission rule.

## What remains unresolved

The payload of every unsupported family, and each family's own blocker as Decision 086 recorded it: the `REQUIRED_FUNDING` authored source for `sequence`, `isProtected` and `allowExcessAboveCapacity`; the `LOWER_PRIORITY_POOL` `FIXED_AMOUNTS` authored sequence; whether a user authors `ALLOCATION_BASIS` at all; the `GOAL_POLICY` and `GOAL_UNTIL_TARGET` duplication; and the `ROLLOVER_POLICY` payload.

An accepted source for a global-obligation cap. The item recorded by Decisions 093 and 095 narrows accordingly: the `GLOBAL_OBLIGATION` payload is settled here, and only a cap source remains open.

Authoring granularity and ownership for `LEFTOVER_POLICY`, which Decision 082 did not address and which this decision does not settle.

The correction of PFOS-ENG-01 §42.1, §42.2 and §42.3, which Decisions 087 and 088 assigned to the payload decision. Those examples remain as written, remain non-authoritative on member shape, and the editorial replacement is now due and is not performed here.

`ConfiguredRuleVersion`, the full `RuleVersion` contract and its §41 metadata, the contract pairing a `Rule` with its versions, the admission check itself and any code it would report, evaluation context, same-level contention, resolver API and population, the canonical serialised order of an authored collection, the canonical ordering key for `globalObligations`, Blocker C, Blocker F, persistence, migration, compatibility readers, and all Milestone 3 behaviour.

## Minimal alternatives

Waiting for all eight arms was rejected. It is Decision 086's original route, and it now blocks three complete families on five incomplete ones for a reason that has expired for the three.

A closed union with placeholder arms for the five was rejected. Decision 086 excluded every available placeholder shape, and a placeholder is precisely the silent gap that made a bounded subset objectionable.

Transcribing §15.1's "Maximum, if any" into the `GLOBAL_OBLIGATION` arm was rejected, for the reasons given under that arm.

Removing `maximumAmount` from `ResolvedGlobalObligation` was rejected here. It is an incompatible persisted-contract change requiring its own transition under Decision 074, and Decision 089 reasons about the field as present.

## Consequences

`RuleConfiguration` becomes definable over three families, and the resolver's authored input has an accepted shape for the first time.

Three families become authorable. Five become explicitly not authorable, which is a stronger and more checkable statement than their previous silence.

`ResolvedSlotKind`, `Rule.slotKind`, `ResolvedRuleSet`, `schemaVersion`, `sourceRuleVersionIds` and Plan Snapshot design are unchanged. Decisions 074, 078, 081, 082, 086, 087, 088, 089, 090, 091 and 093 are unamended.

No specification text changes, no validator is authorised, no error code is registered, no registry changes, and no code is authorised by this decision.

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
