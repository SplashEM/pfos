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
* Exact API/interface names

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
