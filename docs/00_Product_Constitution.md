# Personal Financial Operating System

## Product Constitution

**Document ID:** PFOS-00
**Status:** Draft for review
**Applies to:** Version 1 and all future product decisions
**Primary tagline:** Plan first. Spend with confidence.

---

## 1. Purpose of This Constitution

This document defines the principles that govern the Personal Financial Operating System, referred to as **PFOS**.

It is not a feature list or technical specification. It is the standard against which all future product, design, engineering, and roadmap decisions must be evaluated.

When a proposed feature conflicts with this Constitution, the feature should be changed, deferred, or rejected.

---

## 2. Product Mission

PFOS exists to help users understand and confidently improve their financial future.

The product should help users intentionally plan how money will be used before it is spent, understand whether their financial plan is working, and safely evaluate the consequences of financial decisions.

PFOS is not primarily an expense tracker.

PFOS is not primarily a traditional monthly budgeting tool.

PFOS is a planning-first financial system that helps users build their own budget through intentional decisions.

---

## 3. Product Vision

PFOS should become a personal financial operating system that connects four major areas of financial life:

### Planning

Where should my money go?

### Reality

What actually happened?

### Understanding

Why did it happen?

### Decisions

What should I do next?

Every major feature must support at least one of these four pillars.

---

## 4. Version 1 North Star

Version 1 must answer five questions exceptionally well:

1. Where should my next paycheck go?
2. Am I on track with my financial plan?
3. Will I reach my goals?
4. What should I change if I will not reach them?
5. What happens if I make this financial decision?

A proposed Version 1 feature that does not materially improve one of these five answers should normally be deferred.

---

# 5. Product Principles

## Principle 1: Planning Comes Before Tracking

PFOS should prioritize deciding what money should do before reporting what money already did.

Transactions and reports exist to keep the plan aligned with reality. They are not the central purpose of the product.

The core user workflow should begin with income, priorities, allocation rules, and goals.

---

## Principle 2: Use Opinionated Defaults

The application should provide sensible default behavior so users can receive value quickly.

Examples include:

* Tithing defaults to 10% of net paycheck.
* Top priorities are funded in ranked order.
* Lower-priority spending categories are divided evenly.
* Bucket balances roll over.
* Allocations are previewed before confirmation.
* Historical rule changes affect future allocations only.

Users should not need to configure dozens of settings before completing their first paycheck allocation.

---

## Principle 3: Allow Advanced Customization

Defaults should simplify the initial experience, but they must not unnecessarily restrict advanced users.

Users may customize:

* Percentages
* Priority rankings
* Allocation rules
* Income-source overrides
* Rollover behavior
* Leftover policies
* Goal behavior
* Recurring goal renewal
* Bucket-specific settings

Advanced options should be progressively disclosed rather than displayed everywhere by default.

---

## Principle 4: Explain, Do Not Surprise

PFOS must not silently make important financial decisions.

The system may calculate, recommend, forecast, or propose changes. The user should normally review and confirm actions that materially affect the plan.

Examples include:

* Allocation previews before posting
* Confirmation before accepting likely duplicate paychecks
* Review before importing CSV transactions
* Explicit approval before reallocating existing funds
* Confirmation before changing historical records
* User approval before applying simulator results

Automation may be offered as an optional setting after the user understands the behavior.

---

## Principle 5: Recommend, Do Not Force

The product should help users make decisions without removing their control.

When a plan has a shortfall, PFOS should offer practical alternatives rather than silently reducing priorities.

When a goal falls below its target, PFOS should ask whether funding should resume.

When behavior could be improved, the product should explain the recommendation and let the user choose.

The final financial decision always belongs to the user.

---

## Principle 6: Never Shame the User

PFOS must not judge users based on income, debt, wealth, missed goals, spending mistakes, or changing circumstances.

The system should diagnose situations factually and constructively.

Avoid:

* “Your finances are poor.”
* “You failed your goal.”
* “You are bad at budgeting.”

Prefer:

* “Your insurance expense was higher than planned, leaving this goal $75 behind schedule.”
* “At the current contribution rate, this goal is projected to finish two months late.”
* “Here are three ways to bring the plan back on schedule.”

The application should support improvement without creating guilt or fear.

---

## Principle 7: Do Not Reward Unhealthy Financial Behavior

Scores and recommendations must prioritize stability and essential obligations over optional financial targets.

PFOS must not encourage users to:

* Miss required bills to preserve an investment target
* Ignore high-risk debt to increase savings
* Underfund necessities to maintain a score
* Hide discrepancies through reconciliation adjustments
* Avoid reasonable plan changes merely to protect a metric

Essential bills, debt obligations, cash-flow stability, and basic needs must be weighted more heavily than optional goals.

---

## Principle 8: Physical Money and Virtual Planning Are Separate

Version 1 uses virtual buckets to plan money.

A virtual allocation does not mean money was physically transferred between financial accounts.

The system must clearly distinguish:

* What the user intends to do
* What the app expects to happen
* What actually happened
* Where money physically exists

Future bank integrations may connect planning with physical execution, but the concepts must remain separate.

---

## Principle 9: Every Important Number Must Be Explainable

Users must be able to understand where calculated values came from.

This applies to:

* Allocation amounts
* Planning Score
* Goal Confidence Scores
* Net worth
* Planned balances
* Actual balances
* Forecasts
* Recommendations
* Reconciliation differences
* Funding Advisor suggestions

Important values should support a “Why?” view or equivalent explanation.

The application must not rely on unexplained black-box calculations.

---

## Principle 10: One Calculation, One Owner, One Truth

Each type of financial calculation must have one authoritative engine.

Examples:

* The Allocation Engine owns allocation calculations.
* The Goal Engine owns goal status and goal lifecycle.
* The Transaction Engine owns transaction and ledger effects.
* The Rule Engine owns rule resolution and precedence.
* The Insight Engine owns scores, summaries, and analytical interpretations.

Dashboards, reports, simulations, and coaching features consume engine outputs. They do not recreate the calculations independently.

---

## Principle 11: Preserve Financial History

Changing current rules must not rewrite the past.

By default:

* Priority changes affect future allocations.
* Tithing percentage changes affect future allocations.
* Leftover policies affect future allocations.
* Rollover changes affect future periods.
* Existing bucket balances are not silently redistributed.

Historical allocations remain tied to the plan snapshot that produced them.

Corrections are allowed, but they must be explicit, traceable, and auditable.

---

## Principle 12: Every Financial Action Must Be Traceable

Important financial changes must have an identifiable source.

A user should be able to determine:

* What changed
* When it changed
* Why it changed
* Which rule or plan version was used
* Whether the change was manual, imported, calculated, corrected, or simulated

Historical corrections must preserve an audit record.

Forced reconciliation adjustments must be distinguishable from ordinary spending.

---

## Principle 13: Reduce Decision Fatigue

PFOS should simplify decisions rather than create more settings and screens.

The product should use:

* Progressive onboarding
* Clear defaults
* Allocation previews
* Recommended next steps
* Limited dashboard summaries
* Progressive disclosure
* Reusable rules
* Saved templates
* Clear explanations

Advanced customization should be available without overwhelming the standard experience.

---

## Principle 14: Every Screen Should Answer a Financial Question

Screens and dashboard cards should not exist only to display data.

Examples:

Instead of only showing “Bills,” answer:

> What bills need my attention next?

Instead of only showing “MacBook Goal,” answer:

> Will I have enough for my MacBook by the deadline?

Instead of only showing “Investments,” answer:

> Am I meeting my investment plan this month?

Instead of only showing a score, answer:

> Why did my plan improve or decline?

---

## Principle 15: Teach While Planning

PFOS should improve financial understanding as the user interacts with the plan.

The product may explain:

* When a goal is projected to finish
* How additional contributions change the deadline
* Why a goal is behind schedule
* How a financial decision affects other goals
* Why an allocation was calculated
* What tradeoffs exist between competing choices

The Coaching Engine should explain and recommend. It should not independently move money.

---

## Principle 16: Adaptation Is Normal

Financial plans change because life changes.

The product must make it easy to update:

* Income
* Priorities
* Goals
* Bills
* Contribution levels
* Deadlines
* Life-event scenarios

Changing the plan should not be presented as failure.

Existing history must remain intact while future plans adapt.

---

## Principle 17: Simulations Must Be Safe

The Decision Simulator must never modify real financial data during exploration.

A simulation should:

1. Create a temporary scenario state.
2. Apply hypothetical changes.
3. Reuse the real production engines.
4. Display the projected results.
5. Leave actual data unchanged.
6. Require explicit approval before applying supported changes.

The simulator must not contain duplicate versions of allocation, goal, scoring, or forecasting logic.

---

## Principle 18: Deterministic Financial Engines

Given the same valid inputs, plan snapshot, and rules, an engine must produce the same outputs.

There must be:

* No randomness in financial calculations
* No hidden rule changes
* No duplicated calculation paths
* No unexplained nondeterministic recommendations in Version 1

Determinism is necessary for testing, traceability, and user trust.

---

## Principle 19: Financial Precision Is Non-Negotiable

Money must never be calculated using ordinary binary floating-point arithmetic.

Version 1 will:

* Store USD monetary values in integer cents or an equivalent exact decimal representation
* Round according to explicit rules
* Distribute leftover pennies deterministically
* Ensure allocations balance exactly
* Prevent money from appearing or disappearing through rounding

The following invariant must always hold:

> Total input money = total allocated money + total unallocated money

This must be true to the cent.

---

## Principle 20: Correctness Comes Before Speed of Development

A smaller reliable product is better than a larger unreliable one.

Version 1 requires:

* Unit tests
* Integration tests
* Financial invariant tests
* Regression tests
* Import-validation tests
* Migration tests
* End-to-end tests

A financial calculation bug must receive a permanent regression test when fixed.

---

## Principle 21: Financial Operations Must Be Atomic

A multi-step financial action must either complete fully or not be committed.

Examples include:

* Confirming a paycheck allocation
* Importing CSV transactions
* Correcting historical income
* Posting a split transaction
* Recording a credit-card payment
* Restoring a backup

Partial financial writes must roll back or remain isolated as unconfirmed drafts.

The previous valid state must remain recoverable.

---

## Principle 22: Security and Privacy Are Default Requirements

Security is not a future enhancement.

Version 1 must:

* Avoid collecting bank credentials
* Avoid unnecessary third-party access to financial data
* Treat CSV and JSON files as untrusted input
* Validate and sanitize imports
* Avoid telemetry containing personal financial amounts
* Clearly warn that exported backups contain sensitive data
* Keep financial engines independent from storage implementation
* Prepare for future authentication without prematurely adding cloud complexity

---

## Principle 23: Users Own Their Data

Users must be able to export, back up, restore, and delete their information.

Version 1 should support:

* CSV exports for major financial records
* Complete JSON backup
* Backup schema versioning
* Restore validation
* Migration of compatible older backups
* Full data deletion with strong confirmation

PFOS should not create proprietary data lock-in.

---

## Principle 24: Local First, Cloud Ready

Version 1 is a local-first, single-user web application.

Financial data is stored locally using IndexedDB behind repository interfaces.

The core financial engines must not directly depend on IndexedDB or any specific storage provider.

The architecture should allow future cloud synchronization without rewriting the business logic.

---

## Principle 25: When Clarity and Features Conflict, Choose Clarity

When faced with a choice between adding a feature and improving clarity, always choose clarity.

A feature should not be added merely because it is possible or impressive.

The product should remain understandable, predictable, and trustworthy as it grows.

---

# 6. Engineering Structure

PFOS will use modular engines with clearly defined ownership.

## Allocation Engine

Determines where incoming money should be allocated.

## Goal Engine

Manages buckets, goals, recurring goals, bills, investments, debt objectives, and goal lifecycle.

## Transaction Engine

Records what actually happened, including spending, refunds, transfers, credit-card activity, imports, and reconciliation.

## Rule Engine

Resolves global rules, income-source overrides, priorities, percentages, rollover policies, and leftover allocation policies.

## Insight Engine

Calculates net worth, Planning Score, Confidence Scores, forecasts, reports, and summaries.

## Coaching Engine

Explains results, teaches financial concepts in context, and recommends possible actions.

It never independently moves or reallocates money.

## Decision Simulator

Creates temporary hypothetical scenarios and asks the production engines to calculate the consequences.

## Central Orchestration Layer

Coordinates workflows between engines.

Engines should not be tightly coupled to the user interface or storage layer.

---

# 7. Explainability Contract

Every engine output that influences the user’s financial understanding must include an explanation structure.

## Inputs

The data used to produce the result.

## Output

The calculated result.

## Explanation

The reasons, rules, priorities, or events that produced the result.

## Plan Context

The plan snapshot or rule version used.

## Confidence

For deterministic calculations, the confidence is effectively 100% if the inputs are valid.

For future probabilistic or AI-supported recommendations, the system must distinguish calculations from estimates and recommendations.

---

# 8. Version 1 Scope Filter

Every proposed V1 feature must pass the following review:

1. Which of the five core questions does it improve?
2. Which engine owns it?
3. Can it reuse existing engine logic?
4. Does it reduce or increase decision fatigue?
5. Can its output be explained?
6. Does it preserve historical accuracy?
7. Is it necessary for the beta?
8. Is it Core, Supporting, Delight, or Future?

If a feature has no clear owner or does not support a core question, it should normally be deferred.

---

# 9. Version 1 Product Boundaries

Version 1 will not include:

* Live bank syncing
* Physical money transfers
* Bill payment
* AI habit learning
* Automatic rule changes based on inferred behavior
* Push, email, or scheduled notifications
* Shared household budgeting
* Native mobile applications
* Multi-currency support
* Advanced investment performance analytics
* Tax optimization
* Calendar integrations
* Server-hosted financial accounts
* Complex predictive machine-learning systems

Version 1 may be architected to support these later, but it must not partially implement them.

---

# 10. Version 1 Quality Standard

Version 1 is a beta product, but it should be treated as a **Minimum Lovable Product**.

It should prioritize:

* Correctness
* Clarity
* Reliability
* Explainability
* Financial safety
* Fast onboarding
* Consistent calculations
* A polished core workflow

Version 1 should answer its five core questions exceptionally well before expanding into additional functionality.

---

# 11. Final Governing Statement

PFOS should build trust before automation.

It should help users plan before spending, understand before acting, and simulate before committing.

The system should remain simple at first glance, powerful underneath, and explainable at every level.
