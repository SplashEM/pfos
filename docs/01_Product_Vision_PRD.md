# Personal Financial Operating System

## Product Vision & Version 1 PRD

**Document ID:** PFOS-01
**Status:** Draft for Review
**Product Stage:** Version 1 Beta / Minimum Lovable Product
**Platform:** Local-first web application
**Primary Currency:** USD
**Companion Document:** PFOS-00 Product Constitution

---

# 1. Executive Summary

The Personal Financial Operating System (PFOS) is a planning-first financial application designed to help users decide what their money should do before they spend it.

Traditional budgeting applications often focus primarily on answering:

> Where did my money go?

PFOS begins with a different question:

> Where should my money go?

Users enter income, define priorities, create financial buckets and goals, and establish allocation rules. PFOS then calculates how incoming money should be distributed across those priorities.

Transactions and account balances subsequently allow the user to compare the plan against reality.

PFOS is therefore not intended to replace the user's judgment or create a budget for them.

Instead, it provides the infrastructure necessary for users to create, understand, test, and maintain their own financial plan.

Version 1 is intentionally limited.

It does not move physical money, connect directly to banks, learn user behavior using AI, or attempt to automate the user's entire financial life.

V1 must first establish a trustworthy planning foundation.

---

# 2. Product Mission

PFOS exists to:

> **Help users understand and confidently improve their financial future.**

The product accomplishes this by helping users:

* Plan incoming money
* Establish financial priorities
* Prepare for recurring obligations
* Save toward goals
* Track whether reality matches the plan
* Understand why financial outcomes occurred
* Identify problems before they become larger
* Evaluate possible solutions
* Simulate financial decisions before committing to them

---

# 3. Product Positioning

PFOS should be considered a:

> **Personal Financial Operating System**

rather than merely a budgeting application.

Budgeting remains an important outcome, but budgeting emerges from the user's financial plan.

PFOS does not dictate how users should spend their money.

The user defines the priorities.

PFOS helps execute and evaluate those priorities consistently.

---

# 4. Product Tagline

> **Plan first. Spend with confidence.**

---

# 5. Core Product Philosophy

PFOS organizes financial information around **decisions**, not merely accounts or categories.

The application should continuously help answer:

* What should happen next?
* Why did this happen?
* Am I still on track?
* What could I change?
* What happens if I make this decision?

Data exists to support these questions.

Data presentation should not become the product itself.

---

# 6. The Four Product Pillars

## 6.1 Planning

**Primary question:**

> Where should my money go?

Supported by:

* Paychecks
* Income sources
* Allocation rules
* Priorities
* Buckets
* Goals
* Bills
* Investments
* Debt planning
* Leftover allocation policies

---

## 6.2 Reality

**Primary question:**

> What actually happened?

Supported by:

* Transactions
* Account balances
* Credit-card balances
* CSV imports
* Reconciliation
* Refunds
* Transfers
* Actual net worth

---

## 6.3 Understanding

**Primary question:**

> Why did this happen?

Supported by:

* Planning Score
* Confidence Scores
* Allocation explanations
* Goal projections
* Net-worth explanations
* Variance analysis
* Reports
* Coaching explanations

---

## 6.4 Decisions

**Primary question:**

> What should I do next?

Supported by:

* Funding Advisor
* Recommendations
* Decision Simulator
* Life-event scenarios
* Goal-adjustment suggestions
* Contribution comparisons

---

# 7. Version 1 North Star

Version 1 must answer five questions exceptionally well.

## Question 1

> Where should my next paycheck go?

PFOS should calculate an understandable allocation based on the user's priorities and rules.

## Question 2

> Am I on track with my financial plan?

PFOS should summarize progress through balances, goals, obligations, and the Planning Score.

## Question 3

> Will I reach my goals?

PFOS should forecast progress and provide understandable Confidence Scores.

## Question 4

> What should I change if I won't?

PFOS should identify shortfalls and provide actionable alternatives through the Funding Advisor and Coaching Engine.

## Question 5

> What happens if I make this financial decision?

PFOS should allow safe experimentation through a simple deterministic Decision Simulator.

These questions define V1 scope.

---

# 8. Primary Target User

The primary V1 user is an individual who:

* Receives income from one or more sources
* Wants greater control over where income goes
* Has financial priorities
* Saves toward multiple goals
* Has recurring expenses
* May invest regularly
* May carry credit cards or other debt
* Wants to understand financial progress
* Prefers planning before spending
* Wants customization without configuring everything manually
* Values financial clarity and control

The user does not need advanced financial knowledge.

PFOS should teach concepts contextually as the user plans.

---

# 9. Secondary Target User

PFOS should eventually support users with more advanced planning needs, including:

* Multiple income sources
* Complex allocation policies
* Multiple investment accounts
* Debt payoff strategies
* Numerous savings goals
* Annual and irregular expenses
* Advanced simulations
* Custom financial rules

V1 architecture should support this complexity without exposing all of it during onboarding.

---

# 10. V1 User Model

Version 1 is:

* Single-user
* Local-first
* USD-only
* Web-first
* Planning-first
* Virtual-money-only

There are no shared households or collaborative plans in V1.

---

# 11. Fundamental Financial Model

PFOS distinguishes between three concepts.

## 11.1 Physical Account

Where money actually exists.

Examples:

* Checking
* HYSA
* Brokerage
* Roth IRA

## 11.2 Virtual Bucket

What the money is intended for.

Examples:

* Groceries
* Car Insurance
* Emergency Fund
* MacBook
* Vacation
* Tithing

## 11.3 Financial Rule

How money should be treated.

Examples:

* Tithe 10%
* Invest $500 monthly
* Fund Priority #1 first
* Send leftover money to Brokerage

These concepts must remain independent.

---

# 12. Income Model

PFOS supports multiple income sources.

Examples:

* Employment income
* Internship income
* Bonuses
* Tax refunds
* Gifts
* Side income
* Investment income
* Custom income

Income sources inherit global allocation rules by default.

Users may optionally create income-source-specific overrides.

---

# 13. Paycheck Workflow

The paycheck is the primary planning event in V1.

Typical workflow:

1. Select income source.
2. Enter or confirm paycheck information.
3. Auto-fill recurring information from the income template.
4. Enter net paycheck.
5. Run Allocation Engine.
6. Display Allocation Preview.
7. Explain each allocation.
8. Show underfunded priorities or shortfalls.
9. Allow adjustments.
10. Confirm allocation.
11. Atomically post virtual allocations.
12. Save the Plan Snapshot used.

Posting allocations immediately without preview may be offered as an optional advanced setting.

---

# 14. Duplicate Paycheck Detection

PFOS should detect likely duplicate income entries using signals such as:

* Income source
* Date
* Amount
* Reference information

Likely duplicates trigger a warning.

Users may explicitly confirm legitimate duplicate payments.

The application must not silently discard them.

---

# 15. Global Tithing Model

Default tithing behavior:

> 10% of eligible net income.

The percentage is configurable.

Tithing is calculated globally across eligible income rather than independently optimizing each income source.

Income sources may eventually be marked eligible or excluded when appropriate.

After global rules such as tithing are satisfied, income-source-specific allocation overrides may apply.

---

# 16. Priority Model

Users may select approximately 1–3 top priorities.

Default allocation behavior:

1. Fund highest priority.
2. Fund second priority.
3. Fund third priority.
4. Continue through remaining rules.

Users may optionally distribute funds across priorities using custom percentages.

Priority changes affect future allocations only.

Existing virtual balances are never silently redistributed.

---

# 17. Bucket System

Buckets represent financial intentions.

Buckets may be organized into groups.

Example:

Savings

* Emergency Fund
* MacBook
* Vacation

Investing

* Roth IRA
* Brokerage

Bills

* Insurance
* Phone

Groups do not directly receive allocations.

Groups aggregate information from their child buckets.

---

# 18. Bucket Types

V1 should support extensible bucket types such as:

## Percentage

Example:

Tithing.

## Fixed Monthly

Example:

Missions contribution.

## Recurring Bill

Example:

Car insurance.

## Investment Minimum + Unlimited Extra

Example:

Roth IRA.

## Unlimited Investment

Example:

Brokerage.

## Goal

Example:

MacBook.

## Emergency Fund

Goal-like behavior with optional continued contributions.

## Debt Payoff

Example:

Student loan.

## Everyday Spending

Examples:

Groceries, restaurants, entertainment.

Bucket type determines:

* Available settings
* Allocation behavior
* Progress presentation
* Analytics
* Goal behavior
* Completion logic

---

# 19. Goal Intent

Goals also have an intent.

## One-Time

Examples:

* MacBook
* Vacation

## Recurring

Examples:

* Annual credit-card fee
* Insurance
* Christmas gifts

## Continuous

Examples:

* Emergency fund
* Brokerage
* Long-term giving

Intent and bucket type are separate concepts.

---

# 20. Goal Lifecycle

A standard one-time goal may progress through:

**Active → Funded → Completed → Archived**

## Active

Still receiving allocations.

## Funded

Target has been reached.

Default:

* Stop automatic allocations.
* Keep bucket active.
* Preserve the reserved balance.

User may manually contribute additional funds or increase the target.

## Completed

The user confirms the real-world objective was fulfilled.

Example:

The MacBook was actually purchased.

## Archived

The goal leaves active planning but remains available in history and analytics.

Reaching the monetary target alone does not automatically mean the goal is completed.

---

# 21. Recurring Goals

When a recurring goal completes, PFOS automatically creates the next savings cycle.

Existing settings are preserved.

When the next cycle begins, the default behavior is to ask the user to confirm or update the new target amount.

Advanced recurring goals may use custom renewal rules.

---

# 22. Goal Depletion

If a funded or completed-target bucket falls below its target—for example, because $2,000 is withdrawn from an emergency fund—the application asks whether automatic funding should resume.

It must not silently alter the plan.

---

# 23. Rollover

Default:

> All virtual bucket balances roll over.

Users may optionally customize rollover behavior per bucket.

Possible policies include:

* Carry everything
* Reset
* Carry up to a cap
* Redirect excess
* Apply leftover policy

---

# 24. Everyday Spending

Examples include:

* Groceries
* Gas
* Restaurants
* Entertainment
* Shopping
* Personal care

Default behavior:

Remaining applicable money is divided evenly across everyday spending categories.

Users may optionally configure:

* Priority
* Percentages
* Fixed allocations
* Custom allocation behavior

---

# 25. Leftover Allocation Policy

Users define what happens after required allocations are satisfied.

Examples:

* 100% Brokerage
* 100% MacBook
* 50% Brokerage / 50% Emergency Fund
* Highest-priority unfinished goal
* Maintain a cash buffer and invest the rest
* Keep money available to allocate

The policy should be reusable.

---

# 26. Funding Advisor

When available income cannot satisfy the current plan, PFOS does not silently modify priorities.

The Funding Advisor presents the shortfall and possible solutions.

Example:

> You are $300 short.

Possible alternatives:

* Reduce Vacation by $300
* Reduce Emergency Fund and Vacation by $150 each
* Skip Brokerage this paycheck

The user chooses what to do.

---

# 27. Transactions

V1 supports manual transaction entry.

CSV import is an optional convenience.

Transactions may be:

* Income
* Expense
* Transfer
* Refund
* Credit-card purchase
* Credit-card payment
* Adjustment

Transactions may be split across multiple buckets.

---

# 28. Split Transactions

A single purchase may affect multiple categories.

Example:

Costco — $150

* Groceries: $100
* Household: $30
* Personal: $20

The transaction remains one financial event while containing multiple allocation lines.

---

# 29. Credit Cards

V1 supports full credit-card liability handling.

A credit-card purchase:

* Records spending once
* Reduces the associated virtual spending bucket
* Increases credit-card liability
* Reserves corresponding payment cash

The payment reserve does not create a second expense.

When the card is paid:

* Checking decreases
* Credit-card liability decreases
* Payment reserve decreases
* No additional spending is recorded

---

# 30. Credit-Card Overspending

If a credit-card transaction exceeds the available virtual bucket balance:

* Record the transaction
* Allow the bucket to become negative
* Show the shortfall
* Preserve the payment reserve
* Offer ways to cover the overspending

PFOS must not silently pull money from another bucket.

---

# 31. Refunds

Refunds attempt to restore the original bucket allocation.

For partial refunds, PFOS proposes a proportional reversal of the original transaction split.

Users may edit the proposed distribution before confirmation.

---

# 32. CSV Import

V1 CSV workflow:

1. Upload file.
2. Detect columns where possible.
3. Preview file.
4. Map unknown columns.
5. Detect duplicates.
6. Apply saved high-confidence categorization rules.
7. Flag uncertain transactions.
8. Review.
9. Confirm.
10. Atomically import.

No imported transaction modifies real application state before confirmation.

Users may save reusable import templates.

---

# 33. Categorization Rules

PFOS may remember merchant-to-category mappings.

Example:

GEICO → Car Insurance

High-confidence matches may be automatically proposed.

Uncertain matches require review.

V1 does not use behavioral AI to infer financial rules.

---

# 34. Reconciliation

PFOS compares expected and actual financial states.

Default behavior:

Show discrepancies and ask the user to reconcile them.

Users may:

* Identify missing transactions
* Correct existing transactions
* Enter adjustments
* Accept an unexplained reconciliation adjustment

Adjustments must remain traceable.

---

# 35. Account Model

V1 supports accounts including:

* Checking
* Savings
* HYSA
* Brokerage
* Roth IRA
* 401(k)
* Cash
* Credit cards
* Student loans
* Car loans
* Mortgage
* Custom accounts

Additional manual assets are optional.

---

# 36. Net Worth

Initial net worth is primarily entered manually.

After initialization, known financial activity updates expected balances.

PFOS distinguishes:

## Planned Balance

What the system expects based on known activity.

## Actual Balance

What the user reports as real.

## Variance

Difference between planned and actual.

Variance should be explainable or reconcilable.

---

# 37. Net-Worth Scope

PFOS may distinguish:

## Planning Net Worth

Assets and liabilities actively involved in the financial plan.

## Total Net Worth

Planning net worth plus optional manual assets.

Examples of manual assets:

* House
* Vehicle
* Precious metals
* Collectibles
* Business ownership
* Hardware-wallet cryptocurrency
* Custom assets

Manual assets contribute to net worth but do not automatically participate in paycheck allocation.

---

# 38. Planning Score

PFOS provides a numerical Planning Score and descriptive label.

Example:

> 82 — Good

Potential factors include:

* Bills funded before due dates
* Tithing target
* Goal schedule
* Investment minimums
* Bucket overspending
* Reconciliation status
* Debt payments
* Emergency fund progress
* Net-worth trend
* Unallocated money
* Manual overrides
* Upcoming shortfalls

Weighting must never encourage financially unstable behavior.

Users must be able to see why the score changed.

---

# 39. Confidence Scores

Goals may receive a Confidence Score estimating whether the user is on track.

Example:

> MacBook — 92% likely to reach target by March.

Inputs may include:

* Current balance
* Remaining target
* Contribution rate
* Pay schedule
* Deadline
* Known future allocations
* Expected shortfalls

V1 confidence calculations should remain deterministic and transparent rather than using machine learning.

---

# 40. Coaching Engine

The Coaching Engine explains financial information and offers recommendations.

Examples:

* Why a goal is behind
* How much additional contribution is needed
* How extending a deadline changes the plan
* Why the Planning Score changed
* Why an allocation occurred

V1 coaching is deterministic.

It does not learn user behavior.

It never independently changes financial rules or moves money.

---

# 41. Teaching While Planning

PFOS should teach financial concepts contextually.

Example:

> At your current contribution rate, you'll reach this goal in 14 months.

Or:

> Adding $25 per paycheck would reach your goal approximately four months earlier.

Education should be tied to decisions rather than presented as disconnected lessons.

---

# 42. Decision Simulator

The V1 Decision Simulator is intentionally simple.

Users may simulate scenarios such as:

* Buying something
* Receiving a bonus
* Missing a paycheck
* Increasing investment contributions
* Adding a recurring bill
* Changing priorities
* Delaying a goal

The simulator:

1. Creates temporary scenario state.
2. Applies proposed changes.
3. Calls the production financial engines.
4. Shows resulting changes.
5. Does not modify actual data.
6. Allows supported scenario changes to be explicitly applied afterward.

The simulator must not contain duplicate financial calculations.

---

# 43. Life Events

V1 supports a small set of planning-oriented life-event scenarios.

Examples:

* New job
* Raise
* Pay cut
* Bonus
* New recurring expense

These reuse the Decision Simulator and existing engines.

V2 may expand life-event guidance significantly.

---

# 44. Dashboard

The Dashboard is a summary of the user's financial system.

V1 should prioritize:

* Net-worth summary
* Available to allocate
* Next paycheck
* Top priorities
* Upcoming obligations
* Savings goals
* Recent transactions
* Planning Score

Dashboard cards should link to deeper information.

The dashboard must avoid excessive widget density.

---

# 45. Navigation

V1 web navigation should include approximately:

* Dashboard
* Paychecks
* Buckets & Goals
* Transactions
* Accounts & Net Worth
* Reports
* Decision Simulator
* Settings

Capabilities such as Planning Score, Confidence Scores, Coaching, and Funding Advisor appear contextually rather than receiving unnecessary top-level navigation items.

---

# 46. UX Direction

V1 uses a hybrid design philosophy.

The default experience should be:

* Calm
* Spacious
* Approachable
* Progress-oriented
* Easy to understand

Advanced screens may become:

* More analytical
* Data-rich
* Filterable
* Detailed

Complexity should appear when users request it.

---

# 47. Progressive Onboarding

The user should reach their first meaningful allocation quickly.

Recommended onboarding:

1. Starting balances or skip.
2. Income source.
3. Pay schedule.
4. Initial buckets.
5. Select 1–3 priorities.
6. Basic allocation preferences.
7. Enter paycheck.
8. View Allocation Preview.

Advanced configuration is deferred until later.

Most nonessential setup steps should be skippable.

---

# 48. Reports & Analytics

V1 reports should focus on information necessary to answer the five core questions.

Potential reports include:

* Monthly allocation
* Spending by category
* Goal progress
* Group analytics
* Investment contributions
* Savings progress
* Net-worth history
* Plan vs reality
* Planning Score history

Groups aggregate their child bucket analytics.

---

# 49. Group Analytics

Groups may show information such as:

* Current balance
* Total allocated
* Allocation this month
* Goal progress
* Completed goals
* Contribution history

Investment groups may emphasize contributions.

Savings groups may emphasize progress and confidence.

Groups never directly hold financial allocations.

---

# 50. Historical Integrity

Rule changes affect future allocations.

Historical allocations retain the plan version that produced them.

PFOS uses internal Plan Snapshots so historical explanations remain accurate.

Users do not need to manage technical version numbers directly.

---

# 51. Historical Corrections

Historical financial records may be corrected.

Corrections must be traceable.

When correcting a historical paycheck, PFOS may offer:

## Correct and Recalculate

Recalculate using the original Plan Snapshot.

## Correct Amount Only

Preserve existing allocations and create any resulting discrepancy for reconciliation.

## Cancel

No change.

Historical data should generally be soft-deleted rather than silently destroyed.

---

# 52. Data Ownership

Users own their financial data.

V1 supports:

* Transaction CSV export
* Bucket/goal CSV export
* Account/net-worth export
* Full JSON backup
* JSON restore
* Backup schema versions
* Restore validation
* Full data deletion

Future application versions should attempt to migrate compatible older backups.

---

# 53. Storage

V1 is local-first.

Primary structured storage:

> IndexedDB

Financial engines access data through repository interfaces.

They must not depend directly on IndexedDB.

This allows future cloud synchronization without rewriting core financial logic.

---

# 54. Currency

V1 supports:

> USD only.

The architecture should not unnecessarily prevent future multi-currency support.

---

# 55. Financial Precision

Money calculations must use integer cents or another exact monetary representation.

Binary floating-point money arithmetic is prohibited.

Allocation math must satisfy:

> Income = Allocated + Unallocated

exactly to the cent.

Percentage rounding and leftover pennies must follow deterministic rules.

---

# 56. Security

V1 security principles include:

* No bank credentials
* No live financial institution authentication
* No unnecessary server-side financial storage
* No telemetry containing financial amounts
* Sanitized imports
* Untrusted-file validation
* No unnecessary third-party access to financial data
* Sensitive-backup warnings

Security requirements apply even during beta development.

---

# 57. Reliability

Multi-step financial operations must be atomic.

Examples:

* Posting allocations
* Importing transactions
* Restoring backups
* Historical corrections

An operation either succeeds completely or leaves the previous valid state intact.

---

# 58. Testing Standard

V1 requires:

* Unit tests
* Integration tests
* Financial invariant tests
* Property-based tests where appropriate
* CSV/JSON validation tests
* Migration tests
* End-to-end tests
* Regression tests

Every discovered financial calculation bug should receive a permanent regression test.

---

# 59. Performance Targets

Normal local datasets should provide a fast interactive experience.

Targets include:

* Dashboard load approximately under one second
* Allocation previews effectively instantaneous
* Support approximately 10,000 imported transactions without UI freezing
* Responsive reports across several years of normal personal transaction history
* Progress feedback for long-running operations
* Safe cancellation where appropriate

Performance optimizations must not bypass authoritative engine logic.

---

# 60. V1 Engine Architecture

PFOS V1 consists of seven major financial modules.

## Allocation Engine

Plans incoming money.

## Goal Engine

Manages buckets, goals, bills, investments, debt objectives, and goal lifecycle.

## Transaction Engine

Records financial reality.

## Rule Engine

Resolves priorities and financial policies.

## Insight Engine

Calculates scores, forecasts, analytics, and net worth.

## Coaching Engine

Explains and recommends.

## Decision Simulator

Explores hypothetical futures using the production engines.

A central orchestration/application layer coordinates workflows between engines.

---

# 61. Single Source of Truth

Each financial calculation has one authoritative owner.

Other features consume that owner's output.

The Dashboard must not recreate allocation calculations.

The Simulator must not recreate goal calculations.

The Coaching Engine must not independently calculate scores.

Reports must not create alternative transaction accounting rules.

One calculation.

One owner.

One truth.

---

# 62. Version 1 Feature Priorities

## Core

Required for PFOS to function:

* Local financial profile
* Accounts
* Income sources
* Paychecks
* Allocation Engine
* Rule Engine
* Buckets
* Bucket groups
* Goals
* Transactions
* Credit-card accounting
* Dashboard
* Plan Snapshots
* Backup/restore

## Supporting

Required for a trustworthy and useful experience:

* Planning Score
* Confidence Scores
* Reconciliation
* CSV import
* Categorization rules
* Net worth
* Reports
* Group analytics
* Explainability

## Delight

Features intended to demonstrate PFOS's longer-term potential:

* Funding Advisor
* Coaching explanations
* Simple Decision Simulator
* Simple Life Events

These features should remain limited rather than delaying the Core product.

## Future

Explicitly outside V1:

* Live bank synchronization
* Physical money movement
* AI behavioral learning
* Automatic AI rule changes
* Push notifications
* Email notifications
* Native mobile application
* Shared households
* Multi-currency
* Advanced investment analytics
* Tax optimization
* Calendar integration
* Full cloud synchronization

---

# 63. V1 Success Criteria

A successful V1 should allow a new user to:

* Establish a basic financial plan in approximately 15 minutes or less.
* Enter a paycheck and understand its proposed allocation in approximately 60 seconds or less.
* Understand where every allocated dollar is intended to go.
* Determine whether major goals are on track.
* Understand why a goal is ahead or behind.
* Identify a financial shortfall and see possible solutions.
* Simulate a meaningful financial decision in less than approximately one minute.
* Reconcile planned and actual financial states.
* Export and back up all financial data.
* Understand why important calculated values appear.

---

# 64. Primary User Journey

A representative V1 user journey:

### Stage 1 — Setup

The user creates accounts, income, buckets, goals, and priorities.

### Stage 2 — Plan

The user enters a paycheck.

PFOS proposes allocations.

The user understands why each allocation occurred and confirms the plan.

### Stage 3 — Spend

The user records transactions manually or imports them through CSV.

Transactions reduce appropriate virtual buckets.

### Stage 4 — Reconcile

PFOS compares expected financial state against actual balances.

Differences are reviewed.

### Stage 5 — Understand

Dashboard, Planning Score, Confidence Scores, and reports explain progress.

### Stage 6 — Adjust

Funding Advisor and Coaching Engine suggest ways to resolve shortfalls.

### Stage 7 — Simulate

The user tests a financial decision before committing.

### Stage 8 — Repeat

The next paycheck enters the same planning cycle.

---

# 65. Product Development Strategy

PFOS should not be implemented as one giant AI coding task.

Development should occur incrementally.

Recommended order:

1. Project foundation and domain models
2. Rule Engine
3. Allocation Engine
4. Goal Engine
5. Transaction Engine
6. Account and net-worth foundation
7. Insight Engine
8. Coaching Engine
9. Dashboard
10. Decision Simulator
11. CSV import/reconciliation
12. Reports
13. Backup/restore
14. Integration testing
15. Beta hardening

Each milestone must have explicit acceptance criteria before the next major milestone begins.

---

# 66. AI Coding Agent Strategy

The product documentation must remain model-agnostic.

Claude, Codex, local LLMs, or future coding agents may implement PFOS.

The coding agent should receive only the documents relevant to its current task whenever practical.

Example:

> Implement the Allocation Engine according to the Product Constitution, Architecture Specification, Rule Engine interface, and Allocation Engine specification. Do not implement unrelated engines.

The coding agent must not be instructed simply to:

> Build PFOS.

Large implementation requests should be decomposed into reviewable milestones.

---

# 67. Definition of Done for a Feature

A V1 feature is not complete merely because the UI works.

A feature is complete when:

* Requirements are implemented.
* Business logic has one authoritative owner.
* Financial calculations are deterministic.
* Important outputs are explainable.
* Validation exists.
* Error states are handled.
* Tests pass.
* Financial invariants remain valid.
* Relevant edge cases are tested.
* Historical behavior is preserved.
* No unrelated future feature was introduced.
* Documentation reflects significant architectural decisions.

---

# 68. Roadmap Philosophy

## Version 1 — Trustworthy Planning Foundation

Focus:

> Plan, understand, and simulate.

## Version 2 — Connected Financial Life

Potential focus:

* Mobile application
* Cloud synchronization
* Bank connections
* Notifications
* More sophisticated life events
* Behavior-based recommendations
* Improved automation
* More advanced Coaching Engine

## Version 3+ — Intelligent Financial Operating System

Potential focus:

* Advanced AI coaching
* User-approved adaptive rules
* Advanced investment analysis
* Household planning
* More sophisticated forecasting
* Rich scenario modeling
* Financial institution execution
* Broader financial planning

Future capabilities must continue obeying the Product Constitution.

---

# 69. V1 Product Boundary

Version 1 does not need to prove that PFOS can manage every aspect of personal finance.

It needs to prove one central hypothesis:

> **A planning-first financial system can help users make better financial decisions by showing where money should go, whether the plan is working, and what happens when the plan changes.**

If V1 proves that hypothesis, later versions can connect more of the user's financial life.

---

# 70. Final Product Direction

PFOS should not attempt to automate financial decision-making before earning the user's trust.

The first version should instead make financial decisions:

* Easier to plan
* Easier to understand
* Easier to evaluate
* Easier to change
* Easier to simulate

The ultimate product experience should feel simple on the surface while being rigorous underneath.

PFOS should help the user answer:

> **What should my money do next—and why?**
