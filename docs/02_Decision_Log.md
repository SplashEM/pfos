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
